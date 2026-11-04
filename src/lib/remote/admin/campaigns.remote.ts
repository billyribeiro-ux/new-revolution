import { query, command } from '$app/server';
import { requireAdmin } from '#lib/server/auth-guards.js';
import {
	listCampaigns,
	getCampaignWithVariants,
	createCampaign,
	updateCampaign,
	deleteCampaign,
	getCampaignStats
} from '#lib/server/services/campaigns.js';
import {
	campaignCreateSchema,
	campaignUpdateSchema,
	campaignIdSchema
} from '#lib/shared/schemas/campaigns.js';

/**
 * List campaigns (active + paused + draft, excludes soft-deleted).
 * @boundary query - admin campaigns list
 */
export const fetchCampaigns = query(async () => {
	requireAdmin();
	return listCampaigns();
});

/**
 * Load one campaign with its variants.
 * @boundary query - admin campaign detail
 */
export const fetchCampaign = query(campaignIdSchema, async ({ id }) => {
	requireAdmin();
	return getCampaignWithVariants(id);
});

/**
 * Per-variant impression/conversion/CTR stats.
 * @boundary query - admin campaign stats
 */
export const fetchCampaignStats = query(campaignIdSchema, async ({ id }) => {
	requireAdmin();
	return getCampaignStats(id);
});

/**
 * Create a campaign + variants.
 * @boundary command - admin create campaign
 */
export const createCampaignCmd = command(campaignCreateSchema, async (data) => {
	requireAdmin();
	const id = await createCampaign(data);
	return { id };
});

/**
 * Update a campaign + variants.
 * @boundary command - admin update campaign
 */
export const updateCampaignCmd = command(campaignUpdateSchema, async (data) => {
	requireAdmin();
	await updateCampaign(data);
	return { id: data.id };
});

/**
 * Soft-delete (archive) a campaign.
 * @boundary command - admin delete campaign
 */
export const deleteCampaignCmd = command(campaignIdSchema, async ({ id }) => {
	requireAdmin();
	await deleteCampaign(id);
	return { ok: true };
});
