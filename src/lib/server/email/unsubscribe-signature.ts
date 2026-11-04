import { createHmac, timingSafeEqual } from 'node:crypto';

/** Shared by Kit and the pre-Kit Vercel ingress; never imports framework env. */
export function signUnsubscribeEmail(email: string, secret: string): string {
	return createHmac('sha256', secret).update(email.toLowerCase()).digest('base64url');
}

export function verifySignedUnsubscribeToken(
	token: string,
	secret: string | undefined
): string | null {
	if (!secret || token.length > 2048 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(token))
		return null;
	const [encodedEmail, signature] = token.split('.');
	if (!encodedEmail || !signature) return null;
	const email = Buffer.from(encodedEmail, 'base64url').toString('utf8');
	if (!email || Buffer.from(email).toString('base64url') !== encodedEmail) return null;
	const expected = Buffer.from(signUnsubscribeEmail(email, secret));
	const received = Buffer.from(signature);
	return received.length === expected.length && timingSafeEqual(received, expected) ? email : null;
}
