<!-- src/lib/components/store/CourseCard.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';
	import GraduationCapIcon from 'phosphor-svelte/lib/GraduationCapIcon';
	import ListChecksIcon from 'phosphor-svelte/lib/ListChecksIcon';
	import StackIcon from 'phosphor-svelte/lib/StackIcon';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';
	import type { TradingCourse } from '#lib/data/courses.ts';

	/**
	 * One course in the catalog. The whole card is a single click target (the title link is stretched
	 * over it); the syllabus is a native <details> so every module is in the server-rendered HTML.
	 *
	 * Theming: set `--course-card-accent` on a parent (or on the component) to recolour accents.
	 * `course.featured` expects a host that gives the card two grid columns from 768px up.
	 */
	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'class'> {
		course: TradingCourse;
		headingLevel?: 2 | 3 | 4;
		class?: ClassValue;
	}

	let { course, headingLevel = 3, class: className, ...rest }: Props = $props();

	const uid = $props.id();

	const heading = $derived(`h${headingLevel}` as const);
	// Detail route is typed against the app's route manifest: a wrong slug key fails `pnpm check`.
	const detailHref = $derived(resolve('/store/courses/[slug]', { slug: course.slug }));
	// `room.href` includes routes that are not built yet, so it is not a RouteId; the cast is contained here.
	const roomHref = $derived(resolve(course.room.href as '/'));

	/** "Module 1: Title" -> { label: 'Module 1', title: 'Title' }; falls back to the whole string. */
	function splitModule(text: string): { label: string; title: string } {
		const at = text.indexOf(': ');
		return at === -1
			? { label: '', title: text }
			: { label: text.slice(0, at), title: text.slice(at + 2) };
	}
</script>

<article
	{...rest}
	id={course.id}
	class={['course-card', { 'is-featured': course.featured }, className]}
	aria-labelledby="{uid}-title"
