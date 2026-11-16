import { describe, expect, it } from 'vite-plus/test';
import { spawnSync } from 'node:child_process';
import { assertHostedDatabaseConfig } from './database-config';

describe('durable hosted CMS configuration', () => {
	it('rejects missing, development and invalid URLs before a hosted build starts', () => {
		for (const databaseUrl of [
			undefined,
			'',
			'memory://preview',
			'pglite://preview',
			'postgres://user:password@host:5432/db-name',
			'https://database.example.invalid/db',
			'postgres://database.example.invalid/db'
		]) {
			const result = spawnSync(process.execPath, ['scripts/check-hosted-database.ts'], {
				env: { ...process.env, VERCEL: '1', DATABASE_URL: databaseUrl ?? '' },
				encoding: 'utf8'
			});
			expect(result.status).toBe(1);
			expect(result.stderr).toContain('Hosted CMS requires a real PostgreSQL DATABASE_URL');
			expect(result.stderr).not.toContain('mkdir');
			if (databaseUrl) expect(result.stderr).not.toContain(databaseUrl);
		}
	});

	it('accepts a configured hosted PostgreSQL connection without opening it', () => {
		for (const protocol of ['postgres', 'postgresql']) {
			expect(() =>
				assertHostedDatabaseConfig({
					VERCEL: '1',
					DATABASE_URL: `${protocol}://cms:private@example.invalid/cms?sslmode=require`
				})
			).not.toThrow();
		}
	});

	it('preserves explicitly local development and isolated preview databases', () => {
		for (const databaseUrl of [undefined, 'memory://test', 'pglite://e2e']) {
			expect(() =>
				assertHostedDatabaseConfig({ VERCEL: undefined, DATABASE_URL: databaseUrl })
			).not.toThrow();
		}
	});
});
