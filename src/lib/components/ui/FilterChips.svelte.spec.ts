import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FilterChips from './FilterChips.svelte';

const options = [
	{ id: 'all', label: 'All' },
	{ id: 'a', label: 'Alpha' },
	{ id: 'b', label: 'Beta' }
] as const;

describe('FilterChips', () => {
	it('is a named group of toggle buttons (not a tablist) with the bound value pressed', async () => {
		render(FilterChips, { options, value: 'all', label: 'Filter things' } as never);

		await expect.element(page.getByRole('group', { name: 'Filter things' })).toBeInTheDocument();
		expect(document.querySelector('[role="tablist"], [role="tab"]')).toBeNull();
		await expect
			.element(page.getByRole('button', { name: 'All' }))
			.toHaveAttribute('aria-pressed', 'true');
		await expect
			.element(page.getByRole('button', { name: 'Alpha' }))
			.toHaveAttribute('aria-pressed', 'false');
	});

	it('moves the pressed state to the clicked option and keeps exactly one pressed', async () => {
		render(FilterChips, { options, value: 'all', label: 'Filter things' } as never);

		await page.getByRole('button', { name: 'Beta' }).click();
		await expect
			.element(page.getByRole('button', { name: 'Beta' }))
			.toHaveAttribute('aria-pressed', 'true');
		expect(document.querySelectorAll('[aria-pressed="true"]').length).toBe(1);
	});
});
