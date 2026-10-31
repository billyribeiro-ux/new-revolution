import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestDatabase } from '../src/lib/server/db';
import { account, session, user } from '../src/lib/server/db/auth.schema.ts';
import { userAdditionalFields } from '../src/lib/server/auth-options.ts';
import {
	MIN_PASSWORD_LENGTH,
	PLACEHOLDER_DATABASE_URL_MARKERS,
	assertSeedAllowed,
	createSeedAuth,
	parseSeedArgs,
	readSeedCredentials,
	seedAdmin,
	type SeedContext,
	type SeedEnv,
	type SeedTarget
} from './seed-admin';

const SEED_EMAIL = 'seed-check@example.test';
const SEED_PASSWORD = 'spec-only-value-1234';
const LOCAL_TARGET: SeedTarget = { label: 'PGlite (test)', isLocalPglite: true };
const REMOTE_TARGET: SeedTarget = { label: 'postgres db.example.test/app', isLocalPglite: false };
const BASE_ENV: SeedEnv = {
	BETTER_AUTH_SECRET: 'test-secret-with-at-least-32-characters-entropy',
	ADMIN_SEED_EMAIL: SEED_EMAIL,
	ADMIN_SEED_PASSWORD: SEED_PASSWORD
};

const repoRoot = resolve(import.meta.dirname, '..');