>
	<header class="course-card__top">
		<p class="course-card__code">{course.code}</p>
		<ul class="course-card__meta" aria-label="Course details">
			<li class="course-card__chip course-card__chip--level">
				<GraduationCapIcon size={14} weight="bold" aria-hidden="true" />
				{course.level}
			</li>
			<li class="course-card__chip">
				<StackIcon size={14} weight="bold" aria-hidden="true" />
				{course.modules} Modules
			</li>
			<li class="course-card__chip">{course.perk}</li>
		</ul>
	</header>

	<div class="course-card__body">
		<div class="course-card__intro">
			<p class="course-card__track">{course.trackLabel}</p>
			<svelte:element this={heading} id="{uid}-title" class="course-card__title">
				<a class="course-card__link" href={detailHref}>{course.title}</a>
			</svelte:element>
			<p class="course-card__hook">{course.hook}</p>
		</div>

		<div class="course-card__detail">
			<div class="course-card__outcome">
				<strong>What You Will Master</strong>
				<p>{course.coreOutcome}</p>
			</div>

			<details class="course-card__syllabus" open={course.featured}>
				<summary>
					<ListChecksIcon size={18} weight="bold" aria-hidden="true" />
					<span>View {course.syllabus.length}-module syllabus</span>
					<CaretDownIcon class="course-card__caret" size={16} weight="bold" aria-hidden="true" />
				</summary>
				<ol class="course-card__modules">
					{#each course.syllabus as module (module)}
						{const { label, title } = $derived(splitModule(module))}
						<li>
							{#if label}<span class="course-card__module-label">{label}</span>{/if}
							{title}
						</li>
					{/each}
				</ol>
			</details>
		</div>
	</div>

	<footer class="course-card__footer">
		<a class="course-card__room" href={roomHref}>{course.room.label}</a>
		<!-- Decorative: the title link above is the single, named link to the detail page. -->
		<span class="course-card__cta" aria-hidden="true">
			Learn more <ArrowRightIcon size={16} weight="bold" />
		</span>
	</footer>
</article>

<style>
	/* Mobile-first on the SSOT breakpoints (docs/CSS_STANDARDS.md 5.1): 480 / 640 / 768 / 1024 / 1280 / 1536. */
	.course-card {
		--_accent: var(--course-card-accent, var(--acid));
		--_pad: 18px;

		position: relative;
		display: flex;
		flex-direction: column;
		block-size: 100%;
		min-inline-size: 0;
		overflow: hidden;
		background: linear-gradient(180deg, var(--panel), var(--bg-soft));
		border: 1px solid var(--line);
		box-shadow: var(--shadow-md);
		transition:
			transform 0.2s var(--ease-out),
			border-color 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out);
	}

	.course-card.is-featured {
		border-color: color-mix(in srgb, var(--_accent) 45%, var(--line));
		border-block-start: 3px solid var(--_accent);
	}

	/* Hover lift only where hover exists, so touch devices never get a sticky raised card. */
	@media (hover: hover) and (pointer: fine) {
		.course-card:hover {
			transform: translateY(-4px);
			border-color: var(--line-strong);
			box-shadow: var(--shadow-lg);
		}
	}

	/* Keyboard focus ring on the whole card (the link's own outline is replaced by this larger one). */
	.course-card:has(.course-card__link:focus-visible) {
		outline: 3px solid var(--_accent);
		outline-offset: 3px;
	}

	/* ---- top band ---- */
	.course-card__top {
		display: grid;
		gap: 10px;
		padding: 14px var(--_pad);
		background: color-mix(in srgb, var(--bg) 92%, transparent);
		border-block-end: 1px solid var(--line);
	}

	.course-card__code {
		margin: 0;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.course-card__meta {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.course-card__chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		border: 1px solid var(--line-strong);
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.75rem;
		line-height: 1.2;
		letter-spacing: 0.03em;
		color: var(--text-secondary);
	}

	.course-card__chip--level {
		color: var(--_accent);
		border-color: color-mix(in srgb, var(--_accent) 40%, var(--line-strong));
		background: color-mix(in srgb, var(--_accent) 10%, transparent);
	}

	/* ---- body ---- */
	.course-card__body {
		display: grid;
		flex: 1;
		align-content: start;
		gap: 16px;
		padding: var(--_pad);
	}

	.course-card__intro,
	.course-card__detail {
		display: grid;
		align-content: start;
		gap: 12px;
		min-inline-size: 0;
	}

	.course-card__track {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--_accent);
	}

	.course-card__title {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: clamp(1.125rem, 1rem + 0.7vw, 1.375rem);
		line-height: 1.25;
		letter-spacing: -0.015em;
		color: var(--text);
		text-wrap: balance;
	}

	/* Stretched link: the pseudo-element makes the entire card clickable without nesting links. */
	.course-card__link {
		color: inherit;
		text-decoration: none;
	}

	.course-card__link::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 0;
	}

	.course-card__link:focus-visible {
		outline: none;
	}

	.course-card__hook {
		margin: 0;
		font-family: var(--font-sans);
		font-weight: 600;
		font-size: 1rem;
		line-height: 1.5;
		color: var(--text);
		text-wrap: pretty;
	}

	.course-card__outcome {
		padding: 12px 14px;
		border-inline-start: 3px solid var(--_accent);
		background: color-mix(in srgb, var(--bg) 70%, transparent);
	}

	.course-card__outcome strong {
		display: block;
		margin-block-end: 4px;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--_accent);
	}

	.course-card__outcome p {
		margin: 0;
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		line-height: 1.5;
		color: var(--text-secondary);
	}

	/* ---- syllabus (native disclosure) ---- */
	.course-card__syllabus {
		position: relative; /* above the stretched link */
		z-index: 1;
		border: 1px solid var(--line-strong);
		background: color-mix(in srgb, var(--bg) 70%, transparent);
	}

	.course-card__syllabus summary {
		display: flex;
		align-items: center;
		gap: 10px;
		min-block-size: 48px;
		padding: 8px 14px;
		cursor: pointer;
		list-style: none;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.8125rem;
		letter-spacing: 0.03em;
		color: var(--text);
	}

	.course-card__syllabus summary::-webkit-details-marker {
		display: none;
	}

	.course-card__syllabus summary > span {
		flex: 1;
	}

	.course-card__syllabus summary :global(.course-card__caret) {
		flex-shrink: 0;
		color: var(--muted);
		transition: transform 0.2s var(--ease-out);
	}

	.course-card__syllabus[open] {
		border-color: color-mix(in srgb, var(--_accent) 50%, var(--line-strong));
	}

	.course-card__syllabus[open] summary :global(.course-card__caret) {
		transform: rotate(180deg);
	}

	.course-card__modules {
		display: grid;
		gap: 10px;
		margin: 0;
		padding: 4px 14px 16px;
		list-style: none;
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		line-height: 1.45;
		color: var(--text-secondary);
	}

	.course-card__module-label {
		display: block;
		margin-block-end: 2px;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--_accent);
	}

	/* ---- footer ---- */
	.course-card__footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px 16px;
		padding: 12px var(--_pad) var(--_pad);
		border-block-start: 1px solid var(--line);
	}

	.course-card__room {
		position: relative; /* above the stretched link */
		z-index: 1;
		display: inline-flex;
		align-items: center;
		min-block-size: 44px;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--_accent);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.course-card__cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-block-size: 48px;
		padding-inline: 20px;
		background: var(--_accent);
		color: var(--ink);
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.8125rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		inline-size: 100%;
		transition: gap 0.2s var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.course-card:hover .course-card__cta {
			gap: 12px;
		}
	}

	/* ---- xs: large phones ---- */
	@media (min-width: 480px) {
		.course-card {
			--_pad: 20px;
		}
	}

	/* ---- md: tablets ---- */
	@media (min-width: 768px) {
		.course-card {
			--_pad: 22px;
		}

		/* Featured card spans the full row on tablets: lay its body out in two columns. */
		.course-card.is-featured .course-card__body {
			grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
			column-gap: 28px;
			align-items: start;
		}

		.course-card.is-featured .course-card__title {
			font-size: clamp(1.375rem, 1rem + 1vw, 1.75rem);
		}

		.course-card.is-featured .course-card__hook {
			font-size: 1.0625rem;
		}

		/* The lead card has the room for a single footer row: room link left, CTA right. */
		.course-card.is-featured .course-card__cta {
			inline-size: auto;
		}
	}

	/* ---- xl: wide desktops ---- */
	@media (min-width: 1280px) {
		.course-card {
			--_pad: 24px;
		}
	}
</style>
