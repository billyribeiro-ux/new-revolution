export interface SundayAlphaTelemetryMetric {
	value: string;
	unit?: string;
	label: string;
}

export interface SundayAlphaMechanismAct {
	stepNumber: string;
	tag: string;
	title: string;
	description: string;
	calloutLabel: string;
	calloutValue: string;
	calloutColor: 'gold' | 'emerald' | 'cyan';
}

export interface SundayAlphaTerminalLevels {
	stop: number;
	entry: number;
	t1: number;
	t2: number;
	t3: number;
}

export interface SundayAlphaVbpPoint {
	p: number;
	vol: number;
	type: 'inst' | 'ret';
}

export interface SundayAlphaSeriesPoint {
	d: number;
	p: number;
	v: number;
}

export interface SundayAlphaSpecRow {
	k: string;
	v: string;
	c: string;
}

export interface SundayAlphaBlueprint {
	key: 'tsla' | 'nvda' | 'spy';
	tabLabel: string;
	name: string;
	tag: string;
	tagColor: string;
	tagBg: string;
	tagBorder: string;
	rr: string;
	domain: [number, number];
	levels: SundayAlphaTerminalLevels;
	optBase: number;
	optDelta: number;
	vbp: readonly SundayAlphaVbpPoint[];
	series: readonly SundayAlphaSeriesPoint[];
	specsEq: readonly SundayAlphaSpecRow[];
	specsOpt: readonly SundayAlphaSpecRow[];
	context: string;
}

export interface SundayAlphaSuitabilityTier {
	tierBadge: string;
	tierColor: 'gold' | 'emerald' | 'cyan';
	audience: string;
	headline: string;
	summary: string;
	bullets: readonly { strong: string; text: string }[];
}

export interface SundayAlphaReceipt {
	kicker: string;
	kickerColor: 'gold' | 'emerald' | 'cyan';
	title: string;
	description: string;
}

export interface SundayAlphaPricingTier {
	id: 'monthly' | 'quarterly' | 'annual';
	badge?: string;
	featured?: boolean;
	name: string;
	subtitle: string;
	price: string;
	period: string;
	savingText: string;
	savingHighlight?: boolean;
	features: readonly { strong?: string; text: string; highlight?: boolean }[];
	ctaLabel: string;
	ctaHref: string;
}

export const SUNDAY_ALPHA_HERO_METRICS: readonly SundayAlphaTelemetryMetric[] = [
	{
		value: '7',
		unit: 'Setups',
		label: 'Institutional Setups Audited Every Sunday'
	},
	{
		value: '1 : 2.50',
		label: 'Minimum Weighted Blended R:R Hurdle'
	},
	{
		value: '14–21',
		unit: 'DTE',
		label: 'Options Contract Architecture (0.60–0.70Δ)'
	},
	{
		value: '$47',
		unit: '/mo',
		label: 'Grandfathered Founding Rate (Save 76%)'
	}
] as const;