describe('scripts/seed-admin', () => {
	let testEnv: Awaited<ReturnType<typeof createTestDatabase>>;
	let ctx: SeedContext;
	let logSpy: ReturnType<typeof vi.spyOn>;
	let errorSpy: ReturnType<typeof vi.spyOn>;
	let warnSpy: ReturnType<typeof vi.spyOn>;

	function contextFor(env: SeedEnv = BASE_ENV, target: SeedTarget = LOCAL_TARGET): SeedContext {
		return { db: testEnv.db, auth: createSeedAuth(testEnv.db, env), target, env };
	}

	beforeEach(async () => {
		testEnv = await createTestDatabase();
		ctx = contextFor();
		logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(async () => {
		vi.restoreAllMocks();
		await testEnv.cleanup();
	});

	async function userRows(email: string) {
		return testEnv.db.select().from(user).where(eq(user.email, email));
	}

	it('creates the admin account with role admin and a verified email', async () => {
		const result = await seedAdmin(ctx, { revoke: false, resetPassword: false });

		expect(result.action).toBe('created');
		const [row] = await userRows(SEED_EMAIL);
		expect(row.role).toBe('admin');
		expect(row.emailVerified).toBe(true);
		expect(result.userId).toBe(row.id);

		const accounts = await testEnv.db.select().from(account).where(eq(account.userId, row.id));
		expect(accounts.map((a) => a.providerId)).toEqual(['credential']);
	});

	it('is idempotent: a second run changes nothing and leaves no extra sessions', async () => {
		await seedAdmin(ctx, { revoke: false, resetPassword: false });
		const [first] = await userRows(SEED_EMAIL);

		const second = await seedAdmin(ctx, { revoke: false, resetPassword: false });

		expect(second.action).toBe('unchanged');
		expect(second.userId).toBe(first.id);
		expect(await userRows(SEED_EMAIL)).toHaveLength(1);
		const sessions = await testEnv.db.select().from(session).where(eq(session.userId, first.id));
		expect(sessions).toHaveLength(0);
	});

	it('repairs an existing non-admin account without touching its password', async () => {
		await ctx.auth.api.signUpEmail({
			body: { email: SEED_EMAIL, password: 'the-original-password', name: 'Existing' }
		});
		const [before] = await userRows(SEED_EMAIL);
		expect(before.role).toBe('user');

		const result = await seedAdmin(ctx, { revoke: false, resetPassword: false });

		expect(result.action).toBe('updated');
		const [after] = await userRows(SEED_EMAIL);
		expect(after.role).toBe('admin');
		expect(after.emailVerified).toBe(true);
		const signIn = await ctx.auth.api.signInEmail({
			body: { email: SEED_EMAIL, password: 'the-original-password' }
		});
		expect(signIn.user.email).toBe(SEED_EMAIL);
	});

	it('resets the password only when --reset-password is passed', async () => {
		await seedAdmin(ctx, { revoke: false, resetPassword: false });
		const newPassword = 'a-brand-new-password-value';
		const reset = contextFor({ ...BASE_ENV, ADMIN_SEED_PASSWORD: newPassword });

		await seedAdmin(reset, { revoke: false, resetPassword: false });
		await expect(
			reset.auth.api.signInEmail({ body: { email: SEED_EMAIL, password: newPassword } })
		).rejects.toThrow();

		await seedAdmin(reset, { revoke: false, resetPassword: true });
		const signIn = await reset.auth.api.signInEmail({
			body: { email: SEED_EMAIL, password: newPassword }
		});
		expect(signIn.user.email).toBe(SEED_EMAIL);
	});

	it('a normal sign-up of another email stays role user, and the seeded session exposes role admin', async () => {
		await seedAdmin(ctx, { revoke: false, resetPassword: false });
		await ctx.auth.api.signUpEmail({
			body: { email: 'visitor@example.test', password: 'visitor-password-long', name: 'Visitor' }
		});

		const [visitor] = await userRows('visitor@example.test');
		expect(visitor.role).toBe('user');

		// Regression for docs/ADMIN_AUTH_PLAN.md F2: role must reach the session user.
		const response = await ctx.auth.api.signInEmail({
			body: { email: SEED_EMAIL, password: SEED_PASSWORD },
			asResponse: true
		});
		const cookie = response.headers
			.getSetCookie()
			.map((c) => c.split(';')[0])
			.join('; ');
		const current = await ctx.auth.api.getSession({ headers: new Headers({ cookie }) });
		expect(current?.user.role).toBe('admin');
	});

	it('--revoke deletes the account and cascades its sessions and accounts', async () => {
		await seedAdmin(ctx, { revoke: false, resetPassword: false });
		const [row] = await userRows(SEED_EMAIL);
		await ctx.auth.api.signInEmail({ body: { email: SEED_EMAIL, password: SEED_PASSWORD } });
		expect(
			await testEnv.db.select().from(session).where(eq(session.userId, row.id))
		).not.toHaveLength(0);

		const result = await seedAdmin(ctx, { revoke: true, resetPassword: false });

		expect(result.action).toBe('revoked');
		expect(await userRows(SEED_EMAIL)).toHaveLength(0);
		expect(await testEnv.db.select().from(session).where(eq(session.userId, row.id))).toHaveLength(
			0
		);
		expect(await testEnv.db.select().from(account).where(eq(account.userId, row.id))).toHaveLength(
			0
		);
		expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Revoked: deleted user'));
	});

	it('refuses in production (NODE_ENV or VERCEL) when the database is not local PGlite', async () => {
		const prodEnv = { ...BASE_ENV, NODE_ENV: 'production' };
		await expect(
			seedAdmin(contextFor(prodEnv, REMOTE_TARGET), { revoke: false, resetPassword: false })
		).rejects.toThrow(/Refusing to seed an admin account: NODE_ENV=production/);
		expect(() => assertSeedAllowed({ ...BASE_ENV, VERCEL: '1' }, REMOTE_TARGET)).toThrow(
			/VERCEL is set/
		);
		// Local PGlite is allowed even when NODE_ENV=production.
		expect(() => assertSeedAllowed(prodEnv, LOCAL_TARGET)).not.toThrow();
		expect(await userRows(SEED_EMAIL)).toHaveLength(0);
	});

	it('rejects a password shorter than 12 characters without echoing it', () => {
		const shortPassword = 'short-pass1';
		expect(shortPassword.length).toBeLessThan(MIN_PASSWORD_LENGTH);

		const expected = `ADMIN_SEED_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters (it is ${shortPassword.length}).`;
		// toThrow with a string matches the message exactly, so the password cannot be echoed.
		expect(() => readSeedCredentials({ ...BASE_ENV, ADMIN_SEED_PASSWORD: shortPassword })).toThrow(
			expected
		);
	});

	it('rejects a missing or invalid email and a missing password', () => {
		expect(() => readSeedCredentials({ ADMIN_SEED_PASSWORD: SEED_PASSWORD })).toThrow(
			/ADMIN_SEED_EMAIL is not set/
		);
		expect(() => readSeedCredentials({ ...BASE_ENV, ADMIN_SEED_EMAIL: 'not-an-email' })).toThrow(
			/not a valid email/
		);
		expect(() => readSeedCredentials({ ADMIN_SEED_EMAIL: SEED_EMAIL })).toThrow(
			/ADMIN_SEED_PASSWORD is not set/
		);
	});

	it('never prints the password or a password hash to stdout or stderr', async () => {
		await seedAdmin(ctx, { revoke: false, resetPassword: false });
		await seedAdmin(contextFor({ ...BASE_ENV, ADMIN_SEED_PASSWORD: 'rotated-password-value' }), {
			revoke: false,
			resetPassword: true
		});
		await seedAdmin(ctx, { revoke: true, resetPassword: false });

		const printed = [...logSpy.mock.calls, ...errorSpy.mock.calls, ...warnSpy.mock.calls]
			.flat()
			.map(String)
			.join('\n');
		expect(printed).toContain(SEED_EMAIL);
		expect(printed).not.toContain(SEED_PASSWORD);
		expect(printed).not.toContain('rotated-password-value');
		expect(printed).not.toMatch(/\$argon2|scrypt|:[0-9a-f]{64,}/i);
	});

	it('parses only the documented flags', () => {
		expect(parseSeedArgs([])).toEqual({ revoke: false, resetPassword: false });
		expect(parseSeedArgs(['--reset-password'])).toEqual({ revoke: false, resetPassword: true });
		expect(parseSeedArgs(['--revoke'])).toEqual({ revoke: true, resetPassword: false });
		expect(() => parseSeedArgs(['--nope'])).toThrow(/Unknown argument/);
		expect(() => parseSeedArgs(['--revoke', '--reset-password'])).toThrow(/cannot be combined/);
	});

	it('drift guard: auth.ts and the seed script both use the shared auth-options fragment', () => {
		const authSource = readFileSync(resolve(repoRoot, 'src/lib/server/auth.ts'), 'utf8');
		const seedSource = readFileSync(resolve(repoRoot, 'scripts/seed-admin.ts'), 'utf8');

		expect(authSource).toContain("from '#lib/server/auth-options.ts'");
		expect(authSource).toContain('additionalFields: userAdditionalFields');
		expect(authSource).toContain('emailAndPassword: emailAndPasswordOptions');
		expect(seedSource).toContain("from '../src/lib/server/auth-options.ts'");
		expect(seedSource).toContain('additionalFields: userAdditionalFields');
		expect(seedSource).toContain('emailAndPassword: emailAndPasswordOptions');
		expect(userAdditionalFields.role).toEqual({
			type: 'string',
			defaultValue: 'user',
			input: false
		});
	});

	it('drift guard: placeholder DATABASE_URL markers match src/lib/server/db/index.ts', () => {
		const dbSource = readFileSync(resolve(repoRoot, 'src/lib/server/db/index.ts'), 'utf8');
		for (const marker of PLACEHOLDER_DATABASE_URL_MARKERS) {
			expect(dbSource).toContain(marker);
		}
	});
});
