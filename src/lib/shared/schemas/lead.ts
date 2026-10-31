import { z } from 'zod';

/** Schema for lead capture email submission (name + email gate the free PDF). */
export const leadCaptureSchema = z.object({
	email: z.string().email('Invalid email address'),
	name: z.string().trim().min(1, 'Name is required').max(100),
	/** Optional path the form was submitted from (analytics / lead sourcePage). */
	sourcePage: z.string().max(500).optional()
});

export type LeadCaptureInput = z.infer<typeof leadCaptureSchema>;
