<!-- src/lib/components/store/CourseCard.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';
	import GraduationCapIcon from 'phosphor-svelte/lib/GraduationCapIcon';
	import ListChecksIcon from 'phosphor-svelte/lib/ListChecksIcon';
	import StackIcon from 'phosphor-svelte/lib/StackIcon';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';
	import CatalogCard from '#lib/components/ui/CatalogCard.svelte';
	import type { TradingCourse } from '#lib/data/courses.ts';

	/**
	 * One course in the catalog, built on the shared CatalogCard shell (whole-card click through the
	 * title link, focus ring, hover, footer CTA, breakpoints). This component only owns course content.
	 * The syllabus is a native <details>, so every module is in the server-rendered HTML.
	 * Theming: `--card-accent` on a parent. `course.featured` needs a host that gives it two columns from 768px.
	 */
	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'class' | 'title'> {
		course: TradingCourse;
		headingLevel?: 2 | 3 | 4;
		class?: ClassValue;
	}

	let { course, headingLevel = 3, class: className, ...rest }: Props = $props();

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

<CatalogCard
	{...rest}
	id={course.id}
	class={['course-card', className]}
	{headingLevel}
	featured={course.featured}
>
	{#snippet top()}
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
	{/snippet}

	{#snippet eyebrow()}{course.trackLabel}{/snippet}

	{#snippet title()}
		<a class="catalog-card__link" href={detailHref}>{course.title}</a>
	{/snippet}

	{#snippet intro()}
		<p class="course-card__hook">{course.hook}</p>
	{/snippet}

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

	{#snippet footer()}
		<a class="course-card__room" href={roomHref}>{course.room.label}</a>
	{/snippet}
</CatalogCard>

<style>
	/* Course content only; layout, hover, focus and the CTA live in CatalogCard. */
	.course-card__code {
		margin: 0;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--_muted);
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
		border: 1px solid var(--_line-strong);
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.75rem;
		line-height: 1.2;
		letter-spacing: 0.03em;
		color: var(--_text-2);
	}

	.course-card__chip--level {
		color: var(--_accent-text);
		border-color: color-mix(in srgb, var(--_accent) 40%, var(--_line-strong));
		background: color-mix(in srgb, var(--_accent) 10%, transparent);
	}

	.course-card__hook {
		margin: 0;
		font-family: var(--font-sans);
		font-weight: 600;
		font-size: 1rem;
		line-height: 1.5;
		color: var(--_text);
		text-wrap: pretty;
	}

	.course-card__outcome {
		padding: 12px 14px;
		border-inline-start: 3px solid var(--_accent);
		background: var(--_inset);
	}

	.course-card__outcome strong {
		display: block;
		margin-block-end: 4px;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--_accent-text);
	}

	.course-card__outcome p {
		margin: 0;
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		line-height: 1.5;
		color: var(--_text-2);
	}

	/* ---- syllabus (native disclosure) ---- */
	.course-card__syllabus {
		position: relative; /* above the stretched link */
		z-index: 1;
		border: 1px solid var(--_line-strong);
		background: var(--_inset);
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
		color: var(--_text);
	}

	.course-card__syllabus summary::-webkit-details-marker {
		display: none;
	}

	.course-card__syllabus summary > span {
		flex: 1;
	}

	.course-card__syllabus summary :global(.course-card__caret) {
		flex-shrink: 0;
		color: var(--_muted);
		transition: transform 0.2s var(--ease-out);
	}

	.course-card__syllabus[open] {
		border-color: color-mix(in srgb, var(--_accent) 50%, var(--_line-strong));
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
		color: var(--_text-2);
	}

	.course-card__module-label {
		display: block;
		margin-block-end: 2px;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--_accent-text);
	}

	.course-card__room {
		display: inline-flex;
		align-items: center;
		min-block-size: 44px;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--_accent-text);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	@media (min-width: 768px) {
		/* The lead card has room for a larger hook. */
		:global(.catalog-card.is-featured) .course-card__hook {
			font-size: 1.0625rem;
		}
	}
</style>
