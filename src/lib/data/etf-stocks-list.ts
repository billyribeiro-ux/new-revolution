/**
 * Static content for /resources/etf-stocks-list.
 * Lives outside the component so it is created once per module (not once per page instance) and so the
 * Schema.org @graph in `#lib/seo/structured-data.ts` can derive from the same source (no drift).
 * The FAQ copy is owned by `ETF_STOCKS_LIST_FAQ_ITEMS` in structured-data.ts (JSON-LD parity, AGENTS.md §3.3).
 */

export type EtfFilterCategory =
	'all' | 'index-core' | 'small-account-options' | 'global-macro' | 'income-defensive';

export interface FeaturedETF {
	symbol: string;
	exchange: 'AMEX' | 'NASDAQ';
	name: string;
	category: EtfFilterCategory;
	categoryLabel: string;
	optionsTier: string;
	smallAccountFit: boolean;
	description: string;
	institutionalNote: string;
	features: string[];
}

export interface SectorETFGroup {
	code: string;
	sector: string;
	symbol: string;
	weightNote: string;
	rotationRole: string;
	etfs: { ticker: string; exchange: 'AMEX' | 'NASDAQ'; label: string }[];
}

export interface EtfBenefit {
	num: string;
	title: string;
	description: string;
}

export interface EtfTypeItem {
	code: string;
	type: string;
	examples: string;
	description: string;
}

export interface ComparisonRow {
	feature: string;
	etf: string;
	mutualFund: string;
	etfBetter: boolean | null;
}

export interface RoomCta {
	badge: string;
	title: string;
	description: string;
	ctaLabel: string;
	href: string;
}

/* ===========================================================================
     12 FEATURED ETFS (WITH OPTIONS LIQUIDITY & INSTITUTIONAL TELEMETRY)
     =========================================================================== */
