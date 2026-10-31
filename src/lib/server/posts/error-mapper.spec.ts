import { afterEach, describe, expect, it, vi } from 'vitest';
import { classifyBlogServiceError, toRestErrorResponse } from './error-mapper';

afterEach(() => vi.restoreAllMocks());

describe('error mapper', () => {
	it('does not leak raw exception text on 500 and logs the error', async () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const err = new Error('connect ECONNREFUSED 10.0.0.5:5432 password=hunter2');
		const res = toRestErrorResponse(err);
		expect(res.status).toBe(500);
		const body = await res.json();
		expect(JSON.stringify(body)).not.toContain('hunter2');
		expect(body.code).toBe('INTERNAL_ERROR');
		expect(body.error).toBe('An unexpected server error occurred.');
		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy.mock.calls[0]).toContain(err);
	});

	it('keeps mapped codes and does not log them as server errors', async () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(classifyBlogServiceError(new Error('MEDIA_NOT_FOUND: nope')).status).toBe(404);
		expect(classifyBlogServiceError(new Error('MEDIA_IN_USE: x')).status).toBe(409);
		expect(classifyBlogServiceError(new Error('MEDIA_RESTORE_UNAVAILABLE: x')).status).toBe(409);
		expect(classifyBlogServiceError(new Error('UNSUPPORTED_MEDIA_TYPE: x')).status).toBe(415);
		expect(classifyBlogServiceError(new Error('ENCODE_FAILED: x')).status).toBe(422);
		expect((await toRestErrorResponse(new Error('VALIDATION_ERROR: bad')).json()).error).toBe(
			'bad'
		);
		expect(spy).not.toHaveBeenCalled();
	});
});
