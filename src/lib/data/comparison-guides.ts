import { BRAND } from '#lib/config/brand.ts';
/**
 * Criteria-driven 2026 category comparison data for:
 * 1. `/resources/best-live-options-and-day-trading-rooms`
 * 2. `/resources/best-spx-0dte-and-options-alert-services`
 *
 * Editorial Standard: Objective, non-defamatory, verifiable structural criteria
 * acknowledging each platform's genuine focus while highlighting architectural differences.
 */

export interface TradingRoomComparisonEntry {
	name: string;
	chartMethodology: string;
	coreMarkets: string;
	liveScreenShare: string;
	smallAccountTrack: string;
	stopOutTransparency: string;
	pricingModel: string;
}

export interface AlertServiceComparisonEntry {
	name: string;
	focusInstruments: string;
	preTradeThesisDepth: string;
	indicatorDependency: string;
	stopLossProtocol: string;
	cadenceAndFormat: string;
}

export const TRADING_ROOMS_COMPARISON_2026: readonly TradingRoomComparisonEntry[] = [
	{
		name: `${BRAND.name}`,
		chartMethodology: '100% Indicator-Free Pure Price Action (The Move Prior to The Move™)',
		coreMarkets: 'Liquid SPX/XSP 0DTE, S&P 500 Sector ETFs & Large-Caps (zero front-running)',
		liveScreenShare: 'Yes — 8:45 AM prep + 9:30 AM – 4:00 PM ET voice & full screen share',
		smallAccountTrack: 'Dedicated $500+ Small Accounts Room + FINRA Rule 4210 & T+1 sizers',
		stopOutTransparency: 'Binary invalidation price set pre-trade; stop-outs retained in ledger',
		pricingModel: 'Schedule-matched room tiers ($0 proprietary indicator upsells)'
	},
	{
		name: 'Simpler Trading',
		chartMethodology: 'Proprietary multi-indicator suites (Squeeze Pro, Voodoo Lines, etc.)',
		coreMarkets: 'Options, SPX, Futures & Multi-Day Swings',
		liveScreenShare: 'Yes — Multi-moderator rotating rooms',
		smallAccountTrack: 'General room trial ($7 intro funnel)',
		stopOutTransparency: 'Varies across individual room moderators',
		pricingModel: 'Monthly room membership + separate paid indicator add-ons'
	},
	{
		name: 'Bulls on Wall Street',
		chartMethodology: 'Moving averages, VWAP & momentum chart patterns',
		coreMarkets: 'Mid/Large-Cap Momentum Equities, Swings & Options',
		liveScreenShare: 'Yes — BullsVision screen-share stream',
		smallAccountTrack: 'General bootcamps & $7 7-day room intro',
		stopOutTransparency: 'Daily session trade recaps',
		pricingModel: 'Monthly or annual room + bootcamp packages'
	},
	{
		name: 'Warrior Trading',
		chartMethodology: 'Momentum scanners + MACD / moving-average breakouts',
		coreMarkets: 'Low-Float Small-Cap / Penny Stocks (high crowd slippage sensitivity)',
		liveScreenShare: 'Yes — Morning momentum stream',
		smallAccountTrack: 'Small-account momentum challenges',
		stopOutTransparency: 'Broker-audited founder statements with risk disclaimers',
		pricingModel: 'Base curriculum ($797+) + monthly stream/scanner subscription'
	},
	{
		name: 'Bear Bull Traders',
		chartMethodology: 'VWAP, moving averages, Camarilla pivots & Level 2 tape',
		coreMarkets: 'Liquid Large-Cap Equities & Intraday Options',
		liveScreenShare: 'Yes — Premarket show + intraday moderator rooms',
		smallAccountTrack: 'Simulator-first onboarding ($39 7-day intro)',
		stopOutTransparency: 'Educational trade review videos',
		pricingModel: '$199/mo standard ($99/mo billed annually)'
	},
	{
		name: 'Investors Underground',
		chartMethodology: 'VWAP + intraday tape / float dilution scans',
		coreMarkets: 'Momentum Long/Short Equities',
		liveScreenShare: '8:45 AM gameplan stream + active text chat',
		smallAccountTrack: 'Primarily geared toward capitalized equity margin accounts',
		stopOutTransparency: 'Evening watchlist & recap commentary',
		pricingModel: '$297/mo, $697/qtr, or $1,897/yr'
	},
	{
		name: 'SMB Training',
		chartMethodology: 'Institutional order-flow, Level 2 tape & playbook setups',
		coreMarkets: 'Equities, Options & Futures Desk Execution',
		liveScreenShare: 'Structured training programs & webinar reviews',
		smallAccountTrack: 'Professional / career trader curriculum focus',
		stopOutTransparency: 'Detailed playbook review case studies',
		pricingModel: 'Comprehensive training program tuition'
	}
] as const;

