import { COMMERCE_ENABLED } from '#lib/shared/development-status.ts';

// Enforce the public concept status before authentication, redirects, or routing.
// This is deliberately independent of search-indexing and navigation visibility.
const COMMERCE_PATH =
	/^\/(?:api\/)?(?:cart|checkout|purchase|purchases|payment|payments|billing|subscribe|subscription|subscriptions)(?:\/|$)/i;

export function conceptCommerceResponse(pathname: string): Response | null {
	if (COMMERCE_ENABLED || !COMMERCE_PATH.test(pathname)) return null;
	return Response.json(
		{
			code: 'CONCEPT_ONLY',
			error:
				'Purchases are unavailable. This website is a concept in development; no orders, payments, deposits, or paid subscriptions are accepted.'
		},
		{
			status: 403,
			headers: {
				'Cache-Control': 'private, no-store',
				'X-Robots-Tag': 'noindex, nofollow'
			}
		}
	);
}
