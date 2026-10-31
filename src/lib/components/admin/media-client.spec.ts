import { describe, expect, it } from 'vitest';
import { MediaRequestError, runBounded } from './media-client';

describe('runBounded', () => {
	it('never exceeds the concurrency limit and returns results in input order', async () => {
		let inFlight = 0;
		let peak = 0;
		const results = await runBounded([1, 2, 3, 4, 5, 6, 7], 3, async (n) => {
			inFlight += 1;
			peak = Math.max(peak, inFlight);
			await new Promise((r) => setTimeout(r, 5));
			inFlight -= 1;
			if (n === 4) throw new MediaRequestError('in use', 409, [{ id: 1, title: 'T', slug: 's' }]);
		});

		expect(peak).toBe(3);
		expect(results.map((r) => r.item)).toEqual([1, 2, 3, 4, 5, 6, 7]);
		const failed = results.filter((r) => !r.ok);
		expect(failed).toHaveLength(1);
		const first = failed[0]!;
		expect(
			first.ok === false && first.error instanceof MediaRequestError && first.error.status
		).toBe(409);
	});

	it('handles an empty list', async () => {
		expect(await runBounded([], 3, async () => undefined)).toEqual([]);
	});
});
