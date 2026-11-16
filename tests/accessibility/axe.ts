import axe, { type AxeResults } from 'axe-core';
import type { Page } from 'playwright';

declare global {
	interface Window {
		axe: typeof axe;
	}
}

/** Actual axe results, including incomplete checks that require human review. */
export async function auditAccessibility(page: Page): Promise<AxeResults> {
	await page.addScriptTag({ content: axe.source });
	return page.evaluate(async () => {
		return window.axe.run(document, {
			runOnly: {
				type: 'tag',
				values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
			}
		});
	});
}
