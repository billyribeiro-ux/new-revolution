import { query } from '$app/server';
import { requireAdmin } from '#lib/server/auth-guards.js';
import {
	getDailyPageViews,
	getTopPages,
	getTopReferrers,
	getPopularPosts,
	getBrowserBreakdown,
	getDeviceBreakdown,
	getCountryBreakdown,
	getAnalyticsDashboardData
} from '#lib/server/services/analytics.js';
import { analyticsWindowSchema } from '#lib/shared/schemas/analytics.js';

/**
 * Get daily page views for charting.
 * @boundary query - admin analytics daily views
 */
export const fetchDailyPageViews = query(analyticsWindowSchema, async ({ days }) => {
	requireAdmin();
	return getDailyPageViews(days);
});

export const fetchAnalyticsDashboard = query(analyticsWindowSchema, async ({ days }) => {
	requireAdmin();
	return getAnalyticsDashboardData(days);
});

/**
 * Get top pages by view count.
 * @boundary query - admin analytics top pages
 */
export const fetchTopPages = query(analyticsWindowSchema, async ({ days }) => {
	requireAdmin();
	return getTopPages(10, days);
});

/**
 * Get top referrers.
 * @boundary query - admin analytics referrers
 */
export const fetchTopReferrers = query(analyticsWindowSchema, async ({ days }) => {
	requireAdmin();
	return getTopReferrers(10, days);
});

/**
 * Get popular blog posts by views.
 * @boundary query - admin analytics popular posts
 */
export const fetchPopularPosts = query(analyticsWindowSchema, async ({ days }) => {
	requireAdmin();
	return getPopularPosts(10, days);
});

/**
 * Get analytics overview stats.
 * @boundary query - admin analytics overview
 */
export const fetchAnalyticsOverview = query(analyticsWindowSchema, async ({ days }) => {
	requireAdmin();
	const { overview } = await getAnalyticsDashboardData(days);
	return overview;
});

/**
 * Get browser breakdown for donut chart.
 * @boundary query - admin analytics browser breakdown
 */
export const fetchBrowserBreakdown = query(analyticsWindowSchema, async ({ days }) => {
	requireAdmin();
	return getBrowserBreakdown(days);
});

/**
 * Get device type breakdown for donut chart.
 * @boundary query - admin analytics device breakdown
 */
export const fetchDeviceBreakdown = query(analyticsWindowSchema, async ({ days }) => {
	requireAdmin();
	return getDeviceBreakdown(days);
});

/**
 * Get country breakdown for donut chart.
 * @boundary query - admin analytics country breakdown
 */
export const fetchCountryBreakdown = query(analyticsWindowSchema, async ({ days }) => {
	requireAdmin();
	return getCountryBreakdown(10, days);
});
