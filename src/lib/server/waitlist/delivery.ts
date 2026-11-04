import { Resend } from 'resend';
import { PermanentDeliveryError, type Sender } from './service.ts';
export const deliver: Sender = async (payload, idempotencyKey) => {
	const key = process.env.RESEND_API_KEY;
	if (!key) throw new Error('Provider unavailable');
	if (process.env.VERCEL_ENV !== 'production') {
		const allowed = (process.env.WAITLIST_TEST_RECIPIENTS || '')
			.split(',')
			.map((v) => v.trim().toLowerCase());
		if (!allowed.includes(payload.to)) throw new Error('Recipient not in preview allowlist');
	}
	// A bounded, awaited provider request; a timeout remains retryable with the same key.
	const resend = new Resend(key);
	const response = await resend.emails.send(payload, {
		idempotencyKey,
		signal: AbortSignal.timeout(8000)
	});
	if (response.error) {
		if (
			[
				'validation_error',
				'invalid_access',
				'invalid_parameter',
				'missing_required_field'
			].includes(response.error.name)
		)
			throw new PermanentDeliveryError('Provider rejected payload');
		throw new Error('Provider unavailable');
	}
	if (!response.data?.id) throw new Error('Missing provider ID');
	return response.data.id;
};
