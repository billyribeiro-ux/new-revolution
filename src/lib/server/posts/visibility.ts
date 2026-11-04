import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { and, eq, gt, isNull, lte, or, type SQL } from 'drizzle-orm';
import { posts } from '../db/schema.ts';

export interface PostVisibilityRow {
	id?: number;
	status: string;
	visibility: string;
	robotsNoindex: boolean;
	isFixture: boolean;
	deletedAt: Date | string | null;
	scheduledAt?: Date | string | null;
	expiresAt?: Date | string | null;
}

function toTimestampMs(val: Date | string | null | undefined): number | null {
	if (!val) return null;
	const ms = val instanceof Date ? val.getTime() : Date.parse(val);
	return Number.isNaN(ms) ? null : ms;
}

/**
 * Pure mirror of the SQL public indexability predicate (Section 5.3 & 7.13):
 * - Not deleted (`deletedAt === null`)
 * - Not a fixture (`isFixture === false`)
 * - `visibility === 'public'`
 * - `robotsNoindex === false`
 * - Either `status === 'published'`, OR (`status === 'scheduled'` AND `scheduledAt <= now`)
 * - Not expired (`expiresAt === null` OR `expiresAt > now`)
 */
export function isPubliclyIndexablePost(row: PostVisibilityRow, now: Date = new Date()): boolean {
	if (row.deletedAt !== null && row.deletedAt !== undefined) return false;
	if (row.isFixture) return false;
	if (row.visibility !== 'public') return false;
	if (row.robotsNoindex) return false;

	const nowMs = now.getTime();
	const expiresMs = toTimestampMs(row.expiresAt);
	if (expiresMs !== null && expiresMs <= nowMs) return false;

	if (row.status === 'published') return true;
	if (row.status === 'scheduled') {
		const schedMs = toTimestampMs(row.scheduledAt);
		return schedMs !== null && schedMs <= nowMs;
	}

	return false;
}

/**
 * Checks whether a post is live at read time (published or due-scheduled, not expired, not deleted, not fixture),
 * regardless of `robotsNoindex` or `visibility` (so `/blog/[slug]` can serve noindex, password-protected, or 403 members).
 */
export function isPostLiveAtReadTime(
	row: Pick<PostVisibilityRow, 'status' | 'isFixture' | 'deletedAt' | 'scheduledAt' | 'expiresAt'>,
	now: Date = new Date()
): boolean {
	if (row.deletedAt !== null && row.deletedAt !== undefined) return false;
	if (row.isFixture) return false;

	const nowMs = now.getTime();
	const expiresMs = toTimestampMs(row.expiresAt);
	if (expiresMs !== null && expiresMs <= nowMs) return false;

	if (row.status === 'published') return true;
	if (row.status === 'scheduled') {
		const schedMs = toTimestampMs(row.scheduledAt);
		return schedMs !== null && schedMs <= nowMs;
	}
	return false;
}

/**
 * Single-source-of-truth Drizzle SQL fragment for publicly indexable posts (Section 5.3 & 7.13).
 */
export function publicIndexablePostPredicate(now: Date = new Date()): SQL {
	return and(
		isNull(posts.deletedAt),
		eq(posts.isFixture, false),
		eq(posts.visibility, 'public'),
		eq(posts.robotsNoindex, false),
		or(
			eq(posts.status, 'published'),
			and(eq(posts.status, 'scheduled'), lte(posts.scheduledAt, now))
		),
		or(isNull(posts.expiresAt), gt(posts.expiresAt, now))
	)!;
}

/**
 * Predicate for `/blog/[slug]` live post lookup before visibility/password branching.
 */
export function livePostReadPredicate(now: Date = new Date()): SQL {
	return and(
		isNull(posts.deletedAt),
		eq(posts.isFixture, false),
		or(
			eq(posts.status, 'published'),
			and(eq(posts.status, 'scheduled'), lte(posts.scheduledAt, now))
		),
		or(isNull(posts.expiresAt), gt(posts.expiresAt, now))
	)!;
}

const SCRYPT_PREFIX = 'scrypt$';

export function hashPostPassword(plainPassword: string): string {
	const trimmed = plainPassword.trim();
	if (!trimmed) return '';
	if (trimmed.startsWith(SCRYPT_PREFIX)) return trimmed;
	const salt = randomBytes(16).toString('hex');
	const derived = scryptSync(trimmed, salt, 32).toString('hex');
	return `${SCRYPT_PREFIX}${salt}$${derived}`;
}

export function verifyPostPassword(
	candidatePlain: string,
	storedValue: string | null | undefined
): boolean {
	if (!storedValue || !candidatePlain) return false;

	if (storedValue.startsWith(SCRYPT_PREFIX)) {
		const parts = storedValue.slice(SCRYPT_PREFIX.length).split('$');
		if (parts.length !== 2) return false;
		const [salt, expectedHex] = parts;
		const candidateBuffer = scryptSync(candidatePlain.trim(), salt, 32);
		const expectedBuffer = Buffer.from(expectedHex, 'hex');
		if (candidateBuffer.length !== expectedBuffer.length) return false;
		return timingSafeEqual(candidateBuffer, expectedBuffer);
	}

	// Constant-time comparison over equal-length SHA-256 digests
	const hashA = createHash('sha256').update(candidatePlain.trim()).digest();
	const hashB = createHash('sha256').update(storedValue).digest();
	return timingSafeEqual(hashA, hashB);
}

