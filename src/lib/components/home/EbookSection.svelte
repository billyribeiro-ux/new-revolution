<script lang="ts">
	import ArrowUpRightIcon from 'phosphor-svelte/lib/ArrowUpRightIcon';
	import { revealOnScroll } from '#lib/attachments/reveal.ts';
	import {
		EBOOK_PROFILES,
		EBOOK_TAKEAWAYS,
		type EbookProfile,
		type EbookTakeaway
	} from '#lib/data/homepage.ts';
	import { submitEbookLead } from '../../../routes/home.remote.ts';

	interface Props {
		takeaways?: readonly EbookTakeaway[];
		profiles?: readonly EbookProfile[];
	}

	let { takeaways = EBOOK_TAKEAWAYS, profiles = EBOOK_PROFILES }: Props = $props();

	let localFormStatus = $state('');
</script>

<!-- 08 / EBOOK (<h3> for eBook title + SvelteKit 3.1 experimental remote form) -->
<section class="section ebook" id="ebook" aria-labelledby="ebook-title">
	<div class="container ebook-grid">
		<div class="reveal" {@attach revealOnScroll}>
			<div class="eyebrow">FREE DIGITAL RESOURCE / ZERO HYPE</div>
			<h2 id="ebook-title">
				Your next trade should start with <span class="ebook-underline">a plan.</span>
			</h2>
			<p class="ebook-lead">
				Explore the proposed free stock and options trading guide. Learn how to identify a thesis,
				set invalidation levels, review risk, and approach accounts of different sizes responsibly.
			</p>
			<h3 class="ebook-name">
				The Institutional Execution Playbook: Market Structure, Entries, Exits &amp; Risk
			</h3>
			<ul class="ebook-takeaways">
				{#each takeaways as item (item.number)}
					<li>
						<strong>{item.number}</strong>
						<span>{item.text}</span>
					</li>
				{/each}
			</ul>
		</div>

		<form
			class="ebook-form reveal"
			id="ebookForm"
			{@attach revealOnScroll}
			{...submitEbookLead.enhance(async (form) => {
				localFormStatus = '';
				try {
					const ok = await form.submit();
					if (ok) {
						localFormStatus =
							submitEbookLead.result?.message ??
							'Preview only: the form validates locally, but no email was sent or data collected. Connect email delivery and publish the eBook before launch.';
					}
				} catch {
					localFormStatus =
						'Preview only: the form validates locally, but no email was sent or data collected. Connect email delivery and publish the eBook before launch.';
				}
			})}
		>
			<div class="form-caption">EARLY ACCESS / DIGITAL EDITION</div>
			<h3>Where should we send your free eBook?</h3>

			<div class="field">
				<label for="firstName">First name</label>
				<input
					id="firstName"
					placeholder="Enter your first name"
					autocomplete="given-name"
					minlength="1"
					maxlength="80"
					required
					{...submitEbookLead.fields.firstName.as('text')}
				/>
				{#each submitEbookLead.fields.firstName.issues() as issue (issue.message)}
					<p class="field-issue">{issue.message}</p>
				{/each}
			</div>

			<div class="field">
				<label for="email">Email address</label>
				<input
					id="email"
					placeholder="Enter your best email address"
					autocomplete="email"
					required
					{...submitEbookLead.fields.email.as('email')}
				/>
				{#each submitEbookLead.fields.email.issues() as issue (issue.message)}
					<p class="field-issue">{issue.message}</p>
				{/each}
			</div>

			<div class="field">
				<label for="profile">Which best describes you?</label>
				<select id="profile" required {...submitEbookLead.fields.profile.as('select')}>
					<option value="" selected disabled>Select your trading profile</option>
					{#each profiles as profileOption (profileOption)}
						<option value={profileOption}>{profileOption}</option>
					{/each}
				</select>
				{#each submitEbookLead.fields.profile.issues() as issue (issue.message)}
					<p class="field-issue">{issue.message}</p>
				{/each}
			</div>

			<button class="btn btn-primary" type="submit" disabled={!!submitEbookLead.pending}>
				<span>Send Me the Free eBook</span>
				<span class="arrow" aria-hidden="true">
					<ArrowUpRightIcon size={16} weight="bold" />
				</span>
			</button>

			<p class="privacy">
				DESIGN PREVIEW: This form does not collect, store, or transmit your information. Connect a
				consent-aware mailing service and create the eBook before launching.
			</p>

			{#if !submitEbookLead.fields.allIssues()?.length && (localFormStatus || submitEbookLead.result?.message)}
				<p class="form-status" id="formStatus" role="status" aria-live="polite">
					{localFormStatus || submitEbookLead.result?.message}
				</p>
			{/if}
		</form>
	</div>
</section>

<style>
	.ebook {
		background: var(--acid);
		color: var(--ink);
		overflow: hidden;
	}

	.ebook::before {
		content: 'R';
		position: absolute;
		inset-block-start: -130px;
		inset-inline-start: -90px;
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 640px;
		line-height: 0.9;
		color: rgba(0, 0, 0, 0.045);
		pointer-events: none;
	}

	.ebook-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 34px;
		align-items: center;
		position: relative;
	}

	.ebook .eyebrow {
		color: #3f5321;
	}

	.ebook-underline {
		text-decoration: underline;
		text-decoration-thickness: 3px;
		text-underline-offset: 8px;
	}

	.ebook-lead {
		font-size: 1rem;
		line-height: 1.75;
		max-inline-size: min(70ch, 680px);
	}

	.ebook-name {
		margin-block: 24px;
		border-inline-start: 3px solid #172012;
		padding-inline-start: 21px;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: clamp(1.15rem, 1.8vw, 1.5rem);
		line-height: 1.3;
		letter-spacing: -0.015em;
		max-inline-size: 34ch;
	}

	.ebook-takeaways {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.ebook-takeaways li {
		display: flex;
		gap: 10px;
		font-family: var(--font-sans);
		font-weight: 400;
		font-size: 0.9375rem;
		line-height: 1.65;
		letter-spacing: 0.005em;
		max-inline-size: 60ch;
		padding-block: 10px;
		border-block-start: 1px solid rgba(10, 30, 10, 0.21);
	}

	.ebook-takeaways strong {
		flex: none;
		font-family: var(--font-sans);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.ebook-form {
		background: var(--surface-ebook-form);
		color: #f5f5f0;
		max-inline-size: 600px;
		padding: 27px 23px;
		border: 1px solid rgba(0, 0, 0, 0.22);
		box-shadow: 10px 10px 0 rgba(31, 46, 19, 0.12);
	}

	.ebook-form .form-caption {
		color: var(--acid);
		margin-block-end: 12px;
	}

	.ebook-form h3 {
		margin-block-end: 24px;
	}

	.field {
		margin-block-end: 17px;
	}

	.field label {
		display: block;
		font-family: var(--font-display);
		font-weight: 700;
		font-stretch: 100%;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		inline-size: 100%;
		margin-block-end: 9px;
	}

	.field input,
	.field select {
		inline-size: 100%;
		max-inline-size: 460px;
		block-size: 50px;
		background: #1c2427;
		color: var(--text);
		border: 1px solid #455055;
		border-radius: 0;
		outline: none;
		padding-inline: 14px;
		font-family: var(--font-sans);
		font-weight: 500;
		font-stretch: 100%;
		font-size: 0.9375rem;
		letter-spacing: 0em;
	}

	.field input:focus,
	.field select:focus {
		border-color: var(--acid);
		box-shadow: 0 0 0 1px var(--acid);
	}

	.field input:focus-visible,
	.field select:focus-visible {
		outline: 3px solid var(--acid);
		outline-offset: 4px;
	}

	.field input::placeholder {
		color: #9aa3a2;
	}

	.field select {
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23dcff65' stroke-width='1.7'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 14px center;
		padding-inline-end: 45px;
	}

	.field-issue {
		color: var(--coral);
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		margin: 6px 0 0;
	}

	.ebook-form .btn {
		inline-size: 100%;
		max-inline-size: 460px;
		justify-content: space-between;
		margin-block: 12px 17px;
	}

	.privacy {
		color: #9fa9a7;
		font-family: var(--font-sans);
		font-weight: 400;
		font-stretch: 92%;
		font-variation-settings: 'wdth' 92;
		font-size: 0.75rem;
		line-height: 1.7;
		letter-spacing: 0.01em;
		margin: 0;
	}

	.form-status {
		margin: 14px 0 0;
		padding: 12px;
		border: 1px solid #8ba658;
		color: var(--acid);
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		line-height: 1.5;
	}

	@media (min-width: 768px) {
		.ebook-form {
			padding: 42px;
			box-shadow: 20px 20px 0 rgba(31, 46, 19, 0.12);
		}
	}

	@media (min-width: 1024px) {
		.ebook-grid {
			grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr);
			gap: 44px;
		}

		.ebook-form {
			max-inline-size: none;
		}
	}

	@media (min-width: 1280px) {
		.ebook-grid {
			gap: 90px;
		}
	}
</style>
