<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowUpRightIcon from 'phosphor-svelte/lib/ArrowUpRightIcon';
	import EnvelopeIcon from 'phosphor-svelte/lib/EnvelopeIcon';
	import HeadsetIcon from 'phosphor-svelte/lib/HeadsetIcon';
	import PhoneIcon from 'phosphor-svelte/lib/PhoneIcon';
	import { SUPPORT_CONTACT } from '#lib/data/site.ts';

	interface Props {
		onPreviewNavigate?: (href: string, targetId?: string, event?: MouseEvent) => void;
	}

	let { onPreviewNavigate }: Props = $props();

	const { phone, email, contactHref } = SUPPORT_CONTACT;
	const hasDirectContact = Boolean(phone || email);
	const phoneHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : '';
</script>

<!-- Support block: 260px tall on tablet/desktop -->
<section class="questions" aria-labelledby="have-questions-title">
	<div class="container questions__inner">
		<span class="questions__icon" aria-hidden="true">
			<HeadsetIcon size={24} weight="duotone" />
		</span>
		<h2 id="have-questions-title" class="questions__title">Have Questions?</h2>

		{#if hasDirectContact}
			<p class="questions__copy">
				If you’d like to speak to a live support representative you can
				<!-- eslint-disable svelte/no-navigation-without-resolve -- tel:/mailto: links are not app routes -->
				{#if phone}call <a href={phoneHref}>{phone}</a>{/if}
				{#if phone && email}or{/if}
				{#if email}email <a href={`mailto:${email}`}>{email}</a>{/if}.
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</p>
		{:else}
			<p class="questions__copy">
				Our support team can help with memberships, rooms, alerts, and your 1-on-1 mentorship
				application.
			</p>
		{/if}

		<ul class="questions__actions">
			<li>
				<a
					class="btn btn-primary"
					href={resolve(contactHref as '/')}
					onclick={(e) => onPreviewNavigate?.(contactHref, 'footer', e)}
				>
					<EnvelopeIcon size={18} weight="bold" aria-hidden="true" />
					Contact support
					<ArrowUpRightIcon size={16} weight="bold" aria-hidden="true" />
				</a>
			</li>
			{#if phone}
				<li>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- tel: link is not an app route -->
					<a class="btn btn-outline" href={phoneHref}>
						<PhoneIcon size={18} weight="bold" aria-hidden="true" />
						{phone}
					</a>
				</li>
			{/if}
		</ul>
	</div>
</section>

<style>
	.questions {
		box-sizing: border-box;
		background:
			radial-gradient(ellipse at 50% 0%, rgba(195, 231, 83, 0.08), transparent 55%), var(--bg-soft);
		border-block-start: 1px solid var(--line);
	}

	.questions__inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		min-block-size: 260px;
		padding-block: 40px;
	}

	.questions__icon {
		display: grid;
		place-items: center;
		inline-size: 40px;
		block-size: 40px;
		margin-block-end: 10px;
		color: var(--acid);
		border: 1px solid rgba(220, 255, 101, 0.4);
		background: rgba(220, 255, 101, 0.07);
	}

	.questions__title {
		margin: 0 0 6px;
		font-size: clamp(1.5rem, 2.4vw, 2rem);
		max-inline-size: none;
	}

	.questions__copy {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.9375rem;
		line-height: 1.7;
		max-inline-size: 60ch;
	}

	.questions__copy a {
		color: var(--text);
		font-weight: 700;
		text-decoration: underline;
		text-decoration-color: var(--acid);
		text-underline-offset: 4px;
	}

	.questions__copy a:hover {
		color: var(--acid);
	}

	.questions__actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 12px;
		list-style: none;
		margin: 16px 0 0;
		padding: 0;
	}

	.questions__actions .btn {
		min-block-size: 44px;
		inline-size: auto;
	}

	@media (min-width: 768px) {
		.questions {
			block-size: 260px;
		}

		.questions__inner {
			block-size: 100%;
			padding-block: 0;
		}
	}
</style>
