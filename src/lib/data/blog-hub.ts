/**
 * Static blog hub content for /blogs (module scope). `BlogCardPost` is the normalized shape the
 * BlogCard component renders; DB-backed posts can be mapped into the same shape.
 */

export interface BlogCardImage {
	src: string;
	alt: string;
	width: number;
	height: number;
}

export interface BlogCardPost {
	slug: string;
	title: string;
	excerpt: string;
	keyTakeaway: string;
	category: string;
	categorySlug: string;
	/** ISO date (YYYY-MM-DD) for the <time datetime>. */
	publishedDate: string;
	/** Human-readable date shown to readers. */
	publishedDisplay: string;
	readTime: string;
	image: BlogCardImage;
	hasAudio: boolean;
	featured?: boolean;
}

export const blogCategories: readonly { id: string; label: string }[] = [
	{ id: 'all', label: 'All Market Intelligence' },
	{ id: 'options-mastery', label: 'Options & Greeks Mastery' },
	{ id: 'institutional-execution', label: 'Institutional Order Flow' },
	{ id: 'small-accounts', label: '$500+ Small Accounts' },
	{ id: 'working-professionals', label: 'Swing & Working Pros' },
	{ id: 'trading-psychology', label: 'Risk & Psychology' }
];

export const blogPosts: readonly BlogCardPost[] = [
	{
		slug: 'ultimate-guide-to-options-greeks',
		category: 'Options & Greeks Mastery',
		categorySlug: 'options-mastery',
		title: 'The Ultimate Guide to Options Greeks: Delta, Gamma, Theta, Vega & Rho',
		excerpt:
			'90% of retail options failures stem from Greeks ignorance. Master how Delta, Gamma, Theta, and Vega interact so you structure trades like an institutional desk instead of buying lottery tickets.',
		keyTakeaway:
			'The Greeks are not predictions—they are mathematical risk measurements that govern every options trade.',
		publishedDate: '2026-10-29',
		publishedDisplay: 'Oct 29, 2026',
		readTime: '18 min read',
		image: {
			src: 'https://revolutiontradingpros.com/wp-content/uploads/2025/08/ChatGPT-Image-Aug-28-2025-04_19_20-AM-1024x683.png',
			alt: 'The Ultimate Guide to Options Greeks Graph and Risk Curve',
			width: 640,
			height: 360
		},
		hasAudio: true,
		featured: true
	},
	{
		slug: 'how-we-shorted-oxy-put-options-600-percent-overnight',
		category: 'Institutional Order Flow',
		categorySlug: 'institutional-execution',
		title: 'Anatomy of a 600% Overnight Options Trade: Shorting OXY Live Opposite Warren Buffett',
		excerpt:
			'When mainstream headlines celebrated Warren Buffett buying millions in Occidental Petroleum (OXY), retail chased the top. Here is how we spotted institutional distribution and banked 600% overnight on OXY Puts.',
		keyTakeaway:
			'Never follow billionaire headlines blindly—read institutional liquidity exhaustion and volume structure.',
		publishedDate: '2026-10-28',
		publishedDisplay: 'Oct 28, 2026',
		readTime: '7 min read',
		image: {
			src: 'https://placehold.co/800x450/000000/ffffff?text=OXY+600%25+Put+Options+Case+Study',
			alt: 'Chart breakdown of Occidental Petroleum OXY Put Options 600% overnight gain',
			width: 640,
			height: 360
		},
		hasAudio: true
	},
	{
		slug: 'growing-a-500-dollar-small-options-account-without-blowing-up',
		category: '$500+ Small Accounts',
		categorySlug: 'small-accounts',
		title: 'The $500 Small Account Playbook: Compounding Options & Stocks Without Gambling',
		excerpt:
			'Most small accounts blow up because they copy position sizes meant for $100,000 portfolios. Learn our exact contract price ceilings, T+1 cash settlement rotation, and defined-risk vertical spreads.',
		keyTakeaway:
			'Protect your first $500 with ironclad stop-losses and T+1 cash rotation before swinging for size.',
		publishedDate: '2026-10-24',
		publishedDisplay: 'Oct 24, 2026',
		readTime: '9 min read',
		image: {
			src: 'https://placehold.co/800x450/111111/ffffff?text=%24500+Small+Account+Playbook',
			alt: '$500 Small Account Options Compounding Blueprint',
			width: 640,
			height: 360
		},
		hasAudio: false
	},
	{
		slug: 'swing-trading-options-with-a-full-time-job-watchlist-routine',
		category: 'Swing & Working Pros',
		categorySlug: 'working-professionals',
		title: 'How Working Professionals Trade Institutional Swings in 20 Minutes a Day',
		excerpt:
			'You do not need six monitors or eight free hours a day to capture multi-day moves. Discover how to combine evening video watchlists with conditional orders and hard invalidation stops.',
		keyTakeaway:
			'Pre-planned entries, profit targets, and hard stops eliminate 9-to-5 screen addiction.',
		publishedDate: '2026-10-20',
		publishedDisplay: 'Oct 20, 2026',
		readTime: '6 min read',
		image: {
			src: 'https://placehold.co/800x450/000000/ffffff?text=Working+Pro+Swing+Routine',
			alt: 'Multi-day swing trading routine for working professionals',
			width: 640,
			height: 360
		},
		hasAudio: true
	},
	{
		slug: 'why-repainted-holy-grail-indicators-destroy-retail-accounts',
		category: 'Institutional Order Flow',
		categorySlug: 'institutional-execution',
		title: 'Exposed: How Repainted "Holy Grail" Indicators Trick Traders—And What Works Instead',
		excerpt:
			'Predatory marketers charge $2,500 for scripts that erase losing arrows after the candle closes. Learn how to spot repainting code and how non-repainting volume and liquidity telemetry works.',
		keyTakeaway:
			'If an indicator rewrites its signal after the bar closes, it is a marketing toy—not a trading tool.',
		publishedDate: '2026-10-16',
		publishedDisplay: 'Oct 16, 2026',
		readTime: '8 min read',
		image: {
			src: 'https://placehold.co/800x450/111111/ffffff?text=Zero-Repaint+Institutional+Telemetry',
			alt: 'Comparison of repainted guru indicators vs non-repainting institutional telemetry',
			width: 640,
			height: 360
		},
		hasAudio: false
	},
	{
		slug: '3-best-options-strategies-for-consistent-income',
		category: 'Options & Greeks Mastery',
		categorySlug: 'options-mastery',
		title: '3 Institutional Options Strategies for Consistent Theta Income in Any Market Regime',
		excerpt:
			'Stop buying out-of-the-money weekly lottery tickets that expire worthless 85% of the time. Here are the three Theta-positive credit and diagonal structures we use to get paid while time passes.',
		keyTakeaway:
			'Sell 15–20 Delta premium in the 30–45 DTE window to capture accelerating Theta without expiration-week Gamma blowups.',
		publishedDate: '2026-10-12',
		publishedDisplay: 'Oct 12, 2026',
		readTime: '12 min read',
		image: {
			src: 'https://placehold.co/800x450/000000/ffffff?text=3+Institutional+Options+Strategies',
			alt: '3 Institutional Options Strategies for Consistent Theta Income',
			width: 640,
			height: 360
		},
		hasAudio: true
	},
	{
		slug: 'risk-management-essentials-for-active-traders',
		category: 'Risk & Psychology',
		categorySlug: 'trading-psychology',
		title: 'Risk Management Essentials: The Goldman Sachs Prop Sizing Rules That Prevent Blowups',
		excerpt:
			'Having stood on the losing end early in my career before being mentored by Mark "Goldfinger" McGoldrick, I learned that offense wins trades, but risk mathematics saves careers.',
		keyTakeaway:
			'Size every position by maximum Greek and stop-loss dollar risk—never by gut conviction.',
		publishedDate: '2026-10-08',
		publishedDisplay: 'Oct 08, 2026',
		readTime: '10 min read',
		image: {
			src: 'https://placehold.co/800x450/111111/ffffff?text=Institutional+Risk+Architecture',
			alt: 'Institutional Risk Management and Position Sizing Matrix',
			width: 640,
			height: 360
		},
		hasAudio: false
	}
];

/** Default byline for the hub's editorial posts (rendered as initials: no external avatar dependency). */
export const BLOG_HUB_AUTHOR = { name: 'Billy Ribeiro' } as const;
