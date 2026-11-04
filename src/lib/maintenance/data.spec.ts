import { describe, it, expect } from 'vite-plus/test';
import { demonstrationBars, ema, validateBars } from './data.ts';
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
});
