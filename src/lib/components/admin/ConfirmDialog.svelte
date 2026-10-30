<script lang="ts">
	interface Props {
		open: boolean;
		title: string;
		message: string;
		confirmLabel?: string;
		cancelLabel?: string;
		variant?: 'danger' | 'warning' | 'default';
		onConfirm: () => void;
		onCancel: () => void;
	}

	let {
		open,
		title,
		message,
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		variant = 'default',
		onConfirm,
		onCancel
	}: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			onCancel();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="confirm-backdrop"
		role="dialog"
		aria-modal="true"
		aria-labelledby="confirm-dialog-title"
		aria-describedby="confirm-dialog-desc"
		tabindex="-1"
	>
		<div class="confirm-card">
			<h2 id="confirm-dialog-title" class="confirm-title">{title}</h2>
			<p id="confirm-dialog-desc" class="confirm-message">{message}</p>
			<div class="confirm-actions">
				<button type="button" class="btn-cancel" onclick={onCancel}>
					{cancelLabel}
				</button>
				<button
					{@attach (node) => node.focus()}
					type="button"
					class={[
						'btn-confirm',
						{ 'is-danger': variant === 'danger', 'is-warning': variant === 'warning' }
					]}
					onclick={onConfirm}
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.confirm-backdrop {
		position: fixed;
		inset: 0;
		z-index: 1200;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.25rem;
		background: rgba(11, 14, 18, 0.78);
		backdrop-filter: blur(4px);
	}

	.confirm-card {
		width: 100%;
		max-width: 440px;
		background: var(--panel);
		border: 1px solid var(--line-strong);
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: var(--shadow-lg);
	}

	.confirm-title {
		margin: 0 0 0.65rem;
		font-family: var(--font-display);
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--text);
	}

	.confirm-message {
		margin: 0 0 1.4rem;
		font-size: 0.94rem;
		line-height: 1.55;
		color: var(--text-secondary);
		white-space: pre-line;
	}

	.confirm-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.65rem;
	}

	.btn-cancel,
	.btn-confirm {
		padding: 0.55rem 1rem;
		border-radius: 8px;
		font-family: var(--font-sans);
		font-size: 0.88rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			background 0.15s ease,
			border-color 0.15s ease;
	}

	.btn-cancel {
		background: var(--panel2);
		border: 1px solid var(--line);
		color: var(--text);
	}

	.btn-cancel:hover {
		background: var(--btn-dark-hover);
	}

	.btn-confirm {
		background: var(--acid);
		border: 1px solid var(--acid);
		color: var(--ink);
	}

	.btn-confirm:hover {
		background: var(--btn-acid-hover);
	}

	.btn-confirm.is-danger {
		background: var(--coral);
		border-color: var(--coral);
		color: var(--ink);
	}

	.btn-confirm.is-warning {
		background: var(--acid2);
		border-color: var(--acid2);
		color: var(--ink);
	}
</style>
