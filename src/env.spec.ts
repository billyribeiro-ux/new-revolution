import { describe, expect, it } from 'vitest';
import { variables } from './env.ts';

describe('src/env.ts environment variable validators', () => {
	it('provides safe non-empty fallback defaults when DATABASE_URL, ORIGIN, or BETTER_AUTH_SECRET are undefined or empty', () => {
		for (const key of ['DATABASE_URL', 'ORIGIN', 'BETTER_AUTH_SECRET'] as const) {
			const schema = variables[key].schema as {
				'~standard': { validate: (val: unknown) => { value?: string; issues?: unknown[] } };
			};
			expect(schema).toBeDefined();

			const fromUndefined = schema['~standard'].validate(undefined);
			expect(fromUndefined.issues).toBeUndefined();
			expect(typeof fromUndefined.value).toBe('string');
			expect(fromUndefined.value!.length).toBeGreaterThan(0);

			const fromEmpty = schema['~standard'].validate('');
			expect(fromEmpty.issues).toBeUndefined();
			expect(typeof fromEmpty.value).toBe('string');
			expect(fromEmpty.value!.length).toBeGreaterThan(0);
		}
	});
});
