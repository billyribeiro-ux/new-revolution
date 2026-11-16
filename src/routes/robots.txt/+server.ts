import { BRAND } from '#lib/config/brand.ts';
import { isNonProductionHost } from '../../hooks.server.ts';
import type { RequestHandler } from './$types';

export const prerender = false;

export function _buildRobotsTxt(options: {
	isProduction: boolean;
	domain?: string;
	brandName?: string;
}): string {
	if (!options.isProduction) {
		return 'User-agent: *\nDisallow: /\n';
	}

	const cleanDomain = (options.domain ?? BRAND.domain).replace(/\/+$/, '');
	const brandName = options.brandName ?? BRAND.name;

	return [
		`# ${brandName} — Production robots.txt (RFC 9309 & Google Search Central Compliant)`,
		`# Domain: ${cleanDomain}`,
		'',
		'# 1. Google Search, Discover, Images, Video & News Crawlers',
		'User-agent: Googlebot',
		'User-agent: Googlebot-Image',
		'User-agent: Googlebot-Video',
		'User-agent: Googlebot-News',
		'User-agent: Storebot-Google',
		'User-agent: GoogleOther',
		'Allow: /',
		'Allow: /_app/immutable/',
		'Disallow: /api/',
		'Disallow: /member-login$',
		'Disallow: /member-login/',
		'Disallow: /account/',
		'Disallow: /*?session_id=',
		'Disallow: /*?token=',
		'',
		'# 2. Google AI Overviews & Gemini Grounding Token',
		'User-agent: Google-Extended',
		'Allow: /',
		'',
		'# 3. Apple Search & Apple Intelligence Grounding Tokens',
		'User-agent: Applebot',
		'User-agent: Applebot-Extended',
		'Allow: /',
		'Disallow: /api/',
		'Disallow: /member-login$',
		'Disallow: /member-login/',
		'Disallow: /account/',
		'',
		'# 4. OpenAI, Anthropic & Perplexity Search / Grounding Crawlers',
		'User-agent: OAI-SearchBot',
		'User-agent: ChatGPT-User',
		'User-agent: GPTBot',
		'User-agent: Claude-SearchBot',
		'User-agent: ClaudeBot',
		'User-agent: PerplexityBot',
		'Allow: /',
		'Disallow: /api/',
		'Disallow: /member-login$',
		'Disallow: /member-login/',
		'Disallow: /account/',
		'',
		'# 5. All Other Standard Search Crawlers',
		'User-agent: *',
		'Allow: /',
		'Allow: /_app/immutable/',
		'Disallow: /api/',
		'Disallow: /member-login$',
		'Disallow: /member-login/',
		'Disallow: /account/',
		'Disallow: /*?session_id=',
		'Disallow: /*?token=',
		'',
		'# Note: /admin, /login, and /checkout use X-Robots-Tag / meta noindex (IDX-08) rather than Disallow',
		'# so search crawlers can read the authoritative noindex directive directly.',
		'',
		`Sitemap: ${cleanDomain}/sitemap.xml`,
		''
	].join('\n');
}

export const GET: RequestHandler = ({ url }) => {
	const isProduction = BRAND.isProduction && !isNonProductionHost(url.hostname);
	const body = _buildRobotsTxt({
		isProduction,
		domain: BRAND.domain,
		brandName: BRAND.name
	});

	return new Response(body, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': isProduction ? 'public, max-age=3600' : 'private, no-store',
			'X-Robots-Tag': 'noindex'
		}
	});
};
