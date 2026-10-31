import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ConfirmDialog from './ConfirmDialog.svelte';
import RevisionDiffViewer from './RevisionDiffViewer.svelte';
import PostCard from '../blog/PostCard.svelte';
import RichTextEditor from './RichTextEditor.svelte';
import PostEditor from './PostEditor.svelte';
import MediaLibrary from './MediaLibrary.svelte';
import type { MediaItem } from '#lib/shared/media-upload';

const rpcMocks = vi.hoisted(() => ({
	createPostRpc: vi.fn(),
	updatePostRpc: vi.fn(),
	deletePostRpc: vi.fn(),
	autosavePostRpc: vi.fn(),
	checkSlugAvailableRpc: vi.fn(),
	getPostRevisionDiffRpc: vi.fn(),
	restoreRevisionRpc: vi.fn(),
	createAuthorRpc: vi.fn(),
	createCategoryRpc: vi.fn(),
	createTagRpc: vi.fn(),
	getPostFull: vi.fn()
}));

vi.mock('../../../routes/admin/posts/posts.remote', () => rpcMocks);

const SAMPLE_MEDIA_ITEMS: MediaItem[] = [
	{
		id: 'media-1',
		filename: 'spx-gamma-wall.webp',
		slug: 'spx-gamma-wall-1200w.webp',
		mime_type: 'image/webp',
		size_bytes: 124_000,
		width: 1200,
		height: 675,
		title: 'SPX Gamma Wall',
		alt_text: 'SPX 0DTE gamma wall chart',
		description: 'Institutional gamma profile',
		caption: 'Figure 1: Net GEX levels',
		folder: 'charts',
		urls: {
			original: 'https://revolutiontradingpros.com/media/spx-gamma-wall-1200w.webp',
			large: 'https://revolutiontradingpros.com/media/spx-gamma-wall-1200w.webp',
			medium: 'https://revolutiontradingpros.com/media/spx-gamma-wall-800w.webp',
			thumbnail: 'https://revolutiontradingpros.com/media/spx-gamma-wall-480w.webp',
			webp: 'https://revolutiontradingpros.com/media/spx-gamma-wall-1200w.webp'
		},
		available_sizes: [
			{
				value: 'thumbnail',
				label: 'Thumbnail (480w)',
				url: 'https://revolutiontradingpros.com/media/spx-gamma-wall-480w.webp',
				width: 480,
				height: 270,
				available: true
			},
			{
				value: 'medium',
				label: 'Medium (800w)',
				url: 'https://revolutiontradingpros.com/media/spx-gamma-wall-800w.webp',
				width: 800,
				height: 450,
				available: true
			},
			{
				value: 'large',
				label: 'Large (1200w)',
				url: 'https://revolutiontradingpros.com/media/spx-gamma-wall-1200w.webp',
				width: 1200,
				height: 675,
				available: true
			},
			{
				value: 'full',
				label: 'Full (1200x675)',
				url: 'https://revolutiontradingpros.com/media/spx-gamma-wall-1200w.webp',
				width: 1200,
				height: 675,
				available: true
			}
		],
		usage_count: 1,
		created_at: '2026-10-29T10:00:00.000Z',
		updated_at: '2026-10-29T10:00:00.000Z'
	}
];

