/**
 * Campaigns service.
 *
 * A campaign renders on the public site as a popup, CTA swap, or banner.
 * Variant (A/B) assignment is server-side and cookie-persisted. The private
 * /api/campaigns/active endpoint resolves it after navigation so personalized
 * overlays never enter shared public page HTML or SvelteKit page data.
 *
 * Impressions/conversions are recorded via the rate-limited /api/campaign-events
 * beacon into campaign_events for CTR rollups.
 */
import { db } from '#lib/server/db/index.js';
import { campaigns, campaignVariants, campaignEvents } from '#lib/server/db/schema.js';
import { and, asc, desc, eq, gte, isNull, lte, or, sql, type SQL } from 'drizzle-orm';
import type { ResolvedVariant } from '#lib/shared/campaigns.js';
import { campaignCreateSchema, campaignUpdateSchema } from '#lib/shared/schemas/campaigns.js';
export type { ResolvedVariant };

export type CampaignTargeting = {
	pathPrefixes?: string[];
	utmSource?: string;
	utmCampaign?: string;
	device?: 'any' | 'desktop' | 'mobile';
};

// ─── Public: active resolution + variant assignment ────────────────────

/** Active, non-deleted campaigns inside their date window. */
export async function getActiveCampaigns(now = new Date()) {
	const rows = await db
		.select()
		.from(campaigns)
		.where(and(eq(campaigns.status, 'active'), isNull(campaigns.deletedAt)))
		.orderBy(asc(campaigns.id));
	return rows.filter((c) => {
		if (c.startsAt && c.startsAt > now) return false;
		if (c.endsAt && c.endsAt < now) return false;
		return true;
	});
}

/** Variants for a campaign, ordered by key. */
export async function getVariants(campaignId: number) {
	return db
		.select()
		.from(campaignVariants)
		.where(eq(campaignVariants.campaignId, campaignId))
		.orderBy(asc(campaignVariants.key));
}

/** Metadata, targeting and variants must come from the same SQL snapshot. */
async function readCampaignsWithVariants(condition: SQL | undefined) {
	const rows = await db
		.select({ campaign: campaigns, variant: campaignVariants })
		.from(campaigns)
		.leftJoin(campaignVariants, eq(campaignVariants.campaignId, campaigns.id))
		.where(condition)
		.orderBy(asc(campaigns.id), asc(campaignVariants.key));
	const grouped = new Map<
		number,
		typeof campaigns.$inferSelect & {
			variants: (typeof campaignVariants.$inferSelect)[];
		}
	>();
	for (const { campaign, variant } of rows) {
		let entry = grouped.get(campaign.id);
		if (!entry) {
			entry = { ...campaign, variants: [] };
			grouped.set(campaign.id, entry);
		}
		if (variant) entry.variants.push(variant);
	}
	return [...grouped.values()];
}

/**
 * Does this campaign target the current request? Targeting is best-effort and
 * permissive: an empty rule matches everything.
 */
export function matchesTargeting(
	targeting: CampaignTargeting | null | undefined,
	ctx: { path: string; utmSource?: string | null; utmCampaign?: string | null; isMobile: boolean }
): boolean {
	if (!targeting) return true;
	if (targeting.pathPrefixes?.length) {
		if (!targeting.pathPrefixes.some((p) => ctx.path.startsWith(p))) return false;
	}
	if (targeting.utmSource && targeting.utmSource !== ctx.utmSource) return false;
	if (targeting.utmCampaign && targeting.utmCampaign !== ctx.utmCampaign) return false;
	if (targeting.device && targeting.device !== 'any') {
		const wantMobile = targeting.device === 'mobile';
		if (wantMobile !== ctx.isMobile) return false;
	}
	return true;
}

/**
 * Deterministically pick a variant for a visitor: hash the assignment key
 * (campaignId + stable visitor id) to a 0..99 bucket and walk the weighted
 * variants. Same visitor → same variant across sessions, no DB write.
 */
