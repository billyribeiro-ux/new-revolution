import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import ImageControlMenu from './ImageControlMenu.svelte';

let anchor: HTMLImageElement;

async function mount(overrides: Record<string, unknown> = {}) {
	anchor = document.createElement('img');
	anchor.width = 300;
	anchor.height = 100;
	document.body.append(anchor);
	const callbacks = {
		onAlign: vi.fn(),
		onWidth: vi.fn(),
		onEditDetails: vi.fn(),
		onReplace: vi.fn(),
		onRemove: vi.fn(),
		onEscape: vi.fn()
	};
	const view = await render(ImageControlMenu, {
		props: {
			visible: true,
			x: 200,
			y: 200,
			anchor,
			alignment: null,
			width: 480,
			alt: 'Existing description',
			title: 'Existing title',
			caption: 'Existing caption',
			...callbacks,
			...overrides
		}
	});
	return { view, ...callbacks };
}

afterEach(() => {
	anchor?.remove();
});

describe('ImageControlMenu', () => {
	it('is an accessible labelled toolbar with grouped, pressed-state buttons', async () => {
		await mount({ alignment: 'center' });
		await expect.element(page.getByRole('toolbar', { name: 'Image controls' })).toBeVisible();
		await expect.element(page.getByRole('group', { name: 'Alignment' })).toBeVisible();
		await expect.element(page.getByRole('group', { name: 'Width' })).toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Center', exact: true }))
			.toHaveAttribute('aria-pressed', 'true');
		await expect
			.element(page.getByRole('button', { name: 'Width 25%' }))
			.toHaveAttribute('aria-pressed', 'false');
	});

	it('reports every alignment (including Full width) and every width preset', async () => {
		const { onAlign, onWidth } = await mount();
		for (const [label, value] of [
			['Left', 'left'],
			['Center', 'center'],
			['Right', 'right'],
			['Full width', 'full'],
			['No align', null]
		] as const) {
			await page.getByRole('button', { name: label, exact: true }).click();
			expect(onAlign).toHaveBeenLastCalledWith(value);
		}
		await page.getByRole('button', { name: 'Width 25%' }).click();
		expect(onWidth).toHaveBeenLastCalledWith(expect.objectContaining({ label: '25%', px: 320 }));
		await page.getByRole('button', { name: 'Width 100%' }).click();
		expect(onWidth).toHaveBeenLastCalledWith(expect.objectContaining({ label: '100%', px: null }));
	});

	it('marks the active width preset', async () => {
		await mount({ width: 480 });
		await expect
			.element(page.getByRole('button', { name: 'Width 50%' }))
			.toHaveAttribute('aria-pressed', 'true');
		await expect
			.element(page.getByRole('button', { name: 'Width 100%' }))
			.toHaveAttribute('aria-pressed', 'false');
	});

	it('keeps the editor selection on mousedown over the buttons', async () => {
		await mount();
		const left = page.getByRole('button', { name: 'Left', exact: true }).element();
		const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
		left.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);
	});

	it('edits alt, title and caption and saves trimmed values; Escape cancels', async () => {
		const { onEditDetails } = await mount();
		await page.getByRole('button', { name: 'Alt', exact: true }).click();
		const alt = page.getByLabelText(/Alt text/);
		await expect.element(alt).toHaveValue('Existing description');
		await alt.fill('  New description  ');
		await page.getByLabelText(/Title/).fill('  New title  ');
		await page.getByLabelText(/Caption/).fill(' New caption ');
		await page.getByRole('button', { name: 'Save', exact: true }).click();
		expect(onEditDetails).toHaveBeenCalledExactlyOnceWith({
			alt: 'New description',
			title: 'New title',
			caption: 'New caption'
		});
		await page.getByRole('button', { name: 'Alt', exact: true }).click();
		await page.getByLabelText(/Title/).click();
		await page
			.getByLabelText(/Title/)
			.element()
			.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
			);
		expect(document.querySelector('.menu-editor')).toBeNull();
		expect(onEditDetails).toHaveBeenCalledOnce();
	});

	it('flags a missing alt with an "Add alt text" button and opens the editor from it', async () => {
		await mount({ alt: '' });
		const button = page.getByRole('button', { name: 'Add alt text' });
		await expect.element(button).toBeVisible();
		await button.click();
		await expect.element(page.getByLabelText(/Alt text/)).toHaveValue('');
	});

	it('opens the alt editor when the editor chip requests it', async () => {
		const { view } = await mount({ alt: '' });
		await view.rerender({ altEditRequest: 1 });
		await expect.element(page.getByLabelText(/Alt text/)).toBeVisible();
	});

	it('calls Replace and Remove', async () => {
		const { onReplace, onRemove } = await mount();
		await page.getByRole('button', { name: 'Replace' }).click();
		await page.getByRole('button', { name: 'Remove' }).click();
		expect(onReplace).toHaveBeenCalledOnce();
		expect(onRemove).toHaveBeenCalledOnce();
	});

	it('hands focus back to the editor on Escape from a button', async () => {
		const { onEscape } = await mount();
		const button = page.getByRole('button', { name: 'Replace' }).element() as HTMLElement;
		button.focus();
		button.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
		);
		expect(onEscape).toHaveBeenCalledOnce();
	});

	it('Escape does not reach the window-level editor shortcut (which would leave the post editor)', async () => {
		await mount();
		const windowKeydown = vi.fn();
		window.addEventListener('keydown', windowKeydown);
		const button = page.getByRole('button', { name: 'Replace' }).element() as HTMLElement;
		button.focus();
		button.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
		);
		window.removeEventListener('keydown', windowKeydown);
		expect(windowKeydown).not.toHaveBeenCalled();
	});

	it('drops drafts when the selected image changes (never saves A onto B)', async () => {
		const { view, onEditDetails } = await mount();
		await page.getByRole('button', { name: 'Alt', exact: true }).click();
		await page.getByLabelText(/Alt text/).fill('Typed for image A');
		const other = document.createElement('img');
		document.body.append(other);
		await view.rerender({ anchor: other, alt: 'Image B', title: '', caption: '' });
		expect(document.querySelector('.menu-editor')).toBeNull();
		await page.getByRole('button', { name: 'Alt', exact: true }).click();
		await expect.element(page.getByLabelText(/Alt text/)).toHaveValue('Image B');
		await page.getByRole('button', { name: 'Save', exact: true }).click();
		expect(onEditDetails).toHaveBeenCalledExactlyOnceWith({
			alt: 'Image B',
			title: '',
			caption: ''
		});
		other.remove();
	});

	it('stays on screen: positioned inside the viewport and hidden when not visible', async () => {
		const { view } = await mount();
		const menu = page.getByTestId('image-control-menu').element() as HTMLElement;
		const rect = menu.getBoundingClientRect();
		expect(rect.left).toBeGreaterThanOrEqual(0);
		expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
		expect(rect.top).toBeGreaterThanOrEqual(0);
		await view.rerender({ visible: false });
		expect(getComputedStyle(menu).display).toBe('none');
	});
});
