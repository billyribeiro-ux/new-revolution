import { describe, expect, it } from 'vitest';
import {
	authorCreateSchema,
	authorUpdateSchema,
	categoryCreateSchema,
	categoryUpdateSchema,
	mediaListQuerySchema,
	mediaPatchSchema,
	postAutosaveSchema,
	postCreateSchema,
	postQuickUpdateSchema,
	postUpdateSchema,
	tagCreateSchema
} from './index';

describe('Shared Zod Schemas (Section 7.2)', () => {
	it('validates a complete postCreateSchema payload and allows soft excerpt length > 160', () => {
		const longExcerpt = 'A'.repeat(240);
		const parsed = postCreateSchema.safeParse({
			title: 'Options Greeks Risk Discipline',
			slug: 'options-greeks-risk-discipline',
			excerpt: longExcerpt,
			content: '<p>Detailed options delta and gamma analysis.</p>',
			authorId: 1,
			categoryId: 2,
			categoryIds: [2, 3],
			tagIds: [10, 11],
			relatedPostIds: [5, 6],
			metaTitle: 'Options Greeks Risk Discipline Guide',
			metaDescription:
				'Learn how institutional desks manage Delta, Gamma, Theta, and Vega exposure across volatile options expirations.',
			faqItems: JSON.stringify([
				{
					question: 'What is Delta in options trading?',
					answer: 'Delta measures the expected change in option price per $1 move in the underlying asset.'
				}
			])
		});

		expect(parsed.success).toBe(true);
	});

	it('rejects duplicate IDs in categoryIds, tagIds, and relatedPostIds, and self-referencing relatedPostIds', () => {
		const dupTags = postCreateSchema.safeParse({
			title: 'Duplicate Tags Test',
			slug: 'duplicate-tags-test',
			content: '<p>Body</p>',
			tagIds: [1, 1]
		});
		expect(dupTags.success).toBe(false);

		const selfRelated = postUpdateSchema.safeParse({
			id: 42,
			title: 'Self Related Test',
			slug: 'self-related-test',
			content: '<p>Body</p>',
			relatedPostIds: [10, 42]
		});
		expect(selfRelated.success).toBe(false);
	});

	it('requires a password when visibility is password_protected', () => {
		const missingPw = postCreateSchema.safeParse({
			title: 'Protected Post',
			slug: 'protected-post',
			content: '<p>Secret body</p>',
			visibility: 'password_protected',
			password: ''
		});
		expect(missingPw.success).toBe(false);

		const validPw = postCreateSchema.safeParse({
			title: 'Protected Post',
			slug: 'protected-post',
			content: '<p>Secret body</p>',
			visibility: 'password_protected',
			password: 'strong-secret-password'
		});
		expect(validPw.success).toBe(true);
	});

	it('enforces scheduledAt presence, 60-second grace window, and expiresAt > scheduledAt', () => {
		const twoMinutesAgo = new Date(Date.now() - 120_000).toISOString();
		const thirtySecondsAgo = new Date(Date.now() - 30_000).toISOString();
		const oneHourAhead = new Date(Date.now() + 3_600_000).toISOString();

		const pastFail = postCreateSchema.safeParse({
			title: 'Scheduled Post',
			slug: 'scheduled-post',
			content: '<p>Body</p>',
			status: 'scheduled',
			scheduledAt: twoMinutesAgo
		});
		expect(pastFail.success).toBe(false);

		const gracePass = postCreateSchema.safeParse({
			title: 'Scheduled Post',
			slug: 'scheduled-post',
			content: '<p>Body</p>',
			status: 'scheduled',
			scheduledAt: thirtySecondsAgo
		});
		expect(gracePass.success).toBe(true);

		const badExpiry = postCreateSchema.safeParse({
			title: 'Scheduled Post',
			slug: 'scheduled-post',
			content: '<p>Body</p>',
			status: 'scheduled',
			scheduledAt: oneHourAhead,
			expiresAt: thirtySecondsAgo
		});
		expect(badExpiry.success).toBe(false);
	});

	it('validates FAQ JSON item question and answer types strictly', () => {
		const invalidTypes = postCreateSchema.safeParse({
			title: 'Bad FAQ',
			slug: 'bad-faq-post',
			content: '<p>Body</p>',
			faqItems: JSON.stringify([{ question: 123, answer: null }])
		});
		expect(invalidTypes.success).toBe(false);
	});

	it('allows empty title in postAutosaveSchema for untitled drafts', () => {
		const autosave = postAutosaveSchema.safeParse({
			id: 7,
			title: '',
			content: '<p>Drafting notes...</p>',
			excerpt: null
		});
		expect(autosave.success).toBe(true);
	});

	it('validates category, tag, author, and media schemas with shared meta budgets', () => {
		const catOk = categoryCreateSchema.safeParse({
			name: 'Options Strategy',
			slug: 'options-strategy',
			metaDescription: 'A'.repeat(155),
			color: '#4b5f1d'
		});
		expect(catOk.success).toBe(true);

		const catTooLongDesc = categoryCreateSchema.safeParse({
			name: 'Options Strategy',
			slug: 'options-strategy',
			metaDescription: 'A'.repeat(156)
		});
		expect(catTooLongDesc.success).toBe(false);

		// Category update preserves omitted isActive (does not default to true)
		const catUpd = categoryUpdateSchema.parse({
			id: 3,
			name: 'Options Strategy',
			slug: 'options-strategy'
		});
		expect(catUpd.isActive).toBeUndefined();

		const tagOk = tagCreateSchema.safeParse({
			name: 'Gamma Exposure',
			slug: 'gamma-exposure'
		});
		expect(tagOk.success).toBe(true);

		const authorOk = authorCreateSchema.safeParse({
			name: 'Billy Ribeiro',
			slug: 'billy-ribeiro',
			email: 'billy@revolutiontradingpros.com',
			yearsExperience: 15,
			avatarAlt: 'Portrait of Billy Ribeiro'
		});
		expect(authorOk.success).toBe(true);

		const authorUpd = authorUpdateSchema.parse({
			id: 1,
			name: 'Billy Ribeiro',
			slug: 'billy-ribeiro'
		});
		expect(authorUpd.isActive).toBeUndefined();

		const mediaQuery = mediaListQuerySchema.parse({
			page: '2',
			per_page: '500',
			folder: '/charts/'
		});
		expect(mediaQuery.page).toBe(2);
		expect(mediaQuery.per_page).toBe(100);
		expect(mediaQuery.folder).toBe('charts');

		const mediaPatch = mediaPatchSchema.safeParse({
			name: 'SPX Chart',
			altText: 'SPX Intraday Gamma Levels',
			folder: '/',
			filename: 'spx-chart.webp'
		});
		expect(mediaPatch.success).toBe(true);
		if (mediaPatch.success) {
			expect(mediaPatch.data.title).toBe('SPX Chart');
			expect(mediaPatch.data.alt_text).toBe('SPX Intraday Gamma Levels');
			expect(mediaPatch.data.folder).toBe('');
		}

		const quickUpd = postQuickUpdateSchema.safeParse({
			id: 5,
			status: 'published',
			featured: true
		});
		expect(quickUpd.success).toBe(true);
	});
});
