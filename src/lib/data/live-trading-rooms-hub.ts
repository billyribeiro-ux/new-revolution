export type RoomRouteHref =
	| '/live-trading-rooms/day-trading-room'
	| '/live-trading-rooms/swing-trading-room'
	| '/live-trading-rooms/small-accounts-room';

export type EcosystemRouteHref =
	| '/alert-services/spx-profit-pulse'
	| '/alert-services/sunday-alpha-protocol'
	| '/mentorship';

export interface LiveTradingRoomSpec {
	readonly label: string;
	readonly value: string;
}

export interface LiveTradingRoomBullet {
	readonly lead: string;
	readonly body: string;
}

export interface LiveTradingRoomCard {
	readonly id: 'day-trading-room' | 'swing-trading-room' | 'small-accounts-room';
	readonly indexLabel: string;
	readonly tag: string;
	readonly title: string;
	readonly summary: string;
	readonly href: RoomRouteHref;
	readonly schemaName: string;
	readonly schemaDescription: string;
	readonly specs: readonly LiveTradingRoomSpec[];
	readonly bullets: readonly LiveTradingRoomBullet[];
	readonly ctaLabel: string;
}

export interface DeskProtocolStep {
	readonly number: string;
	readonly title: string;
	readonly description: string;
}

export interface ThreeRoomMatrixRow {
	readonly dimension: string;
	readonly dayRoom: string;
	readonly swingRoom: string;
	readonly smallRoom: string;
}

export type ScheduleAvailability = 'morning-bell' | 'nine-to-five' | 'flexible';
export type AccountSizeBracket = 'under-2500' | '2500-to-25k' | 'over-25k';

export interface MatcherChoice<T extends string> {
	readonly id: T;
	readonly label: string;
	readonly sublabel: string;
}

export interface RoomMatchRecommendation {
	readonly primaryRoomId: LiveTradingRoomCard['id'];
	readonly primaryTitle: string;
	readonly primaryBadge: string;
	readonly primaryCtaLabel: string;
	readonly primaryHref: RoomRouteHref;
	readonly rationale: string;
	readonly riskNote: string;
	readonly secondaryLabel: string;
	readonly secondaryTitle: string;
	readonly secondaryHref: RoomRouteHref | EcosystemRouteHref;
}

export interface EcosystemBridgeCard {
	readonly indexLabel: string;
	readonly tag: string;
	readonly featured?: boolean;
	readonly title: string;
	readonly copy: string;
	readonly ctaLabel: string;
	readonly href: EcosystemRouteHref;
}