export const featuredETFs: FeaturedETF[] = [
	{
		symbol: 'SPY',
		exchange: 'AMEX',
		name: 'SPDR S&P 500 ETF Trust',
		category: 'index-core',
		categoryLabel: 'Core US Index',
		optionsTier: '0DTE, Daily & Weekly Options • Penny-Wide Spreads',
		smallAccountFit: true,
		description:
			'One of the oldest and most heavily traded ETFs in the world, designed to track the S&P 500 Index across 500 of the largest publicly traded U.S. companies.',
		institutionalNote:
			'The #1 ETF for intraday liquidity sweeps, defined-risk vertical spreads in $500+ small accounts, and tracking institutional dealer gamma.',
		features: ['Deepest Options Liquidity', 'Broad S&P 500 Exposure', '0DTE & Daily Expirations']
	},
	{
		symbol: 'QQQ',
		exchange: 'NASDAQ',
		name: 'Invesco QQQ Trust (Nasdaq-100)',
		category: 'index-core',
		categoryLabel: 'Tech & Growth Index',
		optionsTier: '0DTE, Daily & Weekly Options • High Beta Velocity',
		smallAccountFit: true,
		description:
			'Tracks the performance of the Nasdaq-100 Index, comprising 100 of the largest domestic and international non-financial companies listed on the Nasdaq Stock Market.',
		institutionalNote:
			'Higher intraday volatility (ATR) and implied volatility (Vega) than SPY—ideal for opening-bell momentum scalps and multi-day tech swings.',
		features: ['Technology & AI Leaders', 'High Intraday ATR', '0DTE & Weekly Options']
	},
	{
		symbol: 'VTI',
		exchange: 'AMEX',
		name: 'Vanguard Total Stock Market ETF',
		category: 'index-core',
		categoryLabel: 'Total US Market',
		optionsTier: 'Monthly & Quarterly Options • Core Portfolio Anchor',
		smallAccountFit: false,
		description:
			'Tracks the CRSP US Total Market Index, providing comprehensive exposure to the entire U.S. equity market—including micro-, small-, mid-, and large-cap stocks.',
		institutionalNote:
			'Used by long-term capital allocators and portfolio managers as a low-cost core benchmark alongside active tactical options overlays.',
		features: ['Complete US Coverage', 'Ultra-Low Expense Ratio', 'Institutional Benchmark']
	},
	{
		symbol: 'IWM',
		exchange: 'AMEX',
		name: 'iShares Russell 2000 ETF',
		category: 'small-account-options',
		categoryLabel: 'US Small-Cap Index',
		optionsTier: '0DTE, Daily & Weekly Options • Affordable Premiums',
		smallAccountFit: true,
		description:
			'Tracks the Russell 2000 Index, measuring the performance of 2,000 small-capitalization U.S. companies sensitive to domestic growth and interest-rate cycles.',
		institutionalNote:
			'Lower share price and cheaper option contract premiums than SPY/QQQ—making IWM a favorite vehicle inside our $500+ Small Accounts Room.',
		features: ['Small-Cap Rotation Gauge', '$500+ Account Friendly', 'Tight Options Spreads']
	},
	{
		symbol: 'EEM',
		exchange: 'AMEX',
		name: 'iShares MSCI Emerging Markets ETF',
		category: 'global-macro',
		categoryLabel: 'Emerging Markets',
		optionsTier: 'Weekly & Monthly Options • Low Share Price',
		smallAccountFit: true,
		description:
			'Seeks to track the MSCI Emerging Markets Index, offering liquid exposure to large- and mid-cap equities across China, Taiwan, India, South Korea, and Brazil.',
		institutionalNote:
			'Prime vehicle for capturing global dollar-cycle inflections and multi-week macro swings with very low per-contract option cost.',
		features: ['Global Growth Exposure', 'Low Contract Cost', 'Geographic Diversification']
	},
	{
		symbol: 'VEA',
		exchange: 'AMEX',
		name: 'Vanguard FTSE Developed Markets ETF',
		category: 'global-macro',
		categoryLabel: 'Developed Ex-US',
		optionsTier: 'Monthly Options • International Core',
		smallAccountFit: true,
		description:
			'Tracks the FTSE Developed All Cap ex US Index, providing broad exposure to developed equity markets outside the United States, including Europe, Japan, and Canada.',
		institutionalNote:
			'Allows US and Canadian traders to monitor international capital flows and currency-hedged relative strength.',
		features: ['Europe, Japan & Canada', 'Low Expense Ratio', 'Developed Markets']
	},
	{
		symbol: 'AGG',
		exchange: 'AMEX',
		name: 'iShares Core U.S. Aggregate Bond ETF',
		category: 'income-defensive',
		categoryLabel: 'Fixed Income & Rates',
		optionsTier: 'Monthly Options • Treasury & Rate Telemetry',
		smallAccountFit: false,
		description:
			'Tracks the Bloomberg U.S. Aggregate Bond Index, providing broad exposure to U.S. investment-grade Treasury, mortgage-backed, and corporate bonds.',
		institutionalNote:
			'Watching bond ETFs alongside equities reveals institutional "flight-to-safety" rotation during FOMC and CPI volatility regimes.',
		features: ['Fixed Income Benchmark', 'Yield & Rate Gauge', 'Low Volatility']
	},
	{
		symbol: 'VIG',
		exchange: 'NASDAQ',
		name: 'Vanguard Dividend Appreciation ETF',
		category: 'income-defensive',
		categoryLabel: 'Dividend Growth',
		optionsTier: 'Monthly Options • Defensive Quality',
		smallAccountFit: false,
		description:
			'Focuses on U.S. companies with a verified 10+ year track record of increasing annual regular dividends, tracking the S&P U.S. Dividend Growers Index.',
		institutionalNote:
			'Outperforms during late-cycle defensive rotations when institutional desks reduce high-beta tech exposure.',
		features: ['Compounding Dividends', 'Fortress Balance Sheets', 'Low Expense Ratio']
	},
	{
		symbol: 'GLD',
		exchange: 'AMEX',
		name: 'SPDR Gold Shares',
		category: 'global-macro',
		categoryLabel: 'Hard Asset & Commodity',
		optionsTier: 'Weekly & Monthly Options • High Volatility Skew',
		smallAccountFit: true,
		description:
			'Tracks the spot price of physical gold bullion held in secure vaults, offering traders liquid equity and options exposure to gold without futures contracts.',
		institutionalNote:
			'Exhibits powerful multi-week volatility squeezes during inflation spikes, central-bank accumulation, and geopolitical macro shocks.',
		features: ['Inflation & Crisis Hedge', 'Physical Gold Backed', 'Deep Options Chain']
	},
	{
		symbol: 'ARKK',
		exchange: 'AMEX',
		name: 'ARK Innovation ETF',
		category: 'small-account-options',
		categoryLabel: 'High-Beta Thematic',
		optionsTier: 'Weekly & Monthly Options • High Implied Volatility',
		smallAccountFit: true,
		description:
			'An actively managed thematic ETF focused on disruptive innovation across genomics, autonomous technology, robotics, fintech, and next-generation internet.',
		institutionalNote:
			'Because ARKK holds high-beta speculative growth stocks, it serves as an institutional barometer for retail risk appetite—and a prime short/put candidate during bear distribution.',
		features: ['High Beta Momentum', 'Affordable Share Price', 'Both Long & Short Setups']
	},
	{
		symbol: 'EFA',
		exchange: 'AMEX',
		name: 'iShares MSCI EAFE ETF',
		category: 'global-macro',
		categoryLabel: 'International Large-Cap',
		optionsTier: 'Weekly & Monthly Options • High Institutional Volume',
		smallAccountFit: true,
		description:
			'Tracks the MSCI EAFE Index, covering large- and mid-cap companies across developed markets in Europe, Australasia, and the Far East (excluding the U.S. and Canada).',
		institutionalNote:
			'Features significantly deeper options liquidity than most international funds for executing cross-border macro swings.',
		features: ['Global Blue-Chip Leaders', 'Liquid Options Chain', 'Ex-North America']
	},
	{
		symbol: 'SCHB',
		exchange: 'AMEX',
		name: 'Schwab U.S. Broad Market ETF',
		category: 'small-account-options',
		categoryLabel: 'Broad US Equity',
		optionsTier: 'Monthly Options • Low Share Price',
		smallAccountFit: true,
		description:
			'Tracks the Dow Jones U.S. Broad Stock Market Index, providing exposure to the 2,500 largest publicly traded U.S. companies at an accessible share price.',
		institutionalNote:
			'Offers total-market U.S. equity exposure at a fraction of SPY’s per-share cost—ideal for cash-account share accumulation and covered calls.',
		features: ['2,500+ US Companies', 'Low Per-Share Cost', 'Ultra-Low Expense Ratio']
	}
];

