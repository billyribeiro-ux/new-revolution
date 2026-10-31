import { z } from 'zod';

/** Schema for creating a contact submission */
export const contactCreateSchema = z.object({
	name: z.string().min(1, 'Name is required').max(200),
	email: z.string().email('Invalid email address'),
	phone: z.string().max(30).optional(),
	company: z.string().max(200).optional(),
	message: z.string().min(10, 'Message must be at least 10 characters').max(5000)
});

/** Schema for contact ID lookup */
export const contactIdSchema = z.object({
	id: z.number().int().positive()
});

/** Schema for contact list filters */
export const contactListFiltersSchema = z.object({
	status: z.enum(['unread', 'read', 'archived']).optional(),
	limit: z.number().int().positive().optional(),
	offset: z.number().int().nonnegative().optional()
});

export type ContactCreateInput = z.infer<typeof contactCreateSchema>;
export type ContactIdInput = z.infer<typeof contactIdSchema>;
export type ContactListFiltersInput = z.infer<typeof contactListFiltersSchema>;