export const LIVE_TRADING_ROOMS_CARDS: readonly LiveTradingRoomCard[] = [
	{
		id: 'day-trading-room',
		indexLabel: 'ROOM 01',
		tag: 'OPENING BELL · INTRADAY',
		title: 'Live Day Trading Room',
		summary:
			'Structured morning preparation, live voice commentary, and real-time screen sharing for traders active around the 9:30 AM ET opening bell.',
		href: '/live-trading-rooms/day-trading-room',
		schemaName: 'Live Day Trading Room',
		schemaDescription:
			'Intraday stock, ETF, and options trading room featuring pre-market preparation, live voice commentary, screen sharing, and pre-defined invalidation stops.',
		specs: [
			{ label: 'Session Cadence', value: 'Pre-Market Prep + 9:30 AM ET Opening Drive' },
			{ label: 'Hold Horizon', value: 'Intraday Execution (Minutes to Hours)' },
			{ label: 'Account Structure', value: 'FINRA Intraday Margin, T+1 Cash, or Canadian Margin' }
		],
		bullets: [
			{
				lead: 'Pre-market level mapping:',
				body: 'Key equity, index ETF, and liquidity zones prepared before the 9:30 AM ET bell.'
			},
			{
				lead: 'Live voice & screen share:',
				body: 'Real-time order-flow commentary across liquid large-cap stocks, ETFs, and options.'
			},
			{
				lead: 'Pre-stated risk parameters:',
				body: 'Entry zones, scale-out targets, and invalidation levels defined prior to execution.'
			},
			{
				lead: 'Archived session recaps:',
				body: 'Recorded briefings and post-session reviews covering both winning trades and stop-outs.'
			}
		],
		ctaLabel: 'View Day Trading Room'
	},
	{
		id: 'swing-trading-room',
		indexLabel: 'ROOM 02',
		tag: '9-TO-5 SCHEDULE · MULTI-DAY',
		title: 'Live Swing Trading Room',
		summary:
			'Multi-day stock, ETF, and options setups planned during Sunday and evening reviews so working professionals can stage conditional orders outside market hours.',
		href: '/live-trading-rooms/swing-trading-room',
		schemaName: 'Live Swing Trading Room',
		schemaDescription:
			'Multi-day stock, ETF, and options swing trading room structured for working professionals with evening chart reviews and pre-planned conditional order coordinates.',
		specs: [
			{ label: 'Session Cadence', value: 'Sunday Macro Brief + Evening Reviews (15–20 Min)' },
			{ label: 'Hold Horizon', value: 'Multi-Day Structure (3 to 15+ Trading Days)' },
			{ label: 'Account Structure', value: 'Cash, Margin, or Eligible Registered Accounts' }
		],
		bullets: [
			{
				lead: 'Outside-hours preparation:',
				body: 'Sunday macro and evening sector-rotation reviews built around full-time careers.'
			},
			{
				lead: 'Conditional order levels:',
				body: 'Planned entry zones, targets, and structural stops suitable for desktop or mobile orders.'
			},
			{
				lead: 'Theta-aware structuring:',
				body: '21–60 DTE contract selection and vertical or diagonal spreads to manage time decay.'
			},
			{
				lead: 'On-demand replay library:',
				body: 'Full video archives and Q&A accessible across all US and Canadian time zones.'
			}
		],
		ctaLabel: 'View Swing Trading Room'
	},
	{
		id: 'small-accounts-room',
		indexLabel: 'ROOM 03',
		tag: '$500+ ACCOUNTS · SIZING FIRST',
		title: 'Small Accounts Room ($500+)',
		summary:
			'Dedicated risk-first room for $500 to $5,000+ balances focused on contract cost ceilings, T+1 settled-cash rotation, intraday margin cushions, and capped-risk spreads.',
		href: '/live-trading-rooms/small-accounts-room',
		schemaName: 'Small Accounts Trading Room ($500+)',
		schemaDescription:
			'Dedicated small-account stock and options trading room focused on contract affordability ceilings, T+1 settled-cash rotation, intraday margin discipline, and drawdown control.',
		specs: [
			{ label: 'Session Cadence', value: 'Selective Morning Setups + Planned 2–5 Day Swings' },
			{ label: 'Hold Horizon', value: 'Intraday Defined-Risk & Multi-Day Swings' },
			{ label: 'Account Structure', value: '$500+ T+1 Cash & $2,000+ Intraday Margin' }
		],
		bullets: [
			{
				lead: 'Contract cost ceilings:',
				body: 'Strict dollar-per-contract filters so single positions never over-concentrate capital.'
			},
			{
				lead: 'Settlement & margin rules:',
				body: 'T+1 settled-cash rotation (avoiding Good Faith Violations) and FINRA Rule 4210 intraday margin discipline.'
			},
			{
				lead: 'Defined-risk spreads:',
				body: 'Vertical debit and credit spread structures designed to cap maximum dollar exposure.'
			},
			{
				lead: 'Drawdown-first progression:',
				body: 'Structured position-sizing rules focused on capital preservation before scaling size.'
			}
		],
		ctaLabel: 'View Small Accounts Room'
	}
] as const;

export const DESK_PROTOCOL_STEPS: readonly DeskProtocolStep[] = [
	{
		number: '01',
		title: 'Pre-Session Level & Catalyst Preparation',
		description:
			'Key support, resistance, liquidity zones, and scheduled economic or earnings catalysts are mapped prior to execution so decisions follow a prepared plan.'
	},
	{
		number: '02',
		title: 'Stated Entry, Target & Invalidation Parameters',
		description:
			'Every trade discussion outlines the trigger zone, scale-out targets, and structural invalidation stop on liquid US large-cap equities, index ETFs, and options.'
	},
	{
		number: '03',
		title: 'Recorded Session Archive & Post-Trade Review',
		description:
			'Sessions, written level recaps, and post-session reviews covering both winning executions and stop-outs are archived on demand for members across North America.'
	}
] as const;

