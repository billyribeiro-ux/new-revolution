import { sql } from 'drizzle-orm';
import { ensureDbReady, type AppDatabase } from './db';
import { auditLog } from './db/schema';

export interface AuditEntryInput {
	actorUserId?: string | null;
	action: string;
	entityType: 'post' | 'category' | 'tag' | 'author' | 'media' | 'cron' | 'page';
	entityId: string | number;
	summary?: Record<string, unknown>;
}

export async function writeAuditLog(
	entry: AuditEntryInput,
	txOrDb?: Pick<AppDatabase, 'insert'>
): Promise<void> {
	const targetDb = txOrDb ?? (await ensureDbReady());
	const actorId = entry.actorUserId?.trim() || null;

	await targetDb.insert(auditLog).values({
		actorUserId: actorId ? sql`(SELECT id FROM "user" WHERE id = ${actorId})` : null,
		action: entry.action,
		entityType: entry.entityType,
		entityId: String(entry.entityId),
		summary: actorId ? { ...(entry.summary ?? {}), actorId } : (entry.summary ?? {})
	});
}
