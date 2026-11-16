import type { RequestHandler } from './$types';
import { tokenDocument } from '#lib/server/waitlist/http.ts';
export const GET: RequestHandler = ({ url }) => tokenDocument(url, 'unsubscribe');

import { methodNotAllowed } from '#lib/server/waitlist/http.ts';
export const POST = methodNotAllowed('GET, HEAD'),
	PUT = methodNotAllowed('GET, HEAD'),
	PATCH = methodNotAllowed('GET, HEAD'),
	DELETE = methodNotAllowed('GET, HEAD'),
	OPTIONS = methodNotAllowed('GET, HEAD');