/* ===========================================================================
     ALL 11 OFFICIAL S&P 500 GICS SECTOR ETFS (COMPLETED FROM OLD PAGE'S 9)
     =========================================================================== */
export const etfFilters: { id: EtfFilterCategory; label: string }[] = [
	{ id: 'all', label: `All Popular ETFs (${featuredETFs.length})` },
	{ id: 'small-account-options', label: '$500+ Small Account & Options Friendly' },
	{ id: 'index-core', label: 'Core U.S. Index ETFs' },
	{ id: 'global-macro', label: 'Global Macro & Gold' },
	{ id: 'income-defensive', label: 'Bonds & Dividend Growth' }
];

export const sectorETFs: SectorETFGroup[] = [
	{
		code: 'GICS Sector 01 // Growth & AI Engine',
		sector: 'Technology',
		symbol: 'XLK',
		weightNote: 'Highest S&P 500 Weighting (~30%)',
		rotationRole: 'Leads institutional bull expansions; primary driver of QQQ and SPY momentum.',
		etfs: [
			{ ticker: 'XLK', exchange: 'AMEX', label: 'SPDR Tech' },
			{ ticker: 'VGT', exchange: 'AMEX', label: 'Vanguard Tech' },
			{ ticker: 'SMH', exchange: 'NASDAQ', label: 'VanEck Semiconductors' },
			{ ticker: 'SOXX', exchange: 'NASDAQ', label: 'iShares Semiconductors' },
			{ ticker: 'IGV', exchange: 'AMEX', label: 'iShares Software' }
		]
	},
	{
		code: 'GICS Sector 02 // Defensive & Biotech',
		sector: 'Healthcare',
		symbol: 'XLV',
		weightNote: 'Defensive Growth & Clinical Catalysts',
		rotationRole:
			'Provides defensive institutional shelter in bear regimes while biotech (XBI) offers high-beta swings.',
		etfs: [
			{ ticker: 'XLV', exchange: 'AMEX', label: 'SPDR Healthcare' },
			{ ticker: 'VHT', exchange: 'AMEX', label: 'Vanguard Healthcare' },
			{ ticker: 'XBI', exchange: 'AMEX', label: 'SPDR S&P Biotech' },
			{ ticker: 'IBB', exchange: 'NASDAQ', label: 'iShares Biotech' },
			{ ticker: 'IHF', exchange: 'AMEX', label: 'iShares Providers' }
		]
	},
	{
		code: 'GICS Sector 03 // Banks & Capital Markets',
		sector: 'Financials',
		symbol: 'XLF',
		weightNote: 'Yield Curve & Credit Cycle Barometer',
		rotationRole:
			'Highly liquid, low-cost options chain ($500+ small account favorite) sensitive to Fed policy and bank earnings.',
		etfs: [
			{ ticker: 'XLF', exchange: 'AMEX', label: 'SPDR Financials' },
			{ ticker: 'VFH', exchange: 'AMEX', label: 'Vanguard Financials' },
			{ ticker: 'KRE', exchange: 'AMEX', label: 'SPDR Regional Banks' },
			{ ticker: 'KBE', exchange: 'AMEX', label: 'SPDR S&P Bank' },
			{ ticker: 'IYF', exchange: 'AMEX', label: 'iShares Financials' }
		]
	},
	{
		code: 'GICS Sector 04 // Oil, Gas & Commodities',
		sector: 'Energy',
		symbol: 'XLE',
		weightNote: 'The Sector Behind Our +600% OXY Trade',
		rotationRole:
			'Moves independently of tech—producing massive contrarian distribution and inflation-hedge swings.',
		etfs: [
			{ ticker: 'XLE', exchange: 'AMEX', label: 'SPDR Energy' },
			{ ticker: 'VDE', exchange: 'AMEX', label: 'Vanguard Energy' },
			{ ticker: 'XOP', exchange: 'AMEX', label: 'SPDR Oil & Gas E&P' },
			{ ticker: 'OIH', exchange: 'AMEX', label: 'VanEck Oil Services' },
			{ ticker: 'ICLN', exchange: 'NASDAQ', label: 'iShares Clean Energy' }
		]
	},
	{
		code: 'GICS Sector 05 // Consumer Cyclicals & Retail',
		sector: 'Consumer Discretionary',
		symbol: 'XLY',
		weightNote: 'E-Commerce, Auto & Housing Demand',
		rotationRole:
			'Tracks consumer spending strength alongside homebuilders (ITB/XHB) and retail leaders.',
		etfs: [
			{ ticker: 'XLY', exchange: 'AMEX', label: 'SPDR Discretionary' },
			{ ticker: 'VCR', exchange: 'AMEX', label: 'Vanguard Discretionary' },
			{ ticker: 'ITB', exchange: 'AMEX', label: 'iShares Home Construction' },
			{ ticker: 'XHB', exchange: 'AMEX', label: 'SPDR Homebuilders' },
			{ ticker: 'XRT', exchange: 'AMEX', label: 'SPDR S&P Retail' }
		]
	},
	{
		code: 'GICS Sector 06 // Digital Media & Telecom',
		sector: 'Communication Services',
		symbol: 'XLC',
		weightNote: 'Mega-Cap Search, Social & Streaming',
		rotationRole:
			'Added in GICS modernization—houses high-velocity mega-cap advertising and interactive media leaders.',
		etfs: [
			{ ticker: 'XLC', exchange: 'AMEX', label: 'SPDR Comm Services' },
			{ ticker: 'VOX', exchange: 'AMEX', label: 'Vanguard Comm Services' },
			{ ticker: 'IYZ', exchange: 'AMEX', label: 'iShares Telecom' },
			{ ticker: 'FCOM', exchange: 'AMEX', label: 'Fidelity Comm Services' }
		]
	},
	{
		code: 'GICS Sector 07 // Aerospace, Defense & Infrastructure',
		sector: 'Industrials',
		symbol: 'XLI',
		weightNote: 'Manufacturing, Defense & Transports',
		rotationRole:
			'Confirms broad economic expansion when Industrials and Transports break out alongside the S&P 500.',
		etfs: [
			{ ticker: 'XLI', exchange: 'AMEX', label: 'SPDR Industrials' },
			{ ticker: 'VIS', exchange: 'AMEX', label: 'Vanguard Industrials' },
			{ ticker: 'ITA', exchange: 'AMEX', label: 'iShares Aerospace/Defense' },
			{ ticker: 'XAR', exchange: 'AMEX', label: 'SPDR Aerospace/Defense' },
			{ ticker: 'IYT', exchange: 'AMEX', label: 'iShares Transportation' }
		]
	},
	{
		code: 'GICS Sector 08 // Recession-Resistant Essentials',
		sector: 'Consumer Staples',
		symbol: 'XLP',
		weightNote: 'Institutional Risk-Off Safe Haven',
		rotationRole:
			'When institutional money rotates out of XLK/XLY and into XLP, it warns of macro distribution.',
		etfs: [
			{ ticker: 'XLP', exchange: 'AMEX', label: 'SPDR Consumer Staples' },
			{ ticker: 'VDC', exchange: 'AMEX', label: 'Vanguard Staples' },
			{ ticker: 'IYK', exchange: 'AMEX', label: 'iShares Staples' },
			{ ticker: 'KXI', exchange: 'AMEX', label: 'iShares Global Staples' }
		]
	},
	{
		code: 'GICS Sector 09 // Power Grid & Yield Proxy',
		sector: 'Utilities',
		symbol: 'XLU',
		weightNote: 'Interest-Rate & AI Power-Grid Play',
		rotationRole:
			'Historically a defensive bond proxy, now also traded for AI data-center power grid demand.',
		etfs: [
			{ ticker: 'XLU', exchange: 'AMEX', label: 'SPDR Utilities' },
			{ ticker: 'VPU', exchange: 'AMEX', label: 'Vanguard Utilities' },
			{ ticker: 'IDU', exchange: 'AMEX', label: 'iShares Utilities' }
		]
	},
	{
		code: 'GICS Sector 10 // Metals, Mining & Chemicals',
		sector: 'Materials',
		symbol: 'XLB',
		weightNote: 'Industrial Metals, Gold Miners & Chemicals',
		rotationRole:
			'Tracks global commodity demand, infrastructure buildouts, and precious-metal mining leverage (GDX).',
		etfs: [
			{ ticker: 'XLB', exchange: 'AMEX', label: 'SPDR Materials' },
			{ ticker: 'VAW', exchange: 'AMEX', label: 'Vanguard Materials' },
			{ ticker: 'XME', exchange: 'AMEX', label: 'SPDR Metals & Mining' },
			{ ticker: 'GDX', exchange: 'AMEX', label: 'VanEck Gold Miners' },
			{ ticker: 'COPX', exchange: 'AMEX', label: 'Global X Copper Miners' }
		]
	},
	{
		code: 'GICS Sector 11 // Commercial & Residential REITs',
		sector: 'Real Estate',
		symbol: 'XLRE',
		weightNote: 'High-Sensitivity Rate & Yield Sector',
		rotationRole:
			'Moves sharply on Treasury yield inflections and Federal Reserve rate-cut or rate-hike cycles.',
		etfs: [
			{ ticker: 'XLRE', exchange: 'AMEX', label: 'SPDR Real Estate' },
			{ ticker: 'VNQ', exchange: 'AMEX', label: 'Vanguard Real Estate' },
			{ ticker: 'IYR', exchange: 'AMEX', label: 'iShares U.S. Real Estate' }
		]
	}
];

