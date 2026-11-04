/**
 * Lead Capture API Endpoint.
 *
 * Handles email lead capture with transactional email delivery via Resend.
 * Implements database persistence, email delivery, and comprehensive error handling.
 *
 * @module api/lead
 * @category API
 * @since 1.0.0
 *
 * Architecture:
 * - Database-first: Lead persisted before email attempt
 * - Idempotent: Safe to retry on failure
 * - Graceful degradation: Returns 503 if email service unavailable
 * - Audit trail: Stores Resend message ID for tracking
 *
 * Error Handling:
 * - 400: Invalid email format (Zod validation)
 * - 500: Database failure
 * - 503: Email service unavailable (missing API key or Resend failure)
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/lead', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ email: 'user@example.com' })
 * });
 * const { success, message } = await response.json();
 * ```
 */

import type { RequestHandler } from './$types';
import { z } from 'zod';
import { sendLeadEmail } from '#lib/server/services/lead-email.js';
import { checkRateLimit } from '#lib/server/rate-limit.js';
import { apiError, apiSuccess } from '#lib/server/api-response.js';

/**
 * Lead capture request schema
 * Validates email format using Zod
 */
const leadSchema = z.object({
	email: z.string().email('Invalid email address')
});

/**
 * POST /api/lead — Capture lead email and send welcome email with PDF.
 *
 * Request Flow:
 * 1. Validate email format (Zod schema)
 * 2. Check email service availability (RESEND_API_KEY)
 * 3. Persist lead to database (with metadata)
 * 4. Send transactional email via Resend
 * 5. Update lead record with Resend message ID
 *
 * @param {Request} request - SvelteKit request object
 * @param {Function} getClientAddress - Client IP resolver
 * @returns {Response} JSON response with success status and message
 *
 * @throws {400} Invalid email format
 * @throws {500} Database persistence failure
 * @throws {503} Email service unavailable
 *
 * @example
 * Request:
 * ```json
 * { "email": "user@example.com" }
 * ```
 *
 * Success Response (200):
 * ```json
 * { "success": true, "message": "Check your email for your free checklist!" }
 * ```
 *
 * Error Response (503):
 * ```json
 * { "success": false, "message": "Email service is not configured. Please contact support." }
 * ```
 */
export const POST: RequestHandler = async ({ request, getClientAddress, locals }) => {
	const ip = getClientAddress();
	const limit = await checkRateLimit(`lead:${ip}`, 5);
	if (!limit.allowed) {
		return apiError('RATE_LIMITED', 'Too many requests. Please try again later.', 429, undefined, {
			headers: { 'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)) }
		});
	}

	try {
		const body = await request.json();
		const { email } = leadSchema.parse(body);

		const result = await sendLeadEmail(email, {
			source: 'lead_form',
			sourcePage: request.headers.get('referer') || undefined,
			ip: getClientAddress(),
			userAgent: request.headers.get('user-agent') || undefined
		});
		if (!result.success) {
			return apiError('SERVICE_UNAVAILABLE', result.message, 503);
		}

		locals.logger.info({ email }, '[Lead API] Email sent successfully');
		return apiSuccess(result);
	} catch (error: unknown) {
		// Zod validation errors (400 Bad Request)
		if (error && typeof error === 'object' && 'issues' in error) {
			const zodError = error as { issues: Array<{ message: string }> };
			const firstIssue = zodError.issues[0];
			return apiError(
				'VALIDATION',
				firstIssue?.message ?? 'Validation error',
				400,
				zodError.issues
			);
		}

		// Database or email service errors (500 Internal Server Error)
		locals.logger.error({ err: error }, '[Lead API] Error during lead capture');
		return apiError('INTERNAL', 'Something went wrong. Please try again.', 500);
	}
};
