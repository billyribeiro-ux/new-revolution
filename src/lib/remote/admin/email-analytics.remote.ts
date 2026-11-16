import { query } from '$app/server';
import { requireAdmin } from '#lib/server/auth-guards.js';
import {
	getEmailMetrics,
	getDailyEmailStats,
	getEmailFunnel,
	getTopEmailSources
} from '#lib/server/services/email-analytics.js';

/**
 * Email Analytics Remote Functions
 * @boundary query - admin email analytics
 */

export const fetchEmailMetrics = query(async () => {
	requireAdmin();
	return getEmailMetrics(30);
});

export const fetchDailyEmailStats = query(async () => {
	requireAdmin();
	return getDailyEmailStats(30);
});

export const fetchEmailFunnel = query(async () => {
	requireAdmin();
	return getEmailFunnel(30);
});

export const fetchTopEmailSources = query(async () => {
	requireAdmin();
	return getTopEmailSources(10, 30);
});
