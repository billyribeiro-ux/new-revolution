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

/** A repeatable tick path inside a demonstration candle's exact OHLC bounds. */
export function createBarPlayback(bar: Bar) {
	let seed = (bar.time ^ Math.round(bar.open * 100)) >>> 0;
	const rand = () => {
		seed = (seed * 1664525 + 1013904223) >>> 0;
		return seed / 4294967296;
	};
	const lowFirst = rand() < (bar.close >= bar.open ? 0.7 : 0.3);
	const anchors = [
		{ index: 0, price: bar.open },
		{ index: 7, price: lowFirst ? bar.low : bar.high },
		{
			index: 15,
			price: Math.max(
				bar.low,
				Math.min(bar.high, Math.round(((bar.open + bar.close) / 2) * 100) / 100)
			)
		},
		{ index: 24, price: lowFirst ? bar.high : bar.low },
		{ index: 32, price: bar.close }
	];
	const range = bar.high - bar.low;
	let segment = 0,
		elapsed = 0,
		traded = 0,
		high = bar.open,
		low = bar.open;
	const ticks = Array.from({ length: 33 }, (_, index) => {
		while (index > anchors[segment + 1].index) segment++;
		const from = anchors[segment],
			to = anchors[segment + 1],
			fraction = (index - from.index) / (to.index - from.index);
		const anchor = index === from.index ? from : index === to.index ? to : undefined;
		const noise = (rand() - 0.5) * range * 0.28 * Math.sin(Math.PI * fraction);
		const price = anchor
			? anchor.price
			: Math.max(
					bar.low,
					Math.min(
						bar.high,
						Math.round((from.price + (to.price - from.price) * fraction + noise) * 100) / 100
					)
				);
		if (index) {
			elapsed += 0.7 + rand() * 1.2;
			traded += 0.4 + rand();
		}
		high = Math.max(high, price);
		low = Math.min(low, price);
		return { elapsed, traded, price, high, low };
	});
	const duration = elapsed,
		activity = traded;
	return (progress: number): Bar => {
		if (!Number.isFinite(progress)) throw new Error('Invalid playback progress');
		if (progress <= 0) return { ...bar, close: bar.open, high: bar.open, low: bar.open, volume: 0 };
		if (progress >= 1) return { ...bar };
		const elapsed = progress * duration;
		const next = ticks.findIndex((tick) => tick.elapsed > elapsed);
		const from = ticks[next - 1],
			to = ticks[next],
			fraction = (elapsed - from.elapsed) / (to.elapsed - from.elapsed);
		const close = Math.max(
			bar.low,
			Math.min(bar.high, Math.round((from.price + (to.price - from.price) * fraction) * 100) / 100)
		);
		return {
			...bar,
			close,
			high: Math.max(from.high, close),
			low: Math.min(from.low, close),
			volume: Math.round(
				((from.traded + (to.traded - from.traded) * fraction) / activity) * bar.volume
			)
		};
	};
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
