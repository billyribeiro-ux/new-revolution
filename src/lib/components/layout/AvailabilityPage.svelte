<script lang="ts">
	import { resolve } from '$app/paths';

	import Navbar from './Navbar.svelte';
	import Footer from './Footer.svelte';
	import Breadcrumb from './Breadcrumb.svelte';
	import { cleanPlannedLabel, type TodoPageSpec } from '#lib/data/todo-pages.ts';
	let { spec }: { spec: TodoPageSpec } = $props();
	const heading = $derived(cleanPlannedLabel(spec.pageName));
	const kind = $derived(
		spec.route === '/login'
			? 'login'
			: spec.route === '/register'
				? 'register'
				: spec.route === '/mentorship/apply'
					? 'application'
					: spec.route.startsWith('/enroll/')
						? 'enrollment'
						: 'resource'
	);
	const status = $derived(
		kind === 'login'
			? 'Online member sign-in is currently unavailable'
			: kind === 'register'
				? 'Free account registration is currently unavailable'
				: kind === 'application'
					? 'Discuss your mentorship goals with the desk'
					: kind === 'enrollment'
						? 'Discuss availability before enrolling'
						: 'Coming soon'
	);
	const copy = $derived(
		kind === 'login'
			? 'For help with an existing account or access to your service, contact the desk. Public research and calculators remain available without signing in.'
			: kind === 'register'
				? 'You can use our public calculators and reference guides without an account. Contact the desk for questions about membership access.'
				: kind === 'application'
					? 'Share your experience, trading routine, and the skills you want to develop with the desk. Application availability and next steps are discussed directly.'
					: kind === 'enrollment'
						? 'Self-service online enrollment is currently unavailable. Review the service format, then contact the desk to discuss availability and the next steps. No payment is collected on this page.'
						: 'This resource is being prepared. Explore the published tools and service overviews below while it is unavailable.'
	);
	const links = $derived(
		spec.relatedLinks.filter(
			(link) =>
				!link.href.startsWith('/enroll/') &&
				!['/login', '/register', '/mentorship/apply'].includes(link.href)
		)
	);
</script>

<a class="skip" href="#availability-main">Skip to content</a>
<Navbar />
<main id="availability-main" class="inner-page availability-page">
	<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: heading }]} />
	<section class="availability-hero container" aria-labelledby="availability-title">
		<hgroup>
			<p class="eyebrow">{kind === 'resource' ? 'Resource preview' : 'Your next step'}</p>
			<h1 id="availability-title">{heading}</h1>
		</hgroup>
		<div class="availability-grid">
			<div class="availability-status">
				<h2>{status}</h2>
				<p>{copy}</p>
				<a class="btn btn-primary" href={resolve(kind === 'resource' ? '/resources' : '/contact')}
					>{kind === 'resource' ? 'Explore published resources' : 'Contact the desk'} →</a
				>
			</div>
			<aside aria-label="Useful destinations">
				<h2>Continue exploring</h2>
				<ul>
					{#each links as link (link.href)}<li>
							<a href={resolve(link.href as '/')}>{cleanPlannedLabel(link.label)} →</a>
						</li>{/each}
					<li><a href={resolve('/resources')}>Public calculators and guides →</a></li>
					<li><a href={resolve('/risk-disclosure')}>Understand the risks →</a></li>
				</ul>
			</aside>
		</div>
	</section>
</main>
<Footer />

<style>
	.availability-hero {
		padding-block: clamp(3rem, 2rem + 3vi, 6rem);
	}
	hgroup {
		max-inline-size: 65ch;
		margin-block-end: 2rem;
	}
	h1 {
		font-size: var(--step-h1);
		line-height: var(--leading-card-h3);
	}
	.availability-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 2rem;
	}
	.availability-status,
	aside {
		padding: clamp(1.25rem, 1rem + 1vi, 2rem);
		background: var(--panel);
		border: 1px solid var(--line);
	}
	.availability-status {
		border-inline-start: 3px solid var(--acid);
	}
	h2 {
		font-size: var(--step-sub);
		line-height: var(--leading-card-h3);
		margin-block: 0 1rem;
	}
	p,
	li {
		font-size: var(--step-body);
		line-height: var(--leading-body);
	}
	p {
		max-inline-size: 65ch;
		margin-block-end: 1.5rem;
	}
	ul {
		display: grid;
		gap: 1rem;
		padding-inline-start: 1.25rem;
	}
	a {
		color: var(--acid);
	}
	.btn {
		color: var(--ink);
	}
	@media (min-width: 56rem) {
		.availability-grid {
			grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
		}
	}
</style>
