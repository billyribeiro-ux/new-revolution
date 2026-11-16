import { BRAND } from './brand.ts';
import { optionalEnv } from './env.ts';

const linkedInUrl =
	optionalEnv('PUBLIC_LINKEDIN_URL') || 'https://www.linkedin.com/company/revolution-trading-pros';
const twitterUrl = optionalEnv('PUBLIC_TWITTER_URL') || 'https://x.com/revtradingpros';
const calendlyUrl = optionalEnv('PUBLIC_CALENDLY_URL') || 'https://calendly.com/';
const bingSiteVerification = optionalEnv('PUBLIC_BING_SITE_VERIFICATION');

export const siteConfig = {
	get name(): string {
		return BRAND.name;
	},
	tagline: BRAND.slogan,
	description:
		'Stock, ETF, and SPX options trading education built on 100% indicator-free pure price action (The Move Prior to The Move™), live trading rooms, and FINRA Rule 4210 risk tools.',
	get url(): string {
		return BRAND.domain;
	},
	get email(): string {
		return BRAND.contact.email;
	},
	get phone(): string {
		return BRAND.contact.phone;
	},
	bingSiteVerification,
	location: BRAND.location,
	nav: [
		{ label: 'Methodology', href: '/methodology' },
		{ label: 'Live Rooms', href: '/live-trading-rooms' },
		{ label: 'Alert Services', href: '/alert-services' },
		{ label: 'Resources', href: '/resources' },
		{ label: 'Blog', href: '/blog' },
		{ label: 'Contact', href: '/contact' }
	],
	cta: {
		label: 'Contact Desk',
		calendlyUrl
	},
	social: {
		linkedin: linkedInUrl,
		twitter: twitterUrl,
		get email(): string {
			return BRAND.contact.email;
		}
	},
	footer: {
		links: [
			{ label: 'Privacy Policy', href: '/privacy-policy' },
			{ label: 'Terms of Service', href: '/terms-of-service' },
			{ label: 'Risk Disclosure', href: '/risk-disclosure' }
		],
		get copyright(): string {
			return `© ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.`;
		}
	},
	logo: {
		src: '/logo.png',
		get alt(): string {
			return `${BRAND.name}: ${BRAND.slogan}`;
		},
		width: 50,
		height: 50
	}
} as const;
