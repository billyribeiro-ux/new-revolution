import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite, type PgliteDatabase } from 'drizzle-orm/pglite';
import { drizzle as drizzlePostgres, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type AppDatabase = PostgresJsDatabase<typeof schema> | PgliteDatabase<typeof schema>;

const MIGRATION_SQL_PATH = resolve(process.cwd(), 'drizzle/0000_blog_system.sql');

let cachedMigrationSql: string | null = null;
function getMigrationSql(): string {
	if (!cachedMigrationSql) {
		cachedMigrationSql = readFileSync(MIGRATION_SQL_PATH, 'utf8');
	}
	return cachedMigrationSql;
}

function isPlaceholderDatabaseUrl(url: string | undefined): boolean {
	if (!url) return true;
	return (
		url.includes('user:password@host:port/db-name') ||
		url.includes('user:password@localhost:5432/db-name') ||
		url.startsWith('pglite://') ||
		url.startsWith('memory://')
	);
}

let activeDb: AppDatabase | null = null;
let activePglite: PGlite | null = null;
let initPromise: Promise<void> | null = null;
let simulatedFailureError: Error | null = null;

export function setSimulatedDbFailure(error: Error | null): void {
	simulatedFailureError = error;
}

export function assertDbHealthy(): void {
	if (simulatedFailureError) {
		throw simulatedFailureError;
	}
}

function createDefaultDb(): AppDatabase {
	const rawUrl = process.env.DATABASE_URL ?? 'postgres://user:password@host:port/db-name';

	if (!isPlaceholderDatabaseUrl(rawUrl)) {
		const client = postgres(rawUrl);
		return drizzlePostgres(client, { schema });
	}

	const isVitest = Boolean(process.env.VITEST);
	if (isVitest || rawUrl.startsWith('memory://')) {
		activePglite = new PGlite();
	} else {
		const dataDir = resolve(process.cwd(), '.svelte-kit/pglite-blog');
		mkdirSync(dataDir, { recursive: true });
		activePglite = new PGlite(dataDir);
	}

	return drizzlePglite(activePglite, { schema });
}

export function getDb(): AppDatabase {
	assertDbHealthy();
	if (!activeDb) {
		activeDb = createDefaultDb();
	}
	return activeDb;
}

export async function ensureDbReady(): Promise<AppDatabase> {
	assertDbHealthy();
	const instance = getDb();
	if (activePglite && !initPromise) {
		const pgliteInstance = activePglite;
		initPromise = pgliteInstance.exec(getMigrationSql()).then(() => undefined);
	}
	if (initPromise) {
		await initPromise;
	}
	return instance;
}

export async function createTestDatabase(): Promise<{
	db: PgliteDatabase<typeof schema>;
	client: PGlite;
	cleanup: () => Promise<void>;
}> {
	const client = new PGlite();
	await client.exec(getMigrationSql());
	const testDb = drizzlePglite(client, { schema });
	return {
		db: testDb,
		client,
		cleanup: async () => {
			await client.close();
		}
	};
}

export function setActiveDbForTest(
	customDb: AppDatabase,
	customPglite: PGlite | null = null
): void {
	activeDb = customDb;
	activePglite = customPglite;
	initPromise = Promise.resolve();
}

export const db: AppDatabase = new Proxy({} as AppDatabase, {
	get(_target, prop, receiver) {
		const targetDb = getDb();
		const value = Reflect.get(targetDb as object, prop, receiver);
		return typeof value === 'function' ? value.bind(targetDb) : value;
	}
});
