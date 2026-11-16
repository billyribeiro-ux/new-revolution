/**
 * Deterministic FINRA Regulatory Notice 26-10 (Amended Rule 4210(d)(2)) Intraday Margin
 * & Asymmetric Structural Position Sizing Engine.
 *
 * Primary Regulatory Sources:
 * - FINRA Regulatory Notice 26-10 (Adopted April 2026; Effective June 4, 2026; 18-month broker
 *   implementation window ending October 20, 2027).
 * - Eliminates the legacy 4-day-trade Pattern Day Trader (PDT) count and $25,000 minimum equity rule.
 * - Retains the $2,000 baseline margin account equity requirement ($0 FINRA floor in T+1 cash accounts).
 * - Computes Intraday Margin Level (IML) = Account Equity - Intraday Maintenance Requirement.
 * - Computes Intraday Margin Deficit (IMD) = max(0, -IML).
 * - Applies the De Minimis Exception = min(5% of Account Equity, $1,000).
 * - Tracks the 15-business-day satisfaction window and 90-day margin restriction threshold.
 */

export type MarginAccountMode = 'margin' | 'cash';
export type IntradayTradeStructure = 'long_option_0dte' | 'defined_spread' | 'margin_equity';
export type MarginStatusCode = 'SAFE' | 'WARN' | 'BLOCK';

export interface IntradayMarginInput {
	accountMode: MarginAccountMode;
	structure: IntradayTradeStructure;
	accountEquity: number;
	settledCash: number;
	contractOrSharePrice: number;
	spreadWidth: number;
	plannedQuantity: number;
	maintenancePct: number;
	stopLossPct: number;
	maxAccountRiskPct: number;
}

export interface IntradayMarginStatus {
	code: MarginStatusCode;
	label: string;
	detail: string;
}

export interface IntradayMarginResult {
	unitMultiplier: number;
	costPerUnit: number;
	totalExposure: number;
	intradayMaintenanceRequired: number;
	intradayMarginLevel: number;
	intradayMarginDeficit: number;
	remainingSettledCash: number;
	deMinimisLimit: number;
	maxDollarRiskAllowed: number;
	dollarRiskPerUnit: number;
	safeMaxUnits: number;
	status: IntradayMarginStatus;
}

export const FINRA_MARGIN_EQUITY_FLOOR = 2_000;
export const FINRA_DE_MINIMIS_PCT = 0.05;
export const FINRA_DE_MINIMIS_CAP_USD = 1_000;
export const FINRA_DEFICIT_WINDOW_BUSINESS_DAYS = 15;
export const FINRA_RESTRICTION_DAYS = 90;

function clampNonNegative(val: number): number {
	return Number.isFinite(val) && val > 0 ? val : 0;
}

