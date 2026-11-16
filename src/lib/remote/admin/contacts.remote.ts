import { query, command } from '$app/server';
import { requireAdmin } from '#lib/server/auth-guards.js';
import { rethrowServiceRefusal } from '#lib/server/service-errors.js';
import {
	listAllContacts,
	getContactById,
	getUnreadContactCount,
	getContactCounts,
	markContactAsRead,
	archiveContact,
	deleteContactSubmission
} from '#lib/server/services/contacts.js';
import { contactIdSchema, contactListFiltersSchema } from '#lib/shared/schemas/contacts.js';

/**
 * List contact submissions with optional filters.
 * @boundary query - admin contacts list
 */
export const fetchContacts = query(contactListFiltersSchema, async (filters) => {
	requireAdmin();
	return listAllContacts({
		status: filters.status,
		limit: filters.limit,
		offset: filters.offset
	});
});

/**
 * One contact submission by id, for a notification deep link whose message
 * is outside the capped list. `null` means it was deleted.
 * @boundary query - admin contact by id
 */
export const fetchContact = query(contactIdSchema, async ({ id }) => {
	requireAdmin();
	return getContactById(id);
});

/**
 * Get unread contact count (for badge).
 * @boundary query - admin unread contacts count
 */
export const fetchUnreadCount = query(async () => {
	requireAdmin();
	return getUnreadContactCount();
});

/**
 * True inbox totals (all messages + unread) for the header, independent
 * of the capped list fetch.
 * @boundary query - admin inbox header counts
 */
export const fetchContactCounts = query(async () => {
	requireAdmin();
	return getContactCounts();
});

/**
 * Mark a contact as read.
 * @boundary command - admin mark contact read
 */
export const markRead = command(contactIdSchema, async ({ id }) => {
	requireAdmin();
	return markContactAsRead(id).catch(rethrowServiceRefusal);
});

/**
 * Archive a contact.
 * @boundary command - admin archive contact
 */
export const archiveContactCmd = command(contactIdSchema, async ({ id }) => {
	requireAdmin();
	return archiveContact(id).catch(rethrowServiceRefusal);
});

/**
 * Delete a contact submission.
 * @boundary command - admin delete contact
 */
export const deleteContact = command(contactIdSchema, async ({ id }) => {
	requireAdmin();
	return deleteContactSubmission(id);
});
