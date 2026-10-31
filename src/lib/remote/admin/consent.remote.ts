import { query, command } from '$app/server';
import { z } from 'zod';
import { requireAdmin } from '#lib/server/auth-guards.js';
import {
	listConsentRecords,
	getConsentStats,
	exportConsentCsv,
	deleteConsentRecords,
	purgeExpiredConsentRecords,
	CONSENT_PAGE_SIZE_MAX
} from '#lib/server/services/consent.js';

const pageSchema = z.object({
	limit: z.number().int().min(1).max(CONSENT_PAGE_SIZE_MAX).optional(),
	offset: z.number().int().min(0).optional()
});

/**
 * One page of consent records plus the total count.
 *
 * Previously took no arguments and returned a bare array capped at 250, so the
 * admin page silently hid every record past that (283 existed).
 * @boundary query - admin consent list
 */
export const fetchConsentRecords = query(pageSchema, async ({ limit, offset }) => {
	requireAdmin();
	// `exactOptionalPropertyTypes` is on: an explicit `undefined` is not the
	// same as an absent key, so build the arg rather than spreading undefineds.
	return listConsentRecords({
		...(limit !== undefined ? { limit } : {}),
		...(offset !== undefined ? { offset } : {})
	});
});

/**
 * Grant-rate stats for the consent dashboard.
 * @boundary query - admin consent stats
 */
export const fetchConsentStats = query(async () => {
	requireAdmin();
	return getConsentStats();
});

/**
 * Export consent records as CSV (full table, paged internally).
 * @boundary query - admin consent CSV
 */
export const fetchConsentCsv = query(async () => {
	requireAdmin();
	return exportConsentCsv();
});

/**
 * Erase every consent record for one visitor. This is the GDPR Art. 17 path:
 * a subject asks to be forgotten and their whole decision history goes.
 * @boundary command - admin consent erase by visitor
 */
export const eraseConsentForVisitor = command(
	z.object({ anonId: z.string().min(1).max(128) }),
	async ({ anonId }) => {
		requireAdmin();
		return deleteConsentRecords({ anonId });
	}
);

/**
 * Erase specific consent rows, for operational cleanup.
 *
 * `id` is a bigserial, so it crosses the wire as a string and is parsed back to
 * bigint here. Sending it as a JS number would silently lose precision past
 * 2^53.
 * @boundary command - admin consent erase by id
 */
export const eraseConsentRecords = command(
	z.object({ ids: z.array(z.string().regex(/^\d+$/)).min(1).max(500) }),
	async ({ ids }) => {
		requireAdmin();
		return deleteConsentRecords({ ids: ids.map((id) => BigInt(id)) });
	}
);

/**
 * Apply the retention policy now. Idempotent.
 * @boundary command - admin consent retention purge
 */
export const purgeExpiredConsent = command(async () => {
	requireAdmin();
	return purgeExpiredConsentRecords();
});
