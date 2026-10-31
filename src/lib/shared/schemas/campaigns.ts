import { z } from 'zod';
import { safeCtaHref } from '#lib/shared/safe-href.js';

export const campaignTypeSchema = z.enum(['popup', 'cta_swap', 'banner']);
export const campaignStatusSchema = z.enum(['draft', 'active', 'paused', 'archived']);

/** Targeting rules evaluated by the private campaign endpoint. All fields optional. */
export const campaignTargetingSchema = z.object({
	pathPrefixes: z.array(z.string().trim().max(300)).max(50).optional(),
	utmSource: z.string().trim().max(200).optional(),
	utmCampaign: z.string().trim().max(200).optional(),
	device: z.enum(['any', 'desktop', 'mobile']).default('any')
});

/**
 * Free-form notice content (heading, body, text, ctaLabel, ctaHref). The CTA
 * link is rendered as an `href` on every public page, so it is limited to a
 * relative path or an http(s), mailto: or tel: link; empty means no CTA.
 * `CampaignNotice.svelte` re-checks at render time for rows saved earlier.
 */
const campaignContentSchema = z
	.record(z.string(), z.unknown())
	.refine(
		({ ctaHref }) =>
			ctaHref === undefined ||
			(typeof ctaHref === 'string' && ctaHref.trim() === '') ||
			safeCtaHref(ctaHref) !== undefined,
		{
			message: 'CTA link must be a relative path or an http(s), mailto: or tel: link',
			path: ['ctaHref']
		}
	);

/** A weighted A/B variant. */
export const campaignVariantSchema = z.object({
	key: z.string().trim().min(1).max(20),
	weight: z.number().int().min(0).max(100).default(50),
	content: campaignContentSchema.optional()
});

export const campaignCreateSchema = z.object({
	name: z.string().trim().min(1, 'Name is required').max(200),
	type: campaignTypeSchema.default('popup'),
	status: campaignStatusSchema.default('draft'),
	targeting: campaignTargetingSchema.optional(),
	content: campaignContentSchema.optional(),
	startsAt: z.string().datetime().optional(),
	endsAt: z.string().datetime().optional(),
	variants: z
		.array(campaignVariantSchema)
		.max(8)
		.refine(
			(variants) => new Set(variants.map((variant) => variant.key)).size === variants.length,
			{
				message: 'Variant keys must be unique'
			}
		)
		.default([])
});

export const campaignUpdateSchema = campaignCreateSchema.extend({
	id: z.number().int().positive()
});

export const campaignIdSchema = z.object({
	id: z.number().int().positive()
});

/** Public beacon payload: an impression or conversion for a campaign. */
export const campaignEventSchema = z.object({
	campaignId: z.number().int().positive(),
	variantKey: z.string().trim().max(20).optional(),
	type: z.enum(['impression', 'conversion']),
	sessionId: z.string().trim().max(200).optional()
});

export const campaignListFiltersSchema = z.object({
	status: campaignStatusSchema.optional(),
	limit: z.number().int().positive().max(1000).default(250),
	offset: z.number().int().nonnegative().default(0)
});

export type CampaignTargetingInput = z.infer<typeof campaignTargetingSchema>;
export type CampaignVariantInput = z.infer<typeof campaignVariantSchema>;
export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>;
export type CampaignUpdateInput = z.infer<typeof campaignUpdateSchema>;
export type CampaignIdInput = z.infer<typeof campaignIdSchema>;
export type CampaignEventInput = z.infer<typeof campaignEventSchema>;
export type CampaignListFiltersInput = z.infer<typeof campaignListFiltersSchema>;
