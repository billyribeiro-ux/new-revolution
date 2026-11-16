<script lang="ts">
	import {
		CONCEPT_PREVIEW,
		DEVELOPMENT_NOTICE,
		PURCHASE_HISTORY_NOTICE,
		DEVELOPMENT_PURPOSE
	} from '#lib/shared/development-status.ts';
</script>

{#if CONCEPT_PREVIEW}
	<aside class="development-notice" aria-label="Enrollment window notice">
		<div class="container">
			<p><strong>Enrollment notice</strong> {DEVELOPMENT_NOTICE}</p>
			<p>{PURCHASE_HISTORY_NOTICE} {DEVELOPMENT_PURPOSE}</p>
		</div>
	</aside>
{/if}

<style>
	.development-notice {
		background: var(--off);
		color: var(--ink);
		border-block-end: 1px solid var(--ink);
		padding-block: 0.875rem;
		font-family: var(--font-sans);
		font-size: var(--step-sm);
		line-height: 1.6;
	}

	p {
		margin: 0;
		overflow-wrap: anywhere;
	}

	p + p {
		margin-block-start: 0.25rem;
	}

	strong {
		font-family: var(--font-display);
	}
</style>
