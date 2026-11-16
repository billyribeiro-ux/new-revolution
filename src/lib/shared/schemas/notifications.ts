import { z } from 'zod';

export const notificationListSchema = z
	.object({
		status: z.enum(['all', 'unread', 'read']).default('all'),
		folder: z.enum(['active', 'archived']).default('active'),
		limit: z.number().int().positive().max(50).default(20)
	})
	.optional();

export const notificationIdSchema = z.object({
	id: z.number().int().positive()
});

export type NotificationListInput = z.infer<typeof notificationListSchema>;
export type NotificationIdInput = z.infer<typeof notificationIdSchema>;

const notificationTypeSchema = z.enum(['lead', 'contact', 'email', 'analytics', 'system', 'ctr']);
const digestFrequencySchema = z.enum(['immediate', 'daily', 'weekly']);
// HH:MM 24h
const hhmm = z.string().regex(/^\d{2}:\d{2}$/, 'expected HH:MM');

export const preferenceUpdateSchema = z.object({
	type: notificationTypeSchema,
	enabled: z.boolean().optional(),
	digestFrequency: digestFrequencySchema.optional(),
	quietHoursStart: hhmm.nullable().optional(),
	quietHoursEnd: hhmm.nullable().optional(),
	// IANA tz (e.g. 'America/New_York'). Length cap is a soft sanity check —
	// the canonical IANA name is well below 64 chars.
	tz: z.string().min(1).max(64).optional()
});

export type PreferenceUpdateInput = z.infer<typeof preferenceUpdateSchema>;
