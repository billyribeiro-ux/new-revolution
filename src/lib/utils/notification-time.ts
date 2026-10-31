/**
 * Admin notification times: one zone, UTC, and the label says so.
 *
 * Both places that list notifications, the /admin/notifications page and the
 * toolbar bell, format through here so the same row reads the same time in
 * each. UTC rather than the browser's zone because the page is server-rendered
 * on Vercel in UTC and no admin zone is stored (notification_preferences.tz
 * defaults to 'UTC' and nothing sets it): a local format would paint one time
 * in the HTML and another after hydration (see b37baa7).
 */

const TIME = {
	hour: 'numeric',
	minute: '2-digit',
	timeZone: 'UTC',
	timeZoneName: 'short'
} as const satisfies Intl.DateTimeFormatOptions;

const timeOnly = new Intl.DateTimeFormat('en-US', TIME);
const dayAndTime = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', ...TIME });

/** Accept the Date a remote function delivers or an ISO string from JSON. */
export function toNotificationDate(value: Date | string): Date {
	return typeof value === 'string' ? new Date(value) : value;
}

/** "2:30 AM UTC": for rows already grouped under a UTC day heading. */
export function notificationTimeLabel(value: Date | string): string {
	return timeOnly.format(toNotificationDate(value));
}

/** "Mar 10, 2:30 AM UTC": for an ungrouped list such as the bell panel. */
export function notificationDateTimeLabel(value: Date | string): string {
	return dayAndTime.format(toNotificationDate(value));
}
