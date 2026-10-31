/**
 * Imperative confirmation-dialog helper.
 *
 * Why not just render <ConfirmDialog> in every page that needs one?
 *
 * Because ~17 admin call sites need a confirmation dialog, and threading
 * `bind:open + dialog config + onConfirm` state through each one leads to
 * the exact boilerplate `window.confirm()` was popular for short-circuiting.
 * This helper restores the ergonomics — `await confirmAction({...})` — but
 * with a properly accessible, focus-trapped, app-styled modal underneath.
 *
 * Wiring:
 *   1. The admin root layout renders a single <ConfirmDialogHost /> once.
 *   2. Any admin component imports `confirmAction` and `await`s it; the
 *      promise resolves `true` on confirm and `false` on cancel/escape.
 *   3. Only one dialog is in-flight at a time. A second call while one
 *      is open is rejected with a guard error to surface the misuse loud
 *      (admin click handlers should not race their own dialogs).
 */
import { writable, type Writable } from 'svelte/store';

export type ConfirmTone = 'warning' | 'danger';

export interface ConfirmRequest {
	title: string;
	message?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	tone?: ConfirmTone;
}

interface ActiveRequest extends ConfirmRequest {
	resolve: (value: boolean) => void;
}

/**
 * Currently-open dialog state. `null` when no dialog is showing. The host
 * component subscribes to this and renders <ConfirmDialog> when non-null.
 */
export const activeConfirm: Writable<ActiveRequest | null> = writable(null);

let inFlight = false;

/**
 * Open a confirm dialog and resolve `true` on confirm or `false` on
 * cancel / ESC / backdrop click. Throws if another dialog is still open
 * — admin handlers should `await` one before opening the next.
 */
export function confirmAction(req: ConfirmRequest): Promise<boolean> {
	if (inFlight) {
		return Promise.reject(
			new Error(
				'[confirmAction] another dialog is already open. ' +
					'Always await the previous confirmAction before opening another.'
			)
		);
	}
	inFlight = true;
	return new Promise<boolean>((resolve) => {
		activeConfirm.set({
			title: req.title,
			message: req.message ?? '',
			confirmLabel: req.confirmLabel ?? 'Confirm',
			cancelLabel: req.cancelLabel ?? 'Cancel',
			tone: req.tone ?? 'warning',
			resolve: (value) => {
				inFlight = false;
				activeConfirm.set(null);
				resolve(value);
			}
		});
	});
}