export const etfBenefits: EtfBenefit[] = [
	{
		num: '01',
		title: 'Instant Basket Diversification (Zero Single-Stock Earnings Shock)',
		description:
			'An ETF holds a basket of dozens or hundreds of companies. If one company suffers an overnight CEO scandal or earnings miss, your ETF position is insulated from single-stock wipeout risk.'
	},
	{
		num: '02',
		title: 'Tradable Intraday Like Stocks + Deep Options Chains',
		description:
			'Unlike mutual funds that only settle after the 4:00 PM ET close, ETFs trade tick-by-tick all day with limit orders, stop-loss orders, and some of the tightest options bid-ask spreads in the world.'
	},
	{
		num: '03',
		title: 'Ultra-Low Expense Ratios',
		description:
			'Because most index and sector ETFs passively track a rules-based benchmark rather than paying an expensive mutual fund manager, annual expense ratios are often as low as 0.03% to 0.10%.'
	},
	{
		num: '04',
		title: 'Daily Holdings & Institutional Flow Transparency',
		description:
			'ETFs publish their exact constituent holdings and weightings daily—allowing our scanners and indicators to track exactly which top-weighted stocks are driving sector rotation.'
	},
	{
		num: '05',
		title: 'Superior Tax Efficiency (In-Kind Creation/Redemption)',
		description:
			'Through institutional in-kind creation and redemption mechanics, ETFs rarely distribute surprise year-end capital gains taxes the way traditional mutual funds do.'
	}
];

