import { describe, expect, it } from 'vite-plus/test';
import { resolvePostModifiedIso } from '#lib/seo/blog-seo';
import { resolvePostModifiedDate } from './rss';

describe('resolvePostModifiedDate', () => {
	const editorial = new Date('2025-02-02T00:00:00.000Z');
	const published = new Date('2025-01-01T00:00:00.000Z');

	it('prefers contentUpdatedAt, then publishedAt', () => {
		expect(
			resolvePostModifiedDate({ contentUpdatedAt: editorial, publishedAt: published })
		).toEqual(editorial);
		expect(resolvePostModifiedDate({ publishedAt: published })).toEqual(published);
	});

	it('accepts ISO strings', () => {
		expect(resolvePostModifiedDate({ contentUpdatedAt: editorial.toISOString() })).toEqual(
			editorial
		);
	});

	it('ignores updatedAt and createdAt even when present at runtime', () => {
		const row = {
			publishedAt: undefined,
			updatedAt: new Date('2026-06-06T00:00:00.000Z'),
			createdAt: new Date('2020-01-01T00:00:00.000Z')
		};
		expect(resolvePostModifiedDate(row)).toBeNull();
		expect(resolvePostModifiedDate({ ...row, publishedAt: published })).toEqual(published);
	});

	it('returns null for missing or unparseable input, never an epoch placeholder', () => {
		expect(resolvePostModifiedDate({})).toBeNull();
		expect(resolvePostModifiedDate({ contentUpdatedAt: 'not-a-date' })).toBeNull();
		expect(resolvePostModifiedIso({})).toBeUndefined();
	});
});
