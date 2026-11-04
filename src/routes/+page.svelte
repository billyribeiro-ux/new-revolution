<script lang="ts">
	import { scrollY, innerHeight } from 'svelte/reactivity/window';
	import { JsonLd } from 'svelte-meta-tags';
	import ArrowUpIcon from 'phosphor-svelte/lib/ArrowUpIcon';

	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import HeroSection from '#lib/components/home/HeroSection.svelte';
	import CaseStudiesSection from '#lib/components/home/CaseStudiesSection.svelte';
	import ManifestoSection from '#lib/components/home/ManifestoSection.svelte';
	import PersonasSection from '#lib/components/home/PersonasSection.svelte';
	import MembershipsSection from '#lib/components/home/MembershipsSection.svelte';
	import StoreToolsSection from '#lib/components/home/StoreToolsSection.svelte';
	import MentorshipSection from '#lib/components/home/MentorshipSection.svelte';
	import EbookSection from '#lib/components/home/EbookSection.svelte';
	import BlogSection from '#lib/components/home/BlogSection.svelte';
	import FaqSection from '#lib/components/home/FaqSection.svelte';
	import ClosingSection from '#lib/components/home/ClosingSection.svelte';
	import { FREE_EBOOK_AVAILABLE, isLaunchedHref } from '#lib/data/launch-gate.ts';
	import { getDeskStatus } from './home.remote.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const deskStatus = await getDeskStatus();

	let docScrollHeight = $state(4000);

	// Sections that promote something not live yet stay out of the page (docs/seo/LAUNCH_TRACKER.md).
	const storeLive = isLaunchedHref('/store');
	const blogLive = isLaunchedHref('/blog');

	let scrollPercent = $derived.by(() => {
		const y = scrollY.current ?? 0;
		const vh = innerHeight.current ?? 800;
		const available = Math.max(1, docScrollHeight - vh);
		return Math.max(0, Math.min(100, (y / available) * 100));
	});

	let showBackToTop = $derived((scrollY.current ?? 0) > 500);

	function measureDocumentHeight(node: HTMLElement) {
		const update = () => {
			docScrollHeight = document.documentElement.scrollHeight;
		};
		update();
		const resizeObserver = new ResizeObserver(update);
		resizeObserver.observe(node);
		return () => resizeObserver.disconnect();
	}

	function scrollToTop() {
		if (typeof window !== 'undefined') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#main">Skip to content</a>

<Navbar {scrollPercent} />

<main id="main" {@attach measureDocumentHeight}>
	<HeroSection {deskStatus} />
	<CaseStudiesSection />
	<ManifestoSection />
	<PersonasSection />
	<MembershipsSection />
	{#if storeLive}
		<StoreToolsSection />
	{/if}
	<MentorshipSection />
	{#if FREE_EBOOK_AVAILABLE}
		<EbookSection />
	{/if}
	{#if blogLive}
		<BlogSection />
	{/if}
	<FaqSection />
	<ClosingSection />
</main>

<Footer currentYear={deskStatus.updatedYear} showPress />

<button
	type="button"
	class={['backtotop', { visible: showBackToTop }]}
	id="backToTop"
	aria-label="Back to top"
	onclick={scrollToTop}
>
	<ArrowUpIcon size={18} weight="bold" aria-hidden="true" />
</button>

<style>
	.backtotop {
		position: fixed;
		inset-inline-end: 14px;
		inset-block-end: 14px;
		inline-size: 48px;
		block-size: 48px;
		border: 1px solid #b2cb72;
		background: #182021;
		color: var(--acid);
		z-index: 60;
		display: grid;
		place-items: center;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
		opacity: 0;
		pointer-events: none;
		transform: translateY(12px);
		transition:
			opacity 0.2s var(--ease-out),
			transform 0.2s var(--ease-out);
	}

	.backtotop.visible {
		opacity: 1;
		pointer-events: auto;
		transform: translateY(0);
	}

	@media (min-width: 640px) {
		.backtotop {
			inset-inline-end: 24px;
			inset-block-end: 26px;
		}
	}
</style>
