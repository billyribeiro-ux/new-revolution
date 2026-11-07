import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser/context';
import { attachArticleNavigation } from './article-toc';
import articleSource from '../../routes/blog/[slug]/+page.svelte?raw';
import '../../app.css';

let cleanup: (() => void) | undefined;
let fixture: HTMLDivElement | undefined;

afterEach(() => {
	cleanup?.();
	cleanup = undefined;
	fixture?.remove();
	fixture = undefined;
	document.documentElement.style.removeProperty('font-size');
	window.scrollTo({ top: 0, behavior: 'instant' });
});

const settle = () =>
	new Promise<void>((resolve) =>
		requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
	);

async function mount(width = 1920, height = 1000) {
	await page.viewport(width, height);
	fixture = document.createElement('div');
	const css = articleSource.match(/<style>([\s\S]*?)<\/style>/)?.[1];
	if (!css) throw new Error('Article CSS is missing');
	const items = Array.from({ length: 25 }, (_, index) => ({
		id: `${index + 1}-section`,
		text: `${index + 1}. Article section`,
		level: 2
	}));
	fixture.innerHTML = `<style>${css.replace(/:global\(([^)]+)\)/g, '$1')}</style>
		<header class="nav-shell" style="position:sticky;top:0;height:88px;z-index:10;background:black">Header</header>
		<article class="container article-container has-toc">
			<header class="article-header"><h1>Article</h1></header>
			<figure class="article-cover-figure" style="height:200px">Cover</figure>
			<aside class="article-toc-aside"><details class="toc-details" open><summary class="toc-summary">Table of Contents</summary>
				<nav aria-label="Article sections"><ol class="toc-list">${items.map(({ id, text }) => `<li class="toc-item"><a href="#${id}" data-toc-id="${id}">${text}</a></li>`).join('')}</ol></nav>
			</details></aside>
			<div class="article-body-layout"><div class="article-main-column">
				<div class="article-prose">${items.map(({ id, text }) => `<h2 id="${id}" style="margin:0;height:100px">${text}</h2>`).join('')}</div>
				<section class="article-faq-section"><h2>Frequently Asked Questions</h2><div class="faq-accordion">
					${[1, 2, 3, 4, 5].map((i) => `<details class="faq-details"><summary class="faq-summary">Question ${i}</summary><div class="faq-answer"><p style="height:88px">Answer ${i}</p></div></details>`).join('')}
				</div></section><div style="height:200px">Author and post navigation</div>
			</div></div><section class="related-articles-section" style="height:1000px">Related articles</section>
		</article>`;
	document.body.append(fixture);
	const article = fixture.querySelector<HTMLElement>('article')!;
	const changes: string[] = [];
	cleanup = attachArticleNavigation(article, {
		items,
		onActiveHeadingChange: (id) => changes.push(id)
	});
	await settle();
	return { article, changes, panel: article.querySelector<HTMLDetailsElement>('.toc-details')! };
}

describe('article navigation using the real article CSS', () => {
	it('keeps the sticky top stable while the final FAQ changes the lower boundary', async () => {
		const { article, panel } = await mount();
		const faq = article.querySelectorAll<HTMLDetailsElement>('.faq-details')[4];
		const summary = faq.querySelector<HTMLElement>('summary')!;
		window.scrollTo({
			top: summary.getBoundingClientRect().top + scrollY - 150,
			behavior: 'instant'
		});
		await settle();
		const before = {
			top: panel.getBoundingClientRect().top,
			y: scrollY,
			summary: summary.getBoundingClientRect().top,
			height: panel.querySelector('nav')!.clientHeight
		};
		expect(before.top).toBe(96);
		faq.open = true;
		await settle();
		expect(panel.getBoundingClientRect().top).toBe(before.top);
		expect(scrollY).toBe(before.y);
		expect(summary.getBoundingClientRect().top).toBe(before.summary);
		expect(panel.querySelector('nav')!.clientHeight).toBeGreaterThan(before.height);
		expect(panel.getBoundingClientRect().bottom).toBeLessThanOrEqual(
			article.querySelector('.article-main-column')!.getBoundingClientRect().bottom
		);
		faq.open = false;
		await settle();
		expect(panel.getBoundingClientRect().top).toBe(before.top);
	});

	it('measures header changes and removes all observer/frame effects on disposal', async () => {
		const { article, changes } = await mount();
		const header = fixture!.querySelector<HTMLElement>('.nav-shell')!;
		header.style.height = '132px';
		await settle();
		expect(article.style.getPropertyValue('--article-header-height')).toBe('132px');
		window.dispatchEvent(new Event('scroll'));
		cleanup?.();
		cleanup = undefined;
		const count = changes.length;
		header.style.height = '180px';
		window.dispatchEvent(new Event('scroll'));
		window.dispatchEvent(new Event('resize'));
		await settle();
		expect(article.style.getPropertyValue('--article-header-height')).toBe('');
		expect(
			article.querySelector<HTMLElement>('.toc-details')!.style.getPropertyValue('--toc-nav-limit')
		).toBe('');
		expect(changes).toHaveLength(count);
	});

	it('keeps the summary and scrollable navigation reachable in a short viewport', async () => {
		const { panel } = await mount(1920, 320);
		window.scrollTo({ top: 600, behavior: 'instant' });
		await settle();
		expect(panel.getBoundingClientRect().top).toBe(96);
		expect(panel.getBoundingClientRect().bottom).toBeLessThanOrEqual(innerHeight);
		expect(panel.querySelector('summary')!.getBoundingClientRect().height).toBeGreaterThanOrEqual(
			44
		);
		expect(getComputedStyle(panel.querySelector('nav')!).overscrollBehaviorY).toBe('auto');
	});

	it('uses the current article heading set after client navigation without changing fragments', async () => {
		const { article, changes } = await mount();
		const beforeHash = location.hash;
		const second = document.getElementById('2-section')!;
		window.scrollTo({
			top: second.getBoundingClientRect().top + scrollY - 112,
			behavior: 'instant'
		});
		await settle();
		expect(changes.at(-1)).toBe('2-section');
		expect(location.hash).toBe(beforeHash);
		cleanup?.();
		const replacement: string[] = [];
		cleanup = attachArticleNavigation(article, {
			items: [{ id: '3-section', text: '3. Article section', level: 2 }],
			onActiveHeadingChange: (id) => replacement.push(id)
		});
		await settle();
		expect(replacement).toEqual(['3-section']);
		expect(changes.at(-1)).toBe('2-section');
	});

	it('keeps enlarged text inside the short viewport even when a full navigation row cannot fit', async () => {
		document.documentElement.style.fontSize = '200%';
		const { panel } = await mount(1920, 320);
		window.scrollTo({ top: 600, behavior: 'instant' });
		await settle();
		expect(panel.getBoundingClientRect().bottom).toBeLessThanOrEqual(innerHeight);
		expect(panel.querySelector('summary')!.getBoundingClientRect().height).toBeGreaterThanOrEqual(
			44
		);
	});
});
