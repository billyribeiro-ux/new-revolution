import { z } from 'zod';

/** Schema for creating a lead */
export const leadCreateSchema = z.object({
	email: z.string().email('Invalid email address'),
	source: z.string().optional(),
	sourcePage: z.string().optional()
});

/** Schema for updating a lead status */
export const leadUpdateStatusSchema = z.object({
	id: z.number().int().positive(),
	status: z.enum(['new', 'contacted', 'converted', 'unsubscribed'])
});

/** Schema for lead ID lookup */
export const leadIdSchema = z.object({
	id: z.number().int().positive()
});

/**
 * Schema for bulk operations (trash / restore / permanent-delete).
 * Capped at 500 ids per request to bound the worst-case query and
 * payload size — admins never need to operate on more than that in a
 * single click. The UI's "Trash all" button still works correctly
 * because it operates on a filtered page, not the full table.
 */
export const leadIdsSchema = z.object({
	ids: z.array(z.number().int().positive()).min(1).max(500)
});

/** Schema for lead list filters */
export const leadListFiltersSchema = z.object({
	status: z.string().optional(),
	limit: z.number().int().positive().optional(),
	offset: z.number().int().nonnegative().optional()
});

/**
 * `GET /api/admin/leads` query string. Values arrive as strings and are
 * coerced; NaN, fractions, negatives and a page size above the dashboard's own
 * cap (1000) are refused rather than reaching the query.
 */
export const leadRestQuerySchema = z.object({
	status: z.string().trim().min(1).max(50).optional(),
	limit: z.coerce.number().int().positive().max(1000).default(50),
	offset: z.coerce.number().int().nonnegative().default(0)
});

export const leadDashboardFiltersSchema = z.object({
	status: z.enum(['new', 'contacted', 'converted', 'unsubscribed']).optional(),
	source: z.string().trim().max(200).optional(),
	search: z.string().trim().max(200).optional(),
	engagement: z
		.enum(['all', 'no_email', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained'])
		.default('all'),
	dateFrom: z.string().trim().max(40).optional(),
	dateTo: z.string().trim().max(40).optional(),
	days: z.number().int().min(7).max(365).default(30),
	limit: z.number().int().positive().max(1000).default(250),
	offset: z.number().int().nonnegative().default(0)
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
export type LeadUpdateStatusInput = z.infer<typeof leadUpdateStatusSchema>;
export type LeadIdInput = z.infer<typeof leadIdSchema>;
export type LeadIdsInput = z.infer<typeof leadIdsSchema>;
export type LeadListFiltersInput = z.infer<typeof leadListFiltersSchema>;
export type LeadDashboardFiltersInput = z.infer<typeof leadDashboardFiltersSchema>;