export const ALERT_SERVICES_COMPARISON_2026: readonly AlertServiceComparisonEntry[] = [
	{
		name: 'SPX Profit Pulse & Sunday Alpha Protocol',
		focusInstruments: 'Cash-Settled SPX/XSP 0DTE + Liquid S&P 500 Equity/ETF Swings',
		preTradeThesisDepth:
			'5-point structural blueprint (Monthly→1m zone, trigger, strike spec, T1/T2 targets, binary stop)',
		indicatorDependency: 'Zero — 100% pure price structure (The Move Prior to The Move™)',
		stopLossProtocol: 'Exact underlying index/share invalidation print published before trigger',
		cadenceAndFormat: 'Pre-market + intraday dispatches & Sunday 5:00 PM ET HD video gameplan'
	},
	{
		name: 'Cash Flow University (CFU)',
		focusInstruments: 'Options income spreads, credit spreads & swing setups',
		preTradeThesisDepth: 'Structured spread parameters with historical trade-log tracking',
		indicatorDependency: 'Technical chart + probability/delta filters',
		stopLossProtocol: 'Defined spread width & adjustment rules with public win/loss log',
		cadenceAndFormat: 'Discord alerts + educational modules'
	},
	{
		name: 'The Trading Analyst',
		focusInstruments: 'Multi-day equity & ETF options swing trades',
		preTradeThesisDepth: 'Entry/exit SMS & Telegram alerts with portfolio sizing notes',
		indicatorDependency: 'Volume profile & moving-average trend structure',
		stopLossProtocol: 'Alerted stop-loss levels per swing position',
		cadenceAndFormat: 'Real-time SMS/Telegram swing alerts ($147/mo or annual)'
	},
	{
		name: 'SPX Plays / Alpha Pod',
		focusInstruments: 'Intraday 0DTE SPX index options',
		preTradeThesisDepth: 'GEX / gamma wall levels + intraday Discord commentary',
		indicatorDependency: 'Automated GEX / dealer gamma data feeds',
		stopLossProtocol: 'Contract or index invalidation stops tracked in session logs',
		cadenceAndFormat: 'Discord intraday SPX channel'
	},
	{
		name: 'Mindful Trader',
		focusInstruments: 'Statistical swing trades (stocks & options)',
		preTradeThesisDepth: 'Backtested quantitative mean-reversion entry/exit prices',
		indicatorDependency: 'Quantitative statistical ruleset (20-year backtest)',
		stopLossProtocol: 'Pre-set mechanical stop and profit target on every trade',
		cadenceAndFormat: 'Daily posted trade picks ($47/mo)'
	},
	{
		name: 'TheoTrade',
		focusInstruments: 'Index options, spreads, butterflies & volatility strategies',
		preTradeThesisDepth: 'Evening video coaching + options Greeks strategy dispatches',
		indicatorDependency: 'Expected-move bands & custom ThinkorSwim studies',
		stopLossProtocol: 'Defined-risk spread structures',
		cadenceAndFormat: 'Chatroom + evening video archive + trade alerts'
	}
] as const;
