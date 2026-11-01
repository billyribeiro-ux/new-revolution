import { describe, expect, it } from 'vitest';
import { isNonProductionHost } from './hooks.server';

describe('isNonProductionHost (IDX-09)', () => {
	it('flags preview and staging hosts', () => {
		expect(isNonProductionHost('my-app-git-x.vercel.app')).toBe(true);
		expect(isNonProductionHost('staging.revolutiontradingpros.com')).toBe(true);
		expect(isNonProductionHost('preview.revolutiontradingpros.com')).toBe(true);
	});

	it('leaves the production host alone', () => {
		expect(isNonProductionHost('revolutiontradingpros.com')).toBe(false);
	});
});
