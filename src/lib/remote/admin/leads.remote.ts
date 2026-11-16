import { query, command } from '$app/server';
import { requireAdmin } from '#lib/server/auth-guards.js';
import { rethrowServiceRefusal } from '#lib/server/service-errors.js';
import {
	listAllLeads,
	listTrashedLeads,
	getLeadById,
	getTrashedLeadsCount,
	updateLeadStatus,
	getLeadStats,
	getEmailEventStats,
	getLeadsDashboardData,
	exportLeadsCsv,
	softDeleteLead,
	softDeleteLeads,
	restoreLead,
	restoreLeads,
	permanentlyDeleteLead,
	permanentlyDeleteAllTrashedLeads
} from '#lib/server/services/leads.js';
import {
	leadUpdateStatusSchema,
	leadListFiltersSchema,
	leadDashboardFiltersSchema,
	leadIdSchema,
	leadIdsSchema
} from '#lib/shared/schemas/leads.js';

/**
 * List ACTIVE leads (deleted_at IS NULL) with optional filters.
 * @boundary query - admin leads list
 */
export const fetchLeads = query(leadListFiltersSchema, async (filters) => {
	requireAdmin();
	return listAllLeads(filters);
});

/**
 * List TRASHED leads for the recovery view. Always returns the full
 * trash; admins are expected to bulk-restore or empty in one shot.
 * @boundary query - admin trashed leads
 */
export const fetchTrashedLeads = query(async () => {
	requireAdmin();
	return listTrashedLeads();
});

/**
 * One lead by id, INCLUDING trashed rows, so a notification deep link can
 * tell "in Trash" and "outside the current filters" apart from "deleted"
 * (`null`).
 * @boundary query - admin lead by id
 */
export const fetchLead = query(leadIdSchema, async ({ id }) => {
	requireAdmin();
	return getLeadById(id);
});

/**
 * Count of trashed leads — drives the "Trash (N)" tab badge.
 * @boundary query - admin trash count
 */
export const fetchTrashedLeadsCount = query(async () => {
	requireAdmin();
	return getTrashedLeadsCount();
});

/**
 * Get lead stats for dashboard (excludes trashed).
 * @boundary query - admin lead stats
 */
export const fetchLeadStats = query(async () => {
	requireAdmin();
	return getLeadStats();
});

/**
 * Get email event stats (open rate, click rate).
 * @boundary query - admin email stats
 */
export const fetchEmailStats = query(async () => {
	requireAdmin();
	return getEmailEventStats();
});

/**
 * Get the real-data lead dashboard bundle: filtered lead rows, Resend
 * engagement rollups, KPI rates, source breakdown, and capture trend.
 * @boundary query - admin lead dashboard
 */
export const fetchLeadsDashboard = query(leadDashboardFiltersSchema, async (filters) => {
	requireAdmin();
	return getLeadsDashboardData(filters);
});

/**
 * Update a lead's status.
 * @boundary command - admin update lead status
 */
export const updateLeadStatusCmd = command(leadUpdateStatusSchema, async ({ id, status }) => {
	requireAdmin();
	return updateLeadStatus(id, status).catch(rethrowServiceRefusal);
});

// ─── Trash flow ───────────────────────────────────────────────────────

/**
 * Move a single lead to Trash.
 * @boundary command - admin soft delete lead
 */
export const trashLeadCmd = command(leadIdSchema, async ({ id }) => {
	requireAdmin();
	return softDeleteLead(id).catch(rethrowServiceRefusal);
});

/**
 * Bulk move leads to Trash (max 500 ids per call, see schema).
 * @boundary command - admin bulk trash leads
 */
export const trashLeadsBulkCmd = command(leadIdsSchema, async ({ ids }) => {
	requireAdmin();
	return softDeleteLeads(ids);
});

/**
 * Restore a single lead from Trash.
 * @boundary command - admin restore lead
 */
export const restoreLeadCmd = command(leadIdSchema, async ({ id }) => {
	requireAdmin();
	return restoreLead(id).catch(rethrowServiceRefusal);
});

/**
 * Bulk restore leads from Trash (max 500).
 * @boundary command - admin bulk restore leads
 */
export const restoreLeadsBulkCmd = command(leadIdsSchema, async ({ ids }) => {
	requireAdmin();
	return restoreLeads(ids);
});

/**
 * Permanently delete a single trashed lead. Service-side guard refuses
 * if the lead is not currently in Trash.
 * @boundary command - admin permanent delete lead
 */
export const permanentlyDeleteLeadCmd = command(leadIdSchema, async ({ id }) => {
	requireAdmin();
	return permanentlyDeleteLead(id).catch(rethrowServiceRefusal);
});

/**
 * Empty Trash — permanently delete every trashed lead in one shot.
 * @boundary command - admin empty leads trash
 */
export const emptyLeadsTrashCmd = command(async () => {
	requireAdmin();
	return permanentlyDeleteAllTrashedLeads();
});

/**
 * Export ACTIVE leads as CSV.
 * @boundary query - admin export leads
 */
export const fetchLeadsCsv = query(async () => {
	requireAdmin();
	return exportLeadsCsv();
});
