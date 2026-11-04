/** Deterministic demonstration candles; these are not exchange prices or performance. */
export type Bar = {
	time: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
};
export function demonstrationBars(count = 240): Bar[] {
	let seed = 29117,
		close = 520;
	const rand = () => {
		seed = (seed * 1664525 + 1013904223) >>> 0;
		return seed / 4294967296;
	};
	return Array.from({ length: count }, (_, i) => {
		const open = close;
		close = Math.round((open + (rand() - 0.48) * 1.5 + Math.sin(i / 18) * 0.16) * 100) / 100;
		return {
			time: Date.UTC(2026, 10, 3, 9, 30) / 1000 + i * 300,
			open,
			close,
			high: Math.round((Math.max(open, close) + rand() * 0.6) * 100) / 100,
			low: Math.round((Math.min(open, close) - rand() * 0.6) * 100) / 100,
			volume: Math.round(20000 + rand() * 180000)
		};
	});
}
export function ema(bars: Bar[], period = 20) {
	if (!Number.isInteger(period) || period < 1) throw new Error('Invalid EMA period');
	let value = 0;
	return bars.flatMap((bar, i) => {
		if (i < period) {
			value += bar.close / period;
			return i === period - 1 ? [{ time: bar.time, value }] : [];
		}
		value = bar.close * (2 / (period + 1)) + value * (1 - 2 / (period + 1));
		return [{ time: bar.time, value }];
	});
}
export function validateBars(bars: Bar[]) {
	if (bars.length < 80) throw new Error('Insufficient chart warm-up');
	bars.forEach((b, i) => {
		if (
			Object.values(b).some((v) => !Number.isFinite(v)) ||
			(i && b.time <= bars[i - 1].time) ||
			b.low > Math.min(b.open, b.close) ||
			b.high < Math.max(b.open, b.close) ||
			b.volume < 0
		)
			throw new Error('Invalid candle data');
	});
}
