import type { Attachment } from 'svelte/attachments';

let sharedObserver: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver | null {
	if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
		return null;
	}

	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		return null;
	}

	if (!sharedObserver) {
		sharedObserver = new IntersectionObserver(
			(entries, obs) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add('in-view');
						obs.unobserve(entry.target);
					}
				}
			},
			{
				threshold: 0.06,
				rootMargin: '0px 0px 65px 0px'
			}
		);
	}

	return sharedObserver;
}

/**
 * Svelte 5.29+ {@attach} directive for intersection-driven reveal animations.
 * Automatically respects `prefers-reduced-motion: reduce`.
 */
export const revealOnScroll: Attachment<HTMLElement> = (node) => {
	const observer = getObserver();

	if (!observer) {
		node.classList.add('in-view');
		return;
	}

	observer.observe(node);

	return () => {
		observer.unobserve(node);
	};
};