export function pickVariant(
	variants: { key: string; weight: number; contentJson: unknown }[],
	assignmentKey: string
): { key: string; content: Record<string, unknown> } | null {
	if (variants.length === 0) return null;
	const totalWeight = variants.reduce((s, v) => s + Math.max(0, v.weight), 0);
	if (totalWeight <= 0) {
		const v = variants[0]!;
		return { key: v.key, content: (v.contentJson as Record<string, unknown>) ?? {} };
	}
	// Simple stable string hash (djb2) → bucket in [0, totalWeight).
	let h = 5381;
	for (let i = 0; i < assignmentKey.length; i++)
		h = ((h << 5) + h + assignmentKey.charCodeAt(i)) >>> 0;
	let bucket = h % totalWeight;
	for (const v of variants) {
		const w = Math.max(0, v.weight);
		if (bucket < w)
			return { key: v.key, content: (v.contentJson as Record<string, unknown>) ?? {} };
		bucket -= w;
	}
	const last = variants[variants.length - 1]!;
	return { key: last.key, content: (last.contentJson as Record<string, unknown>) ?? {} };
}

/**
 * Resolve the campaigns to render for a request: targeting-matched active
 * campaigns, each with its assigned variant. `visitorId` should be a stable
 * per-visitor id (e.g. a cookie) so assignment is consistent.
 */
export async function resolveCampaignsForRequest(ctx: {
	path: string;
	utmSource?: string | null;
	utmCampaign?: string | null;
	isMobile: boolean;
	visitorId: string;
	now?: Date;
}): Promise<ResolvedVariant[]> {
	const now = ctx.now ?? new Date();
	const active = await readCampaignsWithVariants(
		and(
			eq(campaigns.status, 'active'),
			isNull(campaigns.deletedAt),
			or(isNull(campaigns.startsAt), lte(campaigns.startsAt, now)),
			or(isNull(campaigns.endsAt), gte(campaigns.endsAt, now))
		)
	);
	const matched = active.filter((c) =>
		matchesTargeting(c.targetingJson as CampaignTargeting | null, ctx)
	);
	const out: ResolvedVariant[] = [];
	for (const c of matched) {
		const variants = c.variants;
		if (variants.length === 0) {
			// No variants → render the campaign's base content as a single variant.
			out.push({
				campaignId: c.id,
				type: c.type,
				variantKey: null,
				content: (c.contentJson as Record<string, unknown>) ?? {}
			});
			continue;
		}
		const picked = pickVariant(
			variants.map((v) => ({ key: v.key, weight: v.weight, contentJson: v.contentJson })),
			`${c.id}:${ctx.visitorId}`
		);
		out.push({
			campaignId: c.id,
			type: c.type,
			variantKey: picked?.key ?? null,
			content: picked?.content ?? (c.contentJson as Record<string, unknown>) ?? {}
		});
	}
	return out;
}

// ─── Events ────────────────────────────────────────────────────────────

export async function recordCampaignEvent(data: {
	campaignId: number;
	variantKey?: string | null;
	type: 'impression' | 'conversion';
	sessionId?: string | null;
}): Promise<void> {
	// A conversion means "this visitor acted on this campaign", which can
	// happen at most once per session: repeat CTA clicks must not stack
	// (audit 2026-06-11: per-variant CTR exceeded 100%). Impressions stay
	// raw. Select-then-insert has a small race window, acceptable for an
	// admin-facing stat; the FK on campaign_id rejects spoofed campaigns.
	if (data.type === 'conversion' && data.sessionId) {
		const existing = await db
			.select({ id: campaignEvents.id })
			.from(campaignEvents)
			.where(
				and(
					eq(campaignEvents.campaignId, data.campaignId),
					eq(campaignEvents.type, 'conversion'),
					eq(campaignEvents.sessionId, data.sessionId)
				)
			)
			.limit(1);
		if (existing[0]) return;
	}

	await db.insert(campaignEvents).values({
		campaignId: data.campaignId,
		variantKey: data.variantKey ?? null,
		type: data.type,
		sessionId: data.sessionId ?? null
	});
}

// ─── Admin: CRUD ─────────────────────────────────────────────────────────

type VariantInput = { key: string; weight: number; content?: Record<string, unknown> | undefined };

export async function listCampaigns(filters?: {
	status?: string;
	limit?: number;
	offset?: number;
}) {
	const limit = filters?.limit ?? 250;
	const offset = filters?.offset ?? 0;
	const conditions = [isNull(campaigns.deletedAt)];
	if (filters?.status) conditions.push(eq(campaigns.status, filters.status));
	return db
		.select()
		.from(campaigns)
		.where(and(...conditions))
		.orderBy(desc(campaigns.createdAt))
		.limit(limit)
		.offset(offset);
}

