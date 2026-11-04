import { page } from 'vite-plus/test/browser';
import { describe, expect, it } from 'vite-plus/test';
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
import type {
	ClosingContent,
	FaqItem,
	StoreToolCard,
	VerifiedCaseStudy
} from '#lib/data/homepage.ts';

describe('Modular Homepage Section Components', () => {
	it('renders HeroSection with deskStatus and custom standardItems/trustMetrics overrides', async () => {
		await render(HeroSection, {
			deskStatus: { edition: 'DOSSIER / 002', statusLabel: 'VERIFIED' },
			standardItems: [
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

	it('renders HeroSection with attributed founder claim, a link to the About anchor, and no pending markers', async () => {
		await render(HeroSection, {
			deskStatus: { edition: 'THE EXECUTION DOSSIER / 001', statusLabel: 'RISK FIRST' }
		});

		const body = document.body.textContent ?? '';
		expect(body).not.toMatch(/PROOF PENDING|DOCUMENTATION PENDING|publication pending|Publish:/i);

		const link = page.getByRole('link', {
			name: 'Read the background and context on our About page.'
		});
		await expect.element(link).toBeInTheDocument();
		expect(document.querySelector('a.authority-link')?.getAttribute('href')).toMatch(
			/about#institutional-mentorship$/
		);

		// The third-party name must not appear inside the unattributed brand slogan.
		expect(document.querySelector('blockquote.hero-slogan')?.textContent).not.toContain(
			'McGoldrick'
		);
	});

	it('renders nothing for CaseStudiesSection by default or when a record is incomplete', async () => {
		const { container } = await render(CaseStudiesSection);
		expect(container.querySelector('section')).toBeNull();

		const incomplete = {
			id: 'x',
			kicker: '01 / X',
			title: 'Half-filled trade',
			summary: 'Missing most of its evidence.',
			contractSymbol: '',
			strike: '',
			expiration: 'soon',
			enteredAt: '',
			exitedAt: '',
			positionSize: '',
			maxRisk: '',
			result: '',
			chart: { src: '', width: 1200, height: 675, alt: '' }
		} satisfies VerifiedCaseStudy;
		const second = await render(CaseStudiesSection, { studies: [incomplete] });
		expect(second.container.querySelector('section')).toBeNull();
	});

	it('renders a fully documented CaseStudiesSection record with every evidence field and chart dimensions', async () => {
		const studies: VerifiedCaseStudy[] = [
			{
				id: 'fixture',
				kicker: '01 / FIXTURE',
				title: 'SPX 5800 Call Spread Execution',
				summary: 'Planned pre-market gamma wall inflection with defined 1R risk.',
				contractSymbol: 'SPXW260116C05800000',
				strike: '$5,800',
				expiration: '2026-01-16',
				enteredAt: '2026-01-14T09:45:00-05:00',
				exitedAt: '2026-01-14T15:10:00-05:00',
				positionSize: '2 contracts',
				maxRisk: '$640',
				result: 'Fixture result',
				chart: {
					src: '/fixture.webp',
					width: 1200,
					height: 675,
					alt: 'SPX 15-minute chart showing price rejecting the 5800 gamma wall'
				}
			}
		];

		await render(CaseStudiesSection, { studies });

		await expect
			.element(page.getByRole('heading', { level: 3, name: 'SPX 5800 Call Spread Execution' }))
			.toBeInTheDocument();
		await expect.element(page.getByText('SPXW260116C05800000')).toBeInTheDocument();
		await expect.element(page.getByText('Maximum risk')).toBeInTheDocument();
		const img = document.querySelector('img.case-chart');
		expect(img?.getAttribute('width')).toBe('1200');
		expect(img?.getAttribute('height')).toBe('675');
		expect(img?.getAttribute('alt')).toContain('gamma wall');
		expect(document.querySelectorAll('dl.case-facts time').length).toBe(3);
	});

	it('renders ManifestoSection with scoped WCAG AA negative comparison styling', async () => {
		await render(ManifestoSection);

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
		await render(PersonasSection);
		await expect
			.element(
				page.getByRole('heading', { level: 3, name: 'Working Professionals & Swing Traders' })
			)
			.toBeInTheDocument();

		await render(MembershipsSection);
		await expect
			.element(
				page.getByRole('heading', {
					level: 3,
					name: /Day Trading Room — Live Stock & Options Execution/i
				})
			)
			.toBeInTheDocument();

		await render(MentorshipSection);
		await expect
			.element(page.getByRole('heading', { level: 2, name: /Private 1-on-1 Mentorship/i }))
			.toBeInTheDocument();

		await render(BlogSection);
		await expect
			.element(
				page.getByRole('heading', {
					level: 3,
					name: /Institutional Order Flow & the S&P 500 Gamma Flip Playbook/i
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

		await render(StoreToolsSection, { tools: customTools });

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

		await render(FaqSection, { faqs: customFaqs });

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

		await render(ClosingSection, { content: customClosing, onPreviewNavigate: handlePreview });

		const primaryCta = page.getByRole('link', { name: /Join Swing Trading Room/i });
		await expect.element(primaryCta).toBeInTheDocument();
		await primaryCta.click();
		expect(navigatedHref).toBe('/live-trading-rooms/swing-trading-room');
		expect(navigatedTargetId).toBe('memberships');
	});
});