export const THREE_ROOM_MATRIX_ROWS: readonly ThreeRoomMatrixRow[] = [
	{
		dimension: 'Primary Trader Profile',
		dayRoom: 'Active morning participants able to follow the 9:30 AM ET opening window',
		swingRoom: 'Full-time 9-to-5 professionals and multi-day trend participants',
		smallRoom: 'Traders managing $500–$5,000+ balances prioritizing percentage drawdown control'
	},
	{
		dimension: 'Daily Time Commitment',
		dayRoom:
			'Pre-market preparation + 9:30–11:30 AM ET opening session (optional afternoon review)',
		swingRoom: '15–20 minutes in the evening or pre-market using conditional limit and stop orders',
		smallRoom: '1–2 selective morning setups or pre-planned 2–5 day defined-risk swing structures'
	},
	{
		dimension: 'Typical Hold Horizon',
		dayRoom: 'Intraday (minutes to hours; flat or reduced prior to the 4:00 PM ET close)',
		swingRoom: '3 to 15+ trading days across multi-day institutional accumulation or distribution',
		smallRoom: 'Same-day defined-risk trades or 2–5 day swings sized to strict dollar risk limits'
	},
	{
		dimension: 'Settlement & Margin Structure',
		dayRoom:
			'FINRA Rule 4210 real-time intraday margin ($2,000+ margin baseline), T+1 Cash, or Canadian margin',
		swingRoom:
			'Compatible with Cash, Margin, and eligible retirement or registered accounts across multi-day holds',
		smallRoom:
			'Sub-$2,000 T+1 Cash Account partitioning (avoiding GFVs) and $2,000+ intraday margin cushion discipline'
	},
	{
		dimension: 'Instruments & Options Structure',
		dayRoom: 'Liquid large-cap equities, SPY/QQQ/IWM ETFs, intraday calls, puts, and spreads',
		swingRoom:
			'Equities, sector ETFs, 21–60 DTE options, and Theta-managed vertical/diagonal spreads',
		smallRoom: 'Liquid, affordable options contracts and capped-risk vertical debit/credit spreads'
	},
	{
		dimension: 'Primary Risk Guardrail',
		dayRoom: 'Pre-stated structural invalidation stop + midday overtrading discipline',
		swingRoom: 'Daily/weekly invalidation levels + sector correlation and overnight gap sizing',
		smallRoom: 'Per-contract cost ceiling + 30%–50% daily settled-cash or margin cushion cap'
	},
	{
		dimension: 'Session & Archive Format',
		dayRoom: 'Live voice commentary, screen sharing, written level sheets, and session replays',
		swingRoom: 'Evening video chart briefings, written order coordinates, updates, and Q&A archive',
		smallRoom: 'Guided position-sizing walkthroughs, live and swing breakdowns, and replay archive'
	}
] as const;

export const SCHEDULE_CHOICES: readonly MatcherChoice<ScheduleAvailability>[] = [
	{
		id: 'morning-bell',
		label: '9:30 AM Opening Bell',
		sublabel: 'Available live mornings (ET)'
	},
	{
		id: 'nine-to-five',
		label: '9-to-5 / Evening Prep',
		sublabel: 'Planning outside work hours'
	},
	{
		id: 'flexible',
		label: 'Flexible / Replays',
		sublabel: 'Hybrid schedule & recordings'
	}
] as const;

export const CAPITAL_CHOICES: readonly MatcherChoice<AccountSizeBracket>[] = [
	{
		id: 'under-2500',
		label: '$500 – $2,500',
		sublabel: 'T+1 cash / small balance'
	},
	{
		id: '2500-to-25k',
		label: '$2,500 – $25,000',
		sublabel: 'Intraday margin / growing size'
	},
	{
		id: 'over-25k',
		label: '$25,000+',
		sublabel: 'Established portfolio capital'
	}
] as const;

