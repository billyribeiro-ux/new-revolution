import { form, getRequestEvent } from '$app/server';
import { invalid } from '@sveltejs/kit';
import { createContactSubmission } from '#lib/server/services/contacts.js';
import { checkRateLimit } from '#lib/server/rate-limit.js';
import { contactCreateSchema } from '#lib/shared/schemas/contacts.js';

/**
 * Submit a contact form message (public endpoint).
 *
 * A `form`, not a `command`: the page spreads it onto a real `<form>`, so a
 * visitor whose JavaScript has not hydrated yet (or never runs) still posts
 * natively and gets the success or validation state back in the HTML. As a
 * `command` the form did nothing at all without JavaScript (audit 2026-10-09).
 *
 * Rate-limited at 3 submissions / 60s / IP. Without a cap, the form
 * was a free SMTP-budget burner and inbox spam vector — Zod validates
 * shape but doesn't stop a script from POSTing valid-looking payloads
 * on repeat. Three legitimate submissions in 60s is already an extreme
 * legitimate-user signal (form fatigue, double-click); anything beyond
 * is almost certainly a bot.
 *
 * Over budget, the handler refuses with a form-level `invalid(...)` rather
 * than `error(429)`: Kit then re-renders the form with the message (and,
 * without JavaScript, with every typed value), where an error would show the
 * error page and lose the visitor's message (audit 2026-10-09). Nothing is
 * stored either way.
 *
 * @boundary form - public contact form
 */
export const submitContactForm = form(contactCreateSchema, async (data) => {
	const event = getRequestEvent();
	const ip = event.getClientAddress();
	const limit = await checkRateLimit(`contact:${ip}`, 3, 60_000);
	if (!limit.allowed) {
		invalid('Too many messages in a short time. Please wait a minute and try again.');
	}

	// A form posts every control, so untouched optional inputs arrive as ''.
	// Store them as NULL, exactly as the JavaScript-only form did.
	await createContactSubmission({
		...data,
		phone: data.phone || undefined,
		company: data.company || undefined
	});
	// The result reaches the browser (the remote response with JavaScript, the
	// inlined hydration data without), so it carries no row id: the serial
	// `contact_submissions.id` would tell every visitor how many messages the
	// firm has received. The page only reads `success`.
	return { success: true };
});
