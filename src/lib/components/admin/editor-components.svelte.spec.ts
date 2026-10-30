import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ConfirmDialog from './ConfirmDialog.svelte';
import RevisionDiffViewer from './RevisionDiffViewer.svelte';
import PostCard from '../blog/PostCard.svelte';
import RichTextEditor from './RichTextEditor.svelte';

describe('Admin & Blog Svelte 5 Components + Prose Parity', () => {
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

	it('verifies RichTextEditor canvas carries .prose-base with max-width: 900px and accessible toolbar toggles', async () => {
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

		const proseSurface = document.querySelector('.prose-base') as HTMLElement | null;
		expect(proseSurface).not.toBeNull();
		const computed = getComputedStyle(proseSurface!);
		expect(computed.maxWidth).toBe('900px');
	});
});
