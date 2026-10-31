import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { blogPosts } from '#lib/data/blog-hub.ts';
import BlogCard from './BlogCard.svelte';

const post = blogPosts.find((p) => p.hasAudio) ?? blogPosts[0];
const silent = blogPosts.find((p) => !p.hasAudio) ?? blogPosts[1];

describe('BlogCard', () => {
	it('is one BlogPosting article with a single stretched title link to the article', async () => {
		render(BlogCard, { post });

		const article = document.querySelector('article') as HTMLElement;
		expect(article.getAttribute('itemtype')).toBe('https://schema.org/BlogPosting');
		await expect.element(page.getByRole('article', { name: post.title })).toBeInTheDocument();
		await expect
			.element(page.getByRole('link', { name: post.title }))
			.toHaveAttribute('href', `/blogs/${post.slug}`);
		expect(document.querySelectorAll('article a').length).toBe(1);
	});

	it('renders the cover with explicit dimensions (no CLS) and lazy loading by default', async () => {
		render(BlogCard, { post });
		const img = document.querySelector('img.blog-card__img') as HTMLImageElement;
		expect(img.getAttribute('width')).toBe(String(post.image.width));
		expect(img.getAttribute('height')).toBe(String(post.image.height));
		expect(img.getAttribute('alt')).toBe(post.image.alt);
		expect(img.getAttribute('loading')).toBe('lazy');
		expect(img.getAttribute('fetchpriority')).toBe('auto');
	});

	it('loads an eager cover with high priority when told to', async () => {
		render(BlogCard, { post, eager: true });
		const img = document.querySelector('img.blog-card__img') as HTMLImageElement;
		expect(img.getAttribute('loading')).toBe('eager');
		expect(img.getAttribute('fetchpriority')).toBe('high');
	});

	it('exposes the machine-readable date, the read time, and the category badge', async () => {
		render(BlogCard, { post });
		const time = document.querySelector('time') as HTMLTimeElement;
		expect(time.getAttribute('datetime')).toBe(post.publishedDate);
		expect(time.textContent).toBe(post.publishedDisplay);
		expect(document.querySelector('.catalog-card__eyebrow')?.textContent).toContain(post.readTime);
		expect(document.querySelector('.blog-card__category')?.textContent).toBe(post.category);
	});

	it('shows the audio badge only for narrated posts', async () => {
		render(BlogCard, { post });
		expect(document.querySelector('.blog-card__audio')).not.toBeNull();
	});

	it('omits the audio badge for posts without narration', async () => {
		render(BlogCard, { post: silent });
		expect(document.querySelector('.blog-card__audio')).toBeNull();
	});

	it('renders on the light tone for light sections', async () => {
		render(BlogCard, { post, tone: 'light' });
		expect(document.querySelector('article')?.classList.contains('is-light')).toBe(true);
	});

	it('shows the author as decorative initials (no remote avatar) beside the name, and forwards rest props', async () => {
		render(BlogCard, { post, 'data-testid': 'blog', class: 'host' } as never);
		expect(document.querySelector('.blog-card__avatar')?.getAttribute('aria-hidden')).toBe('true');
		expect(document.querySelector('.blog-card__avatar')?.textContent).toBe('BR');
		expect(document.querySelector('.blog-card__author-name')?.textContent).toBe('Billy Ribeiro');
		const article = document.querySelector('article') as HTMLElement;
		expect(article.getAttribute('data-testid')).toBe('blog');
		expect(article.classList.contains('blog-card')).toBe(true);
		expect(article.classList.contains('host')).toBe(true);
	});
});
