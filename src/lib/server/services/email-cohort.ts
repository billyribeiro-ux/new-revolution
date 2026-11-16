import { sql } from 'drizzle-orm';

/**
 * Distinct accepted messages sent during the selected period to live leads.
 * Engagement is observed for those same message IDs, regardless of event date.
 * Legacy welcome sends use their historic signup time as a fallback. Accepted
 * baseline drip writes count immediately, before cron normalizes their status.
 */
export function emailCohortSql(since: Date, before: Date) {
	return sql`
		WITH candidates AS (
			SELECT id AS lead_id, resend_message_id AS message_id,
				coalesce(email_sent_at, created_at) AS sent_at
			FROM leads WHERE deleted_at IS NULL AND resend_message_id IS NOT NULL
			UNION ALL
			SELECT e.lead_id, s.resend_message_id, coalesce(s.sent_at, s.first_attempt_at) FROM email_sends s
			JOIN email_enrollments e ON e.id = s.enrollment_id JOIN leads l ON l.id = e.lead_id
			WHERE l.deleted_at IS NULL AND s.resend_message_id IS NOT NULL
				AND (s.status = 'sent' OR s.payload IS NULL)
			UNION ALL
			SELECT e.lead_id, e.message_id, e.created_at FROM email_events e JOIN leads l ON l.id = e.lead_id
			WHERE l.deleted_at IS NULL AND e.event = 'sent' AND e.message_id IS NOT NULL
		), messages AS (
			SELECT message_id, min(lead_id) AS lead_id, min(sent_at) AS sent_at FROM candidates
			GROUP BY message_id
		), cohort AS (
			SELECT * FROM messages WHERE sent_at >= ${since.toISOString()}::timestamptz
				AND sent_at < ${before.toISOString()}::timestamptz
		)
		SELECT m.message_id, m.lead_id, m.sent_at, l.source,
			coalesce(bool_or(e.event = 'delivered'), false) AS delivered,
			coalesce(bool_or(e.event = 'opened'), false) AS opened,
			coalesce(bool_or(e.event = 'clicked'), false) AS clicked,
			coalesce(bool_or(e.event = 'bounced'), false) AS bounced,
			coalesce(bool_or(e.event = 'complained'), false) AS complained
		FROM cohort m JOIN leads l ON l.id = m.lead_id
		LEFT JOIN email_events e ON e.message_id = m.message_id
		GROUP BY m.message_id, m.lead_id, m.sent_at, l.source
	`;
}
