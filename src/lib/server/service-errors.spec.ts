import { describe, expect, it } from 'vite-plus/test';
import { isUniqueViolation } from './service-errors';

describe('Postgres unique-violation matching', () => {
	it('matches a real constraint or string detail and ignores malformed detail objects', () => {
		const target = { table: 'posts', column: 'slug' };
		const base = { code: '23505', table: 'posts' };
		expect(isUniqueViolation({ ...base, constraint: 'posts_slug_unique' }, target)).toBe(true);
		expect(
			isUniqueViolation(
				{ cause: { ...base, detail: 'Key (slug)=(duplicate) already exists.' } },
				target
			)
		).toBe(true);
		expect(
			isUniqueViolation({ ...base, detail: { toString: () => 'Key (slug)=fake' } }, target)
		).toBe(false);
		expect(
			isUniqueViolation({ ...base, detail: 'Key (title)=(duplicate) already exists.' }, target)
		).toBe(false);
	});
});
