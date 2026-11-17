/**
 * Single Source of Truth (SSOT) Brand, Staging Shield, Founder Lineage & Methodology Registry.
 *
 * Parameterizes the entire platform via `PUBLIC_BRAND_NAME`, `PUBLIC_SITE_URL`, and `PUBLIC_ENV`:
 * - Zero-Leak Staging Shield: `BRAND.isProduction` is `true` strictly when `PUBLIC_ENV === 'production'`.
 * - Verified Lineage: Locks in the biographical record for Mark "Goldfinger" McGoldrick
 *   (Partner at Goldman Sachs, Co-Founder & Co-Head of Goldman Sachs Global Special Situations
 *   Group [GSSG / SSG, 1997–2007], and Co-Founder of Mount Kellett Capital Management) and
 *   Welber "Billy" Ribeiro's 100% indicator-free system, "The Move Prior to The Move™".
 */

type PublicBrandEnvKey =
	| 'PUBLIC_BRAND_NAME'
	| 'PUBLIC_APP_NAME'
	| 'PUBLIC_SITE_URL'
	| 'PUBLIC_APP_URL'
	| 'PUBLIC_ENV'
	| 'PUBLIC_CONTACT_EMAIL'
	| 'PUBLIC_CONTACT_PHONE';

const DEFAULT_BRAND_NAME = 'Revolution Trading Pros';
const DEFAULT_SITE_URL = 'https://www.revolutiontradingpros.com';
const DEFAULT_SLOGAN = 'Pure Price Structure • Asymmetric Risk • Live Execution';

let syncedClientEnv: Record<string, string | undefined> | null = null;

export function syncClientBrandEnv(env: Record<string, string | undefined>): void {
	syncedClientEnv = env;
}

export function readPublicBrandEnv(key: PublicBrandEnvKey): string | undefined {
	const fromSynced = syncedClientEnv?.[key]?.trim();
	if (fromSynced) return fromSynced;
	const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
	const fromMeta = metaEnv?.[key]?.trim();
	if (fromMeta) return fromMeta;
	if (typeof process !== 'undefined' && process.env) {
		const fromProc = process.env[key]?.trim();
		if (fromProc) return fromProc;
	}
	return undefined;
}

export function resolveSiteOrigin(explicitUrl?: string): string {
	const raw =
		explicitUrl?.trim() ||
		readPublicBrandEnv('PUBLIC_SITE_URL') ||
		readPublicBrandEnv('PUBLIC_APP_URL') ||
		DEFAULT_SITE_URL;
	return raw.replace(/\/+$/, '');
}

export function resolveBrandHost(explicitUrl?: string): string {
	try {
		return new URL(resolveSiteOrigin(explicitUrl)).hostname.replace(/^www\./i, '');
	} catch {
		return 'localhost';
	}
}

export function resolveBrandName(override?: string): string {
	return (
		override?.trim() ||
		readPublicBrandEnv('PUBLIC_BRAND_NAME') ||
		readPublicBrandEnv('PUBLIC_APP_NAME') ||
		DEFAULT_BRAND_NAME
	);
}

export function resolveBrandShortName(brandName = resolveBrandName()): string {
	if (brandName === DEFAULT_BRAND_NAME) return 'RTP';
	const initials = brandName
		.split(/\s+/)
		.map((part) => part.replace(/[^A-Za-z0-9]/g, '')[0])
		.filter(Boolean)
		.join('')
		.toUpperCase();
	return initials || brandName.slice(0, 4).toUpperCase();
}

export function resolveIsProduction(envOverride?: string): boolean {
	const raw = envOverride !== undefined ? envOverride : readPublicBrandEnv('PUBLIC_ENV');
	return raw?.trim().toLowerCase() === 'production';
}

export const BRAND = {
	get name(): string {
		return resolveBrandName();
	},
	get upperName(): string {
		return resolveBrandName().toUpperCase();
	},
	get shortName(): string {
		return resolveBrandShortName();
	},
	get domain(): string {
		return resolveSiteOrigin();
	},
	get host(): string {
		return resolveBrandHost();
	},
	get supportEmail(): string {
		return readPublicBrandEnv('PUBLIC_CONTACT_EMAIL') || `support@${resolveBrandHost()}`;
	},
	get isProduction(): boolean {
		return resolveIsProduction();
	},
	slogan: DEFAULT_SLOGAN,
	upperSlogan: DEFAULT_SLOGAN.toUpperCase(),
	navTagline: 'EDUCATE. INNOVATE. PROSPER.',
	methodology: 'The Move Prior to The Move™',
	philosophyQuotes: [
		'I do not use indicators, I use my system.',
		'I trade the charts and not the noise.',
		'I buy into weakness and sell into strength.'
	] as const,
	founder: {
		legalName: 'Welber "Billy" Ribeiro',
		name: 'Billy Ribeiro',
		shortName: 'Billy Ribeiro',
		jobTitle: 'Founder, Head Trader & Creator of The Move Prior to The Move™',
		mentorshipLineage:
			'Personally mentored by the late Mark "Goldfinger" McGoldrick — Partner at Goldman Sachs, Co-Founder & Co-Head of Goldman Sachs Global Special Situations Group (GSSG / SSG, 1997–2007), and Co-Founder of Mount Kellett Capital Management.',
		corroborationUrls: ['https://www.tradinggreats.com/traders/billy-ribeiro'] as const
	},
	contact: {
		get email(): string {
			return readPublicBrandEnv('PUBLIC_CONTACT_EMAIL') ?? '';
		},
		get phone(): string {
			return readPublicBrandEnv('PUBLIC_CONTACT_PHONE') ?? '';
		},
		deskHours: 'Monday–Friday, 9:30 AM – 4:00 PM ET',
		contactHref: '/contact'
	},
	location: {
		region: 'Connecticut, US',
		country: 'US'
	}
} as const;