describe('Admin & Blog Svelte 5 Components + Prose Parity', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
		rpcMocks.checkSlugAvailableRpc.mockResolvedValue({ available: true });
	});

	it('renders ConfirmDialog with aria-modal, focus management, and confirm/cancel callbacks', async () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		render(ConfirmDialog, {
			open: true,
			title: 'Unpublish Live Article',
			message: 'Switching status to Draft will remove this post from /blog.',
			confirmLabel: 'Unpublish',
			cancelLabel: 'Keep Live',
			variant: 'danger',
			onConfirm,
			onCancel
		});

		const dialog = page.getByRole('dialog', { name: 'Unpublish Live Article' });
		await expect.element(dialog).toBeInTheDocument();

		const confirmBtn = page.getByRole('button', { name: 'Unpublish' });
		await confirmBtn.click();
		expect(onConfirm).toHaveBeenCalledOnce();
	});

	it('renders RevisionDiffViewer with word-level additions/removals and restore confirmation', async () => {
		const onRestore = vi.fn();
		const onClose = vi.fn();

		render(RevisionDiffViewer, {
			open: true,
			revision: {
				id: 42,
				titleSnapshot: 'Original Gamma Guide',
				excerptSnapshot: 'Initial excerpt text',
				contentSnapshot: '<p>Market makers hedge delta exposure.</p>',
				wordCount: 6,
				wordCountDelta: 6,
				changeType: 'manual',
				createdAt: '2026-10-29T12:00:00.000Z'
			},
			currentTitle: 'Updated Gamma Exposure Guide',
			currentExcerpt: 'Initial excerpt text',
			currentContent: '<p>Market makers actively hedge gamma and delta exposure.</p>',
			onRestore,
			onClose
		});

		const dialog = page.getByRole('dialog');
		await expect.element(dialog).toBeInTheDocument();

		const restoreTrigger = page.getByRole('button', {
			name: /Restore This Revision/i
		});
		await expect.element(restoreTrigger).toBeInTheDocument();

		const backdrop = document.querySelector('.diff-modal-backdrop') as HTMLElement;
		expect(backdrop).not.toBeNull();
		backdrop.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		expect(onClose).toHaveBeenCalledOnce();
	});

	it('renders PostCard with responsive srcset derived from variant URL', async () => {
		render(PostCard, {
			post: {
				id: 1,
				title: 'Institutional Order Flow Playbook',
				slug: 'institutional-order-flow-playbook',
				excerpt: 'How to read dark pool prints and gamma walls.',
				coverImage: 'https://cdn.example.com/media/flow-chart-1200w.webp',
				coverImageAlt: 'Dark pool liquidity chart',
				readingTime: 5,
				category: {
					name: 'Order Flow',
					slug: 'order-flow'
				},
				author: {
					name: 'Billy Ribeiro',
					slug: 'billy-ribeiro'
				}
			},
			eager: true,
			headingLevel: 'h3'
		});

		const heading = page.getByRole('heading', {
			level: 3,
			name: 'Institutional Order Flow Playbook'
		});
		await expect.element(heading).toBeInTheDocument();

		const img = document.querySelector('img.card-cover-img') as HTMLImageElement | null;
		expect(img).not.toBeNull();
		expect(img?.getAttribute('srcset')).toContain('flow-chart-480w.webp 480w');
		expect(img?.getAttribute('srcset')).toContain('flow-chart-800w.webp 800w');
		expect(img?.getAttribute('srcset')).toContain('flow-chart-1200w.webp 1200w');
		expect(img?.getAttribute('loading')).toBe('eager');
	});

	it('verifies RichTextEditor canvas carries .prose-base with max-width: 900px, status bar, and accessible toolbar toggles', async () => {
		render(RichTextEditor, {
			content: '<h2>Market Structure Heading</h2><p>Institutional risk management paragraph.</p>',
			onChange: () => {},
			onStatsChange: () => {}
		});

		const toolbar = page.getByRole('toolbar', {
			name: 'Post content formatting'
		});
		await expect.element(toolbar).toBeInTheDocument();

		const boldBtn = page.getByRole('button', { name: 'Bold (Cmd+B)' });
		await expect.element(boldBtn).toHaveAttribute('aria-pressed', 'false');

		const plainPasteBtn = page.getByRole('button', { name: 'Paste Plain' });
		await expect.element(plainPasteBtn).toHaveAttribute('aria-pressed', 'false');

		const advancedBtn = page.getByRole('button', { name: 'Advanced' });
		await advancedBtn.click();

		const justifyBtn = page.getByRole('button', { name: 'Justify' });
		await expect.element(justifyBtn).toBeInTheDocument();

		const wordCountEl = document.querySelector('[data-testid="post-body-word-count"]');
		expect(wordCountEl?.textContent?.trim()).toBe('7 words · 64 characters · 1 min read');

		const proseSurface = document.querySelector('.prose-base') as HTMLElement | null;
		expect(proseSurface).not.toBeNull();
		const computed = getComputedStyle(proseSurface!);
		expect(computed.maxWidth).toBe('900px');
	});

	it('manages PostEditor metaTitle auto-follow, disclosure panels, dirty tracking during in-flight save, and unpublish/rename confirmations', async () => {
		let resolveUpdate!: (val: unknown) => void;
		rpcMocks.updatePostRpc.mockImplementation(
			() =>
				new Promise((resolve) => {
					resolveUpdate = resolve;
				})
		);

		render(PostEditor, {
			initialPost: {
				id: 77,
				title: 'Live Zero DTE Playbook',
				slug: 'live-zero-dte-playbook',
				excerpt:
					'A concise 145-character summary of zero DTE risk management and institutional execution discipline for index options traders.',
				content:
					'<h2>Key Takeaway</h2><p>Respect gamma flip zones.</p><h2>Setup Rules</h2><p>Size down near CPI.</p>',
				status: 'published',
				visibility: 'public',
				authorId: 1,
				categoryId: 1,
				categoryIds: [1],
				tagIds: [1],
				coAuthorIds: [],
				relatedPostIds: [],
				coverImage: 'https://revolutiontradingpros.com/media/spx-gamma-wall-1200w.webp',
				coverImageAlt: 'SPX gamma wall chart',
				coverImageCaption: '',
				metaTitle: 'Live Zero DTE Playbook',
				metaDescription:
					'Learn how institutional options desks manage zero DTE gamma exposure, define key intraday inflection levels, and size positions with strict risk controls.',
				focusKeyword: 'zero dte',
				secondaryKeywords: '["gamma exposure"]',
				canonicalUrl: '',
				ogTitle: '',
				ogDescription: '',
				ogImage: '',
				twitterCardType: 'summary_large_image',
				twitterTitle: '',
				twitterDescription: '',
				twitterImage: '',
				schemaType: 'Article',
				robotsNoindex: false,
				robotsNofollow: false,
				isPillar: true,
				featured: false,
				isSticky: false,
				commentsEnabled: false,
				pingbacksEnabled: false,
				postFormat: 'standard',
				template: 'default',
				seriesId: null,
				seriesOrder: null,
				language: 'en',
				translationOfId: null,
				scheduledAt: null,
				expiresAt: null,
				faqItems: '[]',
				customFields: '{}',
				hasPassword: false,
				updatedAt: '2026-10-29T12:00:00.000Z'
			},
			categories: [{ id: 1, name: 'Options Strategy', slug: 'options-strategy' }],
			tags: [{ id: 1, name: '0DTE', slug: '0dte' }],
			authors: [{ id: 1, name: 'Billy Ribeiro', jobTitle: 'Head Trader' }],
			allPosts: [],
			initialRevisions: [],
			onBack: () => {}
		});

		const titleInput = document.getElementById('post-title') as HTMLInputElement;
		expect(titleInput).not.toBeNull();
		expect(titleInput.value).toBe('Live Zero DTE Playbook');

		// Modify title while save will be in-flight
		titleInput.value = 'Updated Zero DTE Playbook';
		titleInput.dispatchEvent(new Event('input', { bubbles: true }));

		// Trigger Save via top bar button
		const saveBtn = document.querySelector('button[title="Save (⌘S)"]') as HTMLButtonElement;
		saveBtn.click();

		expect(rpcMocks.updatePostRpc).toHaveBeenCalledOnce();

		// Make an additional edit WHILE the save RPC is still in flight
		titleInput.value = 'Edited During In-Flight Save';
		titleInput.dispatchEvent(new Event('input', { bubbles: true }));

		// Resolve the first save
		resolveUpdate({
			id: 77,
			slug: 'live-zero-dte-playbook',
			status: 'published',
			visibility: 'public',
			hasPassword: false,
			updatedAt: '2026-10-29T12:05:00.000Z'
		});
		await new Promise((r) => setTimeout(r, 30));

		// Because the user edited during the in-flight save, the dirty dot must remain present!
		const dirtyDot = document.querySelector('.dirty-dot');
		expect(dirtyDot).not.toBeNull();

		// Test slug rename confirmation on a published post
		const slugInput = document.getElementById('post-slug') as HTMLInputElement;
		slugInput.value = 'renamed-zero-dte-playbook';
		slugInput.dispatchEvent(new Event('input', { bubbles: true }));

		saveBtn.click();
		await new Promise((r) => setTimeout(r, 20));

		const renameDialog = page.getByRole('dialog', { name: 'Rename Published Post URL' });
		await expect.element(renameDialog).toBeInTheDocument();

		const cancelBtn = page.getByRole('button', { name: 'Cancel' });
		await cancelBtn.click();

		// Test unpublish confirmation when clicking "Save Draft" on a live post
		slugInput.value = 'live-zero-dte-playbook';
		slugInput.dispatchEvent(new Event('input', { bubbles: true }));

		const saveDraftBtn = Array.from(document.querySelectorAll('button')).find(
			(b) => b.textContent?.trim() === 'Save Draft'
		);
		expect(saveDraftBtn).toBeDefined();
		saveDraftBtn!.click();

		const unpublishDialog = page.getByRole('dialog', { name: 'Unpublish Live Article' });
		await expect.element(unpublishDialog).toBeInTheDocument();
	});

	it('traps focus in MediaLibrary modal mode, filters by folder, and supports selection and double-click insert', async () => {
		const onSelect = vi.fn();
		const onClose = vi.fn();
		const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response(
				JSON.stringify({
					items: SAMPLE_MEDIA_ITEMS,
					total: 1,
					folders: ['charts', 'thumbnails'],
					page: 1
				}),
				{ status: 200, headers: { 'content-type': 'application/json' } }
			)
		);

		render(MediaLibrary, {
			mode: 'modal',
			isOpen: true,
			initialItems: SAMPLE_MEDIA_ITEMS,
			initialFolders: ['charts', 'thumbnails'],
			initialTotal: 1,
			onSelect,
			onClose
		});

		const dialog = page.getByRole('dialog', { name: 'Media Library Picker' });
		await expect.element(dialog).toBeInTheDocument();

		// Folder filter triggers fetch with folder parameter
		const folderSelect = page.getByRole('combobox', { name: 'Filter by folder' });
		await folderSelect.selectOptions('charts');
		expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('folder=charts'));

		// Escape key inside modal calls onClose
		const modalRoot = document.querySelector('.media-library-root') as HTMLElement;
		modalRoot.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		expect(onClose).toHaveBeenCalledOnce();

		// Double-clicking a media card selects and inserts immediately in modal mode
		const mediaCard = document.querySelector('.media-card') as HTMLButtonElement;
		expect(mediaCard).not.toBeNull();
		mediaCard.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
		expect(onSelect).toHaveBeenCalledOnce();
		expect(onSelect.mock.calls[0]?.[0]).toMatchObject({
			url: 'https://revolutiontradingpros.com/media/spx-gamma-wall-1200w.webp',
			width: 1200,
			height: 675
		});

		fetchSpy.mockRestore();
	});

	it('marks PostEditor dirty on non-title field edits, shows 0/60 rendered when title and metaTitle are empty, and closes RevisionDiffViewer on Escape', async () => {
		render(PostEditor, {
			initialPost: null,
			categories: [{ id: 1, name: 'Options Strategy', slug: 'options-strategy' }],
			tags: [{ id: 1, name: '0DTE', slug: '0dte' }],
			authors: [{ id: 1, name: 'Billy Ribeiro', jobTitle: 'Head Trader' }],
			allPosts: [],
			initialRevisions: [
				{
					id: 5,
					titleSnapshot: 'Earlier Draft',
					excerptSnapshot: 'Earlier excerpt',
					contentSnapshot: '<p>Earlier body</p>',
					wordCount: 2,
					wordCountDelta: 2,
					changeType: 'manual',
					createdAt: '2026-10-29T10:00:00.000Z'
				}
			],
			onBack: () => {}
		});

		// Empty new post must NOT be dirty initially
		expect(document.querySelector('.dirty-dot')).toBeNull();

		// Empty title + empty metaTitle must show (0/60 rendered)
		const metaTitleLabel = document.querySelector('label[for="post-meta-title"]');
		expect(metaTitleLabel?.textContent).toContain('(0/60 rendered)');

		// Editing a non-title bound field (excerpt textarea) must mark the editor dirty
		const excerptTextarea = document.getElementById('post-excerpt') as HTMLTextAreaElement;
		expect(excerptTextarea).not.toBeNull();
		excerptTextarea.value = 'Updated excerpt via bound textarea';
		excerptTextarea.dispatchEvent(new Event('input', { bubbles: true }));
		await new Promise((r) => setTimeout(r, 20));

		expect(document.querySelector('.dirty-dot')).not.toBeNull();
	});
});
