<!-- src/lib/components/layout/TodoPageShell.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { RouteId } from '$app/types';
	import Breadcrumb from '#lib/components/layout/Breadcrumb.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import type { TodoPageSpec } from '#lib/data/todo-pages.ts';

	interface Props {
		spec: TodoPageSpec;
	}

	let { spec }: Props = $props();

	const crumbItems = $derived(
		spec.breadcrumbs.map((crumb) => ({
			label: crumb.label,
			...(crumb.href ? { href: crumb.href as RouteId } : {})
		}))
	);
</script>

<a class="skip" href="#todo-page-main">Skip to main content</a>

<Navbar />

<main id="todo-page-main" class="inner-page todo-page">
	<Breadcrumb items={crumbItems}>
		<span>Status: TODO Placeholder</span> • <span>Route: {spec.route}</span> •
		<span>Indexing: noindex</span>
	</Breadcrumb>

	<header class="page-hero todo-hero" aria-labelledby="todo-page-h1">
		<div class="container todo-hero__inner">
			<div class="todo-status-row">
				<span class="todo-pill">TODO · PAGE PENDING IMPLEMENTATION</span>
				<span class="todo-category">{spec.categoryBadge}</span>
			</div>

			<h1 id="todo-page-h1" class="todo-title">
				{spec.pageName} <span class="todo-title__tag">[TODO]</span>
			</h1>

			<p class="todo-summary">{spec.summary}</p>

			<dl class="todo-meta-strip" aria-label="Placeholder route diagnostics">
				<div class="todo-meta-cell">
					<dt>Canonical Destination</dt>
					<dd><code>{spec.route}</code></dd>
				</div>
				<div class="todo-meta-cell">
					<dt>Build Status</dt>
					<dd>TODO — Unbuilt Destination Shell</dd>
				</div>
				<div class="todo-meta-cell">
					<dt>Connected From</dt>
					<dd>{spec.connectedFrom}</dd>
				</div>
			</dl>
		</div>
	</header>

	<section class="content-section is-light todo-body" aria-labelledby="todo-checklist-h2">
		<div class="container todo-body__grid">
			<div class="todo-card">
				<span class="todo-card__kicker">01 / IMPLEMENTATION BACKLOG</span>
				<h2 id="todo-checklist-h2" class="todo-card__h2">
					Planned Build Scope for {spec.pageName}
				</h2>
				<p class="todo-card__intro">
					This dedicated route exists so navigation menus, cards, and action buttons connect to
					their true URL rather than routing to an unrelated page. Complete the items below to
					graduate this route from <code>TODO</code> to live production:
				</p>

				<ol class="todo-checklist">
					{#each spec.todoChecklist as item, idx (item)}
						<li class="todo-checklist__item">
							<span class="todo-checklist__num">TODO 0{idx + 1}</span>
							<span>{item}</span>
						</li>
					{/each}
				</ol>
			</div>

			<aside class="todo-sidebar" aria-labelledby="todo-related-h2">
				<span class="todo-card__kicker">02 / LIVE DESTINATIONS</span>
				<h2 id="todo-related-h2" class="todo-sidebar__h2">Continue Exploring Live Pages</h2>
				<ul class="todo-related-list">
					{#each spec.relatedLinks as link (link.href)}
						<li>
							<a href={resolve(link.href as '/')} class="todo-related-link">
								<span class="todo-related-link__title">{link.label} →</span>
								<span class="todo-related-link__desc">{link.description}</span>
							</a>
						</li>
					{/each}
				</ul>
			</aside>
		</div>
	</section>
</main>

<Footer />

<style>
	.todo-hero {
		background-color: var(--bg);
		border-block-end: 1px solid var(--line);
		padding-block: clamp(2.5rem, 5vw, 4.25rem);
	}

	.todo-hero__inner {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.todo-status-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.625rem;
	}

	.todo-pill {
		display: inline-flex;
		align-items: center;
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		background-color: var(--acid);
		color: var(--ink);
		font-family: var(--font-mono);
		font-size: var(--step-xs);
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.todo-category {
		display: inline-flex;
		align-items: center;
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		background-color: var(--panel);
		border: 1px solid var(--status-amber-border);
		color: var(--status-amber-text);
		font-family: var(--font-mono);
		font-size: var(--step-xs);
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.todo-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--step-h1);
		font-weight: 700;
		line-height: 1.14;
		letter-spacing: -0.02em;
		color: var(--text);
		max-inline-size: 28ch;
	}

	.todo-title__tag {
		font-family: var(--font-mono);
		font-size: 0.62em;
		font-weight: 500;
		color: var(--acid);
		vertical-align: middle;
	}

	.todo-summary {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--step-lead);
		line-height: 1.6;
		color: var(--muted);
		max-inline-size: 70ch;
	}

	.todo-meta-strip {
		margin: 0.5rem 0 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 1px;
		background-color: var(--line);
		border: 1px solid var(--line);
		border-radius: 0.75rem;
		overflow: hidden;
	}

	@media (min-width: 900px) {
		.todo-meta-strip {
			grid-template-columns: minmax(220px, 1fr) minmax(220px, 1fr) minmax(280px, 1.4fr);
		}
	}

	.todo-meta-cell {
		background-color: var(--panel);
		padding: 0.95rem 1.15rem;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.todo-meta-cell dt {
		font-family: var(--font-mono);
		font-size: var(--step-xs);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
	}

	.todo-meta-cell dd {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--step-sm);
		line-height: 1.45;
		color: var(--text);
	}

	.todo-meta-cell code {
		font-family: var(--font-mono);
		color: var(--acid);
	}

	.todo-body {
		background-color: var(--off);
		color: var(--ink);
		padding-block: clamp(2.5rem, 5vw, 4rem);
	}

	.todo-body__grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
		align-items: start;
	}

	@media (min-width: 1024px) {
		.todo-body__grid {
			grid-template-columns: minmax(0, 1.55fr) minmax(300px, 1fr);
			gap: 2rem;
		}
	}

	.todo-card,
	.todo-sidebar {
		background-color: var(--card-white);
		border: 1px solid var(--card-light-border);
		border-radius: 0.875rem;
		padding: clamp(1.35rem, 2.5vw, 2rem);
	}

	.todo-card__kicker {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: var(--step-xs);
		font-weight: 600;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--acid-text-on-light);
		margin-block-end: 0.5rem;
	}

	.todo-card__h2,
	.todo-sidebar__h2 {
		margin: 0 0 0.75rem;
		font-family: var(--font-display);
		font-size: var(--step-h3);
		font-weight: 700;
		line-height: 1.25;
		color: var(--ink);
	}

	.todo-card__intro {
		margin: 0 0 1.25rem;
		font-family: var(--font-sans);
		font-size: var(--step-body);
		line-height: 1.6;
		color: var(--lightmuted);
	}

	.todo-card__intro code {
		font-family: var(--font-mono);
		font-size: 0.9em;
		color: var(--ink);
		background-color: var(--off2);
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
	}

	.todo-checklist {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.todo-checklist__item {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.9rem 1rem;
		background-color: var(--off);
		border: 1px solid var(--card-light-border);
		border-radius: 0.625rem;
		font-family: var(--font-sans);
		font-size: var(--step-body);
		line-height: 1.5;
		color: var(--ink);
	}

	@media (min-width: 640px) {
		.todo-checklist__item {
			flex-direction: row;
			align-items: baseline;
			gap: 0.875rem;
		}
	}

	.todo-checklist__num {
		flex-shrink: 0;
		font-family: var(--font-mono);
		font-size: var(--step-xs);
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--acid-text-on-light);
	}

	.todo-related-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.todo-related-link {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.9rem 1rem;
		border-radius: 0.625rem;
		background-color: var(--off);
		border: 1px solid var(--card-light-border);
		text-decoration: none;
		transition:
			border-color 0.18s ease,
			background-color 0.18s ease;
	}

	.todo-related-link:hover {
		background-color: var(--card-featured-bg);
		border-color: var(--card-featured-border);
	}

	.todo-related-link__title {
		font-family: var(--font-display);
		font-size: var(--step-body);
		font-weight: 700;
		color: var(--ink);
	}

	.todo-related-link__desc {
		font-family: var(--font-sans);
		font-size: var(--step-sm);
		line-height: 1.45;
		color: var(--lightmuted);
	}
</style>
