import { page, userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { MediaItem } from '#lib/shared/media-upload';
import MediaLibrary from './MediaLibrary.svelte';

function makeItem(id: string, over: Partial<MediaItem> = {}): MediaItem {
	const base = `https://example.test/media/${id}`;
	return {
		id,
		filename: `${id}.webp`,
		slug: `${id}.webp`,
		mime_type: 'image/webp',
		size_bytes: 2048,
		width: 1200,
		height: 675,
		title: `Title ${id}`,
		alt_text: `Alt ${id}`,
		description: '',
		caption: '',
		folder: '',
		urls: {
			original: `${base}-1200w.webp`,
			large: `${base}-1200w.webp`,
			medium: `${base}-800w.webp`,
			thumbnail: `${base}-480w.webp`,
			webp: `${base}-1200w.webp`
		},
		available_sizes: [
			{
				value: 'thumbnail',
				label: 'Thumbnail (480w)',
				url: `${base}-480w.webp`,
				width: 480,
				height: 270,
				available: true
			},
			{
				value: 'full',
				label: 'Full (1200x675)',
				url: `${base}-1200w.webp`,
				width: 1200,
				height: 675,
				available: true
			}
		],
		usage_count: 0,
		created_at: '2026-10-31T10:00:00.000Z',
		updated_at: '2026-10-31T10:00:00.000Z',
		...over
	};
}

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' }
	});
}

/** Minimal XMLHttpRequest stand-in that tests drive by hand (progress, success, failure). */
class FakeXHR {
	static instances: FakeXHR[] = [];
	upload: { onprogress: ((e: ProgressEvent) => void) | null } = { onprogress: null };
	onload: (() => void) | null = null;
	onerror: (() => void) | null = null;
	onabort: (() => void) | null = null;
	status = 0;
	responseText = '';
	method = '';
	url = '';
	body: FormData | null = null;
	open(method: string, url: string) {
		this.method = method;
		this.url = url;
	}
	send(body: FormData) {
		this.body = body;
		FakeXHR.instances.push(this);
	}
	abort() {
		this.onabort?.();
	}
	progress(loaded: number, total: number) {
		this.upload.onprogress?.({ lengthComputable: true, loaded, total } as ProgressEvent);
	}
	respond(status: number, body: unknown) {
		this.status = status;
		this.responseText = JSON.stringify(body);
		this.onload?.();
	}
}

type Handler = (url: string, init: RequestInit | undefined) => Response | Promise<Response>;

function mockFetch(handler: Handler) {
	return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
		return handler(String(input), init);
	});
}

function setFiles(input: HTMLInputElement, files: File[]) {
	const dt = new DataTransfer();
	for (const f of files) dt.items.add(f);
	input.files = dt.files;
	input.dispatchEvent(new Event('change', { bubbles: true }));
}

