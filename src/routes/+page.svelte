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
	import { getDeskStatus } from './home.remote.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const deskStatus = await getDeskStatus();

	let docScrollHeight = $state(4000);
	let toastMessage = $state('');
	let toastVisible = $state(false);
	let toastTimer: ReturnType<typeof setTimeout> | undefined;

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

	function announceToast(message: string) {
		toastMessage = message;
		toastVisible = true;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			toastVisible = false;
		}, 4600);
	}

	// Routes that are built; links to these navigate normally instead of showing the preview toast.
	const LIVE_ROUTES = new Set([
		'/about',
		'/our-mission',
		'/mentorship',
		'/live-trading-rooms/day-trading-room',
		'/live-trading-rooms/swing-trading-room',
		'/sitemap.xml'
	]);

	function handlePreviewLink(href: string, targetId?: string, event?: MouseEvent) {
		if (LIVE_ROUTES.has(href)) return;
		event?.preventDefault();
		if (targetId && typeof document !== 'undefined') {
			const element = document.getElementById(targetId);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}
		announceToast(
			`Preview route: ${href} · Single-source homepage blueprint; connect destination route before launch.`
		);
	}

	function scrollToTop() {
		if (typeof window !== 'undefined') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#main">Skip to content</a>

<Navbar {scrollPercent} onPreviewNavigate={handlePreviewLink} />

<main id="main" {@attach measureDocumentHeight}>
	<HeroSection {deskStatus} onPreviewNavigate={handlePreviewLink} />
	<CaseStudiesSection />
	<ManifestoSection />
	<PersonasSection onPreviewNavigate={handlePreviewLink} />
	<MembershipsSection onPreviewNavigate={handlePreviewLink} />
	<StoreToolsSection onPreviewNavigate={handlePreviewLink} />
	<MentorshipSection onPreviewNavigate={handlePreviewLink} />
	<EbookSection />
	<BlogSection onPreviewNavigate={handlePreviewLink} />
	<FaqSection />
	<ClosingSection onPreviewNavigate={handlePreviewLink} />
</main>

<Footer currentYear={deskStatus.updatedYear} showPress onPreviewNavigate={handlePreviewLink} />

<button
	type="button"
	class={['backtotop', { visible: showBackToTop }]}
	id="backToTop"
	aria-label="Back to top"
	onclick={scrollToTop}
>
	<ArrowUpIcon size={18} weight="bold" aria-hidden="true" />
</button>

<div class="preview-label">SVELTE 5 / SVELTEKIT 3.1 ENTERPRISE BLUEPRINT</div>

<div class={['toast', { show: toastVisible }]} id="toast" role="status" aria-live="polite">
	{toastMessage}
</div>

<style>
	.toast {
		position: fixed;
		z-index: 300;
		inset-block-end: 28px;
		inset-inline-start: 50%;
		transform: translate(-50%, 24px);
		background: #e9fbba;
		color: #142016;
		box-shadow: 0 18px 65px rgba(0, 0, 0, 0.55);
		border: 1px solid #9ac558;
		padding: 15px 18px;
		max-inline-size: min(480px, calc(100vw - 28px));
		inline-size: max-content;
		opacity: 0;
		pointer-events: none;
		transition:
			opacity 0.23s var(--ease-out),
			transform 0.23s var(--ease-out);
		font-family: var(--font-sans);
		font-weight: 500;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.toast.show {
		opacity: 1;
		transform: translate(-50%, 0);
	}

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

	.preview-label {
		position: fixed;
		inset-block-end: 0;
		inset-inline-start: 0;
		z-index: 55;
		background: #12181c;
		color: #a5b5ab;
		padding: 7px 13px;
		border: 1px solid #35453b;
		border-inline-start: 0;
		border-block-end: 0;
		font-family: var(--font-sans);
		font-weight: 700;
		font-stretch: 87.5%;
		font-variation-settings: 'wdth' 87.5;
		font-size: 0.6875rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		pointer-events: none;
		display: none;
	}

	@media (min-width: 640px) {
		.backtotop {
			inset-inline-end: 24px;
			inset-block-end: 26px;
		}
	}

	@media (min-width: 768px) {
		.preview-label {
			display: block;
		}
	}
</style>
