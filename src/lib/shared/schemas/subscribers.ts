import { z } from 'zod';

/**
 * Filters for the admin subscribers roster. `search` matches email or name on
 * the server; the roster is capped, so searching only the rows already in the
 * browser reported "No matches." for anyone past the cap.
 */
export const subscriberListFiltersSchema = z.object({
	search: z.string().trim().max(200).optional()
});

export type SubscriberListFiltersInput = z.infer<typeof subscriberListFiltersSchema>;
