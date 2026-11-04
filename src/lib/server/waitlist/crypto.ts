import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'node:crypto';
export const tokenHash = (value: string) => createHash('sha256').update(value).digest('hex');
export const newToken = () => randomBytes(32).toString('base64url');
export function privateBucket(purpose: string, value: string): string {
	const secret = process.env.WAITLIST_RATE_LIMIT_KEY;
	if (!secret || secret.length < 32) throw new Error('Waitlist rate limit key unavailable');
	return createHmac('sha256', secret).update(`${purpose}:${value}`).digest('hex');
}
function key(version = 'v1') {
	const material =
		version === 'v1'
			? process.env.WAITLIST_ENCRYPTION_KEY
			: process.env.WAITLIST_PREVIOUS_ENCRYPTION_KEY;
	if (!material || !/^[a-f0-9]{64}$/i.test(material))
		throw new Error('Waitlist encryption key unavailable');
	return Buffer.from(material, 'hex');
}
export function seal(value: string, rowId: string): string {
	const iv = randomBytes(12),
		cipher = createCipheriv('aes-256-gcm', key(), iv);
	cipher.setAAD(Buffer.from(`waitlist:${rowId}`));
	const body = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
	return [
		'v1',
		iv.toString('base64url'),
		cipher.getAuthTag().toString('base64url'),
		body.toString('base64url')
	].join('.');
}
export function unseal(value: string, rowId: string): string {
	const [version, iv, tag, body] = value.split('.');
	if (!['v1', 'v0'].includes(version) || !iv || !tag || !body)
		throw new Error('Invalid waitlist payload');
	const decipher = createDecipheriv('aes-256-gcm', key(version), Buffer.from(iv, 'base64url'));
	decipher.setAAD(Buffer.from(`waitlist:${rowId}`));
	decipher.setAuthTag(Buffer.from(tag, 'base64url'));
	return Buffer.concat([
		decipher.update(Buffer.from(body, 'base64url')),
		decipher.final()
	]).toString('utf8');
}
