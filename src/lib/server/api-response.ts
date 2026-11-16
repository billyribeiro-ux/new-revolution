import { error as svelteKitError } from '@sveltejs/kit';
import type { z } from 'zod';
import { getRequestEvent } from '$app/server';
import { randomUUID } from 'crypto';
import { logger } from '#lib/server/logger.js';
import { ServiceRefusal, rethrowServiceRefusal } from '#lib/server/service-errors.js';

function requestContext() {
	try {
		const { locals } = getRequestEvent();
		return { requestId: (locals.reqId ??= randomUUID()), log: locals.logger ?? logger };
	} catch {
		// Helpers may also be used outside a request, such as a background task.
		return { requestId: randomUUID(), log: logger };
	}
}

/**
 * Unified API response helpers.
 *
 * Transitional design: every response carries a `requestId` for tracing, and
 * every error carries a structured `error: { code, message, details? }`
 * envelope alongside the legacy `{ success: false, message }` fields. The
 * legacy fields are preserved so existing frontend consumers do not break;
 * new code should read from `error.code` and `requestId`.
 *
 * Once all callers migrate to the envelope, `success`/top-level `message`
 * can be dropped in a follow-up.
 */

export type ApiErrorCode =
	| 'VALIDATION'
	| 'UNAUTHORIZED'
	| 'FORBIDDEN'
	| 'NOT_FOUND'
	| 'RATE_LIMITED'
	| 'CONFLICT'
	| 'SERVICE_UNAVAILABLE'
	| 'NOT_CONFIGURED'
	| 'INTERNAL';

export interface ApiErrorBody {
	success: false;
	message: string;
	error: { code: ApiErrorCode; message: string; details?: unknown };
	requestId: string;
}

/**
 * Convert a service-layer `SEO_GATE_BLOCKED:` throw into a 422 with the
 * human-readable failing-check list, mirroring the remote functions'
 * `rethrowSeoGate`. Shared here so the REST post handlers and any future
 * API consumer surface the gate identically instead of a generic 500.
 * A service refusal (a missing post) becomes its 404/409 the same way.
 */
export function rethrowSeoGate(err: unknown): never {
	if (err instanceof Error && err.message.startsWith('SEO_GATE_BLOCKED:')) {
		const body = err.message.slice('SEO_GATE_BLOCKED:'.length).trim();
		svelteKitError(422, body);
	}
	rethrowServiceRefusal(err);
}

/**
 * REST boundary for service refusals (`src/lib/server/service-errors.ts`):
 * a `NotFoundError` / `ConflictError` / `NotConfiguredError` becomes the
 * structured 404 / 409 / 503 envelope with its own message; anything else is
 * rethrown untouched.
 */
export function apiRefusal(err: unknown): Response {
	if (err instanceof ServiceRefusal) return apiError(err.code, err.message, err.status);
	throw err;
}

/**
 * REST write contract: an empty string clears a nullable field. The admin
 * REST PUT handlers wrote `field || null` inline before they were routed
 * through the services (which keep `''`), so this keeps that wire contract.
 */
export function blankToNull<T extends Record<string, unknown>>(data: T): T {
	return Object.fromEntries(
		Object.entries(data).map(([key, value]) => [key, value === '' ? null : value])
	) as T;
}

/** Build a structured error response. Logs at warn (4xx) or error (5xx). */
export function apiError(
	code: ApiErrorCode,
	message: string,
	status: number,
	details?: unknown,
	init?: ResponseInit
): Response {
	const { requestId, log } = requestContext();
	const body: ApiErrorBody = {
		success: false,
		message,
		error: details === undefined ? { code, message } : { code, message, details },
		requestId
	};
	const logPayload = { requestId, code, status, details };
	if (status >= 500) log.error(logPayload, message);
	else log.warn(logPayload, message);
	const headers = new Headers(init?.headers);
	headers.set('x-request-id', requestId);
	return Response.json(body, { ...init, status, headers });
}

/**
 * Wrap a success payload, attaching `requestId`. Accepts an object payload
 * (the requestId is merged in) or `null`/`undefined` (returns `{ requestId }`).
 *
 * Pass-through for raw arrays is intentional — wrapping breaks list consumers.
 * Use `Response.json(...)` when the wire format must stay an
 * array; tracing falls back to the `x-request-id` response header.
 */
export function apiSuccess<T extends Record<string, unknown> | null | undefined>(
	payload: T,
	init?: ResponseInit
): Response {
	const { requestId } = requestContext();
	const body = payload && typeof payload === 'object' ? { ...payload, requestId } : { requestId };
	const headers = new Headers(init?.headers);
	headers.set('x-request-id', requestId);
	return Response.json(body, { ...init, headers });
}

/** Result of validating request input: the data, or the 400 to return. */
export type ParsedInput<T> = { ok: true; data: T } | { ok: false; response: Response };

/** A body that is not JSON at all, reported in the shape of a Zod issue. */
const MALFORMED_JSON_ISSUES = [
	{ code: 'invalid_json', path: [], message: 'Request body is not valid JSON' }
];

/**
 * Read a JSON request body and validate it. Malformed JSON and schema
 * failures are both a 400 VALIDATION envelope: an unguarded
 * `await request.json()` throws a SyntaxError that surfaced as a 500.
 */
export async function parseJsonBody<S extends z.ZodType>(
	request: Request,
	schema: S,
	message: string
): Promise<ParsedInput<z.output<S>>> {
	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		// Not swallowed: answered (and logged at warn) as a 400.
		return { ok: false, response: apiError('VALIDATION', message, 400, MALFORMED_JSON_ISSUES) };
	}
	const parsed = schema.safeParse(raw);
	return parsed.success
		? { ok: true, data: parsed.data }
		: { ok: false, response: apiError('VALIDATION', message, 400, parsed.error.issues) };
}

/**
 * Validate a URL query string. An empty value counts as absent, matching the
 * `searchParams.get(key) || default` reads these schemas replace.
 */
export function parseQuery<S extends z.ZodType>(
	url: URL,
	schema: S,
	message: string
): ParsedInput<z.output<S>> {
	const raw = Object.fromEntries([...url.searchParams].filter(([, value]) => value !== ''));
	const parsed = schema.safeParse(raw);
	return parsed.success
		? { ok: true, data: parsed.data }
		: { ok: false, response: apiError('VALIDATION', message, 400, parsed.error.issues) };
}
