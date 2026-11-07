import type { TocEntry } from '#lib/shared/seo/toc';

interface ArticleNavigationOptions {
	items: readonly TocEntry[];
	onActiveHeadingChange: (id: string) => void;
}

/**
 * Keep CSS sticky in charge of positioning. Only the scrollable navigation's
 * available height changes near the reading column's lower boundary.
 * Native details, links, fragment history and focus retain browser ownership.
 */
export function attachArticleNavigation(
	article: HTMLElement,
	{ items, onActiveHeadingChange }: ArticleNavigationOptions
): () => void {
	const header = document.querySelector<HTMLElement>('.nav-shell');
	const rail = article.querySelector<HTMLElement>('.article-toc-aside');
	const panel = rail?.querySelector<HTMLDetailsElement>('.toc-details');
	const summary = panel?.querySelector<HTMLElement>('summary');
	const nav = panel?.querySelector<HTMLElement>('nav');
	const boundary = article.querySelector<HTMLElement>('.article-main-column');
	const firstLink = nav?.querySelector<HTMLElement>('[data-toc-id]');
	const desktop = window.matchMedia('(min-width: 118.75rem)');
	const headings = items.map(({ id }) => ({ id, element: document.getElementById(id) }));
	const links = Array.from(nav?.querySelectorAll<HTMLElement>('[data-toc-id]') ?? []);
	let frame = 0;
	let disposed = false;
	let forceFollow = false;
	let currentId = '';
	let lastNavLimit = -1;
	let lastHeaderHeight = -1;

	function update() {
		frame = 0;
		if (disposed) return;
		const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
		const headerHeight = header?.getBoundingClientRect().height ?? 0;
		const anchorOffset = headerHeight + rem * 1.5;
		let nextId = items[0]?.id ?? '';
		for (const { id, element } of headings) {
			if (element && element.getBoundingClientRect().top <= anchorOffset + 1) nextId = id;
		}

		let navLimit = -1;
		let followDelta = 0;
		if (desktop.matches && rail && panel && summary && nav && boundary) {
			const stickyTop = headerHeight + rem * 0.5;
			const railRect = rail.getBoundingClientRect();
			const top = Math.max(stickyTop, railRect.top);
			const viewportAvailable = window.innerHeight - top - rem;
			const boundaryAvailable = boundary.getBoundingClientRect().bottom - top - rem;
			const navStyle = getComputedStyle(nav);
			const navChrome =
				Number.parseFloat(navStyle.paddingTop) +
				Number.parseFloat(navStyle.paddingBottom) +
				Number.parseFloat(navStyle.borderTopWidth) +
				Number.parseFloat(navStyle.borderBottomWidth);
			// Preserve a useful one-link viewport before allowing the natural sticky exit.
			const minimum = (firstLink?.getBoundingClientRect().height ?? rem * 2.75) + navChrome;
			const summaryHeight = summary.getBoundingClientRect().height + 2;
			navLimit = Math.min(
				Math.max(0, viewportAvailable - summaryHeight),
				Math.max(minimum, boundaryAvailable - summaryHeight)
			);
			const activeLink = links.find((link) => link.dataset.tocId === nextId);
			if (
				panel.open &&
				activeLink &&
				(forceFollow ||
					((nextId !== currentId || navLimit < lastNavLimit) &&
						!panel.matches(':focus-within, :hover')))
			) {
				const linkRect = activeLink.getBoundingClientRect();
				const navRect = nav.getBoundingClientRect();
				const bottom = navRect.top + Math.min(navRect.height, navLimit);
				if (linkRect.top < navRect.top) followDelta = linkRect.top - navRect.top;
				else if (linkRect.bottom > bottom) followDelta = linkRect.bottom - bottom;
			}
		}

		// Group geometry reads above and writes below to avoid per-heading layout flushes.
		if (headerHeight !== lastHeaderHeight) {
			article.style.setProperty('--article-header-height', `${headerHeight}px`);
			lastHeaderHeight = headerHeight;
		}
		if (panel && navLimit !== lastNavLimit) {
			if (navLimit < 0) panel.style.removeProperty('--toc-nav-limit');
			else panel.style.setProperty('--toc-nav-limit', `${navLimit}px`);
			lastNavLimit = navLimit;
		}
		if (followDelta && nav) nav.scrollTop += followDelta;
		forceFollow = false;
		if (nextId !== currentId) {
			currentId = nextId;
			onActiveHeadingChange(nextId);
		}
	}

	function schedule() {
		if (!disposed && !frame) frame = requestAnimationFrame(update);
	}
	function onToggle() {
		forceFollow = Boolean(panel?.open);
		schedule();
	}
	const observer = new ResizeObserver(schedule);
	for (const element of [header, boundary, summary, firstLink]) {
		if (element) observer.observe(element);
	}
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule, { passive: true });
	desktop.addEventListener('change', schedule);
	panel?.addEventListener('toggle', onToggle);
	schedule();
	return () => {
		disposed = true;
		cancelAnimationFrame(frame);
		observer.disconnect();
		window.removeEventListener('scroll', schedule);
		window.removeEventListener('resize', schedule);
		desktop.removeEventListener('change', schedule);
		panel?.removeEventListener('toggle', onToggle);
		article.style.removeProperty('--article-header-height');
		panel?.style.removeProperty('--toc-nav-limit');
	};
}