export function resolveRoomRecommendation(
	schedule: ScheduleAvailability,
	capital: AccountSizeBracket
): RoomMatchRecommendation {
	if (capital === 'under-2500') {
		return {
			primaryRoomId: 'small-accounts-room',
			primaryTitle: 'Small Accounts Room ($500+)',
			primaryBadge: 'Matched · Capital-Preservation Fit',
			primaryCtaLabel: 'View Small Accounts Room',
			primaryHref: '/live-trading-rooms/small-accounts-room',
			rationale:
				schedule === 'nine-to-five'
					? 'With a $500–$2,500 balance and a daytime work schedule, contract cost ceilings and 2–5 day defined-risk vertical spreads take priority alongside archived evening reviews.'
					: 'On a $500–$2,500 balance, contract cost and drawdown math govern longevity. Focuses on T+1 settled-cash rotation, affordable liquid contracts, and capped-risk spreads.',
			riskNote:
				'Educational fit guide, not investment advice. Smaller balances face magnified percentage drawdowns if oversized.',
			secondaryLabel: 'Watchlist Alternative',
			secondaryTitle: 'Sunday Alpha Protocol',
			secondaryHref: '/alert-services/sunday-alpha-protocol'
		};
	}

	if (schedule === 'nine-to-five') {
		return {
			primaryRoomId: 'swing-trading-room',
			primaryTitle: 'Live Swing Trading Room',
			primaryBadge: 'Matched · 9-to-5 Schedule Fit',
			primaryCtaLabel: 'View Swing Trading Room',
			primaryHref: '/live-trading-rooms/swing-trading-room',
			rationale:
				capital === '2500-to-25k'
					? 'A full-time work schedule paired with $2,500–$25,000 capital aligns with multi-day swings: Sunday and evening reviews support staging conditional orders outside market hours.'
					: 'With $25,000+ capital and limited daytime screen time, Sunday and evening reviews support methodical multi-day equity and Theta-managed options allocation in 15–20 minutes.',
			riskNote:
				'Educational fit guide, not investment advice. Multi-day equity and options positions carry overnight gap risk.',
			secondaryLabel: 'Watchlist Alternative',
			secondaryTitle: 'Sunday Alpha Protocol',
			secondaryHref: '/alert-services/sunday-alpha-protocol'
		};
	}

	if (schedule === 'morning-bell' && capital === 'over-25k') {
		return {
			primaryRoomId: 'day-trading-room',
			primaryTitle: 'Live Day Trading Room',
			primaryBadge: 'Matched · Opening-Bell Intraday Fit',
			primaryCtaLabel: 'View Day Trading Room',
			primaryHref: '/live-trading-rooms/day-trading-room',
			rationale:
				'With morning market availability and $25,000+ capital, the Live Day Trading Room provides pre-market preparation, live voice commentary, and screen sharing at the 9:30 AM ET bell.',
			riskNote:
				'Educational fit guide, not investment advice. Intraday equities and options move rapidly and require strict stops.',
			secondaryLabel: 'Index Companion',
			secondaryTitle: 'SPX Profit Pulse',
			secondaryHref: '/alert-services/spx-profit-pulse'
		};
	}

	if (schedule === 'morning-bell' && capital === '2500-to-25k') {
		return {
			primaryRoomId: 'day-trading-room',
			primaryTitle: 'Live Day Trading Room',
			primaryBadge: 'Matched · Opening Bell + Margin Fit',
			primaryCtaLabel: 'View Day Trading Room',
			primaryHref: '/live-trading-rooms/day-trading-room',
			rationale:
				'Under FINRA Rule 4210 intraday margin rules, accounts above the $2,000 margin baseline can trade the 9:30 AM ET session when real-time margin cushions and sizing are respected.',
			riskNote:
				'Educational fit guide, not investment advice. Intraday margin rules vary by broker; compare Small Accounts sizing.',
			secondaryLabel: 'Compare Sizing Rules',
			secondaryTitle: 'Small Accounts Room ($500+)',
			secondaryHref: '/live-trading-rooms/small-accounts-room'
		};
	}

	return {
		primaryRoomId: 'swing-trading-room',
		primaryTitle: 'Live Swing Trading Room',
		primaryBadge: 'Matched · Flexible Multi-Day Fit',
		primaryCtaLabel: 'View Swing Trading Room',
		primaryHref: '/live-trading-rooms/swing-trading-room',
		rationale:
			'When market availability shifts week to week, multi-day swing setups give a wider window to review archived chart briefings and enter conditional orders without chasing intraday moves.',
		riskNote:
			'Educational fit guide, not investment advice. Always size multi-day positions for potential overnight gap risk.',
		secondaryLabel: 'Live Morning Option',
		secondaryTitle: 'Live Day Trading Room',
		secondaryHref: '/live-trading-rooms/day-trading-room'
	};
}

export const UNIQUE_ROOM_RECOMMENDATIONS: readonly RoomMatchRecommendation[] = Array.from(
	new Map(
		SCHEDULE_CHOICES.flatMap((schedule) =>
			CAPITAL_CHOICES.map((capital) => resolveRoomRecommendation(schedule.id, capital.id))
		).map((rec) => [`${rec.primaryBadge}|${rec.rationale}`, rec])
	).values()
);

export const ECOSYSTEM_BRIDGE_CARDS: readonly EcosystemBridgeCard[] = [
	{
		indexLabel: 'ALERT FORMAT 01',
		tag: 'INDEX OPTIONS WATCHLIST',
		title: 'SPX Profit Pulse',
		copy: 'Structured S&P 500 index options video watchlists and institutional gamma-level scenarios for self-directed traders who do not need an interactive live room.',
		ctaLabel: 'View SPX Profit Pulse',
		href: '/alert-services/spx-profit-pulse'
	},
	{
		indexLabel: 'ALERT FORMAT 02',
		tag: 'WEEKEND & MID-WEEK BRIEFINGS',
		featured: true,
		title: 'Sunday Alpha Protocol',
		copy: 'Prepared Sunday and mid-week video watchlists detailing multi-day stock and options entry zones, profit targets, and invalidation levels outside market hours.',
		ctaLabel: 'View Sunday Alpha Protocol',
		href: '/alert-services/sunday-alpha-protocol'
	},
	{
		indexLabel: 'APPLICATION ONLY',
		tag: '1-ON-1 DESK COACHING',
		title: 'Private 1-on-1 Mentorship',
		copy: 'Individualized trade review, risk-management diagnostics, and structured 1-on-1 coaching offered strictly by application and mutual fit.',
		ctaLabel: 'Review Mentorship Criteria',
		href: '/mentorship'
	}
] as const;