function getPasswordCookieSecret(): string {
	const secret = process.env.POST_PASSWORD_SECRET || process.env.BETTER_AUTH_SECRET || '';
	if (!secret || secret.trim().length < 16) {
		throw new Error(
			'POST_PASSWORD_SECRET_MISSING: No secret configured for password-protected post cookies.'
		);
	}
	return secret;
}

export function getPostPasswordCookieName(postId: number): string {
	return `post_pw_${postId}`;
}

export function signPostUnlockToken(
	postId: number,
	storedPasswordHash: string,
	expiresAtMs: number = Date.now() + 24 * 60 * 60 * 1000
): string {
	const secret = getPasswordCookieSecret();
	const versionTag = createHash('sha256').update(storedPasswordHash).digest('hex').slice(0, 16);
	const payload = `${postId}.${expiresAtMs}.${versionTag}`;
	const sig = createHmac('sha256', secret).update(payload).digest('hex');
	return `${payload}.${sig}`;
}

export function verifyPostUnlockToken(
	token: string | undefined,
	postId: number,
	storedPasswordHash: string | null | undefined
): boolean {
	if (!token || !storedPasswordHash) return false;
	let secret: string;
	try {
		secret = getPasswordCookieSecret();
	} catch {
		return false;
	}

	const parts = token.split('.');
	if (parts.length !== 4) return false;
	const [idStr, expStr, versionTag, providedSig] = parts;
	if (Number(idStr) !== postId) return false;
	const expMs = Number(expStr);
	if (Number.isNaN(expMs) || expMs <= Date.now()) return false;

	const expectedVersionTag = createHash('sha256')
		.update(storedPasswordHash)
		.digest('hex')
		.slice(0, 16);
	const payload = `${postId}.${expMs}.${expectedVersionTag}`;
	const expectedSig = createHmac('sha256', secret).update(payload).digest('hex');

	const sigBufA = createHash('sha256').update(providedSig).digest();
	const sigBufB = createHash('sha256').update(expectedSig).digest();
	const verBufA = createHash('sha256').update(versionTag).digest();
	const verBufB = createHash('sha256').update(expectedVersionTag).digest();

	return timingSafeEqual(sigBufA, sigBufB) && timingSafeEqual(verBufA, verBufB);
}

function getDraftPreviewSecret(): string {
	const explicit = process.env.POST_PASSWORD_SECRET || process.env.BETTER_AUTH_SECRET || '';
	if (explicit && explicit.trim().length >= 16) {
		return explicit;
	}
	if (process.env.NODE_ENV === 'production') {
		throw new Error(
			'PREVIEW_SECRET_MISSING: Configure POST_PASSWORD_SECRET or BETTER_AUTH_SECRET in production.'
		);
	}
	return 'dev-only-better-auth-secret-32-chars-minimum';
}

export function signDraftPreviewToken(
	postId: number,
	expiresAtMs: number = Date.now() + 60 * 60 * 1000
): string {
	const secret = getDraftPreviewSecret();
	const payload = `preview.${postId}.${expiresAtMs}`;
	const sig = createHmac('sha256', secret).update(payload).digest('hex');
	return `${expiresAtMs}.${sig}`;
}

export function verifyDraftPreviewToken(token: string | null | undefined, postId: number): boolean {
	if (!token) return false;
	let secret: string;
	try {
		secret = getDraftPreviewSecret();
	} catch {
		return false;
	}
	const [expStr, providedSig] = token.split('.');
	if (!expStr || !providedSig) return false;
	const expMs = Number(expStr);
	if (Number.isNaN(expMs) || expMs <= Date.now()) return false;

	const payload = `preview.${postId}.${expMs}`;
	const expectedSig = createHmac('sha256', secret).update(payload).digest('hex');
	const bufA = createHash('sha256').update(providedSig).digest();
	const bufB = createHash('sha256').update(expectedSig).digest();
	return timingSafeEqual(bufA, bufB);
}

export interface LockedPostPublicPayload {
	id: number;
	title: string;
	slug: string;
	locked: true;
	robotsNoindex: true;
	breadcrumbs: Array<{ name: string; href: string }>;
	notice: string;
}

/**
 * Strips all sensitive fields from a locked password-protected post (Section 7.15):
 * Never leaks metaDescription, ogDescription, twitterDescription, coverImage, wordCount,
 * readingTime, coverImageCaption, author bios, TOC, FAQ, content, excerpt, or password.
 */
export function buildLockedPostPayload(post: {
	id: number;
	title: string;
	slug: string;
}): LockedPostPublicPayload {
	return {
		id: post.id,
		title: post.title,
		slug: post.slug,
		locked: true,
		robotsNoindex: true,
		breadcrumbs: [
			{ name: 'Home', href: '/' },
			{ name: 'Blog', href: '/blog' },
			{ name: post.title, href: `/blog/${post.slug}` }
		],
		notice: 'This article is password protected. Enter the access password to continue reading.'
	};
}

export function stripPasswordFromPostRow<T extends { password?: string | null }>(
	row: T
): Omit<T, 'password'> & { hasPassword: boolean } {
	const { password, ...rest } = row;
	return {
		...rest,
		hasPassword: Boolean(password && password.length > 0)
	};
}