export const etfTypes: EtfTypeItem[] = [
	{
		code: 'Type 01',
		type: 'Broad Market & Index Stock ETFs',
		examples: 'SPY, QQQ, IWM, VTI, DIA',
		description:
			'Track flagship equity indexes (S&P 500, Nasdaq-100, Russell 2000), offering the deepest intraday volume and daily/0DTE options chains.'
	},
	{
		code: 'Type 02',
		type: 'Sector & Industry ETFs',
		examples: 'XLK, XLF, XLE, XLV, SMH, XBI',
		description:
			'Isolate the 11 S&P 500 GICS sectors or high-velocity sub-industries (semiconductors, biotech, oil & gas, regional banks) to ride institutional sector rotation.'
	},
	{
		code: 'Type 03',
		type: 'Bond & Fixed-Income ETFs',
		examples: 'AGG, TLT, IEF, HYG, LQD',
		description:
			'Provide liquid stock-exchange access to U.S. Treasuries, investment-grade corporate debt, and high-yield credit—critical for tracking macro interest-rate regimes.'
	},
	{
		code: 'Type 04',
		type: 'Commodity & Hard-Asset ETFs',
		examples: 'GLD, SLV, USO, UNG, DBA',
		description:
			'Track physical gold, silver, crude oil, natural gas, or agriculture without needing a futures brokerage account or taking physical delivery.'
	},
	{
		code: 'Type 05',
		type: 'International & Emerging Market ETFs',
		examples: 'EEM, EFA, VEA, FXI, EWZ',
		description:
			'Deliver instant geographic exposure to European, Asian, and Latin American equity markets directly from a standard U.S. or Canadian brokerage account.'
	}
];