export const SUNDAY_ALPHA_MECHANISM_ACTS: readonly SundayAlphaMechanismAct[] = [
	{
		stepNumber: '01',
		tag: 'ACT 01 // ORDER ABSORPTION',
		title: 'Identify The Institutional Base',
		description:
			'Before price ever breaks out, institutional dark pools and block desks absorb supply along high-volume liquidity shelves. Every weekend, we scan the top 100 U.S. large-cap equities and ETFs to isolate multi-week consolidation coils sitting directly on institutional VWAP and Volume-by-Price nodes.',
		calloutLabel: 'PRIMARY FILTER',
		calloutValue: 'Multi-Week Dark-Pool Accumulation Shelf',
		calloutColor: 'gold'
	},
	{
		stepNumber: '02',
		tag: 'ACT 02 // THE 15M GAMMA FLIP',
		title: 'Wait For Confirmed 15m Close',
		description:
			'Amateurs buy the opening 9:30 AM retail head-fake and get stopped out by 10:00 AM. Sunday Alpha Alerts forbids opening-bell chasing. You only execute when a 15-minute candle closes cleanly above our exact trigger coordinate, accompanied by >= 1.5x Relative Volume (RVOL).',
		calloutLabel: 'EXECUTION RULE',
		calloutValue: '15m Candle Close + 1.5x RVOL Confirmation',
		calloutColor: 'emerald'
	},
	{
		stepNumber: '03',
		tag: 'ACT 03 // ASYMMETRIC EXTRACTION',
		title: 'Scale Out Into Liquidity',
		description:
			'Every setup maps a hard structural invalidation stop to the cent alongside three mathematical profit targets: Target 1 (+1.6R) scales 50% and moves your stop to breakeven; Target 2 (+2.8R) scales 30%; Target 3 (+4.3R) trails the remaining 20% runner.',
		calloutLabel: 'WEIGHTED BLENDED RETURN',
		calloutValue: 'Minimum 1 : 2.50 Risk-to-Reward Hurdle',
		calloutColor: 'cyan'
	}
] as const;

export const SUNDAY_ALPHA_TERMINAL_BLUEPRINTS: Record<
	SundayAlphaBlueprint['key'],
	SundayAlphaBlueprint
