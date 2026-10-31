import { describe, expect, it } from 'vitest';
import { enforcePublishSeoGate } from '#lib/shared/seo/score';
import { parsePublishGateRefusal } from './publish-gate';

describe('parsePublishGateRefusal', () => {
	it('returns null for text that is not a publish-gate refusal', () => {
		expect(parsePublishGateRefusal('Post title is required.')).toBeNull();
		expect(parsePublishGateRefusal('')).toBeNull();
	});

	it('splits the summary, blocking errors, non-blocking errors and warnings', () => {
		const text = [
			'SEO_GATE_BLOCKED: SEO score is 40/100 (minimum required: 80/100 with zero blocking errors).',
			'',
			'Errors (items marked [BLOCKING] stop publishing on their own):',
			'- [BLOCKING] Missing meta title (-10)',
			'- No focus keyword (-8)',
			'',
			'Top warnings:',
			'- Meta description is short (-5)'
		].join('\n');

		expect(parsePublishGateRefusal(text)).toEqual({
			summary: 'SEO score is 40/100 (minimum required: 80/100 with zero blocking errors).',
			errors: [
				{ message: 'Missing meta title', points: 10, blocking: true },
				{ message: 'No focus keyword', points: 8, blocking: false }
			],
			warnings: [{ message: 'Meta description is short', points: 5, blocking: false }]
		});
	});

	it('round-trips the text the server actually throws from enforcePublishSeoGate', () => {
		let thrown: unknown = null;
		try {
			enforcePublishSeoGate({ title: 'Bad — Title', slug: 'bad-title', content: '' });
		} catch (err) {
			thrown = err;
		}
		expect(thrown).toBeInstanceOf(Error);
		const parsed = parsePublishGateRefusal((thrown as Error).message);
		expect(parsed).not.toBeNull();
		expect(parsed?.summary).toMatch(/^SEO score is \d+\/100/);
		const blocking = parsed?.errors.filter((e) => e.blocking) ?? [];
		expect(blocking.length).toBeGreaterThan(0);
		expect(blocking.every((e) => e.message.length > 0 && e.points !== null)).toBe(true);
	});
});
