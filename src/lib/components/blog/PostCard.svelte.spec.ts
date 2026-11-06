import { describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser';
import { cleanup, render } from 'vitest-browser-svelte';
import type { BlogCardPost } from '#lib/shared/blog/discovery';
import PostCard from './PostCard.svelte';
import '../../../app.css';

const post: BlogCardPost = {
	id: 7,
	slug: 'cms-research',
	title: 'CMS research',
	excerpt: 'A saved CMS article summary.',
	coverImage: '/icon-512.png',
	coverImageAlt: 'Fixture image used to verify the stored media fields',
	coverImageWidth: 512,
	coverImageHeight: 512,
	publishedAt: '2026-11-05T14:00:00Z'
};

describe('CMS post card', () => {
	it('updates the actual slot and selected pixels when root text grows to 200%', async () => {
		const urls = new Map<string, number>();
		const root = document.documentElement;
		const originalSize = root.style.fontSize;
		try {
			for (const width of [480, 800, 1200, 1600]) {
				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = (width * 9) / 16;
				const context = canvas.getContext('2d')!;
				context.fillStyle = '#445566';
				context.fillRect(0, 0, canvas.width, canvas.height);
				const blob = await new Promise<Blob>((resolve, reject) =>
					canvas.toBlob(
						(value) =>
							value ? resolve(value) : reject(new Error('Unable to create image fixture')),
						'image/png'
					)
				);
				urls.set(URL.createObjectURL(blob), width);
			}
			root.style.fontSize = '16px';
			await render(PostCard, {
				post: {
					...post,
					coverImage: [...urls.keys()].at(-1),
					coverImageWidth: 1600,
					coverImageHeight: 900,
					coverImageSrcset: [...urls].map(([url, width]) => `${url} ${width}w`).join(', ')
				},
				eager: true
			});
			const image = document.querySelector<HTMLImageElement>('.card-cover-img')!;
			await expect
				.poll(() => Number.parseFloat(image.sizes))
				.toBe(Math.ceil(image.getBoundingClientRect().width));
			root.style.fontSize = '32px';
			await expect.poll(() => image.getBoundingClientRect().width).toBeGreaterThan(400);
			await expect
				.poll(() => Number.parseFloat(image.sizes))
				.toBe(Math.ceil(image.getBoundingClientRect().width));
			await expect
				.poll(() => urls.get(image.currentSrc) ?? 0)
				.toBeGreaterThanOrEqual(
					Math.min(1600, Math.floor(image.getBoundingClientRect().width * devicePixelRatio))
				);
			expect(image.loading).toBe('eager');
			expect(image.fetchPriority).toBe('high');
		} finally {
			cleanup();
			root.style.fontSize = originalSize;
			for (const url of urls.keys()) URL.revokeObjectURL(url);
		}
	});

	it('uses saved media dimensions and descriptive links instead of generated cover artwork', async () => {
		await render(PostCard, { post, eager: true });
		const image = document.querySelector('img');
		expect(image?.getAttribute('src')).toBe(post.coverImage);
		expect(image?.getAttribute('width')).toBe('512');
		expect(image?.getAttribute('height')).toBe('512');
		expect(image?.getAttribute('fetchpriority')).toBe('high');
		await expect
			.element(page.getByRole('link', { name: 'Read Article: CMS research', exact: true }))
			.toHaveAttribute('href', '/blog/cms-research');
		expect(document.querySelector('.card-read-link')?.textContent?.trim()).toBe('Read Article');
	});

	it('supports a light lead card without changing its CMS featured flag', async () => {
		await render(PostCard, { post, tone: 'light', lead: true });
		const card = document.querySelector('article');
		expect(card?.classList.contains('is-light')).toBe(true);
		expect(card?.classList.contains('is-lead')).toBe(true);
		expect(card?.classList.contains('is-featured')).toBe(false);
		await expect.element(page.getByRole('heading', { level: 3, name: post.title })).toBeVisible();
	});

	it('keeps a lead without a cover as text rather than fabricating an image', async () => {
		await render(PostCard, { post: { ...post, coverImage: null }, lead: true });
		expect(document.querySelector('img, svg')).toBeNull();
		expect(document.querySelector('article')?.classList.contains('has-cover')).toBe(false);
	});

	it.each(['dark', 'light'] as const)(
		'preserves the complete 16:9 image box on a %s lead, including global anchor styles',
		async (tone) => {
			await render(PostCard, { post, tone, lead: true });
			const card = document.querySelector<HTMLElement>('.blog-post-card')!;
			const link = card.querySelector<HTMLElement>('.card-media-link')!;
			const image = card.querySelector<HTMLImageElement>('img')!;
			const box = link.getBoundingClientRect();
			const imageBox = image.getBoundingClientRect();
			expect(getComputedStyle(link).paddingBlockStart).toBe('0px');
			expect(getComputedStyle(link).paddingBlockEnd).toBe('0px');
			expect(getComputedStyle(image).objectFit).toBe('contain');
			expect(box.width / box.height).toBeCloseTo(16 / 9, 2);
			expect(imageBox.width).toBeCloseTo(box.width, 1);
			expect(imageBox.height).toBeCloseTo(box.height, 1);
			expect(card.getBoundingClientRect().width).toBeLessThanOrEqual(1200);
		}
	);

	it('caps regular cards at 25rem and keeps the uncropped image treatment', async () => {
		await render(PostCard, { post });
		const card = document.querySelector<HTMLElement>('.blog-post-card')!;
		expect(card.getBoundingClientRect().width).toBeLessThanOrEqual(400);
		expect(getComputedStyle(card.querySelector('img')!).objectFit).toBe('contain');
	});

	it('uses only server-verified responsive candidates and never invents variants from a URL', async () => {
		await render(PostCard, {
			post: { ...post, coverImage: '/icon-512.png?legacy-cover-1600w.webp' }
		});
		expect(document.querySelector('img')?.getAttribute('srcset')).toBeNull();
	});
});
