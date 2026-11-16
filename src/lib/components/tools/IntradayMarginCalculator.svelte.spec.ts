import { page } from 'vite-plus/test/browser';
import { describe, expect, it } from 'vite-plus/test';
import { render } from 'vitest-browser-svelte';
import '../../../app.css';
import IntradayMarginCalculator from './IntradayMarginCalculator.svelte';

describe('IntradayMarginCalculator.svelte', () => {
	it('toggles cleanly between Margin ($2,000+ Floor) and Cash ($500+ T+1) modes', async () => {
		await page.viewport(1280, 900);
		await render(IntradayMarginCalculator, { headingLevel: 'h2' });

		await expect
			.element(
				page.getByRole('heading', {
					level: 2,
					name: /FINRA 2026 Intraday Margin & Asymmetric Position Sizer/i
				})
			)
			.toBeInTheDocument();

		await page.getByRole('button', { name: /Cash Account \(\$500\+ T\+1\)/i }).click();
		await expect.element(page.getByText(/T\+1 Settled Cash Compliant/i)).toBeInTheDocument();
	});
});
