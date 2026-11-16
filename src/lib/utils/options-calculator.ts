/**
 * Deterministic Black-Scholes Options Pricing, Analytical Greeks & Asymmetric Payoff Engine.
 *
 * Pure client/server TypeScript utility (zero DOM, zero external packages) powering
 * `/resources/options-calculator` with SSR-safe SVG payoff curve coordinates.
 */

export type OptionStrategyKind = 'long_call' | 'long_put' | 'bull_call_spread' | 'bear_put_spread';

export interface OptionsCalculatorInput {
	strategy: OptionStrategyKind;
	spotPrice: number;
	primaryStrike: number;
	hedgeStrike: number;
	daysToExpiration: number;
	impliedVolatilityPct: number;
	riskFreeRatePct: number;
	contracts: number;
	entryPriceOverride?: number | null;
	accountEquity: number;
	maxRiskPct: number;
	stopLossPct: number;
}

export interface OptionGreeks {
	theoreticalPrice: number;
	delta: number;
	gamma: number;
	thetaPerDay: number;
	vegaPerPct: number;
}

export interface PayoffSample {
	underlyingPrice: number;
	expirationPnl: number;
	midLifePnl: number;
}

export interface OptionsCalculatorResult {
	unitDebit: number;
	totalCommittedCapital: number;
	breakevenPrice: number;
	maxProfitUsd: number | null; // null = uncapped upside (long call)
	maxLossUsd: number;
	rewardToRiskRatio: number | null;
	greeks: OptionGreeks;
	stopLossUsd: number;
	maxAccountRiskUsd: number;
	recommendedMaxContracts: number;
	samples: readonly PayoffSample[];
}

const SQRT_2PI = Math.sqrt(2 * Math.PI);

function normalPdf(x: number): number {
	return Math.exp(-0.5 * x * x) / SQRT_2PI;
}

