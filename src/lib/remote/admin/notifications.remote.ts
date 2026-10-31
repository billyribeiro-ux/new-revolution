import { command, query } from '$app/server';
import { requireAdmin } from '#lib/server/auth-guards.js';
import { rethrowServiceRefusal } from '#lib/server/service-errors.js';
import {
	archiveAdminNotification,
	deleteAdminNotification,
	getUnreadAdminNotificationCount,
	listAdminNotifications,
	markAdminNotificationClicked,
	markAdminNotificationRead,
	markAdminNotificationUnread,
	unarchiveAdminNotification
} from '#lib/server/services/notifications.js';
import {
	getPreferencesForUser,
	upsertPreference
} from '#lib/server/services/notification-preferences.js';
import {
	notificationIdSchema,
	notificationListSchema,
	preferenceUpdateSchema
} from '#lib/shared/schemas/notifications.js';

export const fetchAdminNotifications = query(notificationListSchema, async (filters) => {
	requireAdmin();
	return listAdminNotifications(filters);
});

export const fetchUnreadNotificationCount = query(async () => {
	requireAdmin();
	return getUnreadAdminNotificationCount();
});

export const markNotificationReadCmd = command(notificationIdSchema, async ({ id }) => {
	requireAdmin();
	return markAdminNotificationRead(id).catch(rethrowServiceRefusal);
});

export const markNotificationClickedCmd = command(notificationIdSchema, async ({ id }) => {
	requireAdmin();
	return markAdminNotificationClicked(id).catch(rethrowServiceRefusal);
});

export const markNotificationUnreadCmd = command(notificationIdSchema, async ({ id }) => {
	requireAdmin();
	return markAdminNotificationUnread(id).catch(rethrowServiceRefusal);
});

export const archiveNotificationCmd = command(notificationIdSchema, async ({ id }) => {
	requireAdmin();
	return archiveAdminNotification(id).catch(rethrowServiceRefusal);
});

export const unarchiveNotificationCmd = command(notificationIdSchema, async ({ id }) => {
	requireAdmin();
	return unarchiveAdminNotification(id).catch(rethrowServiceRefusal);
});

export const deleteNotificationCmd = command(notificationIdSchema, async ({ id }) => {
	requireAdmin();
	return deleteAdminNotification(id).catch(rethrowServiceRefusal);
});

/**
 * Return the calling admin's preference rows. Missing rows mean
 * defaults (enabled, no quiet hours, UTC). The UI fills gaps locally
 * rather than the server pre-creating rows for every possible type —
 * that keeps the table empty for admins who never opt out.
 */
export const fetchNotificationPreferences = query(async () => {
	const user = requireAdmin();
	return getPreferencesForUser(user.id);
});

/**
 * Upsert a single (type) preference row for the calling admin.
 * Partial — the client sends only the fields it wants to change.
 */
export const updateNotificationPreferenceCmd = command(
	preferenceUpdateSchema,
	async ({ type, enabled, digestFrequency, quietHoursStart, quietHoursEnd, tz }) => {
		const user = requireAdmin();
		return upsertPreference({
			userId: user.id,
			type,
			enabled,
			digestFrequency,
			quietHoursStart,
			quietHoursEnd,
			tz
		});
	}
);
