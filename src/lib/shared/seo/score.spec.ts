import { describe, expect, it } from 'vitest';
import {
	enforcePublishSeoGate,
	getSeoScore,
	PLACEHOLDER_SENTINEL,
	type SeoScoreInput
} from './score';

function makePassingBaseInput(): SeoScoreInput {
	const fillerWords = Array.from({ length: 620 }, (_, i) => `word${i}`).join(' ');
	return {
		title: 'Options Greeks Risk Discipline Guide for Institutional Desks',
		slug: 'options-greeks-risk-discipline-guide',
		content: `<p>Mastering options greeks is critical for risk management. ${fillerWords}</p><p><a href="https://www.cboe.com/tradable_products/sp_500/spx_options/">Cboe SPX</a> and <a href="https://www.cmegroup.com/markets/equities.html">CME Equity Options</a>.</p><img src="https://revolutiontradingpros.com/media/chart.webp" alt="Options greeks gamma curve" width="1200" height="675" />`,
		excerpt:
			'Learn how institutional options desks structure Delta, Gamma, Theta, and Vega exposure to protect capital across volatile market regimes.',
		metaTitle: 'Options Greeks Risk Discipline Guide for Active Traders',
		metaDescription:
			'Master options greeks risk discipline with our institutional breakdown of Delta, Gamma, Theta, and Vega exposure across volatile expirations.',
		coverImage: 'https://revolutiontradingpros.com/media/cover.webp',
		coverImageAlt: 'Institutional options risk curve showing Delta and Gamma zones',
		coverImageCaption: 'Delta and Gamma exposure zones across strikes.',
		ogImage: 'https://revolutiontradingpros.com/media/cover.webp',
		authorId: 1,
		categoryId: 2,
		categoryIds: [2],
		tagIds: [10, 11],
		focusKeyword: 'options greeks',
		faqItems: JSON.stringify([
			{
				question: 'What is Delta in options trading?',
				answer:
					'Delta measures the expected price change of an option contract for every one dollar move in the underlying asset.'
			},
			{
				question: 'Why does Gamma matter near expiration?',
				answer:
					'Gamma measures the rate of change in Delta and accelerates sharply near at-the-money strikes during expiration week.'
			},
			{
				question: 'How do desks hedge Theta decay?',
				answer:
					'Institutional desks balance short-dated and longer-dated structures or sell outer-wing premium to offset daily Theta decay.'
			}
		])
	};
}

