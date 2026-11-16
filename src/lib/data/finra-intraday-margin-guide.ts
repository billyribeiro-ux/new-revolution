/**
 * Static content module for `/resources/finra-intraday-margin-rule-2026` —
 * FINRA Regulatory Notice 26-10 (Amended Rule 4210(d)(2)) Trader Playbook.
 */

export interface FinraComparisonRow {
	dimension: string;
	legacyPdtRule: string;
	amendedRule4210: string;
}

export const FINRA_4210_COMPARISON_ROWS: readonly FinraComparisonRow[] = [
	{
		dimension: 'Minimum Margin Equity',
		legacyPdtRule: '$25,000 mandatory minimum once executing 4+ day trades in 5 business days',
		amendedRule4210:
			'$2,000 standard FINRA margin account baseline ($0 FINRA minimum in T+1 Cash Accounts)'
	},
	{
		dimension: 'Day-Trade Count Cap',
		legacyPdtRule: 'Strict 3-day-trade limit per rolling 5 business days under $25,000 equity',
		amendedRule4210:
			'Eliminated — zero day-trade count limits once your broker activates the new framework'
	},
	{
		dimension: 'Core Risk Metric',
		legacyPdtRule: 'Static 4x day-trading buying power derived from prior day’s closing equity',
		amendedRule4210:
			'Real-time Intraday Margin Level (IML) = Account Equity minus Intraday Maintenance Requirement'
	},
	{
		dimension: '0DTE Options Coverage',
		legacyPdtRule: 'Fragmented, inconsistent broker house overlays',
		amendedRule4210:
			'Explicitly integrated inside real-time intraday exposure and Intraday Margin Deficit (IMD) monitoring'
	},
	{
		dimension: 'De Minimis Exception',
		legacyPdtRule: 'Minor margin call thresholds varied informally across clearing firms',
		amendedRule4210:
			'Intraday deficits not exceeding the lesser of 5% of account equity or $1,000 are excused from restrictive penalties'
	},
	{
		dimension: 'Unsatisfied Deficit Consequence',
		legacyPdtRule: '90-day PDT equity lock / closing-transactions-only restriction',
		amendedRule4210:
			'Deficits remain on record up to 15 business days; repeated failures to satisfy promptly can trigger a 90-day margin restriction'
	}
] as const;

export const BROKER_TRANSITION_STEPS = [
	{
		dateLabel: 'April 20, 2026',
		title: 'FINRA Publishes Regulatory Notice 26-10',
		detail:
			'FINRA announces SEC-approved amendments to Rule 4210 replacing the 2001-era Pattern Day Trader (PDT) framework with risk-based intraday maintenance margin.'
	},
	{
		dateLabel: 'June 4, 2026',
		title: 'Effective Date Opens Broker Rollout',
		detail:
			'Clearing firms with updated real-time intraday risk engines may transition customer margin accounts onto the Intraday Margin Level (IML) standard immediately.'
	},
	{
		dateLabel: 'June 2026 – October 20, 2027',
		title: '18-Month Broker Implementation Window',
		detail:
			'Brokers have up to 18 months through October 20, 2027 to complete system cutovers — confirm whether your specific broker has switched your account off legacy PDT counting before sizing margin trades.'
	}
] as const;
