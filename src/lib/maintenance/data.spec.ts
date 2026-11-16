import { describe, it, expect } from 'vite-plus/test';
import { createBarPlayback, demonstrationBars, ema, validateBars } from './data.ts';
describe('maintenance market study', () => {
	it('is deterministic with valid OHLCV and increasing UTC timestamps', () => {
		const bars = demonstrationBars();
		validateBars(bars);
		expect(bars).toEqual(demonstrationBars());
		expect(bars[1].time - bars[0].time).toBe(300);
	});
	it('seeds EMA using SMA then applies the standard exponential recurrence', () => {
		const bars = demonstrationBars();
		const values = ema(bars);
		const seed = bars.slice(0, 20).reduce((sum, b) => sum + b.close, 0) / 20;
		expect(values[0].value).toBeCloseTo(seed, 10);
		expect(values[1].value).toBeCloseTo((bars[20].close * 2) / 21 + (seed * 19) / 21, 10);
	});
	it('rejects reversed timestamps and impossible candle bounds', () => {
		const bars = demonstrationBars();
		bars[1].time = bars[0].time;
		expect(() => validateBars(bars)).toThrow();
		bars[1].time += 300;
		bars[0].high = 0;
		expect(() => validateBars(bars)).toThrow();
	});
	it('starts playback at the open and finishes at the exact completed candle', () => {
		for (const bar of demonstrationBars()) {
			const sample = createBarPlayback(bar);
			expect(sample(0)).toEqual({
				...bar,
				close: bar.open,
				high: bar.open,
				low: bar.open,
				volume: 0
			});
			expect(sample(1)).toEqual(bar);
			expect(sample(-1)).toEqual(sample(0));
			expect(sample(2)).toEqual(bar);
		}
	});
	it('keeps tick prices bounded while candle wicks and volume accumulate', () => {
		for (const bar of demonstrationBars()) {
			const sample = createBarPlayback(bar);
			let previous = sample(0);
			for (let tick = 1; tick <= 200; tick++) {
				const current = sample(tick / 200);
				expect(current.open).toBe(bar.open);
				expect(current.time).toBe(bar.time);
				expect(current.close).toBeGreaterThanOrEqual(bar.low);
				expect(current.close).toBeLessThanOrEqual(bar.high);
				expect(current.high).toBeGreaterThanOrEqual(
					Math.max(current.open, current.close, previous.high)
				);
				expect(current.high).toBeLessThanOrEqual(bar.high);
				expect(current.low).toBeLessThanOrEqual(
					Math.min(current.open, current.close, previous.low)
				);
				expect(current.low).toBeGreaterThanOrEqual(bar.low);
				expect(current.volume).toBeGreaterThanOrEqual(previous.volume);
				expect(current.volume).toBeLessThanOrEqual(bar.volume);
				expect(Number.isInteger(current.volume)).toBe(true);
				previous = current;
			}
		}
	});
	it('repeats its tick path and includes price reversals before the close', () => {
		const bar = demonstrationBars()[160];
		const first = createBarPlayback(bar),
			second = createBarPlayback(bar);
		const prices = Array.from({ length: 201 }, (_, tick) => {
			const progress = tick / 200;
			expect(first(progress)).toEqual(second(progress));
			return first(progress).close;
		});
		const changes = prices.slice(1).map((price, index) => price - prices[index]);
		expect(changes.some((change) => change > 0)).toBe(true);
		expect(changes.some((change) => change < 0)).toBe(true);
	});
	it('rejects non-finite playback progress', () => {
		const sample = createBarPlayback(demonstrationBars()[0]);
		for (const progress of [NaN, Infinity, -Infinity]) {
			expect(() => sample(progress)).toThrow('Invalid playback progress');
		}
	});
});