beforeEach(() => {
	FakeXHR.instances = [];
	vi.stubGlobal('XMLHttpRequest', FakeXHR);
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('MediaLibrary picker', () => {
	it('renders items with alt text on the image and a No Alt badge when alt is missing', async () => {
		const withAlt = makeItem('with-alt');
		const noAlt = makeItem('no-alt', { alt_text: '' });
		render(MediaLibrary, {
			mode: 'page',
			initialItems: [withAlt, noAlt],
			initialFolders: [],
			initialTotal: 2
		});

		await expect.element(page.getByRole('img', { name: 'Alt with-alt' })).toBeInTheDocument();
		// Without alt text the image falls back to the filename and the badge is shown exactly once.
		await expect.element(page.getByRole('img', { name: 'no-alt.webp' })).toBeInTheDocument();
		await expect.element(page.getByText('No Alt')).toBeInTheDocument();
		expect(document.querySelectorAll('.badge-missing-alt')).toHaveLength(1);
	});

	it('queues same-named files under unique keys and shows per-file progress and errors', async () => {
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		mockFetch((url) => {
			if (url.startsWith('/api/media/list')) {
				return jsonResponse({
					items: [makeItem('new1')],
					total: 1,
					folders: [],
					page: 1
				});
			}
			return jsonResponse({ error: `unexpected ${url}` }, 500);
		});
		render(MediaLibrary, { mode: 'page', initialItems: [makeItem('seed')], initialTotal: 1 });

		await page.getByRole('tab', { name: 'Upload Files' }).click();
		const input = document.querySelector<HTMLInputElement>('#ml-upload-input')!;
		setFiles(input, [
			new File(['one'], 'same.png', { type: 'image/png' }),
			new File(['two'], 'same.png', { type: 'image/png' })
		]);

		await vi.waitFor(() => expect(FakeXHR.instances).toHaveLength(1));
		FakeXHR.instances[0]!.progress(40, 100);
		await expect.element(page.getByText('Uploading 40%')).toBeInTheDocument();
		await expect
			.element(page.getByRole('progressbar', { name: 'Upload progress for same.png' }))
			.toHaveAttribute('value', '40');
		expect(document.querySelectorAll('.ml-queue-item')).toHaveLength(2);

		FakeXHR.instances[0]!.respond(201, { item: makeItem('new1') });
		await vi.waitFor(() => expect(FakeXHR.instances).toHaveLength(2));
		FakeXHR.instances[1]!.respond(413, { error: 'Image is too large for the server.' });

		await expect.element(page.getByText('Image is too large for the server.')).toBeInTheDocument();
		await expect.element(page.getByText('Uploaded 1 file(s).')).toBeInTheDocument();
		expect(errorSpy).not.toHaveBeenCalled();
	});

	it('bulk delete reports partial failures per item, lists in-use posts, and keeps failures selected', async () => {
		const items = [makeItem('a'), makeItem('b'), makeItem('c')];
		const deleted: string[] = [];
		mockFetch((url, init) => {
			if (init?.method === 'DELETE') {
				const id = url.split('/').pop()!;
				if (id === 'b') {
					return jsonResponse(
						{
							code: 'MEDIA_IN_USE',
							error: 'MEDIA_IN_USE: Cannot delete "b.webp" because it is used in 1 post(s).',
							details: [{ id: 7, title: 'Gamma Playbook', slug: 'gamma-playbook' }]
						},
						409
					);
				}
				if (id === 'c') return jsonResponse({ error: 'storage unavailable' }, 500);
				deleted.push(id);
				return new Response(null, { status: 204 });
			}
			if (url.startsWith('/api/media/list')) {
				return jsonResponse({ items: [items[1], items[2]], total: 2, folders: [], page: 1 });
			}
			return jsonResponse({ error: `unexpected ${url}` }, 500);
		});
		render(MediaLibrary, { mode: 'page', initialItems: items, initialTotal: 3 });

		await page.getByRole('checkbox', { name: 'Select a.webp for bulk actions' }).click();
		await page.getByRole('button', { name: 'Select all on page' }).click();
		await expect.element(page.getByText('3 selected')).toBeInTheDocument();

		await page.getByRole('button', { name: 'Delete (3)' }).click();
		await expect.element(page.getByRole('dialog', { name: 'Delete 3 items?' })).toBeInTheDocument();
		await page.getByRole('button', { name: 'Delete Selected' }).click();

		await expect
			.element(page.getByText(/2 of 3 item\(s\) could not be deleted\./))
			.toBeInTheDocument();
		await expect.element(page.getByText('Deleted 1 item(s).')).toBeInTheDocument();
		await expect.element(page.getByText('Gamma Playbook')).toBeInTheDocument();
		await vi.waitFor(() =>
			expect(document.querySelector('[role="alert"]')!.textContent).toContain(
				'c.webp: storage unavailable'
			)
		);
		await expect.element(page.getByText('2 selected')).toBeInTheDocument();
		expect(deleted).toEqual(['a']);
	});

	it('bulk move sends the destination folder per item and keeps only failed items selected', async () => {
		const items = [makeItem('a'), makeItem('b')];
		const patches: Array<{ id: string; body: unknown }> = [];
		mockFetch((url, init) => {
			if (init?.method === 'PATCH') {
				const id = url.split('/').pop()!;
				patches.push({ id, body: JSON.parse(String(init.body)) });
				return id === 'b'
					? jsonResponse({ error: 'Folder name is invalid.' }, 400)
					: jsonResponse({ item: items[0] });
			}
			if (url.startsWith('/api/media/list')) {
				return jsonResponse({ items, total: 2, folders: ['charts'], page: 1 });
			}
			return jsonResponse({ error: `unexpected ${url}` }, 500);
		});
		render(MediaLibrary, {
			mode: 'page',
			initialItems: items,
			initialFolders: ['charts'],
			initialTotal: 2
		});

		await page.getByRole('checkbox', { name: 'Select a.webp for bulk actions' }).click();
		await page.getByRole('checkbox', { name: 'Select b.webp for bulk actions' }).click();
		await page.getByLabelText('Move selected to folder').selectOptions('charts');

		await expect
			.element(page.getByText(/1 of 2 item\(s\) could not be moved\./))
			.toBeInTheDocument();
		await expect.element(page.getByText('Moved 1 item(s) to charts.')).toBeInTheDocument();
		await vi.waitFor(() =>
			expect(document.querySelector('[role="alert"]')!.textContent).toContain(
				'b.webp: Folder name is invalid.'
			)
		);
		await expect.element(page.getByText('1 selected')).toBeInTheDocument();
		expect(patches.map((p) => p.id).sort()).toEqual(['a', 'b']);
		expect(patches.every((p) => (p.body as { folder: string }).folder === 'charts')).toBe(true);
	});

	it('closes on Escape, traps Tab, and restores focus to the opener on close', async () => {
		const opener = document.createElement('button');
		opener.textContent = 'Open picker';
		document.body.append(opener);
		opener.focus();
		const onClose = vi.fn();
		try {
			const screen = await render(MediaLibrary, {
				mode: 'modal',
				isOpen: true,
				initialItems: [makeItem('a')],
				initialTotal: 1,
				onSelect: vi.fn(),
				onClose
			});
			const dialog = page.getByRole('dialog', { name: 'Media Library Picker' });
			await expect.element(dialog).toHaveAttribute('aria-modal', 'true');
			// Focus moved into the dialog on open.
			await vi.waitFor(() =>
				expect(document.querySelector('[role="dialog"]')!.contains(document.activeElement)).toBe(
					true
				)
			);

			// Shift+Tab from the first control wraps to the last one, still inside the dialog.
			const root = document.querySelector<HTMLElement>('[role="dialog"]')!;
			const search = root.querySelector<HTMLElement>('input[type="search"]')!;
			search.focus();
			await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
			expect(root.contains(document.activeElement)).toBe(true);

			await userEvent.keyboard('{Escape}');
			expect(onClose).toHaveBeenCalledOnce();

			await screen.unmount();
			expect(document.activeElement).toBe(opener);
		} finally {
			opener.remove();
		}
	});

	it('emits the select payload with the exact alignment, size, url and dimensions', async () => {
		const onSelect = vi.fn();
		render(MediaLibrary, {
			mode: 'modal',
			isOpen: true,
			initialItems: [makeItem('a')],
			initialTotal: 1,
			onSelect,
			onClose: vi.fn()
		});

		await page
			.getByRole('button', { name: /a\.webp/ })
			.first()
			.click();
		await page.getByRole('combobox', { name: /Alignment/ }).selectOptions('full');
		await page.getByRole('combobox', { name: /Insert Size/ }).selectOptions('thumbnail');
		await page.getByRole('button', { name: 'Insert Into Post' }).click();

		expect(onSelect).toHaveBeenCalledOnce();
		expect(onSelect.mock.calls[0]![0]).toMatchObject({
			url: 'https://example.test/media/a-480w.webp',
			width: 480,
			height: 270,
			alt: 'Alt a',
			size: 'thumbnail',
			align: 'full',
			linkUrl: ''
		});
	});
});
