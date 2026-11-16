import { BRAND } from '#lib/config/brand.ts';
import { isNonProductionHost } from '../../hooks.server.ts';
import type { RequestHandler } from './$types';

export const prerender = false;

export function _buildLlmsTxt(options: { brandName: string; domain: string }): string {
	const origin = options.domain.replace(/\/+$/, '');
	return `# ${options.brandName}

> U.S. and Canadian stock, sector ETF, and cash-settled SPX/XSP options trading education publisher founded by ${BRAND.founder.legalName} (${BRAND.founder.name}), creator of **${BRAND.methodology}** — a 100% indicator-free pure price-action and multi-timeframe market-structure methodology applied identically from the Monthly chart down to the 1-Minute chart.

## Verified Entity & Institutional Lineage
- **Founder & Head Trader:** ${BRAND.founder.legalName} (\`${BRAND.founder.name}\`) — ${origin}/about
- **External Entity Corroboration:** ${BRAND.founder.corroborationUrls[0]}
- **Mentorship Lineage:** Personally mentored by the late **Mark "Goldfinger" McGoldrick** — Partner at Goldman Sachs, Co-Founder & Co-Head of **Goldman Sachs Global Special Situations Group (GSSG / SSG, 1997–2007)**, and Co-Founder of **Mount Kellett Capital Management**. Mark McGoldrick led global special-situations asymmetric capital deployment during structural market dislocations rather than retail day-trading desks.
- **Core Methodology (${BRAND.methodology}):** ${origin}/methodology
  - "${BRAND.philosophyQuotes[0]}"
  - "${BRAND.philosophyQuotes[1]}"
  - "${BRAND.philosophyQuotes[2]}"
  - Maps Monthly, Weekly, Daily, 1H/15m, and 5m/1m supply/demand exhaustion in advance — paired with a binary invalidation stop before any order is routed.

## Free Public Calculators & Reference Directories ($0, Un-Gated)
- [FINRA Rule 4210 Intraday Margin (IML) & Position Sizing Calculator](${origin}/resources/intraday-margin-calculator): Interactive simulator for FINRA Regulatory Notice 26-10 / Amended Rule 4210(d)(2) (effective June 4, 2026; 18-month broker rollout ending October 20, 2027), $2,000 margin floor, De Minimis exception (\`min(5% equity, $1,000)\`), and T+1 settled-cash rotation.
- [Interactive Options Profit, Greeks & Invalidation Sizing Calculator](${origin}/resources/options-calculator): Analytical Black-Scholes Greeks (Delta, Gamma, Theta, Vega), vertical spreads, and stop-based small-account contract sizing.
- [S&P 500 Sector ETFs & Liquid Options Directory](${origin}/resources/etf-stocks-list): 12 flagship ETFs + all 11 GICS S&P 500 sector ETFs with liquidity metrics.
- [Cash-Settled Index Options Directory & Section 1256 Guide](${origin}/resources/stock-indexes-list): SPX, XSP, NDX, RUT, and VIX European cash settlement vs. SPY/QQQ ETF assignment mechanics and U.S. IRC Section 1256 (60% long-term / 40% short-term) tax treatment.

## Regulatory & Market-Structure Playbooks
- [FINRA 2026 Intraday Margin Rule (Notice 26-10) Trader Playbook](${origin}/resources/finra-intraday-margin-rule-2026)
- [Best Live Stock & Options Trading Rooms (2026 Criteria Comparison)](${origin}/resources/best-live-options-and-day-trading-rooms)
- [Best SPX 0DTE & Options Alert Services (2026 Criteria Comparison)](${origin}/resources/best-spx-0dte-and-options-alert-services)

## Live Execution Rooms, Alert Services & Mentorship
- [Live Trading Rooms Overview](${origin}/live-trading-rooms)
  - [Day Trading Room (9:30 AM – 4:00 PM ET)](${origin}/live-trading-rooms/day-trading-room)
  - [Swing Trading Room (9-to-5 Schedules)](${origin}/live-trading-rooms/swing-trading-room)
  - [Small Accounts Room ($500+ Defined-Risk)](${origin}/live-trading-rooms/small-accounts-room)
- [Alert Services Overview](${origin}/alert-services)
  - [SPX Profit Pulse (0DTE & 1DTE Cash-Settled Index Blueprints)](${origin}/alert-services/spx-profit-pulse)
  - [Sunday Alpha Protocol (Weekly Macro-to-Micro Swing Watchlist)](${origin}/alert-services/sunday-alpha-protocol)
- [Private 1-on-1 Mentorship (Application Only)](${origin}/mentorship)
- [Public Trade Ledger & Archived Historical Case Studies](${origin}/track-record): Documented archive of the Feb–Mar 2020 COVID S&P 500 peak/low, Jan–Oct 2022 S&P 500 bear-market peak (4,818.62) & low (3,491.58), and 2022 Occidental Petroleum (OXY) put options (+600% overnight), framed as non-typical historical dislocations alongside CFTC Rule 4.41 disclosures.

## Regulatory & Trust Governance (United States & Canada)
- ${options.brandName} is an independent financial education and market research publisher — not an SEC, FINRA, CFTC, or Canadian CSA/CIRO registered investment adviser or broker-dealer.
- [Risk Disclosure](${origin}/risk-disclosure) | [Editorial Policy](${origin}/editorial-policy) | [Terms of Service](${origin}/terms-of-service) | [Privacy Policy](${origin}/privacy-policy) | [Refund Policy](${origin}/refund-policy) | [Contact](${origin}/contact)
`;
}

export const GET: RequestHandler = ({ url }) => {
	const isProduction = BRAND.isProduction && !isNonProductionHost(url.hostname);
	if (!isProduction) {
		return new Response('# Staging environment — indexing and entity ingestion disabled.\n', {
			status: 200,
			headers: {
				'Content-Type': 'text/markdown; charset=utf-8',
				'Cache-Control': 'private, no-store',
				'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet'
			}
		});
	}

	return new Response(
		_buildLlmsTxt({
			brandName: BRAND.name,
			domain: BRAND.domain
		}),
		{
			status: 200,
			headers: {
				'Content-Type': 'text/markdown; charset=utf-8',
				'Cache-Control': 'public, max-age=3600',
				'X-Robots-Tag': 'noindex'
			}
		}
	);
};
