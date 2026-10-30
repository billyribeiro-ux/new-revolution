import { error as svelteKitError, json } from '@sveltejs/kit';
import { ZodError } from 'zod';

export interface MappedServiceError {
	status: number;
	code: string;
	message: string;
	details?: unknown;
}

export function classifyBlogServiceError(err: unknown): MappedServiceError {
	if (err && typeof err === 'object' && 'status' in err && typeof err.status === 'number') {
		const body = (err as { body?: { message?: string } }).body;
		return {
			status: err.status,
			code: 'HTTP_ERROR',
			message: body?.message ?? 'Request failed.'
		};
	}

	if (err instanceof ZodError) {
		const issues = err.issues.map((i) => `${i.path.join('.') || 'input'}: ${i.message}`);
		return {
			status: 400,
			code: 'VALIDATION_ERROR',
			message: issues.join('\n'),
			details: err.issues
		};
	}

	const rawMessage = err instanceof Error ? err.message : String(err);

	if (rawMessage.startsWith('SEO_GATE_BLOCKED:')) {
		return {
			status: 422,
			code: 'SEO_GATE_BLOCKED',
			message: rawMessage.slice('SEO_GATE_BLOCKED:'.length).trimStart()
		};
	}

	if (rawMessage.startsWith('DUPLICATE_SLUG:')) {
		return {
			status: 409,
			code: 'DUPLICATE_SLUG',
			message: rawMessage.slice('DUPLICATE_SLUG:'.length).trim()
		};
	}

	if (rawMessage.startsWith('STALE_WRITE:')) {
		return {
			status: 409,
			code: 'STALE_WRITE',
			message: rawMessage.slice('STALE_WRITE:'.length).trim()
		};
	}

	for (const conflictPrefix of [
		'CATEGORY_IN_USE:',
		'TAG_IN_USE:',
		'AUTHOR_IN_USE:',
		'MEDIA_IN_USE:'
	] as const) {
		if (rawMessage.startsWith(conflictPrefix)) {
			const code = conflictPrefix.slice(0, -1);
			return {
				status: 409,
				code,
				message: rawMessage.slice(conflictPrefix.length).trim(),
				details: (err as { usage?: unknown })?.usage
			};
		}
	}

	for (const notFoundPrefix of [
		'POST_NOT_FOUND:',
		'CATEGORY_NOT_FOUND:',
		'TAG_NOT_FOUND:',
		'AUTHOR_NOT_FOUND:',
		'MEDIA_NOT_FOUND:',
		'REVISION_NOT_FOUND:'
	] as const) {
		if (rawMessage.startsWith(notFoundPrefix)) {
			return {
				status: 404,
				code: notFoundPrefix.slice(0, -1),
				message: rawMessage.slice(notFoundPrefix.length).trim()
			};
		}
	}

	if (rawMessage.startsWith('UNSUPPORTED_MEDIA_TYPE:')) {
		return {
			status: 415,
			code: 'UNSUPPORTED_MEDIA_TYPE',
			message: rawMessage.slice('UNSUPPORTED_MEDIA_TYPE:'.length).trim()
		};
	}

	if (rawMessage.startsWith('ENCODE_FAILED:')) {
		return {
			status: 422,
			code: 'ENCODE_FAILED',
			message: rawMessage.slice('ENCODE_FAILED:'.length).trim()
		};
	}

	if (
		rawMessage.startsWith('VALIDATION_ERROR:') ||
		rawMessage.startsWith('CATEGORY_CYCLE:') ||
		rawMessage.startsWith('CATEGORY_PARENT_NOT_FOUND:')
	) {
		const colonIdx = rawMessage.indexOf(':');
		return {
			status: 400,
			code: rawMessage.slice(0, colonIdx),
			message: rawMessage.slice(colonIdx + 1).trim()
		};
	}

	return {
		status: 500,
		code: 'INTERNAL_ERROR',
		message: rawMessage || 'An unexpected server error occurred.'
	};
}

export function toRestErrorResponse(err: unknown): Response {
	const mapped = classifyBlogServiceError(err);
	return json(
		{
			error: mapped.message,
			code: mapped.code,
			details: mapped.details
		},
		{ status: mapped.status }
	);
}

export function throwRpcServiceError(err: unknown): never {
	const mapped = classifyBlogServiceError(err);
	svelteKitError(mapped.status, `${mapped.code}: ${mapped.message}`);
}
