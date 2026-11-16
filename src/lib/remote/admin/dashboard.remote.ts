import { query } from '$app/server';
import { requireAdmin } from '#lib/server/auth-guards.js';
import {
	getDashboardKPIs,
	getDashboardKPIsForDays,
	getRecentActivity,
	getDailyLeads
} from '#lib/server/services/dashboard.js';
import { getDailyPageViews, getTopPages } from '#lib/server/services/analytics.js';
import { analyticsWindowSchema } from '#lib/shared/schemas/analytics.js';

/**
 * Get all dashboard KPIs.
 * @boundary query - admin dashboard KPIs
 */
export const fetchDashboardKPIs = query(analyticsWindowSchema, async ({ days }) => {
	requireAdmin();
	if (days === 30) return getDashboardKPIs();
	return getDashboardKPIsForDays(days);
});

export const fetchDashboardBundle = query(analyticsWindowSchema, async ({ days }) => {
	requireAdmin();
	const [kpis, activity, dailyViews, dailyLeads, topPages] = await Promise.all([
		days === 30 ? getDashboardKPIs() : getDashboardKPIsForDays(days),
		getRecentActivity(15),
		getDailyPageViews(days),
		getDailyLeads(days),
		getTopPages(10, days)
	]);
	return { kpis, activity, dailyViews, dailyLeads, topPages };
});

/**
 * Get recent activity feed.
 * @boundary query - admin recent activity
 */
export const fetchRecentActivity = query(async () => {
	requireAdmin();
	return getRecentActivity(15);
});

/**
 * Get daily page views for chart (30 days).
 * @boundary query - admin daily views chart
 */
export const fetchDailyViews = query(analyticsWindowSchema, async ({ days }) => {
	requireAdmin();
	return getDailyPageViews(days);
});

/**
 * Get daily leads for chart (30 days).
 * @boundary query - admin daily leads chart
 */
export const fetchDailyLeadsChart = query(analyticsWindowSchema, async ({ days }) => {
	requireAdmin();
	return getDailyLeads(days);
});
