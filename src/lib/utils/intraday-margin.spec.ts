import { describe, expect, it } from 'vite-plus/test';
import { calculateIntradayMargin } from './intraday-margin.ts';

describe('calculateIntradayMargin (FINRA Notice 26-10 / Amended Rule 4210(d)(2))', () => {
	it('returns SAFE when margin account >= $2,000 has positive Intraday Margin Level (IML)', () => {
		const res = calculateIntradayMargin({
			accountMode: 'margin',
			structure: 'long_option_0dte',
			accountEquity: 3500,
			settledCash: 3500,
			contractOrSharePrice: 2.4,
			spreadWidth: 5,
			plannedQuantity: 2,
			maintenancePct: 25,
			stopLossPct: 25,
			maxAccountRiskPct: 2
		});

		expect(res.totalExposure).toBeCloseTo(480, 2);
		expect(res.intradayMaintenanceRequired).toBeCloseTo(480, 2);
		expect(res.intradayMarginLevel).toBeCloseTo(3020, 2);
		expect(res.intradayMarginDeficit).toBe(0);
		expect(res.deMinimisLimit).toBeCloseTo(175, 2);
		expect(res.safeMaxUnits).toBe(1); // $70 max risk / ($240 * 25% = $60) = 1 contract
		expect(res.status.code).toBe('SAFE');
	});

	it('blocks margin accounts below the $2,000 FINRA Rule 4210 baseline floor', () => {
		const res = calculateIntradayMargin({
			accountMode: 'margin',
			structure: 'long_option_0dte',
			accountEquity: 1500,
			settledCash: 1500,
			contractOrSharePrice: 1.5,
			spreadWidth: 5,
			plannedQuantity: 1,
			maintenancePct: 25,
			stopLossPct: 25,
			maxAccountRiskPct: 2
		});

		expect(res.status.code).toBe('BLOCK');
		expect(res.status.label).toContain('Below $2,000');
	});

	it('distinguishes WARN within de minimis (min(5% equity, $1,000)) from BLOCK above de minimis', () => {
		// $10,000 equity -> de minimis = $500. 42 shares @ $1,000 = $42,000 exposure * 25% = $10,500 maintenance -> $500 deficit (WARN)
		const warnRes = calculateIntradayMargin({
			accountMode: 'margin',
			structure: 'margin_equity',
			accountEquity: 10000,
			settledCash: 10000,
			contractOrSharePrice: 1000,
			spreadWidth: 5,
			plannedQuantity: 42,
			maintenancePct: 25,
			stopLossPct: 10,
			maxAccountRiskPct: 2
		});
		expect(warnRes.deMinimisLimit).toBe(500);
		expect(warnRes.intradayMarginDeficit).toBe(500);
		expect(warnRes.status.code).toBe('WARN');

		// $30,000 equity -> 5% is $1,500, capped at $1,000! 125 shares @ $1,000 * 25% = $31,250 -> $1,250 deficit > $1,000 cap (BLOCK)
		const blockRes = calculateIntradayMargin({
			accountMode: 'margin',
			structure: 'margin_equity',
			accountEquity: 30000,
			settledCash: 30000,
			contractOrSharePrice: 1000,
			spreadWidth: 5,
			plannedQuantity: 125,
			maintenancePct: 25,
			stopLossPct: 10,
			maxAccountRiskPct: 2
		});
		expect(blockRes.deMinimisLimit).toBe(1000);
		expect(blockRes.intradayMarginDeficit).toBe(1250);
		expect(blockRes.status.code).toBe('BLOCK');
		expect(blockRes.status.detail).toContain('15th business day');
		expect(blockRes.status.detail).toContain('90-day');
	});

	it('validates T+1 settled cash compliance and Good Faith Violation (GFV) blocks for $500+ cash accounts', () => {
		const safeCash = calculateIntradayMargin({
			accountMode: 'cash',
			structure: 'long_option_0dte',
			accountEquity: 750,
			settledCash: 600,
			contractOrSharePrice: 2.5,
			spreadWidth: 5,
			plannedQuantity: 2,
			maintenancePct: 25,
			stopLossPct: 20,
			maxAccountRiskPct: 2
		});
		expect(safeCash.totalExposure).toBe(500);
		expect(safeCash.remainingSettledCash).toBe(100);
		expect(safeCash.status.code).toBe('SAFE');

		const gfvBlock = calculateIntradayMargin({
			accountMode: 'cash',
			structure: 'long_option_0dte',
			accountEquity: 750,
			settledCash: 400,
			contractOrSharePrice: 2.5,
			spreadWidth: 5,
			plannedQuantity: 2,
			maintenancePct: 25,
			stopLossPct: 20,
			maxAccountRiskPct: 2
		});
		expect(gfvBlock.status.code).toBe('BLOCK');
		expect(gfvBlock.status.label).toContain('GFV');
	});
});
