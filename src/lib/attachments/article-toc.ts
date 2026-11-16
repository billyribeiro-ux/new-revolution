import type { TocEntry } from '#lib/shared/seo/toc';

interface ArticleNavigationOptions {
	items: readonly TocEntry[];
	onActiveHeadingChange: (id: string) => void;
}

/**
 * Keep CSS sticky in charge of positioning and keep TOC navigation links
 * free of URL hash fragments (matching Easy Table of Contents `avoid_anch_jump`
 * and `observerDisabled` click-lock behavior).
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
	const firstLink = nav?.querySelector<HTMLElement>('[data-toc-id]');
	const desktop = window.matchMedia('(min-width: 118.75rem)');
	const headings = items.map(({ id }) => ({ id, element: document.getElementById(id) }));
	const links = Array.from(nav?.querySelectorAll<HTMLElement>('[data-toc-id]') ?? []);
	let frame = 0;
	let disposed = false;
	let forceFollow = false;
	let currentId = '';
	let lockedHeadingId = '';
	let lockUntil = 0;
	let lastNavLimit = -1;
	let lastHeaderHeight = -1;

	function getAnchorOffset(): number {
		const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
		const headerHeight = header?.getBoundingClientRect().height ?? 0;
		return headerHeight + rem * 1.5;
	}

	function scrollToHeading(targetId: string, smooth: boolean) {
		const target = document.getElementById(targetId);
		if (!target) return;
		const anchorOffset = getAnchorOffset();
		const targetTop = Math.max(
			0,
			target.getBoundingClientRect().top + window.scrollY - anchorOffset + 4
		);
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		window.scrollTo({
			top: targetTop,
			behavior: smooth && !reducedMotion ? 'smooth' : 'instant'
		});
	}

	function onNavClick(event: MouseEvent) {
		if (
			event.defaultPrevented ||
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}
		const targetEl = event.target instanceof Element ? event.target : null;
		const link = targetEl?.closest<HTMLAnchorElement>('a[data-toc-id]');
		const targetId = link?.dataset.tocId;
		if (!link || !targetId) return;

		const targetHeading = document.getElementById(targetId);
		if (!targetHeading) return;

		event.preventDefault();

		// Lock active heading state during smooth scroll (matches ez-toc observerDisabled)
		lockedHeadingId = targetId;
		lockUntil = performance.now() + 1800;
		forceFollow = true;
		if (currentId !== targetId) {
			currentId = targetId;
			onActiveHeadingChange(targetId);
		}
		scrollToHeading(targetId, true);
		schedule();
	}

	function clearLockOnManualInput() {
		if (lockedHeadingId) {
			lockedHeadingId = '';
			lockUntil = 0;
		}
	}

	function consumeLocationHash() {
		if (window.location.hash.length <= 1) return;
		const rawHashId = decodeURIComponent(window.location.hash.slice(1));
		const matchingHeading = document.getElementById(rawHashId);
		if (matchingHeading) {
			if (items.some((item) => item.id === rawHashId)) {
				lockedHeadingId = rawHashId;
				lockUntil = performance.now() + 1000;
				forceFollow = true;
				if (currentId !== rawHashId) {
					currentId = rawHashId;
					onActiveHeadingChange(rawHashId);
				}
			}
			scrollToHeading(rawHashId, false);
			window.history.replaceState(
				window.history.state,
				'',
				`${window.location.pathname}${window.location.search}`
			);
			schedule();
		}
	}

	// If the reader arrived via a legacy #fragment URL, scroll to the target and strip the # from the URL bar
	consumeLocationHash();

	function update() {
		frame = 0;
		if (disposed) return;
		const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
		const headerHeight = header?.getBoundingClientRect().height ?? 0;
		const anchorOffset = headerHeight + rem * 1.5;

		let nextId = items[0]?.id ?? '';
		const now = performance.now();
		if (lockedHeadingId && now < lockUntil) {
			nextId = lockedHeadingId;
			const lockedEl = document.getElementById(lockedHeadingId);
			if (lockedEl && Math.abs(lockedEl.getBoundingClientRect().top - anchorOffset) <= 12) {
				// Target reached; keep locked briefly until scroll settles
				lockUntil = Math.min(lockUntil, now + 150);
			}
		} else {
			lockedHeadingId = '';
			lockUntil = 0;
			for (const { id, element } of headings) {
				if (element && element.getBoundingClientRect().top <= anchorOffset + 1) nextId = id;
			}
		}

		let navLimit = -1;
		let followDelta = 0;
		if (desktop.matches && panel && summary && nav) {
			const stickyTop = headerHeight + rem * 0.5;
			const summaryHeight = summary.getBoundingClientRect().height + 2;
			const viewportAvailable = window.innerHeight - stickyTop - rem;
			// Constant viewport-bounded max-height so the TOC never squishes or slices text at the bottom
			navLimit = Math.max(0, viewportAvailable - summaryHeight);

			const activeLink = links.find((link) => link.dataset.tocId === nextId);
			if (
				panel.open &&
				activeLink &&
				(forceFollow || (nextId !== currentId && !panel.matches(':focus-within, :hover')))
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
	for (const element of [header, summary, firstLink]) {
		if (element) observer.observe(element);
	}
	nav?.addEventListener('click', onNavClick);
	window.addEventListener('hashchange', consumeLocationHash);
	window.addEventListener('wheel', clearLockOnManualInput, { passive: true });
	window.addEventListener('touchmove', clearLockOnManualInput, { passive: true });
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule, { passive: true });
	desktop.addEventListener('change', schedule);
	panel?.addEventListener('toggle', onToggle);
	schedule();
	return () => {
		disposed = true;
		cancelAnimationFrame(frame);
		observer.disconnect();
		nav?.removeEventListener('click', onNavClick);
		window.removeEventListener('hashchange', consumeLocationHash);
		window.removeEventListener('wheel', clearLockOnManualInput);
		window.removeEventListener('touchmove', clearLockOnManualInput);
		window.removeEventListener('scroll', schedule);
		window.removeEventListener('resize', schedule);
		desktop.removeEventListener('change', schedule);
		panel?.removeEventListener('toggle', onToggle);
		article.style.removeProperty('--article-header-height');
		panel?.style.removeProperty('--toc-nav-limit');
	};
}