describe('getSeoScore & enforcePublishSeoGate (Section 7.6 Table)', () => {
	it('returns 100/100 and publishable=true for a fully compliant post', () => {
		const res = getSeoScore(makePassingBaseInput());
		expect(res.score).toBe(100);
		expect(res.publishable).toBe(true);
		expect(res.band).toBe('good');
		expect(res.label).toBe('Excellent');
		expect(res.issues).toEqual([]);
	});

	it('Row 1: Missing meta title -> error -10 BLOCK', () => {
		const res = getSeoScore({ ...makePassingBaseInput(), metaTitle: '' });
		const issue = res.issues.find((i) => i.id === 'missing_meta_title');
		expect(issue).toMatchObject({ severity: 'error', points: 10, blocking: true });
		expect(res.publishable).toBe(false);
	});

	it('Row 2 & 3: Meta title > 60 (-5 warn) and Meta title < 30 (-5 warn)', () => {
		const tooLong = getSeoScore({
			...makePassingBaseInput(),
			metaTitle: 'Options Greeks Risk Discipline Guide for Institutional Trading Desks Today'
		});
		expect(tooLong.issues.find((i) => i.id === 'meta_title_too_long')).toMatchObject({
			severity: 'warn',
			points: 5,
			blocking: false
		});

		const tooShort = getSeoScore({
			...makePassingBaseInput(),
			metaTitle: 'Options Greeks Guide'
		});
		expect(tooShort.issues.find((i) => i.id === 'meta_title_too_short')).toMatchObject({
			severity: 'warn',
			points: 5,
			blocking: false
		});
	});

	it('Row 4: Meta title starts with a lowercase letter -> error -10 BLOCK', () => {
		const res = getSeoScore({
			...makePassingBaseInput(),
			metaTitle: 'options Greeks Risk Discipline Guide for Active Traders'
		});
		expect(res.issues.find((i) => i.id === 'meta_title_lowercase')).toMatchObject({
			severity: 'error',
			points: 10,
			blocking: true
		});
		expect(res.publishable).toBe(false);
	});

	it('Row 5, 6, 7: Missing meta description (-10 BLOCK), > 155 (-5 warn), < 70 (-5 warn)', () => {
		const missing = getSeoScore({ ...makePassingBaseInput(), metaDescription: '' });
		expect(missing.issues.find((i) => i.id === 'missing_meta_description')).toMatchObject({
			severity: 'error',
			points: 10,
			blocking: true
		});
		expect(missing.publishable).toBe(false);

		const over155 = getSeoScore({
			...makePassingBaseInput(),
			metaDescription: `Options greeks ${'a'.repeat(150)}`
		});
		expect(over155.issues.find((i) => i.id === 'meta_description_too_long')).toMatchObject({
			severity: 'warn',
			points: 5,
			blocking: false
		});

		const under70 = getSeoScore({
			...makePassingBaseInput(),
			metaDescription: 'Options greeks short description under seventy chars.'
		});
		expect(under70.issues.find((i) => i.id === 'meta_description_too_short')).toMatchObject({
			severity: 'warn',
			points: 5,
			blocking: false
		});
	});

	it('Row 8, 9, 10: No cover & no OG (-10 BLOCK), cover set with blank alt (-10 BLOCK), cover alt equals title (-10 BLOCK)', () => {
		const noCoverNoOg = getSeoScore({
			...makePassingBaseInput(),
			coverImage: '',
			ogImage: ''
		});
		expect(noCoverNoOg.issues.find((i) => i.id === 'missing_cover_and_og_image')).toMatchObject({
			severity: 'error',
			points: 10,
			blocking: true
		});

		const blankAlt = getSeoScore({
			...makePassingBaseInput(),
			coverImageAlt: '   '
		});
		expect(blankAlt.issues.find((i) => i.id === 'missing_cover_alt')).toMatchObject({
			severity: 'error',
			points: 10,
			blocking: true
		});

		const base = makePassingBaseInput();
		const altEqualsTitle = getSeoScore({
			...base,
			coverImageAlt: base.title.toLowerCase()
		});
		expect(altEqualsTitle.issues.find((i) => i.id === 'cover_alt_equals_title')).toMatchObject({
			severity: 'error',
			points: 10,
			blocking: true
		});
	});

	it('Row 11 & 12: Body <img> missing width/height (-4 warn once) and none having focus keyword in alt (-3 warn)', () => {
		const base = makePassingBaseInput();
		const modifiedContent = base.content.replace(
			'<img src="https://revolutiontradingpros.com/media/chart.webp" alt="Options greeks gamma curve" width="1200" height="675" />',
			"<img src='https://revolutiontradingpros.com/media/chart1.webp' alt='Chart one' /><img src='https://revolutiontradingpros.com/media/chart2.webp' alt='Chart two' />"
		);
		const res = getSeoScore({ ...base, content: modifiedContent });
		expect(res.issues.filter((i) => i.id === 'body_img_missing_dimensions')).toHaveLength(1);
		expect(res.issues.find((i) => i.id === 'body_img_missing_dimensions')?.points).toBe(4);
		expect(res.issues.find((i) => i.id === 'body_img_missing_keyword_alt')).toMatchObject({
			severity: 'warn',
			points: 3,
			blocking: false
		});
	});

	it('Row 13, 14, 15, 16, 17: Missing excerpt (-5 warn), no author (-8 BLOCK), no category (-5 BLOCK), 0 tags (-5 BLOCK), 1 tag (-2 warn)', () => {
		const noExcerpt = getSeoScore({ ...makePassingBaseInput(), excerpt: '' });
		expect(noExcerpt.issues.find((i) => i.id === 'missing_excerpt')).toMatchObject({
			severity: 'warn',
			points: 5,
			blocking: false
		});

		const noAuthor = getSeoScore({ ...makePassingBaseInput(), authorId: null });
		expect(noAuthor.issues.find((i) => i.id === 'missing_author')).toMatchObject({
			severity: 'error',
			points: 8,
			blocking: true
		});

		const noCat = getSeoScore({
			...makePassingBaseInput(),
			categoryId: null,
			categoryIds: []
		});
		expect(noCat.issues.find((i) => i.id === 'missing_category')).toMatchObject({
			severity: 'error',
			points: 5,
			blocking: true
		});

		const zeroTags = getSeoScore({ ...makePassingBaseInput(), tagIds: [] });
		expect(zeroTags.issues.find((i) => i.id === 'zero_tags')).toMatchObject({
			severity: 'error',
			points: 5,
			blocking: true
		});

		const oneTag = getSeoScore({ ...makePassingBaseInput(), tagIds: [10] });
		expect(oneTag.issues.find((i) => i.id === 'single_tag')).toMatchObject({
			severity: 'warn',
			points: 2,
			blocking: false
		});
	});

	it('Row 18, 19, 20, 21, 22: Focus keyword checks (-8 error non-blocking, -5 title, -5 desc, -3 slug, -5 body)', () => {
		const noKw = getSeoScore({ ...makePassingBaseInput(), focusKeyword: '' });
		expect(noKw.issues.find((i) => i.id === 'missing_focus_keyword')).toMatchObject({
			severity: 'error',
			points: 8,
			blocking: false
		});

		const mismatchedKw = getSeoScore({
			...makePassingBaseInput(),
			focusKeyword: 'iron condor'
		});
		expect(mismatchedKw.issues.find((i) => i.id === 'keyword_missing_in_meta_title')?.points).toBe(
			5
		);
		expect(
			mismatchedKw.issues.find((i) => i.id === 'keyword_missing_in_meta_description')?.points
		).toBe(5);
		expect(mismatchedKw.issues.find((i) => i.id === 'keyword_missing_in_slug')?.points).toBe(3);
		expect(mismatchedKw.issues.find((i) => i.id === 'keyword_missing_in_body')?.points).toBe(5);
	});

	it('Row 23, 24, 25: Word count < 300 (-10 BLOCK), 300..599 (-3 warn), duplicate h1/h2 title (-3 warn)', () => {
		const base = makePassingBaseInput();
		const shortBody =
			'<p>Options greeks short text <a href="https://cboe.com">Cboe</a> <a href="https://cmegroup.com">CME</a></p>';
		const under300 = getSeoScore({ ...base, content: shortBody });
		expect(under300.issues.find((i) => i.id === 'words_below_300')).toMatchObject({
			severity: 'error',
			points: 10,
			blocking: true
		});

		const mediumWords = Array.from({ length: 350 }, (_, i) => `word${i}`).join(' ');
		const between300And600 = getSeoScore({
			...base,
			content: `<h2>${base.title}</h2><p>Options greeks ${mediumWords} <a href="https://cboe.com">Cboe</a> <a href="https://cmegroup.com">CME</a></p>`
		});
		expect(between300And600.issues.find((i) => i.id === 'words_below_600')).toMatchObject({
			severity: 'warn',
			points: 3,
			blocking: false
		});
		expect(between300And600.issues.find((i) => i.id === 'duplicate_title_heading')).toMatchObject({
			severity: 'warn',
			points: 3,
			blocking: false
		});
	});

	it('Row 26, 27, 28, 29: Slug > 70 (-3 warn), slug >= 3 gate stop words (-3 warn), 0 external authority domains (-12 BLOCK), 1 domain (-8 error non-blocking)', () => {
		const base = makePassingBaseInput();
		const slugChecks = getSeoScore({
			...base,
			slug: 'options-greeks-for-the-and-with-from-institutional-portfolio-hedging-desk'
		});
		expect(slugChecks.issues.find((i) => i.id === 'slug_over_70')?.points).toBe(3);
		expect(slugChecks.issues.find((i) => i.id === 'slug_too_many_stop_words')?.points).toBe(3);

		// Social and own-domain links do not count as external authority domains
		const zeroExt = getSeoScore({
			...base,
			content: base.content
				.replace('https://www.cboe.com/tradable_products/sp_500/spx_options/', 'https://x.com/post')
				.replace(
					'https://www.cmegroup.com/markets/equities.html',
					'https://revolutiontradingpros.com/about'
				)
		});
		expect(zeroExt.issues.find((i) => i.id === 'zero_external_authority_domains')).toMatchObject({
			severity: 'error',
			points: 12,
			blocking: true
		});

		const oneExt = getSeoScore({
			...base,
			content: base.content.replace(
				'https://www.cmegroup.com/markets/equities.html',
				'https://youtube.com/watch?v=1'
			)
		});
		expect(oneExt.issues.find((i) => i.id === 'one_external_authority_domain')).toMatchObject({
			severity: 'error',
			points: 8,
			blocking: false
		});
	});

	it('Row 30, 31, 32, 33, 34, 35: FAQ counts/length, freshness > 180d, placeholder sentinel (-100 BLOCK), and em/en dash (-25 BLOCK)', () => {
		const base = makePassingBaseInput();

		const noFaq = getSeoScore({ ...base, faqItems: '[]' });
		expect(noFaq.issues.find((i) => i.id === 'no_faq_items')?.points).toBe(5);

		const twoFaq = getSeoScore({
			...base,
			faqItems: JSON.stringify([
				{ question: 'Q1?', answer: 'A'.repeat(45) },
				{ question: 'Q2?', answer: 'B'.repeat(45) }
			])
		});
		expect(twoFaq.issues.find((i) => i.id === 'fewer_than_3_faq_items')?.points).toBe(3);

		const shortFaq = getSeoScore({
			...base,
			faqItems: JSON.stringify([
				{ question: 'Q1?', answer: 'Too short' },
				{ question: 'Q2?', answer: 'B'.repeat(45) },
				{ question: 'Q3?', answer: 'C'.repeat(45) }
			])
		});
		expect(shortFaq.issues.find((i) => i.id === 'short_faq_answer')?.points).toBe(2);

		const oldDate = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString();
		const stale = getSeoScore({
			...base,
			publishedAt: oldDate,
			updatedAt: oldDate
		});
		expect(stale.issues.find((i) => i.id === 'stale_unupdated_post')?.points).toBe(4);

		const sentinel = getSeoScore({
			...base,
			content: `${base.content}<p>${PLACEHOLDER_SENTINEL}</p>`
		});
		expect(sentinel.issues.find((i) => i.id === 'unresolved_placeholder_sentinel')).toMatchObject({
			severity: 'error',
			points: 100,
			blocking: true
		});
		expect(sentinel.publishable).toBe(false);

		const withDash = getSeoScore({
			...base,
			title: `Options Greeks \u2014 Risk Guide`
		});
		expect(withDash.issues.find((i) => i.id === 'contains_em_or_en_dash')).toMatchObject({
			severity: 'error',
			points: 25,
			blocking: true
		});
		expect(withDash.publishable).toBe(false);
		expect(() => enforcePublishSeoGate({ ...base, title: `Bad \u2014 Title` })).toThrow(
			/^SEO_GATE_BLOCKED:/
		);
	});
});
