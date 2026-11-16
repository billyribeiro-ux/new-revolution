import type { RequestHandler } from './$types';
import { z } from 'zod';
import { resolveCampaignsForRequest } from '#lib/server/services/campaigns.js';

const targetingSchema = z.object({
	path: z
		.string()
		.max(2048)
		.regex(/^\/(?!\/)[^?#]*$/)
		.refine((path) =>
			Array.from(path).every(
				(character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127
			)
		),
	utmSource: z.string().max(256).nullable(),
	utmCampaign: z.string().max(256).nullable()
});
const visitorIdPattern = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;
const visitorCookie = 'tc_camp_vid';
const privateHeaders = { 'cache-control': 'private, no-store' };

/** Personalized overlays never enter shared page HTML or SvelteKit page data. */
export const GET: RequestHandler = async ({ url, cookies, request, locals }) => {
	const parsed = targetingSchema.safeParse({
		path: url.searchParams.get('path'),
		utmSource: url.searchParams.get('utm_source'),
		utmCampaign: url.searchParams.get('utm_campaign')
	});
	if (!parsed.success) {
		return Response.json({ campaigns: [] }, { status: 400, headers: privateHeaders });
	}
	if (parsed.data.path.startsWith('/admin')) {
		return Response.json({ campaigns: [] }, { headers: privateHeaders });
	}
	let visitorId = cookies.get(visitorCookie);
	if (!visitorId || !visitorIdPattern.test(visitorId)) {
		visitorId = crypto.randomUUID();
		cookies.set(visitorCookie, visitorId, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365,
			httpOnly: true,
			sameSite: 'lax',
			secure: url.protocol === 'https:'
		});
	}
	try {
		const campaigns = await resolveCampaignsForRequest({
			...parsed.data,
			isMobile: /Mobi|Android|iPhone|iPad/i.test(request.headers.get('user-agent') ?? ''),
			visitorId
		});
		return Response.json({ campaigns }, { headers: privateHeaders });
	} catch (err) {
		locals.logger.warn({ err }, '[campaigns] Could not resolve public campaigns');
		return Response.json({ campaigns: [] }, { status: 503, headers: privateHeaders });
	}
};
