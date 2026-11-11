<script lang="ts">
	import {
		PURCHASE_HISTORY_NOTICE,
		AI_CONTENT_NOTICE,
		PROPOSED_SERVICE_NOTICE
	} from '#lib/shared/development-status.ts';
</script>

<dialog id="concept-purchase-dialog" aria-labelledby="concept-purchase-title">
	<h2 id="concept-purchase-title">Purchases unavailable — concept only</h2>
	<p>{PURCHASE_HISTORY_NOTICE}</p>
	<p>{PROPOSED_SERVICE_NOTICE}</p>
	<p>{AI_CONTENT_NOTICE}</p>
	<p>This preview does not start checkout or ask for card details.</p>
	<form method="dialog">
		<button class="btn btn-primary" type="submit">Close and continue exploring</button>
	</form>
</dialog>

<style>
	dialog {
		inline-size: min(38rem, calc(100% - 2rem));
		max-block-size: calc(100% - 2rem);
		overflow: auto;
		margin: auto;
		padding: clamp(1.25rem, 4vw, 2rem);
		border: 1px solid var(--line);
		background: var(--bg);
		color: var(--text);
		font-family: var(--font-sans);
	}

	dialog::backdrop {
		background: rgb(0 0 0 / 0.75);
	}

	h2 {
		font-family: var(--font-display);
		font-size: clamp(1.25rem, 3vw, 1.75rem);
		line-height: 1.35;
		margin: 0 0 1rem;
	}

	p {
		margin-block: 0 1rem;
		line-height: 1.65;
	}

	button {
		white-space: normal;
	}
</style>