/** Abramowitz & Stegun 7.1.26 cumulative standard normal approximation (error < 7.5e-8). */
export function normalCdf(x: number): number {
	const sign = x < 0 ? -1 : 1;
	const absX = Math.abs(x) / Math.sqrt(2);
	const t = 1 / (1 + 0.3275911 * absX);
	const erf =
		1 -
		((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
			t *
			Math.exp(-absX * absX);
	return 0.5 * (1 + sign * erf);
}

export function blackScholesLeg(
	isCall: boolean,
	spot: number,
	strike: number,
	yearsToExp: number,
	sigma: number,
	rate: number
): OptionGreeks {
	const S = Math.max(0.01, spot);
	const K = Math.max(0.01, strike);
	const r = Math.max(0, rate);
	const v = Math.max(0.01, sigma);

	if (yearsToExp <= 1e-6) {
		const intrinsic = isCall ? Math.max(0, S - K) : Math.max(0, K - S);
		const delta = isCall ? (S > K ? 1 : S < K ? 0 : 0.5) : S < K ? -1 : S > K ? 0 : -0.5;
		return {
			theoreticalPrice: intrinsic,
			delta,
			gamma: 0,
			thetaPerDay: 0,
			vegaPerPct: 0
		};
	}

	const sqrtT = Math.sqrt(yearsToExp);
	const d1 = (Math.log(S / K) + (r + 0.5 * v * v) * yearsToExp) / (v * sqrtT);
	const d2 = d1 - v * sqrtT;
	const nd1 = normalPdf(d1);
	const discK = K * Math.exp(-r * yearsToExp);

	const theoreticalPrice = isCall
		? S * normalCdf(d1) - discK * normalCdf(d2)
		: discK * normalCdf(-d2) - S * normalCdf(-d1);

	const delta = isCall ? normalCdf(d1) : normalCdf(d1) - 1;
	const gamma = nd1 / (S * v * sqrtT);
	const annualTheta = isCall
		? -(S * nd1 * v) / (2 * sqrtT) - r * discK * normalCdf(d2)
		: -(S * nd1 * v) / (2 * sqrtT) + r * discK * normalCdf(-d2);
	const thetaPerDay = annualTheta / 365;
	const vegaPerPct = (S * nd1 * sqrtT) / 100;

	return {
		theoreticalPrice: Math.max(0, theoreticalPrice),
		delta,
		gamma,
		thetaPerDay,
		vegaPerPct
	};
}

function positionValueAt(
	strategy: OptionStrategyKind,
	spot: number,
	k1: number,
	k2: number,
	yearsToExp: number,
	sigma: number,
	rate: number
): OptionGreeks {
	if (strategy === 'long_call') {
		return blackScholesLeg(true, spot, k1, yearsToExp, sigma, rate);
	}
	if (strategy === 'long_put') {
		return blackScholesLeg(false, spot, k1, yearsToExp, sigma, rate);
	}
	if (strategy === 'bull_call_spread') {
		const lower = Math.min(k1, k2);
		const upper = Math.max(lower + 1, Math.max(k1, k2));
		const longLeg = blackScholesLeg(true, spot, lower, yearsToExp, sigma, rate);
		const shortLeg = blackScholesLeg(true, spot, upper, yearsToExp, sigma, rate);
		return {
			theoreticalPrice: Math.max(0, longLeg.theoreticalPrice - shortLeg.theoreticalPrice),
			delta: longLeg.delta - shortLeg.delta,
			gamma: longLeg.gamma - shortLeg.gamma,
			thetaPerDay: longLeg.thetaPerDay - shortLeg.thetaPerDay,
			vegaPerPct: longLeg.vegaPerPct - shortLeg.vegaPerPct
		};
	}
	// bear_put_spread
	const upper = Math.max(k1, k2);
	const lower = Math.min(upper - 1, Math.min(k1, k2));
	const longLeg = blackScholesLeg(false, spot, upper, yearsToExp, sigma, rate);
	const shortLeg = blackScholesLeg(false, spot, lower, yearsToExp, sigma, rate);
	return {
		theoreticalPrice: Math.max(0, longLeg.theoreticalPrice - shortLeg.theoreticalPrice),
		delta: longLeg.delta - shortLeg.delta,
		gamma: longLeg.gamma - shortLeg.gamma,
		thetaPerDay: longLeg.thetaPerDay - shortLeg.thetaPerDay,
		vegaPerPct: longLeg.vegaPerPct - shortLeg.vegaPerPct
	};
}

export function calculateOptionsScenario(input: OptionsCalculatorInput): OptionsCalculatorResult {
	const spot = Math.max(1, input.spotPrice || 100);
	const k1 = Math.max(1, input.primaryStrike || spot);
	const k2 = Math.max(1, input.hedgeStrike || spot + 5);
	// Treat 0DTE intraday as ~0.5 trading session (~0.0015 yr) so Greeks reflect live intraday convexity
	const dteDays = Math.max(0, input.daysToExpiration);
	const yearsToExp = dteDays === 0 ? 0.4 / 365 : dteDays / 365;
	const sigma = Math.min(3, Math.max(0.05, (input.impliedVolatilityPct || 20) / 100));
	const rate = Math.min(0.2, Math.max(0, (input.riskFreeRatePct ?? 4.25) / 100));
	const contracts = Math.max(1, Math.floor(input.contracts || 1));
	const equity = Math.max(100, input.accountEquity || 2500);
	const maxRiskPct = Math.min(25, Math.max(0.25, input.maxRiskPct || 2));
	const stopPct = Math.min(100, Math.max(5, input.stopLossPct || 30));

	const greeks = positionValueAt(input.strategy, spot, k1, k2, yearsToExp, sigma, rate);
	const rawDebit =
		input.entryPriceOverride && input.entryPriceOverride > 0
			? input.entryPriceOverride
			: Math.max(0.05, Number(greeks.theoreticalPrice.toFixed(2)));

	let width = 0;
	let breakevenPrice: number;
	let maxProfitUsd: number | null;

	if (input.strategy === 'long_call') {
		breakevenPrice = k1 + rawDebit;
		maxProfitUsd = null;
	} else if (input.strategy === 'long_put') {
		breakevenPrice = Math.max(0, k1 - rawDebit);
		maxProfitUsd = Math.max(0, (k1 - rawDebit) * 100 * contracts);
	} else if (input.strategy === 'bull_call_spread') {
		const lower = Math.min(k1, k2);
		const upper = Math.max(lower + 1, Math.max(k1, k2));
		width = upper - lower;
		const cappedDebit = Math.min(rawDebit, width - 0.05);
		breakevenPrice = lower + cappedDebit;
		maxProfitUsd = Math.max(0, (width - cappedDebit) * 100 * contracts);
	} else {
		const upper = Math.max(k1, k2);
		const lower = Math.min(upper - 1, Math.min(k1, k2));
		width = upper - lower;
		const cappedDebit = Math.min(rawDebit, width - 0.05);
		breakevenPrice = upper - cappedDebit;
		maxProfitUsd = Math.max(0, (width - cappedDebit) * 100 * contracts);
	}

	const unitDebit = width > 0 ? Math.min(rawDebit, width - 0.05) : rawDebit;
	const maxLossUsd = unitDebit * 100 * contracts;
	const totalCommittedCapital = maxLossUsd;
	const rewardToRiskRatio =
		maxProfitUsd !== null && maxLossUsd > 0 ? maxProfitUsd / maxLossUsd : null;

	const maxAccountRiskUsd = equity * (maxRiskPct / 100);
	const riskPerContractAtStop = unitDebit * 100 * (stopPct / 100);
	const stopLossUsd = riskPerContractAtStop * contracts;
	const recommendedMaxContracts =
		riskPerContractAtStop > 0
			? Math.max(0, Math.floor(maxAccountRiskUsd / riskPerContractAtStop))
			: 0;

	const rangeSpan = Math.max(
		spot * Math.max(0.03, sigma * Math.sqrt(Math.max(yearsToExp, 2 / 365)) * 2.2),
		10
	);
	const minPrice = Math.max(1, spot - rangeSpan);
	const maxPrice = spot + rangeSpan;
	const steps = 32;
	const samples: PayoffSample[] = [];
	for (let i = 0; i <= steps; i++) {
		const px = minPrice + ((maxPrice - minPrice) * i) / steps;
		const expVal = positionValueAt(input.strategy, px, k1, k2, 0, sigma, rate).theoreticalPrice;
		const midVal = positionValueAt(
			input.strategy,
			px,
			k1,
			k2,
			yearsToExp * 0.5,
			sigma,
			rate
		).theoreticalPrice;
		samples.push({
			underlyingPrice: Number(px.toFixed(2)),
			expirationPnl: Number(((expVal - unitDebit) * 100 * contracts).toFixed(2)),
			midLifePnl: Number(((midVal - unitDebit) * 100 * contracts).toFixed(2))
		});
	}

	return {
		unitDebit,
		totalCommittedCapital,
		breakevenPrice: Number(breakevenPrice.toFixed(2)),
		maxProfitUsd: maxProfitUsd !== null ? Number(maxProfitUsd.toFixed(2)) : null,
		maxLossUsd: Number(maxLossUsd.toFixed(2)),
		rewardToRiskRatio: rewardToRiskRatio !== null ? Number(rewardToRiskRatio.toFixed(2)) : null,
		greeks,
		stopLossUsd: Number(stopLossUsd.toFixed(2)),
		maxAccountRiskUsd: Number(maxAccountRiskUsd.toFixed(2)),
		recommendedMaxContracts,
		samples
	};
}
