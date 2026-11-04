<script lang="ts">
	import FacebookLogoIcon from 'phosphor-svelte/lib/FacebookLogoIcon';
	import InstagramLogoIcon from 'phosphor-svelte/lib/InstagramLogoIcon';
	import XLogoIcon from 'phosphor-svelte/lib/XLogoIcon';
	import YoutubeLogoIcon from 'phosphor-svelte/lib/YoutubeLogoIcon';
	import { SOCIAL_LINKS, type SocialLink } from '#lib/data/site.ts';

	const icons = {
		youtube: YoutubeLogoIcon,
		x: XLogoIcon,
		facebook: FacebookLogoIcon,
		instagram: InstagramLogoIcon
	} satisfies Record<SocialLink['id'], unknown>;
</script>

<!-- Social profiles strip: 80px tall on tablet/desktop -->
<section class="social-bar" aria-label="Revolution Trading Pros on social media">
	<div class="container social-bar__inner">
		<p class="social-bar__label">Find us on:</p>
		<ul class="social-bar__list">
			{#each SOCIAL_LINKS as link (link.id)}
				{@const Icon = icons[link.id]}
				<li>
					<!-- eslint-disable svelte/no-navigation-without-resolve -- external social profiles, not app routes -->
					<a
						class="social-bar__link"
						href={link.href}
						target="_blank"
						rel="noopener noreferrer me"
						aria-label="{link.label} (opens in a new tab)"
					>
						<Icon size={24} weight="fill" aria-hidden="true" />
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.social-bar {
		box-sizing: border-box;
		background: var(--panel);
		border-block: 1px solid var(--line);
	}

	.social-bar__inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 12px 24px;
		min-block-size: 80px;
		padding-block: 16px;
	}

	.social-bar__label {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
		max-inline-size: none;
	}

	.social-bar__list {
		display: flex;
		align-items: center;
		gap: 12px;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.social-bar__link {
		display: grid;
		place-items: center;
		inline-size: 48px;
		block-size: 48px;
		color: var(--text);
		border: 1px solid var(--btn-outline-border);
		transition:
			background-color 0.2s var(--ease-out),
			border-color 0.2s var(--ease-out),
			color 0.2s var(--ease-out),
			transform 0.2s var(--ease-out);
	}

	.social-bar__link:hover,
	.social-bar__link:focus-visible {
		background: var(--acid);
		border-color: var(--acid);
		color: var(--ink);
		transform: translateY(-2px);
	}

	@media (min-width: 768px) {
		.social-bar {
			block-size: 80px;
		}

		.social-bar__inner {
			block-size: 100%;
			padding-block: 0;
			gap: 32px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.social-bar__link:hover {
			transform: none;
		}
	}
</style>
