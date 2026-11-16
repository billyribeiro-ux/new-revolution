import { describe, expect, it } from 'vite-plus/test';
import { blackScholesLeg, calculateOptionsScenario, normalCdf } from './options-calculator.ts';

describe('options-calculator Black-Scholes & asymmetric risk engine', () => {
	it('satisfies standard normal symmetry and put-call parity within floating-point precision', () => {
		expect(normalCdf(0)).toBeCloseTo(0.5, 6);
		expect(normalCdf(1.96) + normalCdf(-1.96)).toBeCloseTo(1, 6);

		const S = 5800;
		const K = 5800;
		const T = 30 / 365;
		const sigma = 0.16;
		const r = 0.045;

		const call = blackScholesLeg(true, S, K, T, sigma, r);
		const put = blackScholesLeg(false, S, K, T, sigma, r);
		// Put-Call Parity: C - P = S - K * exp(-rT)
		expect(call.theoreticalPrice - put.theoreticalPrice).toBeCloseTo(S - K * Math.exp(-r * T), 2);
		expect(call.delta - put.delta).toBeCloseTo(1, 5);
		expect(call.gamma).toBeCloseTo(put.gamma, 6);
	});

	it('computes bounded max profit, max loss, breakeven, and R-multiple on vertical debit spreads', () => {
		const res = calculateOptionsScenario({
			strategy: 'bull_call_spread',
			spotPrice: 5850,
			primaryStrike: 5850,
			hedgeStrike: 5860,
			daysToExpiration: 3,
			impliedVolatilityPct: 15,
			riskFreeRatePct: 4.25,
			contracts: 2,
			entryPriceOverride: 4.0,
			accountEquity: 2500,
			maxRiskPct: 2,
			stopLossPct: 25
		});

		expect(res.unitDebit).toBe(4.0);
		expect(res.breakevenPrice).toBe(5854);
		expect(res.maxLossUsd).toBe(800); // $4.00 * 100 * 2
		expect(res.maxProfitUsd).toBe(1200); // ($10 - $4) * 100 * 2
		expect(res.rewardToRiskRatio).toBe(1.5);
		expect(res.samples).toHaveLength(33);
	});

	it('models 0DTE intraday theta decay and small-account contract limits', () => {
		const res = calculateOptionsScenario({
			strategy: 'long_put',
			spotPrice: 580,
			primaryStrike: 580,
			hedgeStrike: 575,
			daysToExpiration: 0,
			impliedVolatilityPct: 18,
			riskFreeRatePct: 4.25,
			contracts: 1,
			entryPriceOverride: 1.6,
			accountEquity: 1000,
			maxRiskPct: 2,
			stopLossPct: 25
		});

		expect(res.greeks.delta).toBeLessThan(0);
		expect(res.greeks.thetaPerDay).toBeLessThan(0);
		expect(res.stopLossUsd).toBe(40); // $160 * 25% = $40
		expect(res.maxAccountRiskUsd).toBe(20); // $1,000 * 2% = $20 -> 0 full contracts recommended at $1.60
		expect(res.recommendedMaxContracts).toBe(0);
	});
});
