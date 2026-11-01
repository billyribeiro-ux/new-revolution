<script lang="ts">
	import '#lib/styles/inner-page.css';
	import '#lib/styles/sunday-alpha-protocol.css';
	import { resolve } from '$app/paths';
	import * as d3 from 'd3';
	import { gsap } from 'gsap';
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

	// Scroll & sticky bar state
	let scrollProgress = $state(0);
	let showStickyBar = $state(false);

	// Live Sunday 5:00 PM EST countdown
	let countdownText = $state('NEXT DISPATCH IN: --d --h --m --s');

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

	// Lead magnet form state
	let reconEmail = $state('');
	let reconSubmitted = $state(false);
	let reconSubmitting = $state(false);
	let reconMessage = $state('');

	async function handleReconSubmit(event: SubmitEvent) {
		event.preventDefault();
		const trimmed = reconEmail.trim();
		if (!trimmed) return;
		reconSubmitting = true;
		reconMessage = '';
		try {
			const response = await fetch('/api/lead', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: trimmed,
					source: 'sunday-alpha-protocol-recon'
				})
			});
			if (response.ok) {
				reconSubmitted = true;
				reconMessage = `Confirmed! ${trimmed} is registered for the Sunday 6:30 PM EST Market Recon.`;
				reconEmail = '';
			} else {
				reconSubmitted = true;
				reconMessage = `You're on the list! Watch your inbox Sunday at 6:30 PM EST.`;
				reconEmail = '';
			}
		} catch {
			reconSubmitted = true;
			reconMessage = `You're on the list! Watch your inbox Sunday at 6:30 PM EST.`;
			reconEmail = '';
		} finally {
			reconSubmitting = false;
		}
	}

	function setupPageTelemetry(node: HTMLElement) {
		if (typeof window === 'undefined') return;

		const computeCountdown = () => {
			try {
				const now = new Date();
				const estNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
				const day = estNow.getDay();
				const daysUntilSunday = (7 - day) % 7;
				const candidate = new Date(
					estNow.getFullYear(),
					estNow.getMonth(),
					estNow.getDate() + daysUntilSunday,
					17,
					0,
					0,
					0
				);
				const targetMs =
					estNow.getTime() >= candidate.getTime()
						? candidate.getTime() + 7 * 24 * 60 * 60 * 1000
						: candidate.getTime();
				const diff = Math.max(0, targetMs - estNow.getTime());
				const d = Math.floor(diff / (1000 * 60 * 60 * 24));
				const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
				const m = Math.floor((diff / 1000 / 60) % 60);
				const s = Math.floor((diff / 1000) % 60);
				countdownText = `NEXT DISPATCH IN: ${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
			} catch {
				countdownText = 'SUNDAY 5:00 PM EST DISPATCH';
			}
		};

		computeCountdown();
		const timerId = window.setInterval(computeCountdown, 1000);

		const onScroll = () => {
			const scrollTop = window.scrollY;
			const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
			scrollProgress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
			showStickyBar = scrollTop > 700;
		};

		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });

		// Subtle GSAP entrance for hero elements when motion is permitted
		const prefersReduced =
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!prefersReduced) {
			const targets = node.querySelectorAll('.sap-gsap-hero');
			if (targets.length > 0) {
				gsap.fromTo(
					targets,
					{ y: 18, opacity: 0.01 },
					{
						y: 0,
						opacity: 1,
						duration: 0.75,
						stagger: 0.08,
						ease: 'power3.out',
						delay: 0.15,
						clearProps: 'all'
					}
				);
			}
		}

		return () => {
			window.clearInterval(timerId);
			window.removeEventListener('scroll', onScroll);
		};
	}

	function setupHeroStageTilt(stage: HTMLElement) {
		if (typeof window === 'undefined') return;
		const prefersReduced =
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReduced) return;

		const deck = stage.querySelector<HTMLElement>('.vision-deck');

		const handleMove = (e: MouseEvent) => {
			const rect = stage.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			stage.style.setProperty('--sap-mouse-x', `${x}px`);
			stage.style.setProperty('--sap-mouse-y', `${y}px`);

			if (deck && window.innerWidth > 1080) {
				const dRect = deck.getBoundingClientRect();
				const cx = dRect.left + dRect.width / 2;
				const cy = dRect.top + dRect.height / 2;
				const rx = Math.max(-7, Math.min(7, -((e.clientY - cy) / (dRect.height / 2)) * 4.5));
				const ry = Math.max(-7, Math.min(7, ((e.clientX - cx) / (dRect.width / 2)) * 4.5));
				deck.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
			}
		};

		const handleLeave = () => {
			if (deck) {
				deck.style.transform = 'rotateX(0deg) rotateY(0deg)';
			}
		};

		stage.addEventListener('mousemove', handleMove, { passive: true });
		stage.addEventListener('mouseleave', handleLeave, { passive: true });

		return () => {
			stage.removeEventListener('mousemove', handleMove);
			stage.removeEventListener('mouseleave', handleLeave);
		};
	}

	function setupWavefieldCanvas(canvas: HTMLCanvasElement) {
		if (typeof window === 'undefined') return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let width = 0;
		let height = 0;
		let time = 0;
		let mouseX = 0.5;
		let mouseY = 0.5;
		let rafId = 0;
		let isVisible = true;

		const resize = () => {
			const parent = canvas.parentElement;
			width = canvas.width = parent ? parent.clientWidth : window.innerWidth;
			height = canvas.height = parent ? parent.clientHeight : window.innerHeight;
		};

		resize();

		const drawFrame = () => {
			ctx.clearRect(0, 0, width, height);
			const lines = 20;
			for (let i = 0; i < lines; i++) {
				const ratio = i / lines;
				ctx.beginPath();
				const alpha = (1 - Math.abs(ratio - 0.5) * 1.6) * 0.22;
				if (i % 4 === 0) {
					ctx.strokeStyle = `rgba(212, 175, 55, ${Math.max(0.03, alpha)})`;
					ctx.lineWidth = 1.4;
				} else if (i % 3 === 0) {
					ctx.strokeStyle = `rgba(16, 185, 129, ${Math.max(0.02, alpha * 0.8)})`;
					ctx.lineWidth = 1.1;
				} else {
					ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0.015, alpha * 0.5)})`;
					ctx.lineWidth = 0.8;
				}

				const baseY = height * (0.18 + ratio * 0.68);
				for (let x = 0; x <= width; x += 28) {
					const nx = x / Math.max(1, width);
					const wave1 = Math.sin(nx * 4.5 + time + i * 0.28) * 28;
					const wave2 = Math.cos(nx * 2.2 - time * 0.7 + i * 0.15) * 18;
					const mouseInfluence = Math.exp(-Math.pow(nx - mouseX, 2) * 8) * (mouseY - 0.5) * 55;
					const y = baseY + wave1 + wave2 + mouseInfluence;
					if (x === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.stroke();
			}
		};

		const prefersReduced =
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (prefersReduced) {
			drawFrame();
			return;
		}

		const tick = () => {
			if (isVisible) {
				time += 0.008;
				drawFrame();
			}
			rafId = window.requestAnimationFrame(tick);
		};

		rafId = window.requestAnimationFrame(tick);

		const onMouseMove = (e: MouseEvent) => {
			mouseX = e.clientX / Math.max(1, width);
			mouseY = e.clientY / Math.max(1, height);
		};

		const io =
			typeof IntersectionObserver !== 'undefined'
				? new IntersectionObserver((entries) => {
						isVisible = entries[0]?.isIntersecting ?? true;
					})
				: null;
		io?.observe(canvas);

		window.addEventListener('resize', resize, { passive: true });
		window.addEventListener('mousemove', onMouseMove, { passive: true });

		return () => {
			window.cancelAnimationFrame(rafId);
			io?.disconnect();
			window.removeEventListener('resize', resize);
			window.removeEventListener('mousemove', onMouseMove);
		};
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
			.attr('stroke', 'rgba(255,255,255,0.12)')
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
			.attr('stop-color', '#10b981')
			.attr('stop-opacity', 0.35);
		grad
			.append('stop')
			.attr('offset', '100%')
			.attr('stop-color', '#10b981')
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
			.attr('stroke', 'rgba(139,149,168,0.45)')
			.attr('stroke-width', 1.5)
			.attr('stroke-dasharray', '4,3')
			.attr('d', lineGen);

		// Sunday Alpha 1:2.50 area + line
		g.append('path').datum(sapData).attr('fill', 'url(#sapSimGrad)').attr('d', areaGen);
		g.append('path')
			.datum(sapData)
			.attr('fill', 'none')
			.attr('stroke', '#34d399')
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
				.attr('fill', '#34d399')
				.attr('stroke', '#030407')
				.attr('stroke-width', 1.5);

			g.append('text')
				.attr('x', x(lastSap.t) + 6)
				.attr('y', y(lastSap.r) + 3)
				.attr('fill', '#34d399')
				.attr('font-family', 'JetBrains Mono, monospace')
				.attr('font-size', '10px')
				.attr('font-weight', '700')
				.text(`${lastSap.r >= 0 ? '+' : ''}${lastSap.r.toFixed(1)}R`);

			g.append('text')
				.attr('x', x(lastRet.t) + 6)
				.attr('y', y(lastRet.r) + 3)
				.attr('fill', '#8b95a8')
				.attr('font-family', 'JetBrains Mono, monospace')
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
					.attr('fill', '#525b6d')
					.attr('font-family', 'JetBrains Mono, monospace')
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
			.attr('stop-color', '#38bdf8')
			.attr('stop-opacity', 0.25);
		priceGrad
			.append('stop')
			.attr('offset', '100%')
			.attr('stop-color', '#38bdf8')
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
			.attr('fill', 'rgba(16, 185, 129, 0.06)');

		// Risk Zone (Stop -> Entry)
		g.append('rect')
			.attr('x', x(12))
			.attr('y', entryY)
			.attr('width', iW - x(12))
			.attr('height', Math.max(0, stopY - entryY))
			.attr('fill', 'rgba(244, 63, 94, 0.07)');

		// 2. Horizontal Grid Lines
		const yTicks = y.ticks(6);
		yTicks.forEach((tickVal) => {
			g.append('line')
				.attr('x1', 0)
				.attr('x2', iW)
				.attr('y1', y(tickVal))
				.attr('y2', y(tickVal))
				.attr('stroke', 'rgba(255,255,255,0.04)');
			g.append('text')
				.attr('x', -10)
				.attr('y', y(tickVal) + 3)
				.attr('text-anchor', 'end')
				.attr('fill', '#525b6d')
				.attr('font-family', 'JetBrains Mono, monospace')
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
					bar.type === 'inst' ? 'rgba(212, 175, 55, 0.22)' : 'rgba(139, 149, 168, 0.12)'
				)
				.attr('stroke', bar.type === 'inst' ? 'rgba(212, 175, 55, 0.45)' : 'none')
				.attr('stroke-width', 0.7);
		});

		// 4. Key Institutional Level Lines & Right Pills
		const levelConfigs = [
			{ key: 'T3 RUNNER', val: bp.levels.t3, color: '#38bdf8', dash: '3,3' },
			{ key: 'T2 CORE', val: bp.levels.t2, color: '#34d399', dash: '4,3' },
			{ key: 'T1 SCALE', val: bp.levels.t1, color: '#10b981', dash: '4,3' },
			{ key: '15M TRIGGER', val: bp.levels.entry, color: '#fbbf24', dash: 'none' },
			{ key: 'HARD STOP', val: bp.levels.stop, color: '#fb7185', dash: '3,3' }
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
				.attr('fill', 'rgba(7, 10, 18, 0.92)')
				.attr('stroke', lvl.color)
				.attr('stroke-width', 0.9);
			pillG
				.append('text')
				.attr('x', 6)
				.attr('y', 12)
				.attr('fill', lvl.color)
				.attr('font-family', 'JetBrains Mono, monospace')
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
			.attr('stroke', '#38bdf8')
			.attr('stroke-width', 2.6)
			.attr('d', lineGen);

		// 6. Highlight Trigger Breakout Node (d = 12) & T3 Node (d = 30)
		const trigPt = bp.series.find((s) => s.d === 12);
		if (trigPt) {
			g.append('circle')
				.attr('cx', x(trigPt.d))
				.attr('cy', y(trigPt.p))
				.attr('r', 6)
				.attr('fill', '#fbbf24')
				.attr('stroke', '#030407')
				.attr('stroke-width', 2);

			g.append('text')
				.attr('x', x(trigPt.d))
				.attr('y', y(trigPt.p) - 12)
				.attr('text-anchor', 'middle')
				.attr('fill', '#fbbf24')
				.attr('font-family', 'JetBrains Mono, monospace')
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
				.attr('fill', '#34d399')
				.attr('stroke', '#030407')
				.attr('stroke-width', 2);
		}

		// 7. Interactive 2D Crosshair & HUD Updater
		const focusG = g.append('g').style('display', 'none');
		const vLine = focusG
			.append('line')
			.attr('y1', 0)
			.attr('y2', iH)
			.attr('stroke', 'rgba(255,255,255,0.35)')
			.attr('stroke-dasharray', '3,3');
		const hLine = focusG
			.append('line')
			.attr('x1', 0)
			.attr('x2', iW)
			.attr('stroke', 'rgba(255,255,255,0.35)')
			.attr('stroke-dasharray', '3,3');
		const focusDot = focusG
			.append('circle')
			.attr('r', 5.5)
			.attr('fill', '#f3e5ab')
			.attr('stroke', '#030407')
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

<a class="skip" href="#watchlist-page">Skip to main content</a>
<Navbar />

<main id="watchlist-page" class="inner-page watchlist-page" {@attach setupPageTelemetry}>
	<!-- Opening Cinema Shutter (Pure CSS Failsafe) -->
	<div class="cinema-shutter" aria-hidden="true">
		<div class="shutter-blade shutter-top">
			<div class="shutter-telemetry">
				<span class="pulse-dot"></span>
				<span>INITIALIZING SUNDAY ALPHA PROTOCOL™ // QUANTITATIVE TELEMETRY v2026.4</span>
			</div>
		</div>
		<div class="shutter-blade shutter-bottom"></div>
	</div>

	<!-- Top Scroll Progress Laser Line -->
	<div class="scroll-laser" style={`width: ${scrollProgress}%`} aria-hidden="true"></div>

	<nav class="breadcrumb-nav" aria-label="Breadcrumb">
		<div class="sap-container">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true">/</li>
				<li><a href={resolve('/alert-services/spx-profit-pulse')}>Alert Services</a></li>
				<li aria-hidden="true">/</li>
				<li aria-current="page">Weekly Stock &amp; Options Video Watchlist</li>
			</ol>
		</div>
	</nav>

	<!-- ACT I: CINEMATIC 3D WAVEFIELD HERO STAGE -->
	<header
		id="hero-stage"
		class="page-hero sap-hero-stage"
		aria-labelledby="sap-hero-h1"
		{@attach setupHeroStageTilt}
	>
		<!-- Top Live Telemetry Ribbon -->
		<div class="telemetry-ribbon">
			<div class="sap-container ribbon-inner">
				<div class="ribbon-badge">
					<span class="live-dot" aria-hidden="true"></span>
					<span>
						Founding Release:
						<strong>First 100 Subscribers Lock In $47/Month For Life</strong>
						(Regular $197/mo — Save 76%)
					</span>
				</div>
				<div class="countdown-pill" aria-live="polite">{countdownText}</div>
			</div>
		</div>

		<!-- Protocol Section Sub-Navigation -->
		<nav class="sap-subnav" aria-label="Sunday Alpha Protocol sections">
			<div class="sap-container sap-subnav-inner">
				<div class="brand-lockup">
					<div class="brand-emblem" aria-hidden="true">RTP</div>
					<div class="brand-text">
						<span class="brand-name">Revolution Trading Pros</span>
						<span class="brand-sub">Sunday Alpha Protocol™</span>
					</div>
				</div>
				<div class="nav-links">
					<a class="sap-subnav-link" href="#keynote-mechanism">The Mechanism</a>
					<a class="sap-subnav-link" href="#d3-terminal-section">Live D3 Terminal</a>
					<a class="sap-subnav-link" href="#suitability">Suitability</a>
					<a class="sap-subnav-link" href="#authority">Track Record</a>
					<a class="sap-subnav-link" href="#pricing">Pricing</a>
				</div>
				<a href="#pricing" class="nav-cta">Claim $47 Access</a>
			</div>
		</nav>

		<!-- 60fps 2D Canvas Wavefield & Volumetric Spotlight -->
		<canvas class="wavefield-canvas" aria-hidden="true" {@attach setupWavefieldCanvas}></canvas>
		<div class="hero-spotlight" aria-hidden="true"></div>

		<div class="sap-container hero-main">
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
						<strong>5:00 PM EST</strong>—one full hour before futures open—receive
						<strong
							>5 to 7 institutional-grade U.S. large-cap stock &amp; options swing blueprints</strong
						>
						engineered with exact 15-minute confirmation triggers, cent-level invalidation stops, and
						a strict <strong>1:2.50+ minimum Risk-to-Reward</strong> hurdle.
					</p>

					<div class="hero-cta-row sap-gsap-hero">
						<a href="#pricing" class="btn-primary-gold">
							<span>Lock In $47/mo Founding Access</span>
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
						<a href="#d3-terminal-section" class="btn-secondary-glass">
							<span>Explore Interactive D3 Terminal</span>
						</a>
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

				<!-- Right Column: 3D VisionOS Glass Command Deck + Interactive D3 R-Simulator -->
				<div class="vision-deck-wrap sap-gsap-hero">
					<div class="vision-deck">
						<div class="deck-header">
							<div class="deck-dots" aria-hidden="true">
								<span></span>
								<span></span>
								<span></span>
							</div>
							<div class="deck-title">PROTOCOL TELEMETRY DECK // LIVE R-ENGINE</div>
							<div class="deck-status">
								<span class="live-dot" aria-hidden="true"></span>
								<span>Audited 1:2.50 R:R</span>
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
										type="range"
										min="40"
										max="75"
										step="5"
										bind:value={winRate}
									/>
									<span class="sim-val-pill">{winRate}% Win Rate</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Bottom Hero Kinetic Telemetry Bar -->
		<div class="hero-telemetry-bar">
			<div class="sap-container telemetry-grid">
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

	<!-- ACT II: APPLE KEYNOTE 3-ACT INSTITUTIONAL MECHANISM -->
	<section id="keynote-mechanism" class="keynote-section" aria-labelledby="mechanism-h2">
		<div class="sap-container">
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
					<strong>Sunday Alpha Protocol™</strong> replaces emotional guesswork with a 3-stage quantitative
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
		<div class="sap-container">
			<div class="sap-section-header">
				<div class="section-kicker">
					<span>INTERACTIVE BLUEPRINT INSPECTION</span>
				</div>
				<h2 id="terminal-h2" class="sap-section-title">
					Inspect an Authentic Sunday Alpha Protocol™ Blueprint.
				</h2>
				<p class="sap-section-subtitle">
					Switch between live sample blueprints below and move your cursor across the
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
						<span class="terminal-sub">Hover or drag across chart to inspect live R-Multiple</span>
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
		<div class="sap-container">
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
		<div class="sap-container">
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
							“Goldfinger” McGoldrick—who called him <strong>“the future of trading”</strong>—Billy
							Ribeiro built Revolution Trading Pros on a single uncompromising mandate:
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
		<div class="sap-container">
			<div class="sap-section-header">
				<div class="section-kicker">
					<span>GRANDFATHERED FOUNDING MEMBER RELEASE</span>
				</div>
				<h2 id="pricing-h2" class="sap-section-title">
					Lock In $47/Month For Life. Save $150/Month (76% OFF).
				</h2>
				<p class="sap-section-subtitle">
					Public retail pricing for the <strong>Sunday Alpha Protocol™</strong> is
					<strong>$197/month</strong>. The first 100 Founding Members lock in
					<strong>$47/month grandfathered for life</strong>—backed by 1-click self-service
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
							class="btn-full"
							class:btn-primary-gold={tier.featured}
							class:btn-secondary-glass={!tier.featured}
						>
							{tier.ctaLabel}
						</a>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- FREE LEAD MAGNET VAULT -->
	<section class="vault-section" aria-labelledby="vault-h2">
		<div class="sap-container">
			<div class="vault-box">
				<div>
					<div class="section-kicker">
						<span>FREE WEEKLY MARKET RECON • SUNDAY 6:30 PM EST</span>
					</div>
					<h2 id="vault-h2" class="vault-title">
						Not Ready for the Full Protocol? Join the Free Sunday Recon Brief.
					</h2>
					<p class="vault-copy">
						Receive Billy Ribeiro’s macro S&amp;P 500 ($SPY) &amp; Nasdaq ($QQQ) weekly dealer gamma
						overview plus <strong>1 complimentary institutional chart setup</strong> every Sunday evening.
					</p>
				</div>
				<div>
					<form class="vault-form" onsubmit={handleReconSubmit}>
						<label class="sr-only" for="sap-recon-email">Email address for Sunday Recon</label>
						<input
							id="sap-recon-email"
							type="email"
							class="vault-input"
							placeholder="Enter your best trading email..."
							required
							bind:value={reconEmail}
							disabled={reconSubmitting}
						/>
						<button type="submit" class="btn-primary-gold" disabled={reconSubmitting}>
							{reconSubmitting ? 'Sending...' : 'Send Free Recon'}
						</button>
					</form>
					{#if reconSubmitted && reconMessage}
						<p class="vault-confirm" role="status">{reconMessage}</p>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<!-- FAQ ACCORDION (1-to-1 Parity with FAQPage Schema) -->
	<section id="faq" class="faq-section" aria-labelledby="faq-h2">
		<div class="sap-container">
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
		<div class="sap-container">
			<p class="disclaimer-legal">
				<strong>IMPORTANT RISK DISCLOSURE &amp; EDUCATIONAL DISCLAIMER:</strong> Revolution Trading Pros
				LLC and Billy Ribeiro are financial publishers and educational providers, not registered investment
				advisors or broker-dealers. The Sunday Alpha Protocol™ provides market research, technical chart
				analysis, and hypothetical trade scenarios strictly for educational and informational purposes.
				Nothing contained herein constitutes individualized financial, investment, legal, or tax advice.
				Trading equities, ETFs, and options involves substantial risk of loss and is not suitable for
				every investor. Past performance, including historical macro calls or simulated R-multiple projections,
				is not indicative of future results. Always consult with a licensed financial professional before
				making any investment decisions.
			</p>
		</div>
	</section>

	<!-- Sticky Bottom Conversion Bar -->
	<div class={['sticky-bar', { visible: showStickyBar }]} aria-hidden={!showStickyBar}>
		<div class="sticky-text">
			<strong>Sunday Alpha Protocol™ Founding Rate:</strong>
			<span>$47/mo (Regular $197/mo — Save 76% For Life)</span>
		</div>
		<a href="#pricing" class="btn-primary-gold sticky-cta">Claim Pass -></a>
	</div>
</main>

<Footer />
