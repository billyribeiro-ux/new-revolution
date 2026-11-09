<script lang="ts">
	import '#lib/styles/sunday-alpha-protocol.css';
	import { resolve } from '$app/paths';
	import * as d3 from 'd3';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import {
		SUNDAY_ALPHA_AUTHORITY_RECEIPTS,
		SUNDAY_ALPHA_HERO_METRICS,
		SUNDAY_ALPHA_MECHANISM_ACTS,
		SUNDAY_ALPHA_PRICING_TIERS,
		SUNDAY_ALPHA_SUITABILITY_TIERS,
		SUNDAY_ALPHA_TERMINAL_BLUEPRINTS,
		type SundayAlphaBlueprint,
		type SundayAlphaSeriesPoint
	} from '#lib/data/sunday-alpha-protocol.ts';
	import { SUNDAY_ALPHA_PROTOCOL_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Act I: D3 15-Trade R-Simulator state
	let winRate = $state(60);
	let netRValue = $derived.by(() => {
		const totalTrades = 15;
		const wins = Math.round((winRate / 100) * totalTrades);
		let sapCum = 0;
		for (let i = 1; i <= totalTrades; i++) {
			const isWin =
				Math.round((i * wins) / totalTrades) > Math.round(((i - 1) * wins) / totalTrades);
			sapCum += isWin ? 2.5 : -1.0;
		}
		return sapCum;
	});
	let netRFormatted = $derived(`${netRValue >= 0 ? '+' : ''}${netRValue.toFixed(1)}R NET`);

	// Act III: D3 Master Quantitative Terminal state
	let activeTicker = $state<SundayAlphaBlueprint['key']>('tsla');
	let activeBlueprint = $derived(SUNDAY_ALPHA_TERMINAL_BLUEPRINTS[activeTicker]);

	// Interactive HUD state (defaults to T3 target metrics of active blueprint)
	let hudOverride = $state<{
		price: string;
		rMultiple: string;
		rPositive: boolean;
		optText: string;
	} | null>(null);

	let defaultHud = $derived.by(() => {
		const bp = activeBlueprint;
		const riskPerShare = bp.levels.entry - bp.levels.stop;
		const rMult = (bp.levels.t3 - bp.levels.entry) / riskPerShare;
		const optEst = Math.max(
			0.5,
			bp.optBase + (bp.levels.t3 - bp.levels.entry) * (bp.optDelta + 0.15)
		);
		const optPct = Math.round(((optEst - bp.optBase) / bp.optBase) * 100);
		return {
			price: `$${bp.levels.t3.toFixed(2)}`,
			rMultiple: `+${rMult.toFixed(2)}R`,
			rPositive: true,
			optText: `$${optEst.toFixed(2)} (+${optPct}%)`
		};
	});

	let activeHud = $derived(hudOverride ?? defaultHud);

	function selectTicker(key: SundayAlphaBlueprint['key']) {
		activeTicker = key;
		hudOverride = null;
	}

	function scrollToTerminal() {
		if (typeof document === 'undefined') return;
		document.getElementById('d3-terminal-section')?.scrollIntoView({ behavior: 'smooth' });
	}

	function renderHeroSimChart(svgEl: SVGSVGElement) {
		const currentWinRate = winRate;
		const svg = d3.select(svgEl);
		svg.selectAll('*').remove();

		const W = 460;
		const H = 155;
		const M = { top: 14, right: 56, bottom: 22, left: 36 };
		const iW = W - M.left - M.right;
		const iH = H - M.top - M.bottom;

		const totalTrades = 15;
		const wins = Math.round((currentWinRate / 100) * totalTrades);
		const sapData: { t: number; r: number }[] = [{ t: 0, r: 0 }];
		const retData: { t: number; r: number }[] = [{ t: 0, r: 0 }];

		let sapCum = 0;
		let retCum = 0;
		for (let i = 1; i <= totalTrades; i++) {
			const isWin =
				Math.round((i * wins) / totalTrades) > Math.round(((i - 1) * wins) / totalTrades);
			sapCum += isWin ? 2.5 : -1.0;
			retCum += isWin ? 1.0 : -1.0;
			sapData.push({ t: i, r: sapCum });
			retData.push({ t: i, r: retCum });
		}

		const g = svg.append('g').attr('transform', `translate(${M.left},${M.top})`);
		const x = d3.scaleLinear().domain([0, totalTrades]).range([0, iW]);
		const minR = Math.min(-3, d3.min(retData, (d) => d.r) ?? -3);
		const maxR = Math.max(18, (d3.max(sapData, (d) => d.r) ?? 18) + 2);
		const y = d3.scaleLinear().domain([minR, maxR]).range([iH, 0]);

		// Zero baseline
		g.append('line')
			.attr('x1', 0)
			.attr('x2', iW)
			.attr('y1', y(0))
			.attr('y2', y(0))
			.attr('stroke', 'rgba(255,248,238,0.14)')
			.attr('stroke-dasharray', '3,3');

		// Gradient fill for Sunday Alpha curve
		const defs = svg.append('defs');
		const grad = defs
			.append('linearGradient')
			.attr('id', 'sapSimGrad')
			.attr('x1', '0%')
			.attr('y1', '0%')
			.attr('x2', '0%')
			.attr('y2', '100%');
		grad
			.append('stop')
			.attr('offset', '0%')
			.attr('stop-color', '#dcff65')
			.attr('stop-opacity', 0.32);
		grad
			.append('stop')
			.attr('offset', '100%')
			.attr('stop-color', '#dcff65')
			.attr('stop-opacity', 0.0);

		const areaGen = d3
			.area<{ t: number; r: number }>()
			.x((d) => x(d.t))
			.y0(y(0))
			.y1((d) => y(d.r))
			.curve(d3.curveMonotoneX);

		const lineGen = d3
			.line<{ t: number; r: number }>()
			.x((d) => x(d.t))
			.y((d) => y(d.r))
			.curve(d3.curveMonotoneX);

		// Retail 1:1 curve
		g.append('path')
			.datum(retData)
			.attr('fill', 'none')
			.attr('stroke', 'rgba(184,176,166,0.45)')
			.attr('stroke-width', 1.5)
			.attr('stroke-dasharray', '4,3')
			.attr('d', lineGen);

		// Sunday Alpha Protocol 1:2.50 area + line
		g.append('path').datum(sapData).attr('fill', 'url(#sapSimGrad)').attr('d', areaGen);
		g.append('path')
			.datum(sapData)
			.attr('fill', 'none')
			.attr('stroke', '#dcff65')
			.attr('stroke-width', 2.5)
			.attr('d', lineGen);

		// End dots & labels
		const lastSap = sapData[sapData.length - 1];
		const lastRet = retData[retData.length - 1];

		if (lastSap && lastRet) {
			g.append('circle')
				.attr('cx', x(lastSap.t))
				.attr('cy', y(lastSap.r))
				.attr('r', 4.5)
				.attr('fill', '#dcff65')
				.attr('stroke', '#171514')
				.attr('stroke-width', 1.5);

			g.append('text')
				.attr('x', x(lastSap.t) + 6)
				.attr('y', y(lastSap.r) + 3)
				.attr('fill', '#dcff65')
				.attr('font-family', 'var(--font-mono)')
				.attr('font-size', '10px')
				.attr('font-weight', '700')
				.text(`${lastSap.r >= 0 ? '+' : ''}${lastSap.r.toFixed(1)}R`);

			g.append('text')
				.attr('x', x(lastRet.t) + 6)
				.attr('y', y(lastRet.r) + 3)
				.attr('fill', '#b8b0a6')
				.attr('font-family', 'var(--font-mono)')
				.attr('font-size', '9px')
				.text(`1:1 (${lastRet.r >= 0 ? '+' : ''}${lastRet.r.toFixed(0)}R)`);
		}

		// Left axis labels
		[0, 10, 20].forEach((val) => {
			if (val <= maxR) {
				g.append('text')
					.attr('x', -6)
					.attr('y', y(val) + 3)
					.attr('text-anchor', 'end')
					.attr('fill', '#b8b0a6')
					.attr('font-family', 'var(--font-mono)')
					.attr('font-size', '9px')
					.text(`${val > 0 ? '+' : ''}${val}R`);
			}
		});
	}

	function renderTerminalChart(svgEl: SVGSVGElement) {
		const bp = activeBlueprint;
		const svg = d3.select(svgEl);
		svg.selectAll('*').remove();

		const W = 860;
		const H = 340;
		const M = { top: 20, right: 118, bottom: 28, left: 56 };
		const iW = W - M.left - M.right;
		const iH = H - M.top - M.bottom;

		const defs = svg.append('defs');

		const priceGrad = defs
			.append('linearGradient')
			.attr('id', 'sapTermPriceGrad')
			.attr('x1', '0%')
			.attr('y1', '0%')
			.attr('x2', '0%')
			.attr('y2', '100%');
		priceGrad
			.append('stop')
			.attr('offset', '0%')
			.attr('stop-color', '#dcff65')
			.attr('stop-opacity', 0.22);
		priceGrad
			.append('stop')
			.attr('offset', '100%')
			.attr('stop-color', '#dcff65')
			.attr('stop-opacity', 0.0);

		const g = svg.append('g').attr('transform', `translate(${M.left},${M.top})`);
		const x = d3.scaleLinear().domain([1, 30]).range([0, iW]);
		const y = d3.scaleLinear().domain(bp.domain).range([iH, 0]);

		// 1. Shaded Risk & Reward Zones
		const entryY = y(bp.levels.entry);
		const stopY = y(bp.levels.stop);
		const t3Y = y(bp.levels.t3);

		// Reward Zone (Entry -> T3)
		g.append('rect')
			.attr('x', x(12))
			.attr('y', t3Y)
			.attr('width', iW - x(12))
			.attr('height', Math.max(0, entryY - t3Y))
			.attr('fill', 'rgba(220, 255, 101, 0.05)');

		// Risk Zone (Stop -> Entry)
		g.append('rect')
			.attr('x', x(12))
			.attr('y', entryY)
			.attr('width', iW - x(12))
			.attr('height', Math.max(0, stopY - entryY))
			.attr('fill', 'rgba(255, 121, 105, 0.07)');

		// 2. Horizontal Grid Lines
		const yTicks = y.ticks(6);
		yTicks.forEach((tickVal) => {
			g.append('line')
				.attr('x1', 0)
				.attr('x2', iW)
				.attr('y1', y(tickVal))
				.attr('y2', y(tickVal))
				.attr('stroke', 'rgba(255,248,238,0.06)');
			g.append('text')
				.attr('x', -10)
				.attr('y', y(tickVal) + 3)
				.attr('text-anchor', 'end')
				.attr('fill', '#b8b0a6')
				.attr('font-family', 'var(--font-mono)')
				.attr('font-size', '10px')
				.text(`$${tickVal}`);
		});

		// 3. Volume-by-Price (VBP) Profile Bars on Left Axis
		const maxVbpWidth = 110;
		bp.vbp.forEach((bar) => {
			const bw = (bar.vol / 100) * maxVbpWidth;
			g.append('rect')
				.attr('x', 0)
				.attr('y', y(bar.p) - 5)
				.attr('width', bw)
				.attr('height', 10)
				.attr('rx', 2)
				.attr(
					'fill',
					bar.type === 'inst' ? 'rgba(220, 255, 101, 0.22)' : 'rgba(184, 176, 166, 0.14)'
				)
				.attr('stroke', bar.type === 'inst' ? 'rgba(220, 255, 101, 0.45)' : 'none')
				.attr('stroke-width', 0.7);
		});

		// 4. Key Institutional Level Lines & Right Pills
		const levelConfigs = [
			{ key: 'T3 RUNNER', val: bp.levels.t3, color: '#dcff65', dash: '3,3' },
			{ key: 'T2 CORE', val: bp.levels.t2, color: '#b9e64f', dash: '4,3' },
			{ key: 'T1 SCALE', val: bp.levels.t1, color: '#b9e64f', dash: '4,3' },
			{ key: '15M TRIGGER', val: bp.levels.entry, color: '#f5efe6', dash: 'none' },
			{ key: 'HARD STOP', val: bp.levels.stop, color: '#ff7969', dash: '3,3' }
		];

		levelConfigs.forEach((lvl) => {
			const ly = y(lvl.val);
			g.append('line')
				.attr('x1', 0)
				.attr('x2', iW)
				.attr('y1', ly)
				.attr('y2', ly)
				.attr('stroke', lvl.color)
				.attr('stroke-width', lvl.key === '15M TRIGGER' ? 1.8 : 1.1)
				.attr('stroke-dasharray', lvl.dash === 'none' ? null : lvl.dash)
				.attr('opacity', 0.85);

			const pillG = g.append('g').attr('transform', `translate(${iW + 6}, ${ly - 9})`);
			pillG
				.append('rect')
				.attr('width', 106)
				.attr('height', 18)
				.attr('rx', 4)
				.attr('fill', 'rgba(23, 21, 20, 0.94)')
				.attr('stroke', lvl.color)
				.attr('stroke-width', 0.9);
			pillG
				.append('text')
				.attr('x', 6)
				.attr('y', 12)
				.attr('fill', lvl.color)
				.attr('font-family', 'var(--font-mono)')
				.attr('font-size', '9.5px')
				.attr('font-weight', '700')
				.text(`${lvl.key} $${lvl.val.toFixed(1)}`);
		});

		// 5. Price Trajectory Area + Line
		const areaGen = d3
			.area<SundayAlphaSeriesPoint>()
			.x((d) => x(d.d))
			.y0(iH)
			.y1((d) => y(d.p))
			.curve(d3.curveMonotoneX);

		const lineGen = d3
			.line<SundayAlphaSeriesPoint>()
			.x((d) => x(d.d))
			.y((d) => y(d.p))
			.curve(d3.curveMonotoneX);

		g.append('path').datum(bp.series).attr('fill', 'url(#sapTermPriceGrad)').attr('d', areaGen);

		g.append('path')
			.datum(bp.series)
			.attr('fill', 'none')
			.attr('stroke', '#dcff65')
			.attr('stroke-width', 2.6)
			.attr('d', lineGen);

		// 6. Highlight Trigger Breakout Node (d = 12) & T3 Node (d = 30)
		const trigPt = bp.series.find((s) => s.d === 12);
		if (trigPt) {
			g.append('circle')
				.attr('cx', x(trigPt.d))
				.attr('cy', y(trigPt.p))
				.attr('r', 6)
				.attr('fill', '#f5efe6')
				.attr('stroke', '#171514')
				.attr('stroke-width', 2);

			g.append('text')
				.attr('x', x(trigPt.d))
				.attr('y', y(trigPt.p) - 12)
				.attr('text-anchor', 'middle')
				.attr('fill', '#f5efe6')
				.attr('font-family', 'var(--font-mono)')
				.attr('font-size', '9.5px')
				.attr('font-weight', '700')
				.text('15M GAMMA FLIP');
		}

		const endPt = bp.series[bp.series.length - 1];
		if (endPt) {
			g.append('circle')
				.attr('cx', x(endPt.d))
				.attr('cy', y(endPt.p))
				.attr('r', 5.5)
				.attr('fill', '#dcff65')
				.attr('stroke', '#171514')
				.attr('stroke-width', 2);
		}

		// 7. Interactive 2D Crosshair & HUD Updater
		const focusG = g.append('g').style('display', 'none');
		const vLine = focusG
			.append('line')
			.attr('y1', 0)
			.attr('y2', iH)
			.attr('stroke', 'rgba(255,248,238,0.35)')
			.attr('stroke-dasharray', '3,3');
		const hLine = focusG
			.append('line')
			.attr('x1', 0)
			.attr('x2', iW)
			.attr('stroke', 'rgba(255,248,238,0.35)')
			.attr('stroke-dasharray', '3,3');
		const focusDot = focusG
			.append('circle')
			.attr('r', 5.5)
			.attr('fill', '#dcff65')
			.attr('stroke', '#171514')
			.attr('stroke-width', 2);

		const riskPerShare = bp.levels.entry - bp.levels.stop;

		const updateHud = (pt: SundayAlphaSeriesPoint) => {
			const rMult = (pt.p - bp.levels.entry) / riskPerShare;
			const rStr = `${rMult >= 0 ? '+' : ''}${rMult.toFixed(2)}R`;
			const optEst = Math.max(
				0.5,
				bp.optBase + (pt.p - bp.levels.entry) * (bp.optDelta + (rMult > 0 ? 0.15 : 0))
			);
			const optPct = Math.round(((optEst - bp.optBase) / bp.optBase) * 100);
			hudOverride = {
				price: `$${pt.p.toFixed(2)}`,
				rMultiple: rStr,
				rPositive: rMult >= 0,
				optText: `$${optEst.toFixed(2)} (${optPct >= 0 ? '+' : ''}${optPct}%)`
			};
		};

		const bisect = d3.bisector((d: SundayAlphaSeriesPoint) => d.d).left;

		const handlePointer = (mx: number) => {
			const dVal = x.invert(Math.max(0, Math.min(iW, mx)));
			const idx = Math.min(bp.series.length - 1, Math.max(0, bisect(bp.series, dVal)));
			const pt = bp.series[idx];
			if (!pt) return;
			const cx = x(pt.d);
			const cy = y(pt.p);
			vLine.attr('x1', cx).attr('x2', cx);
			hLine.attr('y1', cy).attr('y2', cy);
			focusDot.attr('cx', cx).attr('cy', cy);
			updateHud(pt);
		};

		g.append('rect')
			.attr('width', iW)
			.attr('height', iH)
			.attr('fill', 'transparent')
			.style('cursor', 'crosshair')
			.on('mouseover', () => focusG.style('display', null))
			.on('mouseout', () => {
				focusG.style('display', 'none');
				hudOverride = null;
			})
			.on('mousemove', (event: MouseEvent) => {
				const [mx] = d3.pointer(event);
				handlePointer(mx);
			})
			.on(
				'touchmove',
				(event: TouchEvent) => {
					if (event.touches.length > 0) {
						const [mx] = d3.pointer(event.touches[0], g.node());
						focusG.style('display', null);
						handlePointer(mx);
					}
				},
				{ passive: true }
			);
	}
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#sunday-alpha-protocol-page">Skip to main content</a>
<Navbar />

<main id="sunday-alpha-protocol-page" class="inner-page sunday-alpha-protocol-page">
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true">/</li>
				<li aria-current="page">Sunday Alpha Protocol</li>
			</ol>
			<p class="breadcrumb-bar__telemetry">
				<span>Sunday 5:00 PM EST Dispatch</span> • <span>5–7 Swing Blueprints</span> •
				<span>Exact Entries, Targets &amp; Stops</span>
			</p>
		</div>
	</nav>

	<!-- ACT I: SPLIT HERO & INTERACTIVE R-MULTIPLE COMMAND DECK -->
	<header id="hero-stage" class="page-hero sap-hero-stage" aria-labelledby="sap-hero-h1">
		<div class="container hero-main">
			<div class="hero-grid">
				<!-- Left Column: Institutional Manifesto & CTAs -->
				<div class="hero-copy-col">
					<div class="eyebrow-pill sap-gsap-hero">
						<span class="eyebrow-tag">SUNDAY 5:00 PM EST</span>
						<span class="eyebrow-text">
							Directed by Chief Strategist <a href={resolve('/about')}>Billy Ribeiro</a> •
							<time datetime="2026-10-31">Oct 31, 2026</time>
						</span>
					</div>

					<h1 id="sap-hero-h1" class="hero-title sap-gsap-hero">
						<span class="title-line">THE SUNDAY</span>
						<span class="title-line title-gold">ALPHA</span>
						<span class="title-line">PROTOCOL.</span>
					</h1>

					<p class="hero-lead sap-gsap-hero">
						Stop guessing at Monday’s opening bell. Every Sunday at
						<strong>5:00 PM EST</strong> (one full hour before futures open), receive
						<strong
							>5 to 7 institutional-grade U.S. large-cap stock &amp; options swing blueprints</strong
						>
						engineered with exact 15-minute confirmation triggers, cent-level invalidation stops, and
						a strict <strong>1:2.50+ minimum Risk-to-Reward</strong> hurdle.
					</p>

					<div class="hero-cta-row sap-gsap-hero">
						<a href={resolve('/contact')} class="btn-primary-gold">
							<span>Ask about $47/mo membership</span>
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								aria-hidden="true"
							>
								<path d="M5 12h14M12 5l7 7-7 7" />
							</svg>
						</a>
						<button type="button" class="btn-secondary-glass" onclick={scrollToTerminal}>
							<span>Explore Interactive D3 Terminal ↓</span>
						</button>
					</div>

					<div class="hero-trust-strip sap-gsap-hero">
						<div class="trust-item">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								aria-hidden="true"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
							<span>Save <strong>$150/mo (76% OFF)</strong> vs. $197 Regular Rate</span>
						</div>
						<div class="trust-item">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								aria-hidden="true"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
							<span>Built for Beginners, Swing Traders &amp; Investors</span>
						</div>
						<div class="trust-item">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								aria-hidden="true"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
							<span>1-Click Cancel Anytime via Stripe</span>
						</div>
					</div>
				</div>

				<!-- Right Column: Institutional Command Deck + Interactive D3 R-Simulator -->
				<div class="vision-deck-wrap sap-gsap-hero">
					<div class="vision-deck">
						<div class="deck-header">
							<div class="deck-dots" aria-hidden="true">
								<span></span>
								<span></span>
								<span></span>
							</div>
							<div class="deck-title">HYPOTHETICAL R-MULTIPLE EXAMPLE</div>
							<p class="example-notice">
								Interactive hypothetical example. Not live market data or actual performance. This
								simplified model uses fixed wins and losses before fees and slippage.
							</p>
							<div class="deck-status">
								<span class="live-dot" aria-hidden="true"></span>
								<span>Example 1:2.50 R:R</span>
							</div>
						</div>

						<div class="deck-body">
							<div class="deck-ticker-row">
								<div class="deck-ticker-main">
									<div class="ticker-symbol">$TSLA • 18 DTE $250 CALL</div>
									<div class="ticker-setup">
										Sunday Alpha Blueprint #01 • Institutional Accumulation Breakout
									</div>
								</div>
								<div class="deck-rr-badge">
									<span class="rr-label">BLENDED R:R</span>
									<span class="rr-val">1 : 2.50</span>
								</div>
							</div>

							<div class="deck-coords-grid">
								<div class="coord-box">
									<div class="coord-label">15m Trigger</div>
									<div class="coord-val val-gold">$248.50</div>
									<div class="coord-sub">Confirmed Close</div>
								</div>
								<div class="coord-box">
									<div class="coord-label">Hard Stop</div>
									<div class="coord-val val-crimson">$241.20</div>
									<div class="coord-sub">-2.93% Risk</div>
								</div>
								<div class="coord-box">
									<div class="coord-label">Target 1 (50%)</div>
									<div class="coord-val val-emerald">$260.00</div>
									<div class="coord-sub">+1.58R • Stop BE</div>
								</div>
								<div class="coord-box">
									<div class="coord-label">Target 3 (Runner)</div>
									<div class="coord-val val-cyan">$280.00</div>
									<div class="coord-sub">+4.32R Extraction</div>
								</div>
							</div>

							<!-- Embedded D3.js Interactive 15-Trade R-Multiple Simulator -->
							<div class="d3-mini-box">
								<div class="d3-mini-header">
									<span class="d3-mini-title">
										D3.JS 15-TRADE ASYMMETRY SIMULATOR (1:2.50 VS 1:1 RETAIL)
									</span>
									<span class="d3-mini-readout">{netRFormatted}</span>
								</div>
								<div class="d3-mini-svg-wrap">
									<svg
										viewBox="0 0 460 155"
										preserveAspectRatio="xMidYMid meet"
										role="img"
										aria-label="D3 15-trade cumulative R-multiple simulation comparing Sunday Alpha Protocol 1:2.50 risk-to-reward against 1:1 retail risk-to-reward"
										{@attach renderHeroSimChart}
									></svg>
								</div>
								<div class="sim-controls">
									<label for="sap-winrate-slider">SIMULATE WIN RATE:</label>
									<input
										id="sap-winrate-slider"
										name="winRate"
										type="range"
										min="40"
										max="75"
										step="5"
										bind:value={winRate}
										autocomplete="off"
									/>
									<span class="sim-val-pill">{winRate}% Win Rate</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Bottom Hero Telemetry Bar -->
		<div class="hero-telemetry-bar">
			<div class="container telemetry-grid">
				{#each SUNDAY_ALPHA_HERO_METRICS as metric (metric.label)}
					<div class="t-metric">
						<div class="t-metric-val">
							{metric.value}{#if metric.unit}<span>{metric.unit}</span>{/if}
						</div>
						<div class="t-metric-label">{metric.label}</div>
					</div>
				{/each}
			</div>
		</div>
	</header>

	<!-- ACT II: 3-ACT INSTITUTIONAL MECHANISM -->
	<section id="keynote-mechanism" class="keynote-section" aria-labelledby="mechanism-h2">
		<div class="container">
			<div class="sap-section-header">
				<div class="section-kicker">
					<span>THE INSTITUTIONAL EDGE</span>
				</div>
				<h2 id="mechanism-h2" class="sap-section-title">
					Why 90% of Retail Traders Lose Money Before 10:00 AM Monday.
				</h2>
				<p class="sap-section-subtitle">
					Retail traders wake up Monday morning, chase extended pre-market gaps with 1-to-1 risk,
					and become exit liquidity for institutional algorithms. The
					<strong>Sunday Alpha Protocol</strong> replaces emotional guesswork with a 3-stage quantitative
					execution sequence.
				</p>
			</div>

			<div class="mechanism-grid">
				{#each SUNDAY_ALPHA_MECHANISM_ACTS as act (act.stepNumber)}
					<article class="mech-card">
						<div class="mech-step-num" aria-hidden="true">{act.stepNumber}</div>
						<span class="mech-tag">{act.tag}</span>
						<h3>{act.title}</h3>
						<p>{act.description}</p>
						<div
							class={[
								'mech-callout',
								{
									'mech-callout--gold': act.calloutColor === 'gold',
									'mech-callout--emerald': act.calloutColor === 'emerald',
									'mech-callout--cyan': act.calloutColor === 'cyan'
								}
							]}
						>
							<span>{act.calloutLabel}</span>
							<strong>{act.calloutValue}</strong>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- ACT III: INTERACTIVE D3.JS QUANTITATIVE TERMINAL -->
	<section id="d3-terminal-section" class="terminal-section" aria-labelledby="terminal-h2">
		<div class="container">
			<div class="sap-section-header">
				<div class="section-kicker">
					<span>INTERACTIVE BLUEPRINT INSPECTION</span>
				</div>
				<h2 id="terminal-h2" class="sap-section-title">
					Explore an Illustrative Sunday Alpha Protocol Blueprint.
				</h2>
				<p class="sap-section-subtitle">
					These examples use fixed illustrative prices and simplified options estimates, not live
					market data or actual performance. Switch between sample blueprints below and move your
					cursor across the
					<strong>D3.js Institutional Liquidity &amp; R-Multiple Terminal</strong> to inspect Volume-by-Price
					shelves, exact 15m triggers, and options contract specifications.
				</p>
			</div>

			<div class="terminal-shell">
				<!-- Terminal Top Bar -->
				<div class="terminal-topbar">
					<div class="terminal-title-group">
						<div class="deck-dots" aria-hidden="true">
							<span></span>
							<span></span>
							<span></span>
						</div>
						<span class="terminal-badge">D3.JS QUANT ENGINE v4.2</span>
						<span class="terminal-sub"
							>Hover or drag across chart to inspect an illustrative R-multiple</span
						>
					</div>
					<div class="ticker-tabs" role="tablist" aria-label="Sample Sunday Alpha Blueprints">
						{#each Object.values(SUNDAY_ALPHA_TERMINAL_BLUEPRINTS) as bp (bp.key)}
							<button
								type="button"
								role="tab"
								aria-selected={activeTicker === bp.key}
								class={['ticker-tab', { active: activeTicker === bp.key }]}
								onclick={() => selectTicker(bp.key)}
							>
								{bp.tabLabel}
							</button>
						{/each}
					</div>
				</div>

				<!-- Terminal Body -->
				<div class="terminal-body">
					<div class="terminal-chart-col">
						<div class="chart-hud">
							<div class="hud-left">
								<span class="hud-ticker-name">{activeBlueprint.name}</span>
								<span
									class="hud-strategy-tag"
									style={`color: ${activeBlueprint.tagColor}; background: ${activeBlueprint.tagBg}; border-color: ${activeBlueprint.tagBorder};`}
								>
									{activeBlueprint.tag}
								</span>
							</div>
							<div class="hud-metrics">
								<div class="hud-metric">
									<span>PRICE:</span>
									<strong>{activeHud.price}</strong>
								</div>
								<div class="hud-metric">
									<span>R-MULTIPLE:</span>
									<strong
										class={{
											'val-emerald': activeHud.rPositive,
											'val-crimson': !activeHud.rPositive
										}}
									>
										{activeHud.rMultiple}
									</strong>
								</div>
								<div class="hud-metric">
									<span>EST. OPTION:</span>
									<strong class="val-gold">{activeHud.optText}</strong>
								</div>
							</div>
						</div>

						<div class="d3-master-canvas">
							<svg
								viewBox="0 0 860 340"
								preserveAspectRatio="xMidYMid meet"
								role="img"
								aria-label={`Interactive D3 quantitative blueprint chart for ${activeBlueprint.name}`}
								{@attach renderTerminalChart}
							></svg>
						</div>

						<div class="chart-legend">
							<div class="legend-item">
								<span class="legend-swatch swatch-cyan"></span>
								<span>Price Trajectory &amp; 15m Trigger</span>
							</div>
							<div class="legend-item">
								<span class="legend-swatch swatch-gold"></span>
								<span>Institutional Volume-by-Price (VBP) Shelf</span>
							</div>
							<div class="legend-item">
								<span class="legend-swatch swatch-emerald"></span>
								<span>Asymmetric Reward Zone (T1 / T2 / T3)</span>
							</div>
							<div class="legend-item">
								<span class="legend-swatch swatch-crimson"></span>
								<span>Defined Stop Invalidation Zone (-1.0R)</span>
							</div>
						</div>
					</div>

					<!-- Right Specification Sheet -->
					<div class="terminal-specs-col">
						<div class="spec-group-title">
							<span>EQUITY EXECUTION COORDINATES</span>
							<span class="val-emerald">{activeBlueprint.rr}</span>
						</div>
						<table class="spec-table">
							<tbody>
								{#each activeBlueprint.specsEq as row (row.k)}
									<tr>
										<td>{row.k}</td>
										<td style={`color: ${row.c}`}>{row.v}</td>
									</tr>
								{/each}
							</tbody>
						</table>

						<div class="spec-group-title">
							<span>OPTIONS CONTRACT ARCHITECTURE</span>
							<span class="val-gold">0.60–0.70Δ</span>
						</div>
						<table class="spec-table">
							<tbody>
								{#each activeBlueprint.specsOpt as row (row.k)}
									<tr>
										<td>{row.k}</td>
										<td style={`color: ${row.c}`}>{row.v}</td>
									</tr>
								{/each}
							</tbody>
						</table>

						<div class="spec-context-box">
							<strong>INSTITUTIONAL ORDER FLOW CONTEXT</strong>
							<span>{activeBlueprint.context}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ACT IV: MULTI-TIER SUITABILITY MATRIX -->
	<section id="suitability" class="suitability-section" aria-labelledby="suitability-h2">
		<div class="container">
			<div class="sap-section-header">
				<div class="section-kicker">
					<span>ENGINEERED FOR EVERY CAPITAL TIER</span>
				</div>
				<h2 id="suitability-h2" class="sap-section-title">
					One Institutional Protocol. Three Execution Paths.
				</h2>
				<p class="sap-section-subtitle">
					Whether you are building your first disciplined routine, actively swing trading options
					for income, or allocating multi-six-figure equity capital, every Sunday dispatch adapts to
					your account size.
				</p>
			</div>

			<div class="suitability-grid">
				{#each SUNDAY_ALPHA_SUITABILITY_TIERS as tier (tier.tierBadge)}
					<article class="persona-card">
						<span
							class={[
								'persona-tier',
								{
									'persona-tier--gold': tier.tierColor === 'gold',
									'persona-tier--emerald': tier.tierColor === 'emerald',
									'persona-tier--cyan': tier.tierColor === 'cyan'
								}
							]}
						>
							{tier.tierBadge}
						</span>
						<h3>{tier.audience}</h3>
						<div class="persona-headline">{tier.headline}</div>
						<p>{tier.summary}</p>
						<ul class="persona-list">
							{#each tier.bullets as bullet (bullet.strong)}
								<li>
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
										aria-hidden="true"
									>
										<polyline points="20 6 9 17 4 12" />
									</svg>
									<span><strong>{bullet.strong}</strong> {bullet.text}</span>
								</li>
							{/each}
						</ul>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- ACT V: BILLY RIBEIRO AUTHORITY & HISTORICAL CALLS -->
	<section id="authority" class="authority-section" aria-labelledby="authority-h2">
		<div class="container">
			<div class="authority-shell">
				<div class="authority-grid">
					<div>
						<div class="section-kicker">
							<span>CHIEF MARKET STRATEGIST &amp; FOUNDER</span>
						</div>
						<h2 id="authority-h2" class="authority-name">Directed by Billy Ribeiro</h2>
						<div class="authority-role">
							FOUNDER, REVOLUTION TRADING PROS • INSTITUTIONAL ORDER FLOW TECHNICIAN
						</div>
						<p class="authority-bio">
							Mentored directly by former Wall Street Goldman Sachs proprietary trading legend Mark
							“Goldfinger” McGoldrick, who called him <strong>“the future of trading”</strong>,
							Billy Ribeiro built Revolution Trading Pros on a single uncompromising mandate:
							<strong>People Over Profits</strong>.
						</p>
						<p class="authority-bio">
							Rather than selling hindsight alerts or gambling on zero-day lottery tickets, Billy
							synthesizes institutional dark-pool accumulation, dealer gamma positioning, and strict
							asymmetric risk math into a repeatable Sunday evening protocol that everyday traders
							and professionals can execute with confidence.
						</p>
					</div>

					<div class="receipts-timeline">
						{#each SUNDAY_ALPHA_AUTHORITY_RECEIPTS as receipt (receipt.title)}
							<div class="receipt-box">
								<div
									class={[
										'receipt-kicker',
										{
											'receipt-kicker--gold': receipt.kickerColor === 'gold',
											'receipt-kicker--emerald': receipt.kickerColor === 'emerald',
											'receipt-kicker--cyan': receipt.kickerColor === 'cyan'
										}
									]}
								>
									{receipt.kicker}
								</div>
								<h3>{receipt.title}</h3>
								<p>{receipt.description}</p>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ACT VI: FOUNDING MEMBER PRICING MATRIX ($47/MO vs $197/MO) -->
	<section id="pricing" class="pricing-section" aria-labelledby="pricing-h2">
		<div class="container">
			<div class="sap-section-header">
				<div class="section-kicker">
					<span>GRANDFATHERED FOUNDING MEMBER RELEASE</span>
				</div>
				<h2 id="pricing-h2" class="sap-section-title">
					Lock In $47/Month For Life. Save $150/Month (76% OFF).
				</h2>
				<p class="sap-section-subtitle">
					Public retail pricing for the <strong>Sunday Alpha Protocol</strong> is
					<strong>$197/month</strong>. The first 100 Founding Members lock in
					<strong>$47/month grandfathered for life</strong>, backed by 1-click self-service
					cancellation at any time.
				</p>
			</div>

			<div class="pricing-grid">
				{#each SUNDAY_ALPHA_PRICING_TIERS as tier (tier.id)}
					<article class={['price-card', { featured: tier.featured }]}>
						{#if tier.badge}
							<div class="popular-ribbon">{tier.badge}</div>
						{/if}
						<div class="plan-name">{tier.name}</div>
						<p class="plan-sub">{tier.subtitle}</p>
						<div class="price-block">
							<div class="price-strike">
								{#if tier.id === 'monthly'}
									Regular Retail Rate: <s>$197 / month</s>
								{:else if tier.id === 'quarterly'}
									Regular Retail Rate: <s>$497 / quarter</s>
								{:else}
									Regular Retail Rate: <s>$1,647 / year</s>
								{/if}
							</div>
							<div class="price-main">
								<span class="price-amount">{tier.price}</span>
								<span class="price-period">{tier.period}</span>
							</div>
							<div class={['price-saving-pill', { 'is-muted': !tier.savingHighlight }]}>
								{tier.savingText}
							</div>
						</div>
						<ul class="plan-features">
							{#each tier.features as feat (feat.text)}
								<li>
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
										aria-hidden="true"
									>
										<polyline points="20 6 9 17 4 12" />
									</svg>
									<span>
										{#if feat.strong}
											<strong class={{ 'val-emerald': Boolean(feat.highlight) }}>
												{feat.strong}
											</strong>
										{/if}
										{feat.text}
									</span>
								</li>
							{/each}
						</ul>
						<a
							href={resolve(tier.ctaHref as '/')}
							class={[
								'btn-full',
								{ 'btn-primary-gold': tier.featured, 'btn-secondary-glass': !tier.featured }
							]}
						>
							{tier.ctaLabel}
						</a>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- Visible native FAQ; shared data also informs the page graph. -->
	<section id="faq" class="faq-section" aria-labelledby="faq-h2">
		<div class="container">
			<div class="sap-section-header">
				<div class="section-kicker">
					<span>FREQUENTLY ASKED QUESTIONS</span>
				</div>
				<h2 id="faq-h2" class="sap-section-title">Everything You Need to Know Before Sunday.</h2>
			</div>

			<div class="faq-list sap-faq-list">
				{#each SUNDAY_ALPHA_PROTOCOL_FAQ_ITEMS as faq, idx (faq.id)}
					<details class="faq-item sap-faq-item" open={idx === 0}>
						<summary>{faq.question}</summary>
						<p>{faq.answer}</p>
					</details>
				{/each}
			</div>
		</div>
	</section>

	<!-- INSTITUTIONAL RISK DISCLAIMER -->
	<section class="sap-disclaimer-section" aria-label="Institutional risk disclosure">
		<div class="container">
			<p class="disclaimer-legal">
				<strong>IMPORTANT RISK DISCLOSURE &amp; EDUCATIONAL DISCLAIMER:</strong> Revolution Trading Pros
				LLC and Billy Ribeiro are financial publishers and educational providers, not registered investment
				advisors or broker-dealers. Sunday Alpha Protocol provides market research, technical chart analysis,
				and hypothetical trade scenarios strictly for educational and informational purposes. Nothing
				contained herein constitutes individualized financial, investment, legal, or tax advice. Trading
				equities, ETFs, and options involves substantial risk of loss and is not suitable for every investor.
				Past performance, including historical macro calls or simulated R-multiple projections, is not
				indicative of future results. Always consult with a licensed financial professional before making
				any investment decisions.
			</p>
		</div>
	</section>
</main>

<Footer />
