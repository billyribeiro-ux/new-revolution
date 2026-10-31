/**
 * Toast Notification Store — Svelte 5 Runes
 *
 * Usage:
 * import { toast, getToasts } from '#lib/stores/toast.svelte.js';
 * toast.success('Operation completed');
 * toast.error('Something went wrong');
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
	id: string;
	type: ToastType;
	title: string | undefined;
	message: string;
	duration: number;
	dismissible: boolean;
}

interface ToastOptions {
	title?: string | undefined;
	duration?: number | undefined;
	dismissible?: boolean | undefined;
}

const DEFAULT_DURATION = 5000;
const MAX_TOASTS = 5;

let items = $state<ToastItem[]>([]);
// eslint-disable-next-line svelte/prefer-svelte-reactivity -- internal timer tracking, not reactive state
const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

function generateId(): string {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return `toast-${crypto.randomUUID()}`;
	}
	return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function addToast(type: ToastType, message: string, options: ToastOptions = {}): string {
	const toastItem: ToastItem = {
		id: generateId(),
		type,
		message,
		title: options.title,
		duration: options.duration ?? DEFAULT_DURATION,
		dismissible: options.dismissible ?? true
	};

	if (items.length >= MAX_TOASTS) {
		const oldest = items[0];
		if (oldest) dismiss(oldest.id);
	}
	items = [...items, toastItem];

	if (toastItem.duration > 0) {
		const timer = setTimeout(() => {
			dismiss(toastItem.id);
		}, toastItem.duration);
		timeouts.set(toastItem.id, timer);
	}

	announceToScreenReader(message, type);
	return toastItem.id;
}

function dismiss(id: string): void {
	const timer = timeouts.get(id);
	if (timer) {
		clearTimeout(timer);
		timeouts.delete(id);
	}
	items = items.filter((t) => t.id !== id);
}

function dismissAll(): void {
	for (const timer of timeouts.values()) {
		clearTimeout(timer);
	}
	timeouts.clear();
	items = [];
}

/**
 * The ONE announcement path for toasts: the app shell's persistent live
 * regions (`src/routes/+layout.svelte`), which exist before any toast does, so
 * screen readers reliably pick up the change. Errors go to the assertive
 * region, everything else to the polite one. The visual toast carries no live
 * role (it used to, so each toast was read twice).
 */
function announceToScreenReader(message: string, type: ToastType): void {
	if (typeof document === 'undefined') return;

	const liveRegion = document.getElementById(
		type === 'error' ? 'aria-live-region-assertive' : 'aria-live-region'
	);
	if (liveRegion) {
		const prefix =
			type === 'error'
				? 'Error: '
				: type === 'warning'
					? 'Warning: '
					: type === 'success'
						? 'Success: '
						: '';
		liveRegion.textContent = prefix + message;
		setTimeout(() => {
			liveRegion.textContent = '';
		}, 1000);
	}
}

export function getToasts(): ToastItem[] {
	return items;
}

export const toast = {
	success: (message: string, options?: ToastOptions) =>
		addToast('success', message, { title: options?.title ?? 'Success', ...options }),
	error: (message: string, options?: ToastOptions) =>
		addToast('error', message, { title: options?.title ?? 'Error', ...options }),
	warning: (message: string, options?: ToastOptions) =>
		addToast('warning', message, { title: options?.title ?? 'Warning', ...options }),
	info: (message: string, options?: ToastOptions) =>
		addToast('info', message, { title: options?.title, ...options }),
	dismiss,
	dismissAll
};
