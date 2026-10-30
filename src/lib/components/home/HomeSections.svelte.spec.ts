import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import '../../../app.css';
import HeroSection from './HeroSection.svelte';
import CaseStudiesSection from './CaseStudiesSection.svelte';
import ManifestoSection from './ManifestoSection.svelte';
import PersonasSection from './PersonasSection.svelte';
import MembershipsSection from './MembershipsSection.svelte';
import StoreToolsSection from './StoreToolsSection.svelte';
import MentorshipSection from './MentorshipSection.svelte';
import BlogSection from './BlogSection.svelte';
import FaqSection from './FaqSection.svelte';
import ClosingSection from './ClosingSection.svelte';
import type { CaseStudy, ClosingContent, FaqItem, StoreToolCard } from '#lib/data/homepage.ts';

describe('Modular Homepage Section Components', () => {
	it('renders HeroSection with deskStatus and custom proofItems/trustMetrics overrides', async () => {
		render(HeroSection, {
			deskStatus: { edition: 'DOSSIER / 002', statusLabel: 'VERIFIED' },
			proofItems: [
				{
					number: '01',
					title: 'Custom Institutional Proof Item',
					description: 'Timestamped execution dossier.'
				}
			],
			trustMetrics: [{ label: 'FOCUS', value: 'Options & Equities' }]
		});

		await expect.element(page.getByText('DOSSIER / 002')).toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { level: 3, name: 'Custom Institutional Proof Item' }))
			.toBeInTheDocument();
		await expect.element(page.getByText('Options & Equities')).toBeInTheDocument();
	});

	it('renders CaseStudiesSection with custom studies prop overrides for cross-route reuse', async () => {
		const customStudies: CaseStudy[] = [
			{
				kicker: 'SPX 0DTE Case Study',
				state: 'Documented',
				title: 'SPX 5800 Call Spread Execution',
				description: 'Planned pre-market gamma wall inflection with defined 1R risk.',
				evidenceRequirement: 'timestamped alert log, option chain snapshot, and exit fill.'
			}
		];

		render(CaseStudiesSection, { studies: customStudies });

		await expect
			.element(page.getByRole('heading', { level: 3, name: 'SPX 5800 Call Spread Execution' }))
			.toBeInTheDocument();
		await expect.element(page.getByText('SPX 0DTE Case Study')).toBeInTheDocument();
	});

	it('renders ManifestoSection with scoped WCAG AA negative comparison styling', async () => {
		render(ManifestoSection);

		await expect
			.element(
				page.getByRole('heading', {
					level: 2,
					name: /Not another trading guru/i
				})
			)
			.toBeInTheDocument();
		await expect
			.element(page.getByText('WHAT YOU LEAVE BEHIND / THE HYPE TRAP'))
			.toBeInTheDocument();
		await expect
			.element(page.getByText('WHAT WE AIM TO DELIVER / THE REVOLUTION STANDARD'))
			.toBeInTheDocument();
	});

	it('renders PersonasSection, MembershipsSection, MentorshipSection, and BlogSection with SSOT defaults', async () => {
		render(PersonasSection);
		await expect
			.element(
				page.getByRole('heading', { level: 3, name: 'Working Professionals & Swing Traders' })
			)
			.toBeInTheDocument();

		render(MembershipsSection);
		await expect
			.element(
				page.getByRole('heading', {
					level: 3,
					name: /Day Trading Room — Live Stock & Options Execution/i
				})
			)
			.toBeInTheDocument();

		render(MentorshipSection);
		await expect
			.element(page.getByRole('heading', { level: 2, name: /Private 1-on-1 Mentorship/i }))
			.toBeInTheDocument();

		render(BlogSection);
		await expect
			.element(
				page.getByRole('heading', {
					level: 3,
					name: /Behind the Reported 600% Overnight OXY Put-Options Trade/i
				})
			)
			.toBeInTheDocument();
	});

	it('renders StoreToolsSection with custom tools prop overrides for /store/* reuse', async () => {
		const customTools: StoreToolCard[] = [
			{
				id: 'custom-scanner',
				visualVariant: 'indicators',
				visualCorner: 'SCANNER MODULE / PREVIEW',
				visualStamp: 'REAL-TIME UNUSUAL VOLUME',
				tag: 'INNOVATE / INSTITUTIONAL SCANNERS',
				title: 'Unusual Options Volume & Dark Pool Scanner',
				description: 'Filter multi-leg institutional sweeps with defined liquidity thresholds.',
				bullets: ['Real-time sweep filtering.', 'Historical bar verification.'],
				ctaLabel: 'Explore Scanners',
				href: '/store/scanners',
				previewTarget: 'tools'
			}
		];

		render(StoreToolsSection, { tools: customTools });

		await expect
			.element(
				page.getByRole('heading', {
					level: 3,
					name: 'Unusual Options Volume & Dark Pool Scanner'
				})
			)
			.toBeInTheDocument();
		await expect.element(page.getByText('REAL-TIME UNUSUAL VOLUME')).toBeInTheDocument();
	});

	it('renders FaqSection with semantic H3 headings inside native details/summary and supports custom FAQ lists', async () => {
		const customFaqs: FaqItem[] = [
			{
				id: 'faq-non-repainting',
				question: 'Does this indicator repaint on historical bars?',
				answer: 'No. Every signal closes on confirmed bar execution with zero repainting.'
			}
		];

		render(FaqSection, { faqs: customFaqs });

		await expect
			.element(
				page.getByRole('heading', {
					level: 3,
					name: 'Does this indicator repaint on historical bars?'
				})
			)
			.toBeInTheDocument();
	});

	it('renders ClosingSection with custom content prop override and onPreviewNavigate callback', async () => {
		let navigatedHref = '';
		let navigatedTargetId = '';
		const handlePreview = (href: string, targetId?: string, event?: MouseEvent) => {
			event?.preventDefault();
			navigatedHref = href;
			navigatedTargetId = targetId ?? '';
		};

		const customClosing: ClosingContent = {
			eyebrow: 'DISCIPLINE. STRUCTURE. EXECUTION.',
			headlineLead: 'Built for Serious Swing Traders.',
			headlineUnderline: 'Start With a Plan.',
			description: 'Review pre-planned setups with defined invalidation levels.',
			primaryCta: {
				label: 'Join Swing Trading Room',
				href: '/live-trading-rooms/swing-trading-room',
				previewTarget: 'memberships'
			},
			secondaryCta: {
				label: 'Apply for Mentorship',
				href: '/mentorship',
				previewTarget: 'mentorship'
			}
		};

		render(ClosingSection, { content: customClosing, onPreviewNavigate: handlePreview });

		const primaryCta = page.getByRole('link', { name: /Join Swing Trading Room/i });
		await expect.element(primaryCta).toBeInTheDocument();
		await primaryCta.click();
		expect(navigatedHref).toBe('/live-trading-rooms/swing-trading-room');
		expect(navigatedTargetId).toBe('memberships');
	});
});
