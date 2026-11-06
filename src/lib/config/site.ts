import { ensureNoTrailingSlash, optionalEnv, requireEnv } from './env';

const appUrl = ensureNoTrailingSlash(
	requireEnv('PUBLIC_APP_URL', 'https://revolutiontradingpros.com')
);
const contactEmail = requireEnv('PUBLIC_CONTACT_EMAIL', 'support@revolutiontradingpros.com');
const contactPhone = requireEnv('PUBLIC_CONTACT_PHONE', '(800) 555-0199');
const calendlyUrl = requireEnv('PUBLIC_CALENDLY_URL', 'https://calendly.com/');
const linkedInUrl = requireEnv(
	'PUBLIC_LINKEDIN_URL',
	'https://www.linkedin.com/company/revolution-trading-pros'
);
const twitterUrl = optionalEnv('PUBLIC_TWITTER_URL') || 'https://x.com/revtradingpros';
const bingSiteVerification = optionalEnv('PUBLIC_BING_SITE_VERIFICATION');
const appName = optionalEnv('PUBLIC_APP_NAME') || 'Revolution Trading Pros';

export const siteConfig = {
	name: appName,
	tagline: 'Institutional Trading Education & Live Execution Rooms',
	description:
		'Institutional options, futures, and day trading education, live trading rooms, and proprietary scanner tools for disciplined traders.',
	url: appUrl,
	email: contactEmail,
	phone: contactPhone,
	bingSiteVerification,

	address: {
		street: '100 Wall Street',
		city: 'New York',
		state: 'NY',
		zip: '10005',
		country: 'US',
		full: '100 Wall Street, New York, NY 10005'
	},

	nav: [
		{ label: 'About', href: '/about' },
		{ label: 'Live Rooms', href: '/live-trading-rooms' },
		{ label: 'Courses', href: '/courses' },
		{ label: 'Blog', href: '/blog' },
		{ label: 'Contact', href: '/contact' }
	],

	cta: {
		label: 'Schedule Now',
		calendlyUrl
	},

	social: {
		linkedin: linkedInUrl,
		twitter: twitterUrl,
		email: contactEmail
	},

	footer: {
		links: [
			{ label: 'Privacy Policy', href: '/privacy-policy' },
			{ label: 'Terms of Service', href: '/terms-of-service' }
		],
		copyright: `© ${new Date().getFullYear()} ${appName}. All rights reserved.`
	},

	logo: {
		src: '/logo.png',
		alt: `${appName}: Institutional Trading Education`,
		width: 50,
		height: 50
	}
} as const;
