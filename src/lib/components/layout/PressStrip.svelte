<script lang="ts">
	import { PRESS_MENTIONS, type PressMention } from '#lib/data/site.ts';

	interface Props {
		mentions?: readonly PressMention[];
	}

	let { mentions = PRESS_MENTIONS }: Props = $props();
</script>

<!-- Recognition strip: 146px tall on tablet/desktop. Homepage only. -->
<section class="press" aria-labelledby="press-title">
	<div class="container press__inner">
		<p id="press-title" class="press__label">As featured in</p>
		<ul class="press__list">
			{#each mentions as mention (mention.id)}
				<li class="press__item press__item--{mention.id}">{mention.name}</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.press {
		box-sizing: border-box;
		background: var(--off);
		color: var(--ink);
		border-block-start: 1px solid var(--card-light-border);
	}

	.press__inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		min-block-size: 146px;
		padding-block: 28px;
	}

	.press__label {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.6875rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--lightmuted);
		max-inline-size: none;
	}

	.press__list {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 14px 40px;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.press__item {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 1.125rem;
		letter-spacing: -0.02em;
		color: #8b9088;
		filter: grayscale(1);
		transition: color 0.2s var(--ease-out);
	}

	.press__item:hover {
		color: var(--ink);
	}

	.press__item--forbes {
		font-family: Georgia, 'Times New Roman', serif;
		font-weight: 700;
		letter-spacing: 0;
	}

	.press__item--cnbc,
	.press__item--fox-business,
	.press__item--fox-news {
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-size: 1rem;
	}

	@media (min-width: 768px) {
		.press {
			block-size: 146px;
		}

		.press__inner {
			block-size: 100%;
			padding-block: 0;
		}
	}
</style>
