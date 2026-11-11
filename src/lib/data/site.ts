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
// No primary evidence is published for the former prototype recognition logos.
export const PRESS_MENTIONS: readonly PressMention[] = [];

/**
 * Founder portrait shown in instructor and bio blocks. The real photo only ever existed on the legacy
 * WordPress site (`/wp-content/uploads/2025/05/Billy-no-grey-768x768.png.webp`); that path is not served
 * by this app and the host returned an HTML page for it on 2026-11-01, so linking to it left a broken
 * image on every product page. Until the portrait is added to `static/`, the square brand emblem is
 * shown with an honest alt text. Temporary item T9 in `docs/TEMPORARY.md`.
 */
export const FOUNDER_PORTRAIT = {
	src: '/icon-512.png',
	alt: 'Revolution Trading Pros emblem'
} as const;

/**
 * The founder as shown to readers and emitted as the `Person` node (`#founder`) in JSON-LD. One value so the
 * visible byline and the structured data cannot drift apart (they disagreed before: "Head Market Strategist"
 * on /about, "Head Institutional Trader" in the schema).
 */
export const FOUNDER = {
	name: 'Billy Ribeiro',
	jobTitle: 'Founder & Head Trader'
} as const;
