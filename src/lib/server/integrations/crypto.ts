import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import * as env from '$app/env/private';

const VERSION = 'v1';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function encryptionKeyMaterial(): string | null {
	const explicit = env['INTEGRATION_ENCRYPTION_KEY']?.trim();
	if (explicit) return explicit;
	return env['AUTH_SECRET']?.trim() || env['CRON_SECRET']?.trim() || null;
}

export function integrationEncryptionAvailable(): boolean {
	return encryptionKeyMaterial() !== null;
}

function key(): Buffer {
	const material = encryptionKeyMaterial();
	if (!material) {
		throw new Error('INTEGRATION_ENCRYPTION_KEY is not configured');
	}
	return createHash('sha256').update(material, 'utf8').digest();
}

export function encryptIntegrationSecret(value: string): string {
	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv(ALGORITHM, key(), iv, { authTagLength: TAG_LENGTH });
	const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();
	return [
		VERSION,
		iv.toString('base64url'),
		tag.toString('base64url'),
		encrypted.toString('base64url')
	].join('.');
}

export function decryptIntegrationSecret(ciphertext: string): string {
	const [version, ivRaw, tagRaw, encryptedRaw] = ciphertext.split('.');
	if (version !== VERSION || !ivRaw || !tagRaw || !encryptedRaw) {
		throw new Error('Invalid integration secret ciphertext');
	}
	const iv = Buffer.from(ivRaw, 'base64url');
	const tag = Buffer.from(tagRaw, 'base64url');
	const encrypted = Buffer.from(encryptedRaw, 'base64url');
	const decipher = createDecipheriv(ALGORITHM, key(), iv, { authTagLength: TAG_LENGTH });
	decipher.setAuthTag(tag);
	return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

export function secretLastFour(secret: string): string {
	return secret.slice(-4);
}
