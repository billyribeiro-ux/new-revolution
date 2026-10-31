// Temporary admin account for local use (docs/TEMPORARY.md T2, docs/ADMIN_LOCAL_LOGIN.md).
//
//   pnpm db:seed-admin            create or repair the admin account from ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD
//   pnpm db:seed-admin --reset-password   also overwrite the password of an existing account
//   pnpm db:seed-admin --revoke   delete the account (sessions and accounts cascade)
//
// Runs under plain Node (`node --env-file-if-exists=.env`), so it must not import anything that needs
// SvelteKit: no `$app/*`, no `src/lib/server/auth.ts`, no extensionless relative imports (they fail under
// Node's type stripping). It therefore builds its own Better Auth instance from the SAME option fragments
// as src/lib/server/auth.ts (src/lib/server/auth-options.ts). The database selection mirrors
// src/lib/server/db/index.ts (`isPlaceholderDatabaseUrl` -> local PGlite, otherwise postgres-js).
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { hashPassword } from 'better-auth/crypto';
import { PGlite } from '@electric-sql/pglite';
import { and, eq, sql } from 'drizzle-orm';
import { drizzle as drizzlePglite, type PgliteDatabase } from 'drizzle-orm/pglite';
import { drizzle as drizzlePostgres, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { account, session, user, verification } from '../src/lib/server/db/auth.schema.ts';
import { emailAndPasswordOptions, userAdditionalFields } from '../src/lib/server/auth-options.ts';

export const SEED_ADMIN_NAME = 'Temporary Admin (seed)';
export const MIN_PASSWORD_LENGTH = 12;
export const SEED_PGLITE_DIR = '.svelte-kit/pglite-blog';
export const SEED_MIGRATION_PATH = 'drizzle/0000_blog_system.sql';
// Must match the placeholder rules in src/lib/server/db/index.ts (`isPlaceholderDatabaseUrl`).
export const PLACEHOLDER_DATABASE_URL_MARKERS = [
	'user:password@host:port/db-name',
	'user:password@localhost:5432/db-name',
	'pglite://',
	'memory://'
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const authSchema = { user, session, account, verification };
// Loose schema parameter: callers may pass the app's full schema (with relations) or the auth tables only.
export type SeedDatabase =
	PgliteDatabase<Record<string, unknown>> | PostgresJsDatabase<Record<string, unknown>>;
export type SeedAuth = ReturnType<typeof createSeedAuth>;

export class SeedAdminError extends Error {}

export interface SeedTarget {
	/** Human-readable location: the PGlite directory, or host:port/database without credentials. */
	label: string;
	isLocalPglite: boolean;
}

export interface SeedEnv {
	NODE_ENV?: string;
	VERCEL?: string;
	DATABASE_URL?: string;
	BETTER_AUTH_SECRET?: string;
	ORIGIN?: string;
	ADMIN_SEED_EMAIL?: string;
	ADMIN_SEED_PASSWORD?: string;
}

export interface SeedContext {
	db: SeedDatabase;
	auth: SeedAuth;
	target: SeedTarget;
	env: SeedEnv;
}

export interface SeedResult {
	action: 'created' | 'updated' | 'unchanged' | 'revoked' | 'absent';
	userId: string | null;
	email: string;
	role: string | null;
}

/** Better Auth instance with the same options as src/lib/server/auth.ts (minus the SvelteKit cookie plugin). */
export function createSeedAuth(db: SeedDatabase, env: SeedEnv) {
	return betterAuth({
		baseURL: env.ORIGIN ?? 'http://localhost:5173',
		secret: env.BETTER_AUTH_SECRET,
		database: drizzleAdapter(db, { provider: 'pg' }),
		emailAndPassword: emailAndPasswordOptions,
		user: { additionalFields: userAdditionalFields }
	});
}

export function isPlaceholderDatabaseUrl(url: string | undefined): boolean {
	if (!url) return true;
	return PLACEHOLDER_DATABASE_URL_MARKERS.some((marker) => url.includes(marker));
}

/** Reads and validates the seed credentials. Error messages never contain the password. */
export function readSeedCredentials(env: SeedEnv): { email: string; password: string } {
	const rawEmail = env.ADMIN_SEED_EMAIL?.trim();
	if (!rawEmail) {
		throw new SeedAdminError(
			'ADMIN_SEED_EMAIL is not set. Add it to .env (see docs/ADMIN_LOCAL_LOGIN.md).'
		);
	}
	const email = rawEmail.toLowerCase();
	if (!EMAIL_PATTERN.test(email)) {
		throw new SeedAdminError(`ADMIN_SEED_EMAIL is not a valid email address: "${rawEmail}".`);
	}
	const password = env.ADMIN_SEED_PASSWORD;
	if (!password) {
		throw new SeedAdminError(
			'ADMIN_SEED_PASSWORD is not set. Add it to .env (see docs/ADMIN_LOCAL_LOGIN.md).'
		);
	}
	if (password.length < MIN_PASSWORD_LENGTH) {
		throw new SeedAdminError(
			`ADMIN_SEED_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters (it is ${password.length}).`
		);
	}
	return { email, password };
}

/** Refuses production-like environments unless the database is the local PGlite file. */
export function assertSeedAllowed(env: SeedEnv, target: SeedTarget): void {
	const production = env.NODE_ENV === 'production' || Boolean(env.VERCEL);
	if (production && !target.isLocalPglite) {
		const reasons = [
			env.NODE_ENV === 'production' ? 'NODE_ENV=production' : null,
			env.VERCEL ? 'VERCEL is set' : null
		]
			.filter(Boolean)
			.join(' and ');
		throw new SeedAdminError(
			`Refusing to seed an admin account: ${reasons} and the database is not the local PGlite file (${target.label}). ` +
				'Create the real admin by other means; see the pre-production checklist in docs/ADMIN_LOCAL_LOGIN.md.'
		);
	}
}

/**
 * Core logic. Takes an injected database and auth instance so the spec can run it against an in-memory
 * PGlite. Prints email, user id, role and target only; never the password or any hash.
 */
export async function seedAdmin(
	ctx: SeedContext,
	options: { revoke: boolean; resetPassword: boolean }
): Promise<SeedResult> {
	assertSeedAllowed(ctx.env, ctx.target);
	const { email, password } = readSeedCredentials(ctx.env);
	console.log(`Database: ${ctx.target.label}`);

	const [existing] = await ctx.db.select().from(user).where(eq(user.email, email)).limit(1);

	if (options.revoke) {
		if (!existing) {
			console.log(`No account for ${email}; nothing to revoke.`);
			return { action: 'absent', userId: null, email, role: null };
		}
		const [{ sessions }] = await ctx.db
			.select({ sessions: sql<number>`count(*)::int` })
			.from(session)
			.where(eq(session.userId, existing.id));
		const [{ accounts }] = await ctx.db
			.select({ accounts: sql<number>`count(*)::int` })
			.from(account)
			.where(eq(account.userId, existing.id));
		await ctx.db.delete(user).where(eq(user.id, existing.id));
		console.log(
			`Revoked: deleted user ${existing.id} (${email}); ON DELETE CASCADE removed ${sessions} session(s) and ${accounts} account row(s).`
		);
		return { action: 'revoked', userId: existing.id, email, role: existing.role };
	}

	if (existing) {
		const needsUpdate = existing.role !== 'admin' || !existing.emailVerified;
		if (needsUpdate) {
			await ctx.db
				.update(user)
				.set({ role: 'admin', emailVerified: true, updatedAt: new Date() })
				.where(eq(user.id, existing.id));
		}
		if (options.resetPassword) {
			const credentialWhere = and(
				eq(account.userId, existing.id),
				eq(account.providerId, 'credential')
			);
			const [credential] = await ctx.db
				.select({ id: account.id })
				.from(account)
				.where(credentialWhere)
				.limit(1);
			if (!credential) {
				throw new SeedAdminError(
					`User ${email} has no credential account, so its password cannot be reset by this script.`
				);
			}
			await ctx.db
				.update(account)
				.set({ password: await hashPassword(password), updatedAt: new Date() })
				.where(eq(account.id, credential.id));
			console.log('Password: reset (value not printed).');
		}
		const action = needsUpdate ? 'updated' : 'unchanged';
		console.log(
			action === 'updated'
				? 'Account existed: set role=admin and email verified.'
				: 'Account already admin and verified; no change.'
		);
		return logResult({ action, userId: existing.id, email, role: 'admin' });
	}

	let created;
	try {
		created = await ctx.auth.api.signUpEmail({
			body: { email, password, name: SEED_ADMIN_NAME }
		});
	} catch (err) {
		// Better Auth error messages do not include the submitted password; re-throw with context.
		throw new SeedAdminError(
			`Sign-up failed for ${email}: ${err instanceof Error ? err.message : String(err)}`
		);
	}
	const userId = created.user.id;
	await ctx.db
		.update(user)
		.set({ role: 'admin', emailVerified: true, updatedAt: new Date() })
		.where(eq(user.id, userId));
	// sign-up auto-signs-in and stores a session row; the seed does not need one.
	await ctx.db.delete(session).where(eq(session.userId, userId));
	console.log('Account created: role=admin, email verified.');
	return logResult({ action: 'created', userId, email, role: 'admin' });
}

function logResult(result: SeedResult): SeedResult {
	console.log(
		`email=${result.email} id=${result.userId} role=${result.role} action=${result.action}`
	);
	return result;
}

export function parseSeedArgs(argv: string[]): { revoke: boolean; resetPassword: boolean } {
	let revoke = false;
	let resetPassword = false;
	for (const arg of argv) {
		if (arg === '--revoke') revoke = true;
		else if (arg === '--reset-password') resetPassword = true;
		else throw new SeedAdminError(`Unknown argument: ${arg}. Use --revoke or --reset-password.`);
	}
	if (revoke && resetPassword) {
		throw new SeedAdminError('--revoke and --reset-password cannot be combined.');
	}
	return { revoke, resetPassword };
}

/** Human-readable database label without credentials: `host:port/database`. */
export function describePostgresTarget(url: string): string {
	const parsed = new URL(url);
	return `postgres ${parsed.hostname}${parsed.port ? `:${parsed.port}` : ''}${parsed.pathname}`;
}

/** Opens the same database the app would use (see src/lib/server/db/index.ts) for the CLI. */
export async function openSeedTarget(env: SeedEnv): Promise<{
	ctx: Pick<SeedContext, 'db' | 'target'>;
	close: () => Promise<void>;
}> {
	if (!isPlaceholderDatabaseUrl(env.DATABASE_URL)) {
		const client = postgres(env.DATABASE_URL as string, { max: 1 });
		const db = drizzlePostgres(client, { schema: authSchema });
		return {
			ctx: {
				db,
				target: { label: describePostgresTarget(env.DATABASE_URL as string), isLocalPglite: false }
			},
			close: () => client.end()
		};
	}
	const dataDir = resolve(process.cwd(), SEED_PGLITE_DIR);
	mkdirSync(dataDir, { recursive: true });
	const pglite = new PGlite(dataDir);
	// Same forward-only, idempotent migration the app runs on boot (ensureDbReady).
	await pglite.exec(readFileSync(resolve(process.cwd(), SEED_MIGRATION_PATH), 'utf8'));
	const db = drizzlePglite(pglite, { schema: authSchema });
	return {
		ctx: { db, target: { label: `PGlite (local file) ${dataDir}`, isLocalPglite: true } },
		close: () => pglite.close()
	};
}

async function main(argv: string[]): Promise<void> {
	const options = parseSeedArgs(argv);
	const env = process.env as SeedEnv;
	readSeedCredentials(env); // fail loud before touching any database
	// Refuse before a connection is opened or a PGlite directory is created.
	const isLocal = isPlaceholderDatabaseUrl(env.DATABASE_URL);
	assertSeedAllowed(env, {
		label: isLocal ? 'local PGlite' : describePostgresTarget(env.DATABASE_URL as string),
		isLocalPglite: isLocal
	});
	const { ctx: partial, close } = await openSeedTarget(env);
	try {
		const auth = createSeedAuth(partial.db, env);
		await seedAdmin({ ...partial, auth, env }, options);
	} finally {
		await close();
	}
}

const isMainModule =
	typeof process !== 'undefined' && process.argv[1] && process.argv[1].endsWith('seed-admin.ts');

if (isMainModule) {
	main(process.argv.slice(2)).catch((err: unknown) => {
		const message = err instanceof Error ? err.message : String(err);
		console.error(`seed-admin failed: ${message}`);
		process.exitCode = 1;
	});
}