export async function getCampaignWithVariants(id: number) {
	const rows = await readCampaignsWithVariants(eq(campaigns.id, id));
	return rows[0] ?? null;
}

export async function createCampaign(input: {
	name: string;
	type: string;
	status: string;
	targeting?: Record<string, unknown> | undefined;
	content?: Record<string, unknown> | undefined;
	startsAt?: string | undefined;
	endsAt?: string | undefined;
	variants: VariantInput[];
}): Promise<number> {
	const data = campaignCreateSchema.parse(input);
	// One statement shares the generated ID and rolls the parent row back if
	// any variant fails. Neon HTTP does not support interactive transactions.
	const inserted = await db.execute(sql`
		WITH created AS (
			INSERT INTO campaigns (name, type, status, targeting_json, content_json, starts_at, ends_at)
			VALUES (
				${data.name}, ${data.type}, ${data.status},
				${data.targeting ? JSON.stringify(data.targeting) : null}::jsonb,
				${data.content ? JSON.stringify(data.content) : null}::jsonb,
				${data.startsAt ?? null}::timestamptz, ${data.endsAt ?? null}::timestamptz
			)
			RETURNING id
		), inserted_variants AS (
			INSERT INTO campaign_variants (campaign_id, key, weight, content_json)
			SELECT created.id, variant.key, variant.weight, variant.content
			FROM created CROSS JOIN jsonb_to_recordset(${JSON.stringify(data.variants)}::jsonb)
			AS variant(key text, weight integer, content jsonb)
		)
		SELECT id FROM created
	`);
	const id = Number(inserted.rows[0]?.['id']);
	if (!id) throw new Error('Failed to create campaign');
	return id;
}

export async function updateCampaign(input: {
	id: number;
	name: string;
	type: string;
	status: string;
	targeting?: Record<string, unknown> | undefined;
	content?: Record<string, unknown> | undefined;
	startsAt?: string | undefined;
	endsAt?: string | undefined;
	variants: VariantInput[];
}): Promise<void> {
	const data = campaignUpdateSchema.parse(input);
	// The metadata UPDATE locks this campaign row until the whole HTTP batch
	// commits. A concurrent save waits, then replaces variants from a fresh
	// statement snapshot, so variants cannot mix between two saved versions.
	await db.batch([
		db
			.update(campaigns)
			.set({
				name: data.name,
				type: data.type,
				status: data.status,
				targetingJson: data.targeting ?? null,
				contentJson: data.content ?? null,
				startsAt: data.startsAt ? new Date(data.startsAt) : null,
				endsAt: data.endsAt ? new Date(data.endsAt) : null,
				updatedAt: new Date()
			})
			.where(eq(campaigns.id, data.id)),
		db.delete(campaignVariants).where(eq(campaignVariants.campaignId, data.id)),
		db.execute(sql`
			INSERT INTO campaign_variants (campaign_id, key, weight, content_json)
			SELECT ${data.id}, variant.key, variant.weight, variant.content
			FROM jsonb_to_recordset(${JSON.stringify(data.variants)}::jsonb)
			AS variant(key text, weight integer, content jsonb)
		`)
	]);
}

/** Soft-delete a campaign. */
export async function deleteCampaign(id: number): Promise<void> {
	await db
		.update(campaigns)
		.set({ deletedAt: new Date(), status: 'archived', updatedAt: new Date() })
		.where(eq(campaigns.id, id));
}

/** Per-variant impression/conversion rollup for a campaign dashboard. */
export async function getCampaignStats(campaignId: number) {
	const rows = await db
		.select({
			variantKey: campaignEvents.variantKey,
			impressions: sql<number>`count(*) FILTER (WHERE ${campaignEvents.type} = 'impression')::int`,
			conversions: sql<number>`count(*) FILTER (WHERE ${campaignEvents.type} = 'conversion')::int`
		})
		.from(campaignEvents)
		.where(eq(campaignEvents.campaignId, campaignId))
		.groupBy(campaignEvents.variantKey);
	return rows.map((r) => ({
		variantKey: r.variantKey ?? '(none)',
		impressions: r.impressions,
		conversions: r.conversions,
		ctr: r.impressions ? Math.round((r.conversions / r.impressions) * 1000) / 10 : 0
	}));
}
