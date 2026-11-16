<script lang="ts">
	import {
		CONCEPT_PREVIEW,
		PURCHASE_HISTORY_NOTICE,
		AI_CONTENT_NOTICE,
		PROPOSED_SERVICE_NOTICE
	} from '#lib/shared/development-status.ts';
</script>

{#if CONCEPT_PREVIEW}
	<dialog id="concept-purchase-dialog" aria-labelledby="concept-purchase-title">
		<h2 id="concept-purchase-title">Enrollment Window Notice</h2>
		<p>{PURCHASE_HISTORY_NOTICE}</p>
		<p>{PROPOSED_SERVICE_NOTICE}</p>
		<p>{AI_CONTENT_NOTICE}</p>
		<form method="dialog">
			<button class="btn btn-primary" type="submit">Close and continue exploring</button>
		</form>
	</dialog>
{/if}

<style>
	dialog {
		inline-size: min(38rem, calc(100% - 2rem));
		max-block-size: calc(100% - 2rem);
		overflow: auto;
		margin: auto;
		padding: clamp(1.25rem, 1.089rem + 0.689vi, 2rem);
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
		font-size: clamp(1.25rem, 1.089rem + 0.689vi, 1.75rem);
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
