import type { RequestHandler } from './$types';
import { tokenHandler } from '#lib/server/waitlist/http.ts';
export const POST: RequestHandler = (event) => tokenHandler(event, 'unsubscribe');

import { methodNotAllowed } from '#lib/server/waitlist/http.ts';
export const GET = methodNotAllowed('POST'),
	HEAD = methodNotAllowed('POST'),
	PUT = methodNotAllowed('POST'),
	PATCH = methodNotAllowed('POST'),
	DELETE = methodNotAllowed('POST'),
	OPTIONS = methodNotAllowed('POST');
