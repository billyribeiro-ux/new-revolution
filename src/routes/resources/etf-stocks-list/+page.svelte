<!-- src/routes/resources/etf-stocks-list/+page.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type EtfFilterCategory =
		'all' | 'index-core' | 'small-account-options' | 'global-macro' | 'income-defensive';

	interface FeaturedETF {
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

	interface SectorETFGroup {
		code: string;
		sector: string;
		symbol: string;
		weightNote: string;
		rotationRole: string;
		etfs: { ticker: string; exchange: 'AMEX' | 'NASDAQ'; label: string }[];
	}

	interface EtfBenefit {
		num: string;
		title: string;
		description: string;
	}

	interface EtfTypeItem {
		code: string;
		type: string;
		examples: string;
		description: string;
	}

	interface ComparisonRow {
		feature: string;
		etf: string;
		mutualFund: string;
		etfBetter: boolean | null;
	}

	interface FaqItem {
		question: string;
		answer: string;
	}

	interface RoomCta {
		badge: string;
		title: string;
		description: string;
		ctaLabel: string;
		href: string;
	}

	/* ===========================================================================
     12 FEATURED ETFS (WITH OPTIONS LIQUIDITY & INSTITUTIONAL TELEMETRY)
     =========================================================================== */
	const featuredETFs: FeaturedETF[] = [
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
	const sectorETFs: SectorETFGroup[] = [
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

	const etfBenefits: EtfBenefit[] = [
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

	const etfTypes: EtfTypeItem[] = [
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

	const comparisonData: ComparisonRow[] = [
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

	const faqs: FaqItem[] = [
		{
			question: 'Which ETFs are best for trading options in a $500+ small account?',
			answer:
				'For accounts starting between $500 and $2,500, we focus on ETFs that combine penny-wide bid-ask spreads with affordable contract prices: IWM (Russell 2000), XLF (Financials), XLE (Energy), GLD (Gold), and EEM (Emerging Markets)—as well as defined-risk vertical spreads on SPY and QQQ.'
		},
		{
			question:
				'Why do institutional traders and working professionals prefer Sector ETFs over single stocks?',
			answer:
				'Single stocks carry overnight idiosyncratic risk (such as an unexpected FDA rejection, SEC probe, or earnings gap). Sector ETFs like XLK, XLE, XLF, and SMH allow 9-to-5 working professionals to trade the dominant institutional money flow with smooth technical structure and zero single-company blowup risk.'
		},
		{
			question: 'What is the difference between SPY and SPX when trading S&P 500 options?',
			answer:
				'SPY is an Exchange-Traded Fund (ETF) priced at roughly 1/10th the S&P 500 Index with American-style share settlement and dividend payments. SPX is the cash-settled S&P 500 Index itself (10x the notional size of SPY) with European-style exercise and US Section 1256 60/40 tax treatment. We trade SPY in our Day, Swing, and Small Accounts rooms and SPX inside SPX Profit Pulse.'
		},
		{
			question: 'How many official sectors are in the S&P 500, and which ETFs track them?',
			answer:
				'There are 11 official GICS (Global Industry Classification Standard) sectors in the S&P 500, tracked by the 11 Select Sector SPDR ETFs: XLK (Technology), XLV (Healthcare), XLF (Financials), XLY (Consumer Discretionary), XLC (Communication Services), XLI (Industrials), XLP (Consumer Staples), XLE (Energy), XLU (Utilities), XLRE (Real Estate), and XLB (Materials).'
		}
	];

	const bottomRoomCards: RoomCta[] = [
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

	let activeFilter = $state<EtfFilterCategory>('all');
	let searchQuery = $state('');

	const filteredETFs = $derived(
		featuredETFs.filter((etf) => {
			const matchesTab =
				activeFilter === 'all' ||
				(activeFilter === 'small-account-options'
					? etf.smallAccountFit
					: etf.category === activeFilter);
			const q = searchQuery.trim().toLowerCase();
			const matchesQuery =
				q === '' ||
				etf.symbol.toLowerCase().includes(q) ||
				etf.name.toLowerCase().includes(q) ||
				etf.description.toLowerCase().includes(q);
			return matchesTab && matchesQuery;
		})
	);
</script>

<JsonLd schema={data.jsonLdSchema} />

<div class="app-shell">
	<Navbar />

	<main id="etf-stocks-list-page" class="etf-page">
		<!-- =========================================================================
       SECTION 1: BREADCRUMB & PUBLIC UTILITY BAR
       ========================================================================= -->
		<nav class="breadcrumb-bar" aria-label="Breadcrumb">
			<div class="container breadcrumb-bar__inner">
				<ol class="breadcrumb-list">
					<li><a href={resolve('/')}>Home</a></li>
					<li aria-hidden="true">/</li>
					<li><a href={resolve('/resources')}>Resources</a></li>
					<li aria-hidden="true">/</li>
					<li aria-current="page">ETF Stocks List</li>
				</ol>
				<p class="breadcrumb-bar__telemetry">
					<span>100% Free Public Resource</span> •
					<span>12 Core ETFs + All 11 S&amp;P 500 Sectors</span>
				</p>
			</div>
		</nav>

		<!-- =========================================================================
       SECTION 2: ABOVE-THE-FOLD HERO + INSTITUTIONAL ETF ROTATION BRIEFING
       ========================================================================= -->
		<section class="hero-section" aria-labelledby="etf-h1">
			<div class="container hero-section__grid">
				<!-- Left 7 Columns: Search-Intent H1 + Institutional ETF Context -->
				<div class="hero-section__main">
					<div class="eyebrow-pill">
						<span class="eyebrow-pill__badge">Free Trader Resource</span>
						<span class="eyebrow-pill__text">
							Educate • Innovate • Prosper • People Over Profits
						</span>
					</div>

					<h1 id="etf-h1" class="hero-h1">
						<span class="hero-h1__kicker">
							Complete Exchange-Traded Funds (ETF) Directory • Index, Sector &amp; Options Guide
						</span>
						<span class="hero-h1__display">
							The Institutional ETF Stocks List: Master Liquidity, Sector Rotation &amp; Options
							Execution.
						</span>
					</h1>

					<p class="lead-copy">
						Your comprehensive reference guide to <strong>Exchange-Traded Funds (ETFs)</strong>.
						Explore the 12 most heavily traded flagship ETFs, inspect all
						<strong>11 official S&amp;P 500 GICS Sectors</strong>, compare ETFs against mutual
						funds, and learn how institutional desks use ETFs for intraday scalping, 9-to-5 swing
						trading, and <strong>$500+ small account compounding</strong>.
					</p>

					<p class="body-copy">
						Mentored directly by former Wall Street Goldman Sachs proprietary trading legend <strong
							>Mark "Goldfinger" McGoldrick</strong
						>—who called our founder <em>"the future of trading"</em>—we track ETF order flow every
						single morning before the opening bell. Because institutional balance sheets deploy
						billions of dollars through index and sector ETFs (<strong
							>SPY, QQQ, IWM, XLE, XLK, XLF</strong
						>), reading ETF accumulation and distribution is how we called the
						<strong>2020 COVID Top and Bottom</strong>, called the
						<strong>2022 Bull Market Top and Bear Bottom</strong>, and spotted the energy sector
						distribution that fueled our live
						<strong>+600% overnight gain on OXY Put Options</strong>.
					</p>

					<div class="cta-row">
						<a href="#popular-etfs-directory" class="btn btn--solid">
							Explore Popular ETFs Directory ↓
						</a>
						<a href="#etfs-by-sector" class="btn btn--outline"> Jump to All 11 Sector ETFs ↓ </a>
						<a href={resolve('/resources/options-calculator' as '/')} class="btn btn--outline">
							Free Options Risk Calculator →
						</a>
					</div>
				</div>

				<!-- Right 5 Columns: Quick-Reference Institutional ETF Cheat Card -->
				<aside class="quick-ref-card" aria-label="Institutional ETF Quick-Reference Matrix">
					<div class="quick-ref-card__header">
						<div>
							<span class="meta-label">Desk Execution Cheat Sheet</span>
							<h2 class="quick-ref-card__title">How Our Desk Uses ETFs Daily</h2>
						</div>
						<span class="quick-ref-card__stamp">Zero Single-Stock Gap Risk</span>
					</div>

					<dl class="quick-ref-list">
						<div class="quick-ref-list__row">
							<dt>01 // Opening-Bell &amp; 0DTE Options Scalping</dt>
							<dd>
								<strong>SPY, QQQ &amp; IWM</strong> offer penny-wide bid-ask spreads, daily
								expirations, and predictable dealer Gamma walls for our
								<a href={resolve('/live-trading-rooms/day-trading-room')}>Day Trading Room</a>.
							</dd>
						</div>
						<div class="quick-ref-list__row">
							<dt>02 // 9-to-5 Working Professional Swings</dt>
							<dd>
								Sector ETFs (<strong>XLK, XLE, XLF, SMH, GLD</strong>) eliminate single-company CEO
								or earnings blowup risk—making them ideal for our
								<a href={resolve('/live-trading-rooms/swing-trading-room')}>Swing Trading Room</a>
								and
								<a href={resolve('/alert-services/explosive-swings' as '/')}>Explosive Swings</a>.
							</dd>
						</div>
						<div class="quick-ref-list__row">
							<dt>03 // $500+ Small Account Compounding</dt>
							<dd>
								Lower-priced, high-liquidity ETFs like <strong>IWM, XLF, EEM, and XLE</strong> offer
								affordable options contracts and tight vertical spreads for our
								<a href={resolve('/live-trading-rooms/small-accounts-room')}>Small Accounts Room</a
								>.
							</dd>
						</div>
						<div class="quick-ref-list__row">
							<dt>04 // Sibling Market Reference Lists</dt>
							<dd>
								Pair this ETF directory with our <a href={resolve('/resources/stock-indexes-list')}
									>Stock Indexes List (SPX, NDX, DJI, RUT, VIX)</a
								>
								and our <a href={resolve('/store/scanners')}>Live Market Scanners</a>.
							</dd>
						</div>
					</dl>
				</aside>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 3: WHAT IS AN ETF? + 5 CORE BENEFITS + 5 TYPES OF ETFS
       ========================================================================= -->
		<section class="foundation-section" aria-labelledby="what-is-etf-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">Foundation &amp; Mechanics • Complete Breakdown</span>
					<h2 id="what-is-etf-h2" class="section-h2">What Is an Exchange-Traded Fund (ETF)?</h2>
					<p class="body-copy section-header__sub">
						<strong>Exchange-Traded Funds (ETFs)</strong> are SEC- and IIROC-regulated investment vehicles
						that trade on stock exchanges throughout the market day, just like individual stocks. Each
						ETF holds an underlying basket of assets—such as an equity index, an economic sector, Treasury
						bonds, or physical commodities—allowing traders and investors to capture broad market trends
						or hedge risk through a single liquid ticker.
					</p>
				</div>

				<!-- 5 Core Benefits Grid -->
				<div class="benefits-grid">
					{#each etfBenefits as benefit (benefit.title)}
						<article class="benefit-card">
							<div class="benefit-card__top">
								<span class="benefit-card__num">Benefit #{benefit.num}</span>
								<span class="benefit-card__check" aria-hidden="true">✓</span>
							</div>
							<h3 class="benefit-card__title">{benefit.title}</h3>
							<p class="benefit-card__text">{benefit.description}</p>
						</article>
					{/each}
				</div>

				<!-- 5 Types of ETFs Sub-Section -->
				<div class="types-box">
					<div class="types-box__header">
						<span class="meta-label">Asset Class Taxonomy</span>
						<h3 class="types-box__title">
							The 5 Primary Types of ETFs Traded on Institutional Desks
						</h3>
					</div>

					<div class="types-grid">
						{#each etfTypes as item (item.type)}
							<article class="type-card">
								<div class="type-card__head">
									<span class="meta-label">{item.code}</span>
									<span class="type-card__tickers">{item.examples}</span>
								</div>
								<h4 class="type-card__title">{item.type}</h4>
								<p class="type-card__text">{item.description}</p>
							</article>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 4: POPULAR ETFS DIRECTORY (12 FLAGSHIP ETFS + LIVE FILTER/SEARCH)
       ========================================================================= -->
		<section
			id="popular-etfs-directory"
			class="directory-section"
			aria-labelledby="popular-etfs-h2"
		>
			<div class="container">
				<div class="directory-top-bar">
					<div>
						<span class="section-kicker">Interactive Directory • Verified Exchange Links</span>
						<h2 id="popular-etfs-h2" class="section-h2">
							Popular ETFs: The 12 Most Widely Traded Benchmark Funds
						</h2>
						<p class="body-copy section-header__sub">
							Filter by trading category or search by ticker symbol below. Click any TradingView
							chart badge to inspect live price action on its exact primary exchange:
						</p>
					</div>

					<div class="search-box">
						<label for="etf-search" class="meta-label">Search Ticker or Name:</label>
						<input
							type="search"
							id="etf-search"
							bind:value={searchQuery}
							placeholder="Search SPY, QQQ, IWM, Gold, Bond..."
							class="search-box__input"
						/>
					</div>
				</div>

				<!-- Interactive Category Filter Tabs -->
				<div class="filter-bar" role="tablist" aria-label="Filter Popular ETFs">
					<button
						type="button"
						role="tab"
						aria-selected={activeFilter === 'all'}
						class="filter-tab"
						class:filter-tab--active={activeFilter === 'all'}
						onclick={() => (activeFilter = 'all')}
					>
						All Popular ETFs (12)
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={activeFilter === 'small-account-options'}
						class="filter-tab"
						class:filter-tab--active={activeFilter === 'small-account-options'}
						onclick={() => (activeFilter = 'small-account-options')}
					>
						$500+ Small Account &amp; Options Friendly
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={activeFilter === 'index-core'}
						class="filter-tab"
						class:filter-tab--active={activeFilter === 'index-core'}
						onclick={() => (activeFilter = 'index-core')}
					>
						Core U.S. Index ETFs
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={activeFilter === 'global-macro'}
						class="filter-tab"
						class:filter-tab--active={activeFilter === 'global-macro'}
						onclick={() => (activeFilter = 'global-macro')}
					>
						Global Macro &amp; Gold
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={activeFilter === 'income-defensive'}
						class="filter-tab"
						class:filter-tab--active={activeFilter === 'income-defensive'}
						onclick={() => (activeFilter = 'income-defensive')}
					>
						Bonds &amp; Dividend Growth
					</button>
				</div>

				<!-- 12 Featured ETFs Grid -->
				<div class="etf-grid">
					{#each filteredETFs as etf (etf.symbol)}
						<article class="etf-card">
							<div>
								<div class="etf-card__header">
									<div class="etf-card__symbol-group">
										<span class="etf-card__symbol">{etf.symbol}</span>
										<span class="etf-card__cat">{etf.categoryLabel}</span>
									</div>

									<!-- Fixed Exchange-Specific TradingView Link (NYSEARCA vs NASDAQ) -->
									<a
										href={`https://www.tradingview.com/symbols/${etf.exchange}-${etf.symbol}/`}
										target="_blank"
										rel="noopener noreferrer"
										class="etf-card__chart-link"
										aria-label={`View ${etf.symbol} live chart on TradingView (${etf.exchange})`}
										title={`Open ${etf.symbol} chart on TradingView`}
									>
										<span>Chart</span>
										<svg
											viewBox="0 0 24 24"
											width="14"
											height="14"
											fill="none"
											stroke="currentColor"
											stroke-width="2.5"
											aria-hidden="true"
										>
											<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
											<polyline points="15 3 21 3 21 9" />
											<line x1="10" y1="14" x2="21" y2="3" />
										</svg>
									</a>
								</div>

								<h3 class="etf-card__name">{etf.name}</h3>
								<p class="etf-card__options-tier">{etf.optionsTier}</p>
								<p class="etf-card__description">{etf.description}</p>

								<div class="etf-card__inst-note">
									<strong>Desk Execution Note:</strong>
									{etf.institutionalNote}
								</div>
							</div>

							<div class="etf-card__features">
								{#each etf.features as feature (feature)}
									<span class="etf-card__feature">{feature}</span>
								{/each}
							</div>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 5: ETFS BY SECTOR (ALL 11 OFFICIAL S&P 500 GICS SECTORS)
       ========================================================================= -->
		<section id="etfs-by-sector" class="sector-section" aria-labelledby="sector-etfs-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker"
						>Complete 11-Sector Institutional Map • Zero Missing Sectors</span
					>
					<h2 id="sector-etfs-h2" class="section-h2">
						ETFs By Sector: All 11 Official S&amp;P 500 GICS Sectors &amp; Sub-Industries
					</h2>
					<p class="body-copy section-header__sub">
						Institutional capital rarely leaves the market all at once—it rotates from one sector to
						another. Click any sector ticker pill below to open its live TradingView chart:
					</p>
				</div>

				<div class="sector-grid">
					{#each sectorETFs as sector (sector.sector)}
						<article class="sector-card">
							<div>
								<div class="sector-card__top">
									<span class="meta-label">{sector.code}</span>
									<span class="sector-card__primary-ticker">{sector.symbol}</span>
								</div>

								<h3 class="sector-card__title">{sector.sector}</h3>
								<p class="sector-card__weight">{sector.weightNote}</p>
								<p class="sector-card__role">{sector.rotationRole}</p>
							</div>

							<div class="sector-card__etfs-box">
								<span class="meta-label">Click Ticker to Open Live Chart:</span>
								<div class="sector-card__etfs">
									{#each sector.etfs as item (item.ticker)}
										<a
											href={`https://www.tradingview.com/symbols/${item.exchange}-${item.ticker}/`}
											target="_blank"
											rel="noopener noreferrer"
											class="sector-card__etf"
											title={`${item.ticker} — ${item.label}`}
										>
											<strong>{item.ticker}</strong>
											<span>↗</span>
										</a>
									{/each}
								</div>
							</div>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 6: ETFS VS. MUTUAL FUNDS (7-ROW COMPARISON MATRIX)
       ========================================================================= -->
		<section class="comparison-section" aria-labelledby="comparison-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">Structural Comparison • Hard Evidence</span>
					<h2 id="comparison-h2" class="section-h2">
						ETFs vs. Mutual Funds: Why Active Traders &amp; Options Strategists Choose ETFs
					</h2>
					<p class="body-copy section-header__sub">
						Both ETFs and mutual funds hold baskets of securities, but their execution mechanics,
						tax treatment, and options capabilities are fundamentally different:
					</p>
				</div>

				<div class="table-wrapper" role="region" aria-labelledby="comparison-h2">
					<table class="comparison-table">
						<thead>
							<tr>
								<th scope="col">Comparison Feature</th>
								<th scope="col">Exchange-Traded Funds (ETFs)</th>
								<th scope="col">Traditional Mutual Funds</th>
							</tr>
						</thead>
						<tbody>
							{#each comparisonData as row (row.feature)}
								<tr>
									<th scope="row" class="comparison-table__feature">{row.feature}</th>
									<td
										class="comparison-table__etf"
										class:comparison-table__winner={row.etfBetter === true}
									>
										{#if row.etfBetter === true}
											<span class="winner-check" aria-hidden="true">✓</span>
										{/if}
										<span>{row.etf}</span>
									</td>
									<td class="comparison-table__mf">
										<span>{row.mutualFund}</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<div class="comparison-summary">
					<div class="comparison-summary__card comparison-summary__card--featured">
						<span class="meta-label">Active Execution &amp; Options</span>
						<h3>ETFs Are Ideal For:</h3>
						<p>
							Cost-conscious investors, 9-to-5 swing traders, $500+ small accounts, and options
							traders who require intraday liquidity, exact stop-loss control, and deep call/put
							chains.
						</p>
					</div>

					<div class="comparison-summary__card">
						<span class="meta-label">Passive Payroll Retirement</span>
						<h3>Mutual Funds Are Suited For:</h3>
						<p>
							Hands-off 401(k) participants who only execute automated bi-weekly payroll
							contributions and never trade intraday or use options strategies.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 7: ETF TRADING & OPTIONS FAQ ACCORDION
       ========================================================================= -->
		<section class="faq-section" aria-labelledby="etf-faq-h2">
			<div class="container faq-container">
				<div class="section-header">
					<span class="section-kicker">Direct Answers • Zero Fluff</span>
					<h2 id="etf-faq-h2" class="section-h2">
						Frequently Asked Questions About Trading ETFs &amp; Sector Rotation
					</h2>
				</div>

				<div class="faq-list">
					{#each faqs as faq, idx (faq.question)}
						<details class="faq-item" open={idx === 0}>
							<summary class="faq-item__question">
								<span>{faq.question}</span>
								<span class="faq-item__icon" aria-hidden="true">+</span>
							</summary>
							<p class="faq-item__answer">{faq.answer}</p>
						</details>
					{/each}
				</div>

				<!-- Sibling Free Resources Bar -->
				<div class="resources-bridge">
					<div>
						<span class="meta-label">Explore Our Other Free Public Utilities</span>
						<h3 class="resources-bridge__title">Continue With Our Free Trader Resources</h3>
					</div>
					<div class="resources-bridge__links">
						<a href={resolve('/resources/stock-indexes-list')} class="btn btn--outline">
							View Stock Indexes List (SPX, NDX, VIX) →
						</a>
						<a href={resolve('/resources/options-calculator' as '/')} class="btn btn--solid">
							Launch Free Options Risk Calculator →
						</a>
					</div>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 8: START TRADING LIKE A PROFESSIONAL (5 ROOM & ALERT CTA CARDS)
       ========================================================================= -->
		<section class="pro-cta-section" aria-labelledby="pro-cta-h2">
			<div class="container">
				<div class="pro-cta-box">
					<div class="pro-cta-box__header">
						<span class="section-kicker">Educate • Innovate • Prosper</span>
						<h2 id="pro-cta-h2" class="section-h2 pro-cta-box__h2">
							Ready to Trade These ETFs With Institutional Precision?
						</h2>
						<p class="body-copy pro-cta-box__sub">
							Join Revolution Trading Pros for live trading rooms, pre-planned video watchlists with
							exact entries and stops, and $500+ small account mentorship:
						</p>
					</div>

					<div class="room-cta-grid">
						{#each bottomRoomCards as card (card.href)}
							<article class="room-cta-card">
								<div>
									<span class="room-cta-card__badge">{card.badge}</span>
									<h3 class="room-cta-card__title">{card.title}</h3>
									<p class="room-cta-card__desc">{card.description}</p>
								</div>
								<a href={resolve(card.href as '/')} class="btn btn--solid btn--full">
									{card.ctaLabel}
								</a>
							</article>
						{/each}
					</div>
				</div>
			</div>
		</section>
	</main>

	<Footer />
</div>

<style>
	/* ===========================================================================
     PURE NATIVE SCOPED CSS — BLACK & WHITE EDITORIAL ETF DIRECTORY
     Typography: Montserrat (Headings/Tickers/CTAs) + Sofia Sans (Body/Data)
     =========================================================================== */
	.etf-page {
		background-color: var(--bg-soft);
		color: var(--text);
		font-family:
			'Sofia Sans',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
		line-height: 1.65;
		overflow-x: clip;
	}

	.container {
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	/* Shared Typography Tokens */
	.meta-label {
		display: inline-block;
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 700;
		font-stretch: 87.5%;
		font-variation-settings: 'wdth' 87.5;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #c4c8c7;
	}

	.section-kicker {
		display: inline-block;
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		background-color: var(--panel2);
		color: #ffffff;
		padding: 0.25rem 0.625rem;
		margin-bottom: 0.625rem;
	}

	.section-h2 {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: clamp(1.65rem, 3vw, 2.45rem);
		line-height: 1.14;
		letter-spacing: -0.025em;
		max-width: 28ch;
		margin: 0;
		color: var(--text);
	}

	.lead-copy {
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 500;
		font-variation-settings: 'wdth' 100;
		font-size: clamp(1.0625rem, 1.25vw, 1.2rem);
		line-height: 1.65;
		max-width: 66ch;
		margin: 1.25rem 0 0;
		color: var(--text);
	}

	.body-copy {
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 400;
		font-variation-settings: 'wdth' 100;
		font-size: 1rem;
		line-height: 1.65;
		max-width: 66ch;
		margin: 1rem 0 0;
		color: var(--text);
	}

	.lead-copy strong,
	.body-copy strong {
		font-weight: 700;
		color: var(--text);
	}

	/* Buttons */
	.cta-row {
		margin-top: 1.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 48px;
		padding: 0.75rem 1.35rem;
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		text-decoration: none;
		border: 2px solid var(--line-strong);
		text-align: center;
		cursor: pointer;
		box-sizing: border-box;
	}

	.btn--solid {
		background-color: var(--acid);
		color: var(--ink);
	}

	.btn--outline {
		background-color: var(--bg-soft);
		color: var(--text);
	}

	.btn--full {
		width: 100%;
	}

	/* 1. Breadcrumb Bar */
	.breadcrumb-bar {
		background-color: var(--panel);
		border-bottom: 1.5px solid var(--line-strong);
		padding: 0.625rem 0;
	}

	.breadcrumb-bar__inner {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		justify-content: space-between;
	}

	.breadcrumb-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 700;
		font-stretch: 87.5%;
		font-variation-settings: 'wdth' 87.5;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.breadcrumb-list a {
		color: var(--text);
		text-decoration: underline;
	}

	.breadcrumb-bar__telemetry {
		margin: 0;
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 700;
		font-stretch: 87.5%;
		font-variation-settings: 'wdth' 87.5;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #c4c8c7;
	}

	/* 2. Hero Section */
	.hero-section {
		padding: 2.5rem 0 3.5rem;
		border-bottom: 2px solid var(--line-strong);
	}

	.hero-section__grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 2.5rem;
		align-items: start;
	}

	.eyebrow-pill {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		border: 1.5px solid var(--line-strong);
		background-color: var(--panel);
		padding: 0.375rem 0.75rem;
		margin-bottom: 1.25rem;
	}

	.eyebrow-pill__badge {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		background-color: var(--panel2);
		color: #ffffff;
		padding: 0.125rem 0.45rem;
	}

	.eyebrow-pill__text {
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 700;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.hero-h1 {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.hero-h1__kicker {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.09em;
		color: #c4c8c7;
		border-left: 3px solid var(--line-strong);
		padding-left: 0.625rem;
		max-width: 65ch;
	}

	.hero-h1__display {
		font-family: 'Montserrat', sans-serif;
		font-weight: 900;
		font-size: clamp(2rem, 4.1vw, 3.15rem);
		line-height: 1.08;
		letter-spacing: -0.03em;
		max-width: 22ch;
		color: var(--text);
	}

	/* Right Column Quick-Reference Card */
	.quick-ref-card {
		border: 2px solid var(--line-strong);
		background-color: var(--panel);
		padding: 1.5rem;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
	}

	.quick-ref-card__header {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid var(--line-strong);
	}

	.quick-ref-card__title {
		font-family: 'Montserrat', sans-serif;
		font-weight: 900;
		font-size: 1.25rem;
		margin: 0.25rem 0 0;
	}

	.quick-ref-card__stamp {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.6875rem;
		text-transform: uppercase;
		background-color: var(--panel2);
		color: #ffffff;
		padding: 0.25rem 0.5rem;
		white-space: nowrap;
	}

	.quick-ref-list {
		margin: 0;
	}

	.quick-ref-list__row {
		padding: 0.875rem 0;
		border-bottom: 1px solid var(--line);
	}

	.quick-ref-list__row:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.quick-ref-list__row dt {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text);
	}

	.quick-ref-list__row dd {
		margin: 0.25rem 0 0;
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.90625rem;
		line-height: 1.5;
		color: #c4c8c7;
	}

	.quick-ref-list__row a {
		color: var(--text);
		font-weight: 700;
		text-decoration: underline;
	}

	/* 3. What Is an ETF + 5 Benefits + 5 Types */
	.foundation-section {
		padding: 3.5rem 0;
		border-bottom: 2px solid var(--line-strong);
	}

	.section-header {
		margin-bottom: 2.25rem;
	}

	.section-header__sub {
		margin-top: 0.625rem;
	}

	.benefits-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.25rem;
		margin-bottom: 2.75rem;
	}

	.benefit-card {
		border: 2px solid var(--line-strong);
		background-color: var(--panel);
		padding: 1.5rem;
	}

	.benefit-card__top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 0.625rem;
		border-bottom: 1.5px solid var(--line-strong);
		margin-bottom: 0.875rem;
	}

	.benefit-card__num {
		font-family: 'Montserrat', sans-serif;
		font-weight: 900;
		font-size: 0.75rem;
		text-transform: uppercase;
		background-color: var(--panel2);
		color: #ffffff;
		padding: 0.2rem 0.5rem;
	}

	.benefit-card__check {
		font-family: 'Montserrat', sans-serif;
		font-weight: 900;
		font-size: 1rem;
	}

	.benefit-card__title {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 1.125rem;
		line-height: 1.28;
		margin: 0 0 0.5rem;
	}

	.benefit-card__text {
		margin: 0;
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.9375rem;
		line-height: 1.58;
		color: var(--text);
	}

	.types-box {
		border: 2px solid var(--line-strong);
		background-color: var(--panel);
		padding: 1.75rem;
	}

	.types-box__header {
		padding-bottom: 1rem;
		border-bottom: 2px solid var(--line-strong);
		margin-bottom: 1.5rem;
	}

	.types-box__title {
		font-family: 'Montserrat', sans-serif;
		font-weight: 900;
		font-size: 1.35rem;
		margin: 0.25rem 0 0;
	}

	.types-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.25rem;
	}

	.type-card {
		border: 1.5px solid var(--line-strong);
		background-color: var(--bg-soft);
		padding: 1.25rem;
	}

	.type-card__head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.type-card__tickers {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.6875rem;
		background-color: var(--panel2);
		color: #ffffff;
		padding: 0.15rem 0.45rem;
	}

	.type-card__title {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 1.0625rem;
		margin: 0 0 0.375rem;
	}

	.type-card__text {
		margin: 0;
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.875rem;
		line-height: 1.55;
		color: #c4c8c7;
	}

	/* 4. Popular ETFs Directory Section */
	.directory-section {
		padding: 3.5rem 0;
		border-bottom: 2px solid var(--line-strong);
		background-color: var(--panel);
	}

	.directory-top-bar {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 1.25rem;
		margin-bottom: 1.5rem;
	}

	.search-box {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		width: 100%;
		max-width: 360px;
	}

	.search-box__input {
		padding: 0.625rem 0.875rem;
		border: 2px solid var(--line-strong);
		background-color: var(--bg-soft);
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.9375rem;
	}

	.filter-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 2px solid var(--line-strong);
		margin-bottom: 2rem;
	}

	.filter-tab {
		min-height: 42px;
		padding: 0.5rem 1rem;
		border: 2px solid var(--line-strong);
		background-color: var(--bg-soft);
		color: var(--text);
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
	}

	.filter-tab--active,
	.filter-tab:hover {
		background-color: var(--panel2);
		color: #ffffff;
	}

	.etf-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.5rem;
	}

	.etf-card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		border: 2px solid var(--line-strong);
		background-color: var(--bg-soft);
		padding: 1.5rem;
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.etf-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
	}

	.etf-card__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding-bottom: 0.75rem;
		border-bottom: 2px solid var(--line-strong);
	}

	.etf-card__symbol-group {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.etf-card__symbol {
		font-family: 'Montserrat', sans-serif;
		font-weight: 900;
		font-size: 1.25rem;
		background-color: var(--panel2);
		color: #ffffff;
		padding: 0.2rem 0.6rem;
		letter-spacing: 0.02em;
	}

	.etf-card__cat {
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 700;
		font-stretch: 87.5%;
		font-variation-settings: 'wdth' 87.5;
		font-size: 0.6875rem;
		text-transform: uppercase;
		color: #c4c8c7;
	}

	.etf-card__chart-link {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.6875rem;
		text-transform: uppercase;
		border: 1.5px solid var(--line-strong);
		background-color: var(--bg-soft);
		color: var(--text);
		padding: 0.25rem 0.5rem;
		text-decoration: none;
	}

	.etf-card__chart-link:hover {
		background-color: var(--panel2);
		color: #ffffff;
	}

	.etf-card__name {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 1.125rem;
		line-height: 1.25;
		margin: 0.875rem 0 0.25rem;
	}

	.etf-card__options-tier {
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 700;
		font-stretch: 87.5%;
		font-variation-settings: 'wdth' 87.5;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-secondary);
		margin: 0 0 0.75rem;
	}

	.etf-card__description {
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.90625rem;
		line-height: 1.55;
		color: var(--text);
		margin: 0 0 0.875rem;
	}

	.etf-card__inst-note {
		background-color: var(--panel);
		border-left: 3px solid var(--line-strong);
		padding: 0.625rem 0.75rem;
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.8125rem;
		line-height: 1.45;
		color: var(--text);
		margin-bottom: 1rem;
	}

	.etf-card__features {
		margin-top: auto;
		padding-top: 0.75rem;
		border-top: 1px solid var(--line);
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.etf-card__feature {
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 700;
		font-stretch: 87.5%;
		font-variation-settings: 'wdth' 87.5;
		font-size: 0.6875rem;
		text-transform: uppercase;
		border: 1px solid var(--line-strong);
		background-color: var(--panel);
		padding: 0.15rem 0.45rem;
	}

	/* 5. All 11 S&P 500 Sector ETFs Grid */
	.sector-section {
		padding: 3.5rem 0;
		border-bottom: 2px solid var(--line-strong);
	}

	.sector-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.5rem;
	}

	.sector-card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		border: 2px solid var(--line-strong);
		background-color: var(--bg-soft);
		padding: 1.5rem;
	}

	.sector-card__top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding-bottom: 0.625rem;
		border-bottom: 2px solid var(--line-strong);
	}

	.sector-card__primary-ticker {
		font-family: 'Montserrat', sans-serif;
		font-weight: 900;
		font-size: 0.875rem;
		background-color: var(--panel2);
		color: #ffffff;
		padding: 0.2rem 0.55rem;
	}

	.sector-card__title {
		font-family: 'Montserrat', sans-serif;
		font-weight: 900;
		font-size: 1.25rem;
		margin: 0.875rem 0 0.25rem;
	}

	.sector-card__weight {
		font-family: 'Montserrat', sans-serif;
		font-weight: 700;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-secondary);
		margin: 0 0 0.625rem;
	}

	.sector-card__role {
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.90625rem;
		line-height: 1.55;
		color: var(--text);
		margin: 0 0 1.25rem;
	}

	.sector-card__etfs-box {
		margin-top: auto;
		padding-top: 0.875rem;
		border-top: 1px solid var(--line);
	}

	.sector-card__etfs {
		margin-top: 0.5rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	.sector-card__etf {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.75rem;
		border: 1.5px solid var(--line-strong);
		background-color: var(--panel);
		color: var(--text);
		padding: 0.3rem 0.6rem;
		text-decoration: none;
	}

	.sector-card__etf:hover {
		background-color: var(--panel2);
		color: #ffffff;
	}

	/* 6. ETFs vs Mutual Funds Comparison Table */
	.comparison-section {
		padding: 3.5rem 0;
		border-bottom: 2px solid var(--line-strong);
		background-color: var(--panel);
	}

	.table-wrapper {
		width: 100%;
		overflow-x: auto;
		border: 2px solid var(--line-strong);
		background-color: var(--bg-soft);
	}

	.comparison-table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
		min-width: 680px;
	}

	.comparison-table th,
	.comparison-table td {
		padding: 1rem 1.25rem;
		border-bottom: 1.5px solid var(--line);
		border-right: 1.5px solid var(--line);
		vertical-align: top;
	}

	.comparison-table thead th {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.8125rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background-color: var(--panel2);
		color: #ffffff;
	}

	.comparison-table__feature {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.875rem;
		width: 24%;
		background-color: var(--panel);
	}

	.comparison-table__etf {
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.9375rem;
		width: 38%;
	}

	.comparison-table__winner {
		font-weight: 700;
		color: var(--text);
	}

	.winner-check {
		font-family: 'Montserrat', sans-serif;
		font-weight: 900;
		margin-right: 0.35rem;
	}

	.comparison-table__mf {
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.9375rem;
		color: #c4c8c7;
		width: 38%;
	}

	.comparison-summary {
		margin-top: 1.75rem;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.5rem;
	}

	.comparison-summary__card {
		border: 2px solid var(--line-strong);
		background-color: var(--bg-soft);
		padding: 1.5rem;
	}

	.comparison-summary__card--featured {
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
	}

	.comparison-summary__card h3 {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 1.2rem;
		margin: 0.375rem 0 0.5rem;
	}

	.comparison-summary__card p {
		margin: 0;
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.9375rem;
		line-height: 1.55;
	}

	/* 7. FAQ & Sibling Resources Bar */
	.faq-section {
		padding: 3.5rem 0;
		border-bottom: 2px solid var(--line-strong);
	}

	.faq-container {
		max-width: 960px;
	}

	.faq-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.faq-item {
		border: 2px solid var(--line-strong);
		background-color: var(--panel);
		padding: 1.25rem 1.5rem;
	}

	.faq-item__question {
		list-style: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		font-family: 'Montserrat', sans-serif;
		font-weight: 700;
		font-size: 1.0625rem;
	}

	.faq-item__question::-webkit-details-marker {
		display: none;
	}

	.faq-item__icon {
		font-family: 'Montserrat', sans-serif;
		font-weight: 900;
		font-size: 1.25rem;
	}

	.faq-item__answer {
		margin: 1rem 0 0;
		padding-top: 1rem;
		border-top: 1px solid var(--line);
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.96875rem;
		line-height: 1.65;
	}

	.resources-bridge {
		margin-top: 2.25rem;
		border: 2px solid var(--line-strong);
		background-color: var(--panel);
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 1rem;
	}

	.resources-bridge__title {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 1.2rem;
		margin: 0.25rem 0 0;
	}

	.resources-bridge__links {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* 8. 5-Card Room & Alert CTA Section */
	.pro-cta-section {
		padding: 3.5rem 0 4rem;
		background-color: var(--bg-soft);
	}

	.pro-cta-box {
		border: 2px solid var(--line-strong);
		background-color: var(--panel);
		padding: 2rem 1.25rem;
	}

	.pro-cta-box__header {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 2rem;
	}

	.pro-cta-box__h2 {
		text-align: center;
	}

	.pro-cta-box__sub {
		text-align: center;
		margin: 0.75rem auto 0;
	}

	.room-cta-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.25rem;
	}

	.room-cta-card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		border: 2px solid var(--line-strong);
		background-color: var(--bg-soft);
		padding: 1.35rem;
		text-align: center;
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.room-cta-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
	}

	.room-cta-card__badge {
		display: inline-block;
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 700;
		font-stretch: 87.5%;
		font-variation-settings: 'wdth' 87.5;
		font-size: 0.6875rem;
		text-transform: uppercase;
		border: 1px solid var(--line-strong);
		background-color: var(--panel);
		padding: 0.15rem 0.5rem;
	}

	.room-cta-card__title {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 1.125rem;
		margin: 0.75rem 0 0.5rem;
	}

	.room-cta-card__desc {
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.875rem;
		line-height: 1.5;
		color: #c4c8c7;
		margin: 0 0 1.25rem;
	}

	/* ===========================================================================
     ENTERPRISE RESPONSIVE BREAKPOINTS (480px, 640px, 768px, 1024px, 1280px, 1536px)
     =========================================================================== */
	@media (min-width: 480px) {
		.container {
			padding: 0 1.25rem;
		}
	}

	@media (min-width: 640px) {
		.container {
			padding: 0 1.5rem;
		}
		.cta-row,
		.resources-bridge__links {
			flex-direction: row;
			flex-wrap: wrap;
		}
		.benefits-grid,
		.types-grid,
		.etf-grid,
		.sector-grid,
		.comparison-summary,
		.room-cta-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 768px) {
		.breadcrumb-bar__inner,
		.directory-top-bar,
		.resources-bridge {
			flex-direction: row;
			align-items: center;
		}
		.pro-cta-box {
			padding: 2.75rem 2rem;
		}
	}

	@media (min-width: 1024px) {
		.container {
			padding: 0 2rem;
		}
		.hero-section,
		.foundation-section,
		.directory-section,
		.sector-section,
		.comparison-section,
		.faq-section {
			padding: 4.5rem 0;
		}
		.hero-section__grid {
			grid-template-columns: repeat(12, minmax(0, 1fr));
			gap: 2.5rem;
		}
		.hero-section__main {
			grid-column: span 7;
		}
		.quick-ref-card {
			grid-column: span 5;
		}
		.benefits-grid,
		.types-grid,
		.etf-grid,
		.sector-grid,
		.room-cta-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (min-width: 1280px) {
		.hero-section__grid {
			gap: 3.5rem;
		}
		.etf-grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
		.room-cta-grid {
			grid-template-columns: repeat(5, minmax(0, 1fr));
		}
	}

	@media (min-width: 1536px) {
		.container {
			max-width: 1536px;
		}
	}
</style>
