/**
 * Static content & verification governance for `/track-record` —
 * Public Trade Ledger & Archived Historical Case Studies.
 *
 * YMYL & FTC/CFTC Honesty Rule (`T11`):
 * - Zero invented trade rows, win rates, profit factors, or hypothetical backtests masquerading as live fills.
 * - Live trade ledger rows derive strictly from `VERIFIED_CASE_STUDIES` (`isPublishableCaseStudy`) in `homepage.ts`.
 * - Historical structural calls (2020 COVID, 2022 Bear Cycle, 2022 OXY Puts) are clearly labeled with their
 *   primary-receipt verification status and CFTC Rule 4.41 non-typicality disclosures.
 */

import { HISTORICAL_INFLECTION_CALLS, type HistoricalCaseChartImage } from './methodology.ts';

export type LedgerFilterTrack = 'all' | 'macro-index' | 'spx-0dte' | 'swing' | 'small-account';

export interface LedgerAuditField {
	field: string;
	requirement: string;
	whyItMatters: string;
}

export const LEDGER_FILTER_TABS: ReadonlyArray<{ id: LedgerFilterTrack; label: string }> = [
	{ id: 'all', label: 'All Documented Cases' },
	{ id: 'macro-index', label: 'Macro & Index Structure' },
	{ id: 'spx-0dte', label: 'SPX 0DTE' },
	{ id: 'swing', label: 'Multi-Day Swing' },
	{ id: 'small-account', label: '$500+ Small Account' }
] as const;

export const LEDGER_AUDIT_STANDARDS: readonly LedgerAuditField[] = [
	{
		field: '01 · Pre-Trade Structural Thesis',
		requirement:
			'Higher-timeframe supply/demand location + 1m/5m confirmation trigger published BEFORE price activates.',
		whyItMatters: 'Eliminates hindsight chart cherry-picking and post-close screenshot marketing.'
	},
	{
		field: '02 · Exact Contract & Sizing',
		requirement:
			'Underlying ticker, option expiration, strike, structure (single-leg vs. vertical spread), and max risk %.',
		whyItMatters:
			'Proves the option structure matched implied volatility, theta decay, and FINRA Rule 4210 / T+1 rules.'
	},
	{
		field: '03 · Binary Invalidation Stop',
		requirement:
			'Exact index or share print where the structural setup is wrong and the position is cut immediately.',
		whyItMatters:
			'Keeps losses small and mechanical so one invalidated thesis never causes catastrophic drawdown.'
	},
	{
		field: '04 · Permanent Stop-Out Retention',
		requirement:
			'Every stopped-out invalidation and scratched setup stays permanently visible beside winning setups.',
		whyItMatters:
			'Independent financial editors and serious traders evaluate risk management by how a desk handles losses.'
	}
] as const;

export interface ArchivedCallWithTrack {
	id: string;
	track: Exclude<LedgerFilterTrack, 'all'>;
	code: string;
	periodLabel: string;
	title: string;
	instrument: string;
	directionAndStructure: string;
	marketBenchmark: string;
	structuralRead: string;
	executionAndRisk: string;
	verificationStatus: string;
	plannedAssetPath: string;
	chartImage: HistoricalCaseChartImage | null;
	nonTypicalityNote: string;
}

export interface LedgerKpiSummary {
	id: string;
	label: string;
	value: string;
	sublabel: string;
}

export const LEDGER_KPI_CARDS: readonly LedgerKpiSummary[] = [
	{
		id: 'closed-setups',
		label: 'Closed Setups (Live Vault)',
		value: '0',
		sublabel: 'Awaiting post-launch primary receipts'
	},
	{
		id: 'win-rate',
		label: 'Win Rate %',
		value: '—',
		sublabel: 'Computed strictly from verified fills'
	},
	{
		id: 'profit-factor',
		label: 'Profit Factor',
		value: '—',
		sublabel: 'Gross verified R-gains ÷ R-stops'
	},
	{
		id: 'avg-r-multiple',
		label: 'Avg R-Multiple',
		value: '—',
		sublabel: 'Measured vs. pre-trade binary stop'
	},
	{
		id: 'max-drawdown',
		label: 'Max Drawdown',
		value: '—',
		sublabel: 'Zero cherry-picking; all stop-outs retained'
	}
] as const;

export const ARCHIVED_HISTORICAL_CALLS: readonly ArchivedCallWithTrack[] = [
	{
		...HISTORICAL_INFLECTION_CALLS[0],
		track: 'macro-index',
		instrument: 'S&P 500 (SPX / SPY)',
		directionAndStructure: 'Feb Breakdown Hedge + Mar Capitulation Reversal'
	},
	{
		...HISTORICAL_INFLECTION_CALLS[1],
		track: 'macro-index',
		instrument: 'S&P 500 (4,818.62 → 3,491.58)',
		directionAndStructure: 'Jan Distribution Top + Oct Capitulation Demand'
	},
	{
		...HISTORICAL_INFLECTION_CALLS[2],
		track: 'swing',
		instrument: 'Occidental Petroleum (OXY)',
		directionAndStructure: 'Defined-Risk Put Options (+600% Overnight Outlier)'
	}
] as const;