> = {
	tsla: {
		key: 'tsla',
		tabLabel: '$TSLA SWING',
		name: '$TSLA: Tesla, Inc.',
		tag: 'BULLISH GAMMA BREAKOUT',
		tagColor: '#10b981',
		tagBg: 'rgba(16,185,129,0.12)',
		tagBorder: 'rgba(16,185,129,0.35)',
		rr: '1 : 2.50',
		domain: [232, 286],
		levels: { stop: 241.2, entry: 248.5, t1: 260.0, t2: 269.0, t3: 280.0 },
		optBase: 9.4,
		optDelta: 0.65,
		vbp: [
			{ p: 236, vol: 35, type: 'ret' },
			{ p: 241, vol: 88, type: 'inst' },
			{ p: 245, vol: 95, type: 'inst' },
			{ p: 248.5, vol: 100, type: 'inst' },
			{ p: 254, vol: 42, type: 'ret' },
			{ p: 260, vol: 68, type: 'inst' },
			{ p: 269, vol: 62, type: 'inst' },
			{ p: 280, vol: 54, type: 'inst' }
		],
		series: [
			{ d: 1, p: 237.5, v: 42 },
			{ d: 2, p: 239.2, v: 48 },
			{ d: 3, p: 238.0, v: 39 },
			{ d: 4, p: 241.5, v: 64 },
			{ d: 5, p: 243.1, v: 58 },
			{ d: 6, p: 241.8, v: 51 },
			{ d: 7, p: 244.6, v: 72 },
			{ d: 8, p: 246.2, v: 79 },
			{ d: 9, p: 245.1, v: 61 },
			{ d: 10, p: 247.4, v: 83 },
			{ d: 11, p: 246.8, v: 67 },
			{ d: 12, p: 248.5, v: 96 },
			{ d: 13, p: 251.2, v: 92 },
			{ d: 14, p: 253.8, v: 85 },
			{ d: 15, p: 252.9, v: 64 },
			{ d: 16, p: 256.4, v: 88 },
			{ d: 17, p: 258.7, v: 91 },
			{ d: 18, p: 260.0, v: 95 },
			{ d: 19, p: 259.1, v: 62 },
			{ d: 20, p: 262.8, v: 84 },
			{ d: 21, p: 265.4, v: 87 },
			{ d: 22, p: 267.9, v: 89 },
			{ d: 23, p: 269.0, v: 93 },
			{ d: 24, p: 268.2, v: 59 },
			{ d: 25, p: 271.6, v: 81 },
			{ d: 26, p: 274.5, v: 86 },
			{ d: 27, p: 276.8, v: 88 },
			{ d: 28, p: 278.4, v: 90 },
			{ d: 29, p: 279.3, v: 92 },
			{ d: 30, p: 280.0, v: 97 }
		],
		specsEq: [
			{ k: '15m Entry Trigger', v: '$248.50 Confirmed Close', c: 'var(--sap-gold-bright)' },
			{ k: 'Max Chasing Limit', v: '$250.25 (Hard Cap)', c: 'var(--sap-text-main)' },
			{
				k: 'Hard Invalidation Stop',
				v: '$241.20 (-$7.30 / -2.93%)',
				c: 'var(--sap-crimson-bright)'
			},
			{
				k: 'Target 1 (50% Scale)',
				v: '$260.00 (+1.58R) -> Stop to BE',
				c: 'var(--sap-emerald-bright)'
			},
			{
				k: 'Target 2 (30% Scale)',
				v: '$269.00 (+2.81R) -> Trail 8-EMA',
				c: 'var(--sap-emerald-bright)'
			},
			{ k: 'Target 3 (20% Runner)', v: '$280.00 (+4.32R) -> Full Exit', c: 'var(--sap-cyan)' }
		],
		specsOpt: [
			{ k: 'Primary Contract', v: '18 DTE $250.00 CALL', c: 'var(--sap-gold-bright)' },
			{ k: 'Target Delta / IV Rank', v: '0.64 Delta • IVR 28% (Low)', c: 'var(--sap-text-main)' },
			{ k: 'Contract Limit Band', v: '$9.10 – $9.75 Debit Max', c: 'var(--sap-emerald-bright)' },
			{
				k: 'Defined-Risk Spread Alt',
				v: '$250 / $270 Bull Call Debit Spread',
				c: 'var(--sap-cyan)'
			},
			{
				k: 'Theta Protection Rule',
				v: 'Exit if un-triggered by Wed 2 PM',
				c: 'var(--sap-text-sec)'
			},
			{
				k: 'Earnings / Catalyst Risk',
				v: 'CLEAR (26 Days to Earnings)',
				c: 'var(--sap-emerald-bright)'
			}
		],
		context:
			'14-session institutional accumulation shelf defending the 50-SMA ($241.20) with dark-pool block prints absorbing supply at $246–$248. A 15m close above $248.50 forces dealer short-gamma hedging directly toward the $260.00 and $269.00 liquidity air-pocket.'
	},
	nvda: {
		key: 'nvda',
		tabLabel: '$NVDA BREAKOUT',
		name: '$NVDA: NVIDIA Corp.',
		tag: 'RELATIVE STRENGTH LEADER',
		tagColor: '#10b981',
		tagBg: 'rgba(16,185,129,0.12)',
		tagBorder: 'rgba(16,185,129,0.35)',
		rr: '1 : 2.68',
		domain: [129, 156],
		levels: { stop: 132.4, entry: 136.8, t1: 144.0, t2: 149.2, t3: 154.5 },
		optBase: 6.2,
		optDelta: 0.66,
		vbp: [
			{ p: 131, vol: 38, type: 'ret' },
			{ p: 133.5, vol: 91, type: 'inst' },
			{ p: 136.8, vol: 100, type: 'inst' },
			{ p: 140, vol: 45, type: 'ret' },
			{ p: 144, vol: 74, type: 'inst' },
			{ p: 149.2, vol: 66, type: 'inst' },
			{ p: 154.5, vol: 58, type: 'inst' }
		],
		series: [
			{ d: 1, p: 131.2, v: 45 },
			{ d: 2, p: 132.0, v: 50 },
			{ d: 3, p: 131.6, v: 41 },
			{ d: 4, p: 133.1, v: 68 },
			{ d: 5, p: 134.0, v: 62 },
			{ d: 6, p: 133.4, v: 53 },
			{ d: 7, p: 134.9, v: 75 },
			{ d: 8, p: 135.7, v: 81 },
			{ d: 9, p: 135.2, v: 64 },
			{ d: 10, p: 136.3, v: 86 },
			{ d: 11, p: 136.0, v: 70 },
			{ d: 12, p: 136.8, v: 98 },
			{ d: 13, p: 138.4, v: 93 },
			{ d: 14, p: 139.9, v: 87 },
			{ d: 15, p: 139.3, v: 66 },
			{ d: 16, p: 141.5, v: 89 },
			{ d: 17, p: 142.8, v: 92 },
			{ d: 18, p: 144.0, v: 96 },
			{ d: 19, p: 143.5, v: 65 },
			{ d: 20, p: 145.6, v: 85 },
			{ d: 21, p: 147.1, v: 88 },
			{ d: 22, p: 148.4, v: 90 },
			{ d: 23, p: 149.2, v: 94 },
			{ d: 24, p: 148.7, v: 61 },
			{ d: 25, p: 150.4, v: 83 },
			{ d: 26, p: 151.8, v: 87 },
			{ d: 27, p: 152.9, v: 89 },
			{ d: 28, p: 153.6, v: 91 },
			{ d: 29, p: 154.1, v: 93 },
			{ d: 30, p: 154.5, v: 98 }
		],
		specsEq: [
			{ k: '15m Entry Trigger', v: '$136.80 Confirmed Close', c: 'var(--sap-gold-bright)' },
			{ k: 'Max Chasing Limit', v: '$137.75 (Hard Cap)', c: 'var(--sap-text-main)' },
			{
				k: 'Hard Invalidation Stop',
				v: '$132.40 (-$4.40 / -3.21%)',
				c: 'var(--sap-crimson-bright)'
			},
			{
				k: 'Target 1 (50% Scale)',
				v: '$144.00 (+1.64R) -> Stop to BE',
				c: 'var(--sap-emerald-bright)'
			},
			{
				k: 'Target 2 (30% Scale)',
				v: '$149.20 (+2.82R) -> Trail 8-EMA',
				c: 'var(--sap-emerald-bright)'
			},
			{ k: 'Target 3 (20% Runner)', v: '$154.50 (+4.02R) -> Full Exit', c: 'var(--sap-cyan)' }
		],
		specsOpt: [
			{ k: 'Primary Contract', v: '21 DTE $137.00 CALL', c: 'var(--sap-gold-bright)' },
			{
				k: 'Target Delta / IV Rank',
				v: '0.66 Delta • IVR 24% (Optimal)',
				c: 'var(--sap-text-main)'
			},
			{ k: 'Contract Limit Band', v: '$5.95 – $6.40 Debit Max', c: 'var(--sap-emerald-bright)' },
			{
				k: 'Defined-Risk Spread Alt',
				v: '$137 / $150 Bull Call Debit Spread',
				c: 'var(--sap-cyan)'
			},
			{
				k: 'Theta Protection Rule',
				v: 'Exit if un-triggered by Wed 2 PM',
				c: 'var(--sap-text-sec)'
			},
			{
				k: 'Earnings / Catalyst Risk',
				v: 'CLEAR (34 Days to Earnings)',
				c: 'var(--sap-emerald-bright)'
			}
		],
		context:
			'Tight 3-week volatility contraction pattern (VCP) holding higher lows above anchored institutional VWAP ($132.40). Semiconductor relative strength + institutional call sweep concentration at the $140 and $145 strikes supports rapid expansion.'
	},
	spy: {
		key: 'spy',
		tabLabel: '$SPY PIVOT',
		name: '$SPY: S&P 500 ETF Trust',
		tag: 'INDEX LIQUIDITY RECLAIM',
		tagColor: '#38bdf8',
		tagBg: 'rgba(56,189,248,0.12)',
		tagBorder: 'rgba(56,189,248,0.35)',
		rr: '1 : 2.55',
		domain: [573, 601],
		levels: { stop: 576.4, entry: 580.2, t1: 586.5, t2: 591.2, t3: 597.8 },
		optBase: 7.8,
		optDelta: 0.65,
		vbp: [
			{ p: 575, vol: 42, type: 'ret' },
			{ p: 577.5, vol: 94, type: 'inst' },
			{ p: 580.2, vol: 100, type: 'inst' },
			{ p: 583.5, vol: 48, type: 'ret' },
			{ p: 586.5, vol: 76, type: 'inst' },
			{ p: 591.2, vol: 71, type: 'inst' },
			{ p: 597.8, vol: 64, type: 'inst' }
		],
		series: [
			{ d: 1, p: 574.8, v: 44 },
			{ d: 2, p: 575.6, v: 49 },
			{ d: 3, p: 575.1, v: 40 },
			{ d: 4, p: 576.9, v: 67 },
			{ d: 5, p: 577.8, v: 61 },
			{ d: 6, p: 577.2, v: 52 },
			{ d: 7, p: 578.4, v: 74 },
			{ d: 8, p: 579.1, v: 80 },
			{ d: 9, p: 578.7, v: 63 },
			{ d: 10, p: 579.7, v: 85 },
			{ d: 11, p: 579.4, v: 69 },
			{ d: 12, p: 580.2, v: 97 },
			{ d: 13, p: 581.9, v: 92 },
			{ d: 14, p: 583.1, v: 86 },
			{ d: 15, p: 582.6, v: 65 },
			{ d: 16, p: 584.4, v: 88 },
			{ d: 17, p: 585.6, v: 91 },
			{ d: 18, p: 586.5, v: 95 },
			{ d: 19, p: 586.0, v: 64 },
			{ d: 20, p: 587.9, v: 84 },
			{ d: 21, p: 589.3, v: 87 },
			{ d: 22, p: 590.4, v: 89 },
			{ d: 23, p: 591.2, v: 93 },
			{ d: 24, p: 590.7, v: 60 },
			{ d: 25, p: 592.6, v: 82 },
			{ d: 26, p: 594.2, v: 86 },
			{ d: 27, p: 595.5, v: 88 },
			{ d: 28, p: 596.4, v: 90 },
			{ d: 29, p: 597.1, v: 92 },
			{ d: 30, p: 597.8, v: 96 }
		],
		specsEq: [
			{ k: '15m Entry Trigger', v: '$580.20 Confirmed Close', c: 'var(--sap-gold-bright)' },
			{ k: 'Max Chasing Limit', v: '$581.10 (Hard Cap)', c: 'var(--sap-text-main)' },
			{
				k: 'Hard Invalidation Stop',
				v: '$576.40 (-$3.80 / -0.65%)',
				c: 'var(--sap-crimson-bright)'
			},
			{
				k: 'Target 1 (50% Scale)',
				v: '$586.50 (+1.66R) -> Stop to BE',
				c: 'var(--sap-emerald-bright)'
			},
			{
				k: 'Target 2 (30% Scale)',
				v: '$591.20 (+2.89R) -> Trail 8-EMA',
				c: 'var(--sap-emerald-bright)'
			},
			{ k: 'Target 3 (20% Runner)', v: '$597.80 (+4.63R) -> Full Exit', c: 'var(--sap-cyan)' }
		],
		specsOpt: [
			{ k: 'Primary Contract', v: '14 DTE $580.00 CALL', c: 'var(--sap-gold-bright)' },
			{
				k: 'Target Delta / IV Rank',
				v: '0.65 Delta • VIX 14.8 (Controlled)',
				c: 'var(--sap-text-main)'
			},
			{ k: 'Contract Limit Band', v: '$7.55 – $7.95 Debit Max', c: 'var(--sap-emerald-bright)' },
			{
				k: 'Defined-Risk Spread Alt',
				v: '$580 / $592 Bull Call Debit Spread',
				c: 'var(--sap-cyan)'
			},
			{
				k: 'Theta Protection Rule',
				v: 'Exit if un-triggered by Wed 2 PM',
				c: 'var(--sap-text-sec)'
			},
			{ k: 'Macro Event Check', v: 'FOMC / CPI Clear Window', c: 'var(--sap-emerald-bright)' }
		],
		context:
			'Institutional liquidity sweep below $577.50 fully reclaimed on rising breadth. Positive dealer gamma flip sits directly at $580.20, projecting systematic CTA inflows toward the $591.20 and $597.80 upper distribution targets.'
	}
};

