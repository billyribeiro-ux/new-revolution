import { page } from 'vite-plus/test/browser';
import { describe, expect, it } from 'vite-plus/test';
import { render } from 'vitest-browser-svelte';
import TableOfContentsPanel from './TableOfContentsPanel.svelte';

describe('TableOfContentsPanel (Admin Post Editor)', () => {
	it('renders empty state when post content has no headings', async () => {
		await render(TableOfContentsPanel, {
			content: '<p>Just a paragraph with no headings.</p>',
			enableToc: true
		});

		await expect.element(page.getByText('Show TOC on Post')).toBeVisible();
		await expect
			.element(
				page.getByText('Add headings (H2, H3...) to your post to generate a table of contents.')
			)
			.toBeVisible();
	});

	it('extracts H2–H3 headings, displays count badge, and toggles Show TOC on Post', async () => {
		await render(TableOfContentsPanel, {
			content: '<h2>Market Structure</h2><h3>Gamma Flip Zone</h3><h2>Execution Blueprint</h2>',
			enableToc: true
		});

		await expect.element(page.getByText('3 headings')).toBeVisible();
		await expect.element(page.getByText('Market Structure')).toBeVisible();
		await expect.element(page.getByText('Gamma Flip Zone')).toBeVisible();
		await expect.element(page.getByText('Execution Blueprint')).toBeVisible();

		const checkbox = page.getByRole('checkbox', { name: /Show TOC on Post/i });
		await expect.element(checkbox).toBeChecked();
		await checkbox.click();
		await expect.element(checkbox).not.toBeChecked();
	});
});
