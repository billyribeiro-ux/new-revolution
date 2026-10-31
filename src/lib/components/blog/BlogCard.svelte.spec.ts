import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { blogPosts, type BlogCardPost } from '#lib/data/blog-hub.ts';
import BlogCard from './BlogCard.svelte';

const post = blogPosts.find((p) => p.hasAudio) ?? blogPosts[0];
const silent = blogPosts.find((p) => !p.hasAudio) ?? blogPosts[1];

const withPresentation = (presentation: BlogCardPost['presentation']): BlogCardPost => ({
	...post,
	presentation
});

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

	it('uses the cover layout: the image is the card background and the title sits in the top block', async () => {
		render(BlogCard, { post });

		const article = document.querySelector('article') as HTMLElement;
		expect(article.classList.contains('is-cover')).toBe(true);
		const media = article.querySelector('.catalog-card__media') as HTMLElement;
		expect(media.querySelector('img.blog-card__img')).not.toBeNull();
		const intro = article.querySelector('.catalog-card__intro') as HTMLElement;
		expect(intro.querySelector('.catalog-card__title')).not.toBeNull();
		expect(intro.querySelector('.blog-card__category')?.textContent).toBe(post.category);
		// Excerpt lives in the bottom block, not next to the title.
		expect(article.querySelector('.catalog-card__detail .blog-card__excerpt')?.textContent).toBe(
			post.excerpt
		);
	});

	it('renders the cover with explicit dimensions (no CLS), a real alt, and lazy loading by default', async () => {
		render(BlogCard, { post });
		const img = document.querySelector('img.blog-card__img') as HTMLImageElement;
		expect(img.getAttribute('width')).toBe(String(post.image.width));
		expect(img.getAttribute('height')).toBe(String(post.image.height));
		expect(img.getAttribute('alt')).toBe(post.image.alt);
		expect(img.getAttribute('alt')?.length).toBeGreaterThan(10);
		expect(img.getAttribute('loading')).toBe('lazy');
		expect(img.getAttribute('fetchpriority')).toBe('auto');
	});

	it('loads an eager cover with high priority when told to', async () => {
		render(BlogCard, { post, eager: true });
		const img = document.querySelector('img.blog-card__img') as HTMLImageElement;
		expect(img.getAttribute('loading')).toBe('eager');
		expect(img.getAttribute('fetchpriority')).toBe('high');
	});

	it('exposes the machine-readable date, read time and author in the meta line', async () => {
		render(BlogCard, { post });
		const time = document.querySelector('time') as HTMLTimeElement;
		expect(time.getAttribute('datetime')).toBe(post.publishedDate);
		expect(time.textContent).toBe(post.publishedDisplay);
		const meta = document.querySelector('.blog-card__meta') as HTMLElement;
		expect(meta.textContent).toContain(post.readTime);
		expect(meta.querySelector('[itemprop="author"] [itemprop="name"]')?.textContent).toBe(
			'Billy Ribeiro'
		);
	});

	it('shows the audio badge only for narrated posts', async () => {
		render(BlogCard, { post });
		expect(document.querySelector('.blog-card__audio')).not.toBeNull();
	});

	it('omits the audio badge for posts without narration', async () => {
		render(BlogCard, { post: silent });
		expect(document.querySelector('.blog-card__audio')).toBeNull();
	});

	it('maps each post’s own presentation onto the shell’s tuning properties', async () => {
		render(BlogCard, {
			post: withPresentation({ focus: [20, 80], overlay: 'strong', accent: 'coral' })
		});
		const article = document.querySelector('article') as HTMLElement;
		expect(article.style.getPropertyValue('--card-scrim')).toBe('0.94');
		expect(article.style.getPropertyValue('--card-focus')).toBe('20% 80%');
		expect(article.style.getPropertyValue('--card-accent')).toBe('var(--coral)');
	});

	it('falls back to a safe standard scrim and sets no focus/accent override when presentation is omitted', async () => {
		render(BlogCard, { post: withPresentation(undefined) });
		const article = document.querySelector('article') as HTMLElement;
		expect(article.style.getPropertyValue('--card-scrim')).toBe('0.86');
		expect(article.style.getPropertyValue('--card-focus')).toBe('');
		expect(article.style.getPropertyValue('--card-accent')).toBe('');
	});

	it('keeps every scrim level at or above the 0.7 floor needed for AA text over any image', async () => {
		for (const overlay of ['soft', 'standard', 'strong'] as const) {
			const { unmount } = (await render(BlogCard, {
				post: withPresentation({ overlay })
			})) as unknown as { unmount?: () => void };
			const value = Number(
				(document.querySelector('article') as HTMLElement).style.getPropertyValue('--card-scrim')
			);
			expect(value).toBeGreaterThanOrEqual(0.7);
			unmount?.();
			document.body.innerHTML = '';
		}
	});

	it('renders on the light tone for light sections and forwards class and rest props', async () => {
		render(BlogCard, { post, tone: 'light', 'data-testid': 'blog', class: 'host' } as never);
		const article = document.querySelector('article') as HTMLElement;
		expect(article.classList.contains('is-light')).toBe(true);
		expect(article.getAttribute('data-testid')).toBe('blog');
		expect(article.classList.contains('blog-card')).toBe(true);
		expect(article.classList.contains('host')).toBe(true);
	});
});