export const SUNDAY_ALPHA_SUITABILITY_TIERS: readonly SundayAlphaSuitabilityTier[] = [
	{
		tierBadge: 'TIER 01 // FOUNDATION & STRUCTURE',
		tierColor: 'gold',
		audience: 'For Beginners & Developing Traders',
		headline: 'Total Execution Clarity',
		summary:
			'Eliminate chart paralysis, indicator overload, and emotional FOMO. You receive a turnkey execution blueprint that tells you what to buy, when to enter, and where you are wrong.',
		bullets: [
			{
				strong: 'Zero Guesswork:',
				text: 'Exact cent-level triggers and hard stop-losses remove emotional hesitation.'
			},
			{
				strong: '1% Account Risk Rule:',
				text: 'Built-in position sizing math prevents catastrophic drawdown while you learn.'
			},
			{
				strong: 'Plain-English Options:',
				text: 'Explicit expiration, strike, and maximum debit limits so you never overpay for IV.'
			}
		]
	},
	{
		tierBadge: 'TIER 02 // QUANTITATIVE SWING EXECUTION',
		tierColor: 'emerald',
		audience: 'For Active Swing Traders & Option Pros',
		headline: 'Asymmetric Liquidity Alpha',
		summary:
			'Reclaim 15+ hours of weekend scanning. Leverage institutional Volume-by-Price nodes, dealer gamma flip triggers, and strict 1:2.50+ R:R math across the highest-beta large-cap leaders.',
		bullets: [
			{
				strong: '15m Gamma Confirmation:',
				text: 'Filter out 9:30 AM retail traps with institutional RVOL >= 1.5x rules.'
			},
			{
				strong: '0.60–0.70 Delta Architecture:',
				text: '14–21 DTE contracts engineered to maximize gamma acceleration and crush theta decay.'
			},
			{
				strong: 'Tiered Scaling Protocol:',
				text: '50% T1 / 30% T2 / 20% T3 runner extraction model locks in base hits and home runs.'
			}
		]
	},
	{
		tierBadge: 'TIER 03 // CAPITAL ALLOCATION & OVERLAY',
		tierColor: 'cyan',
		audience: 'For Serious Investors & Allocators',
		headline: 'Tactical Portfolio Overlays',
		summary:
			'Deploy high-conviction multi-day equity positions and defined-risk vertical spreads around core holdings with institutional macro regime awareness and capital preservation.',
		bullets: [
			{
				strong: 'Macro Regime Alignment:',
				text: 'Weekly S&P 500 ($SPY), Nasdaq ($QQQ), and VIX dealer positioning brief.'
			},
			{
				strong: 'Deep Liquidity Only:',
				text: 'Strictly S&P 500 / Nasdaq-100 large-caps capable of absorbing serious position size.'
			},
			{
				strong: '9-to-5 Compatible:',
				text: 'Set conditional brokerage alerts on Sunday evening; zero intraday screen-staring required.'
			}
		]
	}
] as const;