export function calculateIntradayMargin(input: IntradayMarginInput): IntradayMarginResult {
	const equity = clampNonNegative(input.accountEquity);
	const settled = clampNonNegative(input.settledCash);
	const price = clampNonNegative(input.contractOrSharePrice);
	const width = Math.max(0.5, clampNonNegative(input.spreadWidth));
	const quantity = Math.max(0, Math.floor(clampNonNegative(input.plannedQuantity)));
	const maintPct = Math.min(100, Math.max(25, clampNonNegative(input.maintenancePct) || 25));
	const stopPct = Math.min(100, Math.max(1, clampNonNegative(input.stopLossPct) || 25));
	const riskPct = Math.min(25, Math.max(0.1, clampNonNegative(input.maxAccountRiskPct) || 2));

	const unitMultiplier = input.structure === 'margin_equity' ? 1 : 100;

	let costPerUnit = price;
	if (input.structure === 'long_option_0dte') {
		// Non-marginable short-dated / 0DTE long options require 100% premium commitment intraday
		costPerUnit = price * 100;
	} else if (input.structure === 'defined_spread') {
		// Conservative max-risk commitment across debit or credit vertical spreads
		costPerUnit = Math.max(price * 100, Math.max(0, width - price) * 100);
	}

	const totalExposure = costPerUnit * quantity;

	let intradayMaintenanceRequired = totalExposure;
	if (input.accountMode === 'margin' && input.structure === 'margin_equity') {
		intradayMaintenanceRequired = totalExposure * (maintPct / 100);
	}

	const intradayMarginLevel = equity - intradayMaintenanceRequired;
	const intradayMarginDeficit = Math.max(0, -intradayMarginLevel);
	const remainingSettledCash = settled - totalExposure;
	const deMinimisLimit = Math.min(equity * FINRA_DE_MINIMIS_PCT, FINRA_DE_MINIMIS_CAP_USD);

	const maxDollarRiskAllowed =
		(input.accountMode === 'cash' ? Math.min(equity || settled, settled || equity) : equity) *
		(riskPct / 100);
	const dollarRiskPerUnit = costPerUnit * (stopPct / 100);
	const safeMaxUnits =
		dollarRiskPerUnit > 0 ? Math.max(0, Math.floor(maxDollarRiskAllowed / dollarRiskPerUnit)) : 0;

	let status: IntradayMarginStatus;

	if (input.accountMode === 'cash') {
		status =
			totalExposure <= settled
				? {
						code: 'SAFE',
						label: 'T+1 Settled Cash Compliant',
						detail:
							'Position fits strictly inside settled cash — zero Good Faith Violation (GFV) or margin deficit restriction risk.'
					}
				: {
						code: 'BLOCK',
						label: 'Exceeds Settled Cash (GFV Warning)',
						detail:
							'Closing an options or equity position bought with unsettled funds before T+1 settlement triggers a Good Faith Violation. Reduce contract count or trade settled cash only.'
					};
	} else if (equity < FINRA_MARGIN_EQUITY_FLOOR) {
		status = {
			code: 'BLOCK',
			label: 'Below $2,000 FINRA Margin Minimum',
			detail:
				'While FINRA Notice 26-10 eliminated the $25,000 PDT rule effective June 4, 2026, FINRA Rule 4210 retains the $2,000 minimum equity floor for margin accounts. Switch to a T+1 Cash Account below $2,000.'
		};
	} else if (intradayMarginDeficit === 0) {
		status = {
			code: 'SAFE',
			label: 'Positive Intraday Margin Level (IML) — Compliant',
			detail:
				'Account equity covers the full intraday maintenance requirement with zero Intraday Margin Deficit under amended FINRA Rule 4210(d)(2).'
		};
	} else if (intradayMarginDeficit <= deMinimisLimit) {
		status = {
			code: 'WARN',
			label: 'Intraday Deficit Within De Minimis Cap',
			detail: `Deficit ($${intradayMarginDeficit.toFixed(0)}) sits within your $${deMinimisLimit.toFixed(0)} de minimis threshold (lesser of 5% equity or $1,000), though broker house pre-trade controls may still block order entry.`
		};
	} else {
		status = {
			code: 'BLOCK',
			label: '90-Day Restriction Risk — Actionable Intraday Margin Deficit',
			detail: `Deficit ($${intradayMarginDeficit.toFixed(0)}) exceeds FINRA's $${deMinimisLimit.toFixed(0)} de minimis cap. Unsatisfied deficits remain open through the ${FINRA_DEFICIT_WINDOW_BUSINESS_DAYS}th business day; repeated failures to satisfy promptly can trigger a ${FINRA_RESTRICTION_DAYS}-day margin restriction.`
		};
	}

	return {
		unitMultiplier,
		costPerUnit,
		totalExposure,
		intradayMaintenanceRequired,
		intradayMarginLevel,
		intradayMarginDeficit,
		remainingSettledCash,
		deMinimisLimit,
		maxDollarRiskAllowed,
		dollarRiskPerUnit,
		safeMaxUnits,
		status
	};
}
