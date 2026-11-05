import { describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser';
import { render } from 'vitest-browser-svelte';
import type { BlogCardPost } from '#lib/shared/blog/discovery';
import PostCard from './PostCard.svelte';

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
});
