import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import RichTextEditor from './RichTextEditor.svelte';

type Payload = {
	url: string;
	alt: string;
	width?: number | null;
	height?: number | null;
	caption?: string;
	size?: string;
	align?: string;
	linkUrl?: string;
	mediaId?: string;
};

const IMG = 'http://localhost:9/missing-1200w.webp';

async function mountEditor(content: string) {
	const html: string[] = [];
	let deliver: ((payload: Payload) => void) | undefined;
	const onOpenMediaPicker = vi.fn((cb: (payload: Payload) => void) => {
		deliver = cb;
	});
	await render(RichTextEditor, {
		props: {
			content,
			onChange: (value: string) => html.push(value),
			onOpenMediaPicker
		}
	});
	return {
		html,
		last: () => html.at(-1) ?? '',
		onOpenMediaPicker,
		deliver: (payload: Payload) => deliver?.(payload)
	};
}

afterEach(() => {
	document.body.replaceChildren();
});

describe('RichTextEditor image handling', () => {
	it('inserting from the picker keeps an empty alt empty (no invented "Article image") and applies Full Width', async () => {
		const ed = await mountEditor('<p>Intro</p>');
		await page.getByRole('button', { name: 'Image', exact: true }).click();
		expect(ed.onOpenMediaPicker).toHaveBeenCalledOnce();
		ed.deliver({
			url: IMG,
			alt: '',
			width: 1200,
			height: 675,
			size: 'large',
			align: 'full',
			mediaId: 'm1'
		});
		await vi.waitFor(() => expect(ed.last()).toContain('<img'));
		const out = ed.last();
		expect(out).toContain('alt=""');
		expect(out).not.toContain('Article image');
		expect(out).toContain('data-align="full"');
		expect(out).toContain('width="1200"');
		expect(out).toContain('height="675"');
		expect(out).toContain('data-media-id="m1"');
		// the missing-alt chip is visible on the image
		await expect
			.element(page.getByRole('button', { name: /Add alt text: this image/ }))
			.toBeVisible();
	});

	it('shows the Add alt text chip, which selects the image and opens the alt editor', async () => {
		await mountEditor(`<p>Intro</p><img src="${IMG}" width="1200" height="675">`);
		await page.getByRole('button', { name: /Add alt text: this image/ }).click();
		await expect.element(page.getByRole('toolbar', { name: 'Image controls' })).toBeVisible();
		await expect.element(page.getByLabelText(/Alt text/)).toBeVisible();
	});

	it('width presets update width AND height together (aspect ratio preserved)', async () => {
		const ed = await mountEditor(
			`<p>Intro</p><img src="${IMG}" alt="Chart" width="1200" height="675">`
		);
		await page
			.elementLocator(document.querySelector('.ProseMirror img') as HTMLImageElement)
			.click();
		await expect.element(page.getByRole('toolbar', { name: 'Image controls' })).toBeVisible();
		await page.getByRole('button', { name: 'Width 50%' }).click();
		await vi.waitFor(() => expect(ed.last()).toContain('width="480"'));
		expect(ed.last()).toContain('height="270"');
		await page.getByRole('button', { name: 'Width 25%' }).click();
		await vi.waitFor(() => expect(ed.last()).toContain('width="320"'));
		expect(ed.last()).toContain('height="180"');
	});

	it('Replace image opens the same picker and keeps alt/title/alignment/caption', async () => {
		const ed = await mountEditor(
			`<p>Intro</p><figure class="blog-image-figure"><img src="${IMG}" alt="Original alt" title="Original title" width="1200" height="675" data-align="left"><figcaption>Cap</figcaption></figure>`
		);
		await page
			.elementLocator(document.querySelector('.ProseMirror img') as HTMLImageElement)
			.click();
		await page.getByRole('button', { name: 'Replace', exact: true }).click();
		expect(ed.onOpenMediaPicker).toHaveBeenCalledOnce();
		ed.deliver({
			url: 'http://localhost:9/other-800w.webp',
			alt: 'Picker alt',
			width: 800,
			height: 450,
			size: 'medium',
			mediaId: 'm2'
		});
		await vi.waitFor(() => expect(ed.last()).toContain('other-800w.webp'));
		const out = ed.last();
		expect(out).not.toContain('missing-1200w');
		expect(out).toContain('alt="Original alt"');
		expect(out).toContain('title="Original title"');
		expect(out).toContain('data-align="left"');
		expect(out).toContain('<figcaption>Cap</figcaption>');
		expect(out).toContain('width="800"');
		expect(out).toContain('height="450"');
	});

	it('editing alt/title in the menu writes them to the image node', async () => {
		const ed = await mountEditor(`<p>Intro</p><img src="${IMG}" width="1200" height="675">`);
		await page
			.elementLocator(document.querySelector('.ProseMirror img') as HTMLImageElement)
			.click();
		await page.getByRole('button', { name: 'Add alt text', exact: true }).click();
		await page.getByLabelText(/Alt text/).fill('SPX gamma chart');
		await page.getByLabelText(/Title/).fill('SPX tooltip');
		await page.getByRole('button', { name: 'Save', exact: true }).click();
		await vi.waitFor(() => expect(ed.last()).toContain('alt="SPX gamma chart"'));
		expect(ed.last()).toContain('title="SPX tooltip"');
		expect(document.querySelectorAll('.ProseMirror button.image-alt-chip')).toHaveLength(0);
	});
});
