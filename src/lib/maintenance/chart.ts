import {
	createChart,
	CandlestickSeries,
	HistogramSeries,
	LineSeries,
	ColorType,
	type UTCTimestamp
} from 'lightweight-charts';
import { gsap } from 'gsap';
import { demonstrationBars, ema, validateBars } from './data.ts';
export function mountChart() {
	const host = document.querySelector<HTMLElement>('#market-chart');
	const play = document.querySelector<HTMLButtonElement>('#chart-play');
	const restart = document.querySelector<HTMLButtonElement>('#chart-restart');
	const readout = document.querySelector<HTMLElement>('#chart-readout');
	if (!host || !play || !restart || !readout) return;
	const css = getComputedStyle(document.body),
		color = (name: string) => css.getPropertyValue(name).trim();
	const chart = createChart(host, {
		autoSize: true,
		height: 480,
		layout: {
			background: { type: ColorType.Solid, color: color('--panel') },
			textColor: color('--muted'),
			fontFamily: css.fontFamily,
			attributionLogo: true,
			panes: { separatorColor: color('--line'), separatorHoverColor: color('--line-strong') }
		},
		grid: { vertLines: { color: color('--line') }, horzLines: { color: color('--line') } },
		rightPriceScale: { borderColor: color('--line') },
		timeScale: {
			timeVisible: true,
			secondsVisible: false,
			borderColor: color('--line'),
			rightOffset: 10,
			barSpacing: 7
		},
		localization: {
			timeFormatter: (time: number) =>
				new Date(time * 1000).toLocaleTimeString('en-GB', {
					timeZone: 'UTC',
					hour: '2-digit',
					minute: '2-digit'
				})
		}
	});
	const up = color('--acid'),
		down = color('--coral');
	const candles = chart.addSeries(CandlestickSeries, {
		upColor: up,
		downColor: down,
		borderVisible: false,
		wickUpColor: up,
		wickDownColor: down
	});
	const average = chart.addSeries(LineSeries, {
		color: color('--status-amber-text'),
		lineWidth: 2,
		priceLineVisible: false,
		lastValueVisible: false
	});
	const volume = chart.addSeries(
		HistogramSeries,
		{ priceFormat: { type: 'volume' }, priceLineVisible: false, lastValueVisible: false },
		1
	);
	chart.panes()[1].setStretchFactor(0.23);
	const bars = demonstrationBars(240);
	validateBars(bars);
	const stamp = (time: number) => time as UTCTimestamp;
	let index = 159,
		generation = 0,
		progress = 0,
		previous = 0,
		playing = !matchMedia('(prefers-reduced-motion: reduce)').matches,
		inView = true,
		follow = true;
	let lastEma = ema(bars.slice(0, index + 1)).at(-1)!.value;
	function label(bar: (typeof bars)[number]) {
		readout!.textContent = `O ${bar.open.toFixed(2)}   H ${bar.high.toFixed(2)}   L ${bar.low.toFixed(2)}   C ${bar.close.toFixed(2)}   V ${bar.volume.toLocaleString('en-US')}`;
	}
	function reset() {
		index = 159;
		generation = 0;
		progress = 0;
		previous = 0;
		candles.setData(bars.slice(60, index + 1).map((b) => ({ ...b, time: stamp(b.time) })));
		volume.setData(
			bars.slice(60, index + 1).map((b) => ({
				time: stamp(b.time),
				value: b.volume,
				color: b.close >= b.open ? up + '65' : down + '65'
			}))
		);
		const values = ema(bars.slice(0, index + 1));
		lastEma = values.at(-1)!.value;
		average.setData(
			values.filter((b) => b.time >= bars[60].time).map((b) => ({ ...b, time: stamp(b.time) }))
		);
		chart.timeScale().fitContent();
		label(bars[index]);
	}
	reset();
	function currentBar() {
		const cycle = bars.length - 160,
			source = bars[160 + ((index - 159) % cycle)];
		const offset = generation * (bars.at(-1)!.close - bars[159].close);
		return {
			...source,
			time: bars[0].time + (index + 1) * 300,
			open: source.open + offset,
			high: source.high + offset,
			low: source.low + offset,
			close: source.close + offset
		};
	}
	let raf = 0;
	function frame(now: number) {
		raf = requestAnimationFrame(frame);
		if (!playing || !inView || document.hidden) {
			previous = 0;
			return;
		}
		if (!previous) previous = now;
		progress += Math.min(now - previous, 100) / 6500;
		previous = now;
		const bar = currentBar(),
			fraction = Math.min(progress, 1),
			close = bar.open + (bar.close - bar.open) * fraction;
		const live = {
			...bar,
			close,
			high: Math.max(bar.open, close, bar.open + (bar.high - bar.open) * fraction),
			low: Math.min(bar.open, close, bar.open + (bar.low - bar.open) * fraction),
			volume: Math.round(bar.volume * fraction)
		};
		candles.update({ ...live, time: stamp(live.time) });
		volume.update({
			time: stamp(live.time),
			value: live.volume,
			color: live.close >= live.open ? up + '65' : down + '65'
		});
		average.update({ time: stamp(live.time), value: close * (2 / 21) + lastEma * (19 / 21) });
		label(live);
		if (follow) chart.timeScale().scrollToPosition(10, false);
		if (progress >= 1) {
			candles.update({ ...bar, time: stamp(bar.time) });
			lastEma = bar.close * (2 / 21) + lastEma * (19 / 21);
			average.update({ time: stamp(bar.time), value: lastEma });
			index++;
			progress = 0;
			if ((index - 159) % (bars.length - 160) === 0) generation++;
		}
	}
	function button() {
		play!.textContent = playing ? 'Pause playback' : 'Play playback';
		play!.setAttribute('aria-pressed', String(playing));
	}
	button();
	play.hidden = false;
	restart.hidden = false;
	const toggle = () => {
		playing = !playing;
		previous = 0;
		button();
	};
	const start = () => {
		reset();
		follow = true;
	};
	const unfollow = () => {
		follow = false;
	};
	play.addEventListener('click', toggle);
	restart.addEventListener('click', start);
	host.addEventListener('pointerdown', unfollow);
	host.addEventListener('wheel', unfollow, { passive: true });
	const observer = new IntersectionObserver((entries) => {
		inView = entries[0].isIntersecting;
		previous = 0;
	});
	observer.observe(host);
	const motion = gsap.matchMedia();
	motion.add('(prefers-reduced-motion: no-preference)', () => {
		const context = gsap.context(() =>
			gsap.fromTo(
				'.maintenance-visual',
				{ y: 12, opacity: 0.6 },
				{ y: 0, opacity: 1, duration: 0.65, ease: 'power2.out' }
			)
		);
		return () => context.revert();
	});
	const preference = matchMedia('(prefers-reduced-motion: reduce)');
	const reduce = () => {
		if (preference.matches) {
			playing = false;
			button();
		}
	};
	preference.addEventListener('change', reduce);
	raf = requestAnimationFrame(frame);
	document.querySelector('#chart-fallback')?.setAttribute('hidden', '');
	const cleanup = () => {
		cancelAnimationFrame(raf);
		observer.disconnect();
		motion.revert();
		preference.removeEventListener('change', reduce);
		chart.remove();
	};
	window.addEventListener('pagehide', cleanup, { once: true });
	window.addEventListener('pageshow', (event) => {
		if (event.persisted) location.reload();
	});
}
