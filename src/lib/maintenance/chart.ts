import {
	createChart,
	CandlestickSeries,
	HistogramSeries,
	LineSeries,
	ColorType,
	CrosshairMode,
	LineStyle,
	type MouseEventParams,
	type UTCTimestamp
} from 'lightweight-charts';
import { gsap } from 'gsap';
import { createBarPlayback, demonstrationBars, ema, validateBars, type Bar } from './data.ts';
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
			fontFamily: color('--font-mono'),
			attributionLogo: true,
			panes: { separatorColor: color('--line'), separatorHoverColor: color('--line-strong') }
		},
		grid: {
			vertLines: { visible: false },
			horzLines: { color: color('--line') + '80' }
		},
		crosshair: {
			mode: CrosshairMode.Normal,
			vertLine: {
				color: color('--muted'),
				style: LineStyle.Dotted,
				labelBackgroundColor: color('--line-strong')
			},
			horzLine: {
				color: color('--muted'),
				style: LineStyle.Dotted,
				labelBackgroundColor: color('--line-strong')
			}
		},
		rightPriceScale: { borderColor: color('--line'), scaleMargins: { top: 0.12, bottom: 0.1 } },
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
	const up = color('--chart-up'),
		down = color('--chart-down');
	const candles = chart.addSeries(CandlestickSeries, {
		upColor: up,
		downColor: down,
		borderVisible: false,
		wickVisible: true,
		wickUpColor: up,
		wickDownColor: down,
		priceLineStyle: LineStyle.Dotted
	});
	const average = chart.addSeries(LineSeries, {
		color: color('--status-amber-text'),
		lineWidth: 2,
		crosshairMarkerVisible: false,
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
		follow = true,
		inspecting = false;
	let latest = bars[index];
	let activeBar: Bar | undefined;
	let sample: ReturnType<typeof createBarPlayback> | undefined;
	let lastEma = ema(bars.slice(0, index + 1)).at(-1)!.value;
	function label(bar: Bar, source = 'playback') {
		readout!.textContent = `O ${bar.open.toFixed(2)}   H ${bar.high.toFixed(2)}   L ${bar.low.toFixed(2)}   C ${bar.close.toFixed(2)}   V ${bar.volume.toLocaleString('en-US')}`;
		readout!.dataset.source = source;
		readout!.dataset.candleTime = String(bar.time);
	}
	function reset() {
		index = 159;
		generation = 0;
		progress = 0;
		previous = 0;
		inspecting = false;
		activeBar = undefined;
		sample = undefined;
		latest = bars[index];
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
		label(latest);
	}
	reset();
	function currentBar() {
		const cycle = bars.length - 160,
			source = bars[160 + ((index - 159) % cycle)];
		const offset = generation * (bars.at(-1)!.close - bars[159].close);
		const price = (value: number) => Math.round((value + offset) * 100) / 100;
		return {
			...source,
			time: bars[0].time + (index + 1) * 300,
			open: price(source.open),
			high: price(source.high),
			low: price(source.low),
			close: price(source.close)
		};
	}
	const inspect = (event: MouseEventParams) => {
		const price = event.seriesData.get(candles),
			traded = event.seriesData.get(volume);
		if (
			!event.point ||
			typeof event.time !== 'number' ||
			!price ||
			!('open' in price) ||
			!traded ||
			!('value' in traded)
		) {
			inspecting = false;
			label(latest);
			return;
		}
		inspecting = true;
		label(
			{
				time: event.time,
				open: price.open,
				high: price.high,
				low: price.low,
				close: price.close,
				volume: traded.value
			},
			'crosshair'
		);
	};
	chart.subscribeCrosshairMove(inspect);
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
		const bar = (activeBar ??= currentBar());
		sample ??= createBarPlayback(bar);
		const live = sample(progress);
		latest = live;
		candles.update({ ...live, time: stamp(live.time) });
		volume.update({
			time: stamp(live.time),
			value: live.volume,
			color: live.close >= live.open ? up + '65' : down + '65'
		});
		average.update({ time: stamp(live.time), value: live.close * (2 / 21) + lastEma * (19 / 21) });
		if (!inspecting) label(live);
		if (follow) chart.timeScale().scrollToPosition(10, false);
		if (progress >= 1) {
			candles.update({ ...bar, time: stamp(bar.time) });
			lastEma = bar.close * (2 / 21) + lastEma * (19 / 21);
			average.update({ time: stamp(bar.time), value: lastEma });
			index++;
			progress = 0;
			if ((index - 159) % (bars.length - 160) === 0) generation++;
			activeBar = undefined;
			sample = undefined;
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
		chart.unsubscribeCrosshairMove(inspect);
		chart.remove();
	};
	window.addEventListener('pagehide', cleanup, { once: true });
	window.addEventListener('pageshow', (event) => {
		if (event.persisted) location.reload();
	});
}
