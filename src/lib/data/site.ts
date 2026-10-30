export interface SocialLink {
	id: 'youtube' | 'x' | 'facebook' | 'instagram';
	label: string;
	href: string;
}

/** Official social profiles. Also emitted as `sameAs` in the Organization JSON-LD. */
export const SOCIAL_LINKS: readonly SocialLink[] = [
	{ id: 'youtube', label: 'YouTube', href: 'https://youtube.com/@RevolutionTradingPros' },
	{ id: 'x', label: 'X (Twitter)', href: 'https://twitter.com/revtradingpros' },
	{ id: 'facebook', label: 'Facebook', href: 'https://facebook.com/revolutiontradingpros' },
	{ id: 'instagram', label: 'Instagram', href: 'https://instagram.com/revolutiontradingpros' }
] as const;

/**
 * Live-support contact details for the "Have Questions?" block.
 * Phone and email are intentionally empty until real values are supplied; the block then
 * falls back to the contact page link instead of showing invented details.
 */
export const SUPPORT_CONTACT: { phone: string; email: string; contactHref: string } = {
	phone: '',
	email: '',
	contactHref: '/contact'
};

export interface PressMention {
	id: string;
	name: string;
}

/**
 * Media / recognition strip shown on the homepage only.
 * Every entry is a claim of coverage or recognition: publish only entries that can be verified,
 * and replace the text wordmarks with licensed logo assets when available.
 */
export const PRESS_MENTIONS: readonly PressMention[] = [
	{ id: 'inc', name: 'Inc. 500' },
	{ id: 'forbes', name: 'Forbes' },
	{ id: 'cnbc', name: 'CNBC' },
	{ id: 'fox-business', name: 'FOX Business' },
	{ id: 'fox-news', name: 'FOX News' },
	{ id: 'cheddar', name: 'Cheddar' }
] as const;
