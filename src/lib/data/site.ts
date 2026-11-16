import { BRAND } from '#lib/config/brand.ts';

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
 * Phone and email read optional `PUBLIC_CONTACT_PHONE` / `PUBLIC_CONTACT_EMAIL` via `BRAND.contact`
 * and stay empty when unset so invented details are never rendered.
 */
export const SUPPORT_CONTACT = {
	get phone(): string {
		return BRAND.contact.phone;
	},
	get email(): string {
		return BRAND.contact.email;
	},
	contactHref: BRAND.contact.contactHref
};

export interface PressMention {
	id: string;
	name: string;
}

export const PRESS_MENTIONS: readonly PressMention[] = [];

/**
 * Founder portrait fallback (`T9` in `docs/TEMPORARY.md`).
 * Uses same-origin square emblem until the owner supplies a real portrait photo in `static/`.
 */
export const FOUNDER_PORTRAIT = {
	src: '/icon-512.png',
	get alt(): string {
		return `${BRAND.name} emblem`;
	}
};

/**
 * Single-owner founder identity shared by visible bylines and `#founder` JSON-LD.
 */
export const FOUNDER = {
	name: BRAND.founder.name,
	legalName: BRAND.founder.legalName,
	jobTitle: BRAND.founder.jobTitle,
	corroborationUrls: BRAND.founder.corroborationUrls
} as const;
