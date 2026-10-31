import { z } from 'zod';

export const analyticsWindowSchema = z.object({
	days: z.number().int().min(1).max(365).optional().default(30)
});

export type AnalyticsWindow = z.infer<typeof analyticsWindowSchema>;
