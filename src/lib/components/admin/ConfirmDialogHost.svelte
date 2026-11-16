<script lang="ts">
	/**
	 * Renders the single global confirm-dialog instance for the admin app.
	 * Mounted once in the admin layout (`/admin/+layout.svelte`). Listens
	 * to the `activeConfirm` store and shows `<ConfirmDialog>` whenever a
	 * call to `confirmAction()` is pending.
	 *
	 * Pairs with `$lib/stores/confirm.svelte.ts` — see that module's docs
	 * for the request/response contract.
	 */
	import { getActiveConfirm } from '#lib/stores/confirm.svelte.js';
	import ConfirmDialog from './ConfirmDialog.svelte';

	// `req` is derived from the Svelte 5 rune state in `confirm.svelte.ts`.
	// `open` is derived from `req !== null`; writable `$derived` (Svelte 5.25+)
	// lets `<ConfirmDialog>`'s `bind:open` assign `open = false` on dismiss.
	let req = $derived(getActiveConfirm());

	let open = $derived.by(() => req !== null);

	function handleConfirm() {
		req?.resolve(true);
	}

	function handleCancel() {
		req?.resolve(false);
	}
</script>

{#if req}
	<ConfirmDialog
		bind:open
		title={req.title}
		message={req.message ?? ''}
		confirmLabel={req.confirmLabel ?? 'Confirm'}
		cancelLabel={req.cancelLabel ?? 'Cancel'}
		tone={req.tone ?? 'warning'}
		onConfirm={handleConfirm}
		onCancel={handleCancel}
	/>
{/if}
