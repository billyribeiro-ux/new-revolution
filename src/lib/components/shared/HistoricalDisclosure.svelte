<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<p class="historical-disclosure">
	Historical examples are selected educational case studies, not typical results. Hypothetical or
	simulated results have limitations, including hindsight and differences from actual execution, as
	described in CFTC Rule 4.41. Trading can result in loss. Review the <a
		href={resolve('/track-record')}>evidence and limitations</a
	>
	and <a href={resolve('/risk-disclosure')}>risk disclosure</a>.
</p>

<style>
	.historical-disclosure {
		font-size: var(--step-caption);
		line-height: var(--leading-body);
		color: inherit;
		max-inline-size: 75ch;
		margin-block: 1rem;
	}
	a {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
</style>
