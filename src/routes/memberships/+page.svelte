<script lang="ts">
	import { resolve } from '$app/paths';

	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import Breadcrumb from '#lib/components/layout/Breadcrumb.svelte';
	import { LIVE_TRADING_ROOMS_CARDS } from '#lib/data/live-trading-rooms-hub.ts';
	import { ALERT_SERVICE_CARDS } from '#lib/data/alert-services-hub.ts';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	const formats = [
		...LIVE_TRADING_ROOMS_CARDS.map((room) => ({
			title: room.title,
			description: room.summary,
			cadence: room.tag,
			href: room.href,
			format: 'Live room'
		})),
		...ALERT_SERVICE_CARDS.map((service) => ({
			title: service.name,
			description: service.bestFor,
			cadence: service.cadence,
			href: service.href,
			format: 'Alert service'
		})),
		{
			title: '1-on-1 Private Mentorship',
			description:
				'Individual education focused on your experience, execution process, and risk discipline. Discuss your goals and program availability with the desk.',
			cadence: 'Application only',
			href: '/mentorship',
			format: 'Private mentorship'
		}
	];
</script>

<JsonLd schema={data.jsonLdSchema} />
<a class="skip" href="#memberships-main">Skip to content</a>
<Navbar />
<main id="memberships-main" class="inner-page memberships-page">
	<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Memberships' }]} />
	<header class="container membership-heading">
		<hgroup>
			<p class="eyebrow">One methodology • Six ways to learn</p>
			<h1>Find the format that fits your routine.</h1>
		</hgroup>
		<p>
			Compare live trading rooms, alert services, and private mentorship. Explore each format, its
			schedule, and its approach to risk before discussing availability with the desk.
		</p>
	</header>
	<section class="container membership-section" aria-labelledby="membership-options">
		<h2 id="membership-options">Compare your learning options</h2>
		<div class="membership-grid">
			{#each formats as format (format.href)}<article>
					<p class="eyebrow">{format.format}</p>
					<h3>{format.title}</h3>
					<p class="cadence">{format.cadence}</p>
					<p>{format.description}</p>
					<a href={resolve(format.href as '/')}>Explore {format.title} →</a>
				</article>{/each}
		</div>
	</section>
	<section class="container membership-section" aria-labelledby="membership-next">
		<h2 id="membership-next">Choose a starting point</h2>
		<p>
			Available around the opening bell? Review the day trading room. Preparing around a working
			schedule? Compare the swing room and Sunday Alpha Protocol. For smaller accounts, review the
			small accounts room and its defined-risk approach.
		</p>
		<p>
			Online checkout is currently unavailable. Contact the desk to discuss service availability.
			All services provide education; trading involves risk and results vary.
		</p>
		<div class="membership-actions">
			<a class="btn btn-primary" href={resolve('/contact')}>Discuss your options →</a><a
				href={resolve('/risk-disclosure')}>Read the risk disclosure →</a
			>
		</div>
	</section>
</main>
<Footer />

<style>
	.membership-heading,
	.membership-section {
		padding-block: clamp(2rem, 1.5rem + 2vi, 4rem);
	}
	hgroup {
		max-inline-size: 55ch;
	}
	h1 {
		font-size: var(--step-h1);
	}
	h2 {
		font-size: var(--step-h2);
		margin-block-end: 1.5rem;
	}
	h3 {
		font-size: var(--step-sub);
		margin-block: 0.75rem;
	}
	p {
		font-size: var(--step-body);
		line-height: var(--leading-body);
		max-inline-size: 70ch;
	}
	.membership-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1rem;
	}
	article {
		display: flex;
		flex-direction: column;
		align-items: start;
		padding: clamp(1.25rem, 1rem + 1vi, 2rem);
		border: 1px solid var(--line);
		background: var(--panel);
	}
	article a {
		margin-block-start: auto;
		padding-block-start: 1rem;
	}
	a {
		color: var(--acid);
	}
	.btn {
		color: var(--ink);
	}
	.cadence {
		color: var(--muted);
	}
	.membership-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		align-items: center;
		margin-block-start: 1.5rem;
	}
	@media (min-width: 48rem) {
		.membership-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (min-width: 75rem) {
		.membership-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
