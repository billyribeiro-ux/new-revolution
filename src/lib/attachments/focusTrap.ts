/**
 * Focus trap as a Svelte attachment.
 *
 * When applied to an element, Tab and Shift+Tab cycle inside it instead
 * of escaping to the surrounding document. Cleans up listeners on
 * unmount and restores focus to whatever was focused before the trap
 * mounted (the opener button, typically).
 *
 * This was an action. Attachments are the current Svelte 5 primitive for
 * "run when this element mounts, clean up when it goes away": they are
 * plain functions rather than a compiler directive, they compose through
 * spread props, and their setup runs inside an effect. The behaviour here
 * is unchanged; the action's `{ destroy }` object simply became the bare
 * teardown function an attachment returns.
 *
 * Use this for any custom-built modal / popover that isn't a native
 * `<dialog>` element (native `<dialog>` already gets a browser-managed
 * focus trap for free via `showModal()`). In this codebase the
 * NotificationBell dropdown is the canonical caller — it's a `<div>`
 * with `role="dialog"` that can't use showModal because it's
 * positioned in the page flow, not modal.
 *
 * Implementation notes:
 *
 *   - Focusable selector is the standard "tab-able" CSS set per the
 *     ARIA APG. We don't query for `tabindex` < 0; those elements get
 *     programmatic focus but aren't part of the tab cycle.
 *   - We re-query on every Tab press rather than caching at mount,
 *     so dynamically inserted content (e.g. a notification that
 *     arrives while the dropdown is open) joins the cycle without
 *     a teardown / remount.
 *   - First-element focus on mount is `queueMicrotask`'d so any
 *     in-flight transition / class change settles before we steal
 *     focus. Prevents the "modal flashes then focus jumps" jitter.
 */

import type { Attachment } from 'svelte/attachments';

const FOCUSABLE_SELECTOR = [
	'a[href]:not([disabled])',
	'button:not([disabled])',
	'textarea:not([disabled])',
	'input:not([type="hidden"]):not([disabled])',
	'select:not([disabled])',
	'[tabindex]:not([tabindex="-1"]):not([disabled])',
	'[contenteditable="true"]:not([disabled])'
].join(',');

export const focusTrap: Attachment<HTMLElement> = (node) => {
	const previouslyFocused = document.activeElement as HTMLElement | null;

	function focusables(): HTMLElement[] {
		return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
			(el) => !el.hasAttribute('aria-hidden')
		);
	}

	function focusFirst() {
		const items = focusables();
		if (items.length > 0) items[0]?.focus();
		else node.focus();
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key !== 'Tab') return;
		const items = focusables();
		if (items.length === 0) {
			event.preventDefault();
			return;
		}
		const first = items[0];
		const last = items[items.length - 1];
		if (!first || !last) return;
		const active = document.activeElement as HTMLElement | null;
		if (event.shiftKey) {
			if (active === first || !node.contains(active)) {
				event.preventDefault();
				last.focus();
			}
		} else if (active === last || !node.contains(active)) {
			event.preventDefault();
			first.focus();
		}
	}

	queueMicrotask(focusFirst);
	node.addEventListener('keydown', onKeydown);

	return () => {
		node.removeEventListener('keydown', onKeydown);
		// Restore focus to the element that had it before the trap mounted.
		// If that element is gone (removed from DOM), do nothing — the
		// browser's natural focus fallback is acceptable.
		if (previouslyFocused && document.body.contains(previouslyFocused)) {
			previouslyFocused.focus();
		}
	};
};
