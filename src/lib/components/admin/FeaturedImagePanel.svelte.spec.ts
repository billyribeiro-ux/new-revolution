import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import FeaturedImagePanel from './FeaturedImagePanel.svelte';

// 1x1 transparent GIF so the preview really loads without a network.
const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

describe('FeaturedImagePanel', () => {
	it('shows only the choose button when there is no cover', async () => {
		const onPick = vi.fn();
		render(FeaturedImagePanel, {
			coverImage: '',
			coverImageAlt: '',
			coverImageCaption: '',
			onPick
		});
		await page.getByRole('button', { name: 'Choose from Media Library' }).click();
		expect(onPick).toHaveBeenCalledOnce();
		expect(document.querySelector('img')).toBeNull();
	});

	it('previews the saved URL with its real dimensions and flags missing alt as required', async () => {
		render(FeaturedImagePanel, {
			coverImage: PIXEL,
			coverImageAlt: '',
			coverImageCaption: '',
			dimensions: { width: 1200, height: 675 },
			onPick: () => {}
		});
		const img = document.querySelector('img') as HTMLImageElement;
		expect(img.getAttribute('src')).toBe(PIXEL);
		expect(img.style.aspectRatio.replace(/\s/g, '')).toBe('1200/675');
		await expect
			.element(page.getByTestId('featured-image-dimensions'))
			.toHaveTextContent('1200 × 675 px');
		await expect.element(page.getByText('Required: add alt text to publish')).toBeVisible();
		await expect.element(page.getByLabelText(/Alt Text/)).toHaveAttribute('aria-invalid', 'true');
	});

	it('does not claim a dimension it does not know', async () => {
		render(FeaturedImagePanel, {
			coverImage: PIXEL,
			coverImageAlt: 'A chart',
			coverImageCaption: '',
			dimensions: null
		});
		expect(document.querySelector('[data-testid="featured-image-dimensions"]')).toBeNull();
		expect(document.body.textContent).not.toContain('Required: add alt text');
	});

	it('Remove clears url, alt and caption', async () => {
		const onChange = vi.fn();
		render(FeaturedImagePanel, {
			coverImage: PIXEL,
			coverImageAlt: 'A chart',
			coverImageCaption: 'Cap',
			onChange
		});
		await page.getByRole('button', { name: 'Remove' }).click();
		expect(document.querySelector('img')).toBeNull();
		await expect.element(page.getByLabelText('Cover Image URL')).toHaveValue('');
		await expect.element(page.getByLabelText(/Alt Text/)).toHaveValue('');
		expect(onChange).toHaveBeenCalled();
	});

	it('says so, loudly, when the saved URL does not load', async () => {
		render(FeaturedImagePanel, {
			coverImage: 'http://localhost:9/definitely-missing.webp',
			coverImageAlt: 'x',
			coverImageCaption: ''
		});
		const alert = page.getByRole('alert');
		await expect.element(alert).toBeVisible();
		expect(alert.element().textContent).toContain('could not be loaded');
	});
});
