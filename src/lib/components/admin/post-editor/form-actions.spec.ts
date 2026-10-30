import { describe, expect, it } from 'vitest';
import {
	createEmptyForm,
	hydrateFromFullPost,
	buildPostPayload,
	canonicalFieldsAfterSave,
	getDraftStorageKey
} from './form-actions';
import { computeWordDiff } from './diff';

describe('Post Editor form-actions & Myers Word Diff Suite', () => {
	it('omits password when editing a password_protected post with empty passwordPlaintext, and sends empty string when clearPassword is true', () => {
		const form = createEmptyForm();
		form.id = 42;
		form.title = 'Protected Options Alert';
		form.slug = 'protected-options-alert';
		form.visibility = 'password_protected';
		form.hasExistingPassword = true;
		form.passwordPlaintext = '';
		form.clearPassword = false;

		const payloadKeep = buildPostPayload(form);
		expect('password' in payloadKeep).toBe(false);

		// When admin enters a new password, it is sent
		form.passwordPlaintext = 'NewSecret99';
		const payloadUpdate = buildPostPayload(form);
		expect(payloadUpdate.password).toBe('NewSecret99');

		// When admin clears password, empty string is sent
		form.passwordPlaintext = '';
		form.clearPassword = true;
		const payloadClear = buildPostPayload(form);
		expect(payloadClear.password).toBe('');
	});

	it('hydrates full post JSON fields and syncs canonical fields after save', () => {
		const hydrated = hydrateFromFullPost({
			id: 7,
			title: 'SPX Gamma Guide',
			slug: 'spx-gamma-guide',
			content: '<p>Body</p>',
			categoryId: 2,
			categoryIds: [2, 5],
			tagIds: [10, 11],
			relatedPostIds: [3],
			visibility: 'password_protected',
			hasPassword: true,
			secondaryKeywords: JSON.stringify(['zero dte', 'dealer gamma']),
			faqItems: JSON.stringify([{ question: 'What is GEX?', answer: 'Gamma exposure.' }]),
			customFields: JSON.stringify([{ key: 'ticker', value: 'SPX' }]),
			updatedAt: '2026-10-30T12:00:00.000Z'
		});

		expect(hydrated.id).toBe(7);
		expect(hydrated.categoryIds).toEqual([2, 5]);
		expect(hydrated.tagIds).toEqual([10, 11]);
		expect(hydrated.hasExistingPassword).toBe(true);
		expect(hydrated.secondaryKeywords).toEqual(['zero dte', 'dealer gamma']);
		expect(hydrated.faqItems).toEqual([{ question: 'What is GEX?', answer: 'Gamma exposure.' }]);
		expect(hydrated.customFields).toEqual([{ key: 'ticker', value: 'SPX' }]);
		expect(hydrated.expectedUpdatedAt).toBe('2026-10-30T12:00:00.000Z');

		const synced = canonicalFieldsAfterSave(hydrated, {
			id: 7,
			title: 'SPX Gamma Guide, Updated',
			slug: 'spx-gamma-guide',
			excerpt: 'Auto-generated excerpt',
			metaTitle: 'SPX Gamma Guide',
			seoScore: 88,
			wordCount: 1250,
			readingTime: 6,
			updatedAt: '2026-10-30T12:05:00.000Z'
		});

		expect(synced.title).toBe('SPX Gamma Guide, Updated');
		expect(synced.excerpt).toBe('Auto-generated excerpt');
		expect(synced.seoScore).toBe(88);
		expect(synced.wordCount).toBe(1250);
		expect(synced.expectedUpdatedAt).toBe('2026-10-30T12:05:00.000Z');
		expect(getDraftStorageKey(null)).toBe('post-draft:new');
		expect(getDraftStorageKey(7)).toBe('post-draft:7');
	});

	it('computes accurate Myers word-level diffs quickly even on large 3,000-word articles', () => {
		const smallDiff = computeWordDiff('Buy the 5800 call at open', 'Buy the 5850 put at close');
		expect(smallDiff).toEqual([
			{ type: 'equal', text: 'Buy the ' },
			{ type: 'delete', text: '5800 call ' },
			{ type: 'insert', text: '5850 put ' },
			{ type: 'equal', text: 'at ' },
			{ type: 'delete', text: 'open' },
			{ type: 'insert', text: 'close' }
		]);

		// Large 3,000-word article performance & correctness check
		const baseParagraph = Array.from(
			{ length: 300 },
			(_, i) => `Sentence ${i} explains institutional options flow and risk discipline.`
		).join(' ');
		const modifiedParagraph = baseParagraph.replace(
			'Sentence 150 explains institutional options flow',
			'Sentence 150 details dealer gamma hedging mechanics'
		);

		const t0 = performance.now();
		const largeDiff = computeWordDiff(baseParagraph, modifiedParagraph);
		const elapsedMs = performance.now() - t0;

		expect(elapsedMs).toBeLessThan(100);
		expect(largeDiff.some((c) => c.type === 'delete' && c.text.includes('institutional'))).toBe(
			true
		);
		expect(largeDiff.some((c) => c.type === 'insert' && c.text.includes('dealer gamma'))).toBe(
			true
		);
	});
});