export const comparisonData: ComparisonRow[] = [
	{
		feature: 'Intraday Execution & Order Control',
		etf: 'Traded live tick-by-tick all day with limit, stop-loss, and conditional orders',
		mutualFund: 'Bought or sold only once per day after the 4:00 PM ET market close at NAV',
		etfBetter: true
	},
	{
		feature: 'Options Trading Compatibility',
		etf: 'Full options chains (Calls, Puts, Verticals, 0DTE & Weeklies on major ETFs)',
		mutualFund: 'Zero options chains—impossible to trade calls, puts, or credit spreads',
		etfBetter: true
	},
	{
		feature: 'Minimum Capital Requirement',
		etf: 'Zero fund minimum—buy 1 share or 1 affordable option contract in a $500+ account',
		mutualFund: 'Often enforces $500 to $3,000+ minimum initial investment lockups',
		etfBetter: true
	},
	{
		feature: 'Annual Expense Ratios',
		etf: 'Typically ultra-low (0.03% to 0.20% for core index and sector ETFs)',
		mutualFund: 'Frequently higher (0.50% to 1.25%+) plus potential front/back-end sales loads',
		etfBetter: true
	},
	{
		feature: 'Tax Efficiency',
		etf: 'In-kind creation/redemption structure minimizes taxable capital gains distributions',
		mutualFund: 'Pooled redemptions trigger mandatory year-end taxable capital gains',
		etfBetter: true
	},
	{
		feature: 'Management Style',
		etf: 'Primarily rules-based index tracking (with select active thematic funds)',
		mutualFund: 'Available in both passive index and active manager mandates',
		etfBetter: null
	},
	{
		feature: 'Best Suited For',
		etf: 'Active day traders, 9-to-5 swing traders, options strategists & cost-conscious investors',
		mutualFund:
			'Hands-off 401(k) retirement savers executing automated bi-weekly payroll contributions',
		etfBetter: null
	}
];

export const bottomRoomCards: RoomCta[] = [
	{
		badge: 'Live Intraday Floor',
		title: 'Day Trading Room',
		description:
			'Trade SPY, QQQ, IWM, and high-beta sector ETFs live every morning with voice and screen share.',
		ctaLabel: 'Learn More →',
		href: '/live-trading-rooms/day-trading-room'
	},
	{
		badge: 'Working Professionals',
		title: 'Swing Trading Room',
		description:
			'Capture multi-day institutional sector rotations across XLK, XLE, SMH, and GLD in 20 minutes a day.',
		ctaLabel: 'Learn More →',
		href: '/live-trading-rooms/swing-trading-room'
	},
	{
		badge: '$500+ Starting Capital',
		title: 'Small Accounts Room',
		description:
			'Compound a $500+ account using affordable ETF options contracts and T+1 cash rotation.',
		ctaLabel: 'Learn More →',
		href: '/live-trading-rooms/small-accounts-room'
	},
	{
		badge: '0DTE & Index Options',
		title: 'SPX Profit Pulse Alerts',
		description:
			'High-conviction S&P 500 index options alerts with pre-planned dealer gamma walls.',
		ctaLabel: 'Explore Alerts →',
		href: '/alert-services/spx-profit-pulse'
	},
	{
		badge: 'Video Watchlist Tier',
		title: 'Explosive Swings Alerts',
		description:
			'Affordable alert-only video watchlists with exact ETF & stock entries, exits, and stops.',
		ctaLabel: 'Explore Alerts →',
		href: '/alert-services/explosive-swings'
	}
];
