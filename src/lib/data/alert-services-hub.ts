/**
 * Static content module for `/alert-services` —
 * Price-Action Options & SPX Alert Services Hub.
 */

export interface AlertServiceCardSpec {
	id: 'spx-profit-pulse' | 'sunday-alpha-protocol';
	badge: string;
	name: string;
	cadence: string;
	bestFor: string;
	instruments: string;
	summary: string;
	deliverables: readonly string[];
	href: '/alert-services/spx-profit-pulse' | '/alert-services/sunday-alpha-protocol';
	ctaLabel: string;
}

export const ALERT_SERVICE_CARDS: readonly AlertServiceCardSpec[] = [
	{
		id: 'spx-profit-pulse',
		badge: 'INTRADAY INDEX OPTIONS · CASH-SETTLED',
		name: 'SPX Profit Pulse',
		cadence: 'Market Days · Pre-Market Plan + Intraday Structural Dispatches',
		bestFor:
			'Active options traders seeking surgical 0DTE and short-dated SPX/XSP index setups without sitting on voice chat all day.',
		instruments:
			'SPX & Mini-XSP Cash-Settled Index Options (IRC Section 1256 · Zero Early Assignment)',
		summary:
			'Powered by The Move Prior to The Move™, every SPX Profit Pulse dispatch delivers the complete 5-point pre-trade structural blueprint — higher-timeframe inflection zone, 1m/5m confirmation trigger, engineered strike selection against midday theta bleed, tiered targets, and a binary index invalidation print.',
		deliverables: [
			'Pre-market SPX higher-timeframe supply, demand, and inflection zones mapped before 9:30 AM ET',
			'Engineered single-leg and defined-risk vertical spread selection (SPX & $500+-friendly XSP)',
			'Exact entry trigger, Target 1 / Target 2 scaling levels, and hard index invalidation stop',
			'Explicit "No-Trade / Mid-Range Chop" sit-out dispatches when risk-to-reward compresses'
		],
		href: '/alert-services/spx-profit-pulse',
		ctaLabel: 'Explore SPX Profit Pulse'
	},
	{
		id: 'sunday-alpha-protocol',
		badge: 'MULTI-DAY SWING · WORKING PROFESSIONALS',
		name: 'Sunday Alpha Protocol',
		cadence: 'Every Sunday 5:00 PM ET Video Briefing + Mid-Week Execution Updates',
		bestFor:
			'Full-time career professionals (9-to-5 schedules) who want institutional multi-day equity, ETF, and options blueprints prepared before Monday’s opening bell.',
		instruments: 'Liquid S&P 500 Large-Caps, GICS Sector ETFs & Multi-Week Options Structures',
		summary:
			'Start every trading week with top-down Monthly-to-Daily market structure already mapped. Sunday Alpha Protocol walks you through macro regime posture, sector rotation leaders/laggards, and pre-planned conditional swing setups you can stage via limit/alert orders without watching 1-minute ticks at work.',
		deliverables: [
			'Sunday 5:00 PM ET HD video chart walkthrough covering SPX, QQQ, IWM & sector rotation',
			'Conditional multi-day entry zones, scaling targets, and binary invalidation stops',
			'Options expiration & delta structuring to insulate swing trades from overnight theta decay',
			'Mid-week structural status updates as targets hit or levels invalidate'
		],
		href: '/alert-services/sunday-alpha-protocol',
		ctaLabel: 'Explore Sunday Alpha Protocol'
	}
] as const;

export const ALERT_BLUEPRINT_ANATOMY = [
	{
		step: '01',
		title: 'Higher-Timeframe Structural Location',
		detail:
			'Monthly, weekly, daily, and 4-hour supply/demand inflection zone identified on a clean, 100% indicator-free chart.'
	},
	{
		step: '02',
		title: 'Conditional Trigger Confirmation',
		detail:
			'Exact price behavior required inside the zone before entry — never blind limit-order guessing into a falling knife.'
	},
	{
		step: '03',
		title: 'Engineered Options Contract Spec',
		detail:
			'Specific expiration, strike, and single-leg vs. vertical spread structure matched to implied volatility and account size.'
	},
	{
		step: '04',
		title: 'Tiered Scaling Targets (T1 / T2 / Runner)',
		detail:
			'Pre-mapped structural opposing liquidity levels to lock in partial gains systematically and protect capital.'
	},
	{
		step: '05',
		title: 'Binary Hard Invalidation Stop',
		detail:
			'Exact underlying index or share price that proves the thesis wrong — exited mechanically and logged win or stop-out.'
	}
] as const;

export const ALERTS_VS_ROOMS_ROWS = [
	{
		criterion: 'Daily Time Commitment',
		standaloneAlerts: '15–30 minutes/day reviewing pre-planned levels & staging conditional orders',
		liveTradingRooms:
			'1–6.5 hours/day watching live voice & screen-share execution (9:30 AM – 4:00 PM ET)'
	},
	{
		criterion: 'Core Methodology',
		standaloneAlerts: '100% Indicator-Free Price Action (The Move Prior to The Move™)',
		liveTradingRooms: '100% Indicator-Free Price Action (The Move Prior to The Move™)'
	},
	{
		criterion: 'Live Voice & Q&A Coaching',
		standaloneAlerts: 'Recorded HD video watchlists + written pre-trade dispatches',
		liveTradingRooms: 'Real-time live microphone commentary, screen sharing & intraday Q&A'
	},
	{
		criterion: 'Best Schedule Fit',
		standaloneAlerts: 'Busy executives, 9-to-5 professionals, and self-directed SPX traders',
		liveTradingRooms:
			'Active morning-bell traders and developing traders building tape-reading reps'
	}
] as const;