export const SUNDAY_ALPHA_AUTHORITY_RECEIPTS: readonly SundayAlphaReceipt[] = [
	{
		kicker: 'MARCH 2020 // MACRO INFLECTION',
		kickerColor: 'gold',
		title: 'Called The Pandemic Bottom To The Cent',
		description:
			'Identified institutional exhaustion and generational liquidity absorption at the exact March 2020 S&P 500 capitulation low while retail consensus panicked in cash.'
	},
	{
		kicker: '2022 CYCLE // CONTRARIAN ALPHA',
		kickerColor: 'emerald',
		title: '2022 Cycle Top & +600% Overnight $OXY Put',
		description:
			'Called the 2022 bull market distribution top and bear cycle bottom, and executed a live +600% overnight Put Options trade on Occidental Petroleum ($OXY) opposite mainstream institutional headlines.'
	},
	{
		kicker: 'EXECUTION PROTOCOL',
		kickerColor: 'cyan',
		title: 'Zero Hindsight. 100% Pre-Market Coordinates.',
		description:
			'Every blueprint in Sunday Alpha Alerts is published at 5:00 PM EST Sunday, before futures open, with immutable entry triggers, stops, and targets.'
	}
] as const;

export const SUNDAY_ALPHA_PRICING_TIERS: readonly SundayAlphaPricingTier[] = [
	{
		id: 'monthly',
		badge: 'MOST POPULAR • FIRST 100 FOUNDERS',
		featured: true,
		name: 'Founding Member Monthly',
		subtitle: 'Lock in our lowest monthly rate for the life of your active membership.',
		price: '$47',
		period: '/ month',
		savingText: 'Regular $197/mo; save $150/mo (76% OFF) Forever',
		savingHighlight: true,
		features: [
			{ strong: 'Sunday 5:00 PM EST Dispatch:', text: '5–7 Institutional Swing Blueprints' },
			{ strong: 'Exact Equity Coordinates:', text: '15m Trigger, Max Chase Cap & Hard Stop' },
			{ strong: 'Explicit Options Architecture:', text: '14–21 DTE, 0.65Δ Strike & Debit Band' },
			{
				strong: '3-Tier Profit Scaling Matrix:',
				text: 'T1 (+1.6R), T2 (+2.8R), T3 (+4.3R) Runner'
			},
			{ strong: 'Mid-Week Wednesday Recon:', text: 'Trigger status & stop-to-BE updates' },
			{ text: '1-Click Self-Service Cancel Anytime via Stripe' }
		],
		ctaLabel: 'Ask about $47/mo membership →',
		ctaHref: '/contact'
	},
	{
		id: 'quarterly',
		name: 'Quarterly Pass',
		subtitle: 'Commit to a full 12-week institutional market cycle and save an extra 10%.',
		price: '$127',
		period: '/ quarter',
		savingText: 'Equivalent to $42.33/mo (Regular $497/qtr; save 74%)',
		features: [
			{ strong: 'Everything in Founding Monthly', text: '(12 Full Weekly Dispatches)' },
			{ strong: 'Priority Founding Rate Lock:', text: 'Grandfathered at $127/quarter' },
			{ strong: 'Bonus:', text: '15-Minute Gamma Flip Execution Guide (PDF)' },
			{ strong: 'Bonus:', text: 'Position Sizing & 1% Risk Calculator Sheet' },
			{ strong: 'Full Historical Archive:', text: 'Access past Sunday Alpha blueprints' },
			{ text: '1-Click Self-Service Cancel Anytime via Stripe' }
		],
		ctaLabel: 'Ask about quarterly ($127)',
		ctaHref: '/contact'
	},
	{
		id: 'annual',
		name: 'Annual VIP Pass',
		subtitle: 'Maximum savings for serious swing traders and portfolio allocators.',
		price: '$447',
		period: '/ year',
		savingText: 'Equivalent to $37.25/mo (Regular $1,647/yr; save $1,200/yr)',
		features: [
			{ strong: '52 Full Weeks', text: 'of Sunday Alpha Alerts Dispatches' },
			{
				strong: 'Lowest Effective Rate:',
				text: 'Save an additional 21% off Founding Monthly',
				highlight: true
			},
			{ strong: 'All Quarterly Bonuses Included', text: '(Gamma Guide + Risk Calculator)' },
			{ strong: 'VIP Macro Inflection Alerts:', text: 'Special regime shift briefings' },
			{ strong: 'Lifetime Rate Lock:', text: 'Never pay a price increase' },
			{ text: '1-Click Self-Service Cancel Anytime via Stripe' }
		],
		ctaLabel: 'Ask about annual VIP ($447)',
		ctaHref: '/contact'
	}
] as const;
