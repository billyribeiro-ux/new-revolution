<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { resolve } from '$app/paths';
	import SEO from '#lib/components/SEO.svelte';
	import AdminNotifications from '#lib/components/admin/AdminNotifications.svelte';
	import { fetchDashboardBundle } from '#lib/remote/admin/dashboard.remote.js';
	import SparkBar from '#lib/components/admin/SparkBar.svelte';
	import D3AreaChart from '#lib/components/admin/D3AreaChart.svelte';
	import ChartCard from '#lib/components/admin/ChartCard.svelte';
	import KpiCard from '#lib/components/admin/KpiCard.svelte';
	import D3BarList from '#lib/components/admin/D3BarList.svelte';
	import EyeIcon from 'phosphor-svelte/lib/EyeIcon';
	import UsersIcon from 'phosphor-svelte/lib/UsersIcon';
	import UserPlusIcon from 'phosphor-svelte/lib/UserPlusIcon';
	import EnvelopeOpenIcon from 'phosphor-svelte/lib/EnvelopeOpenIcon';
	import CursorClickIcon from 'phosphor-svelte/lib/CursorClickIcon';
	import ChatCircleDotsIcon from 'phosphor-svelte/lib/ChatCircleDotsIcon';
	import ArticleIcon from 'phosphor-svelte/lib/ArticleIcon';
	import FunnelSimpleIcon from 'phosphor-svelte/lib/FunnelSimpleIcon';
	import TrayIcon from 'phosphor-svelte/lib/TrayIcon';
	import ChartLineUpIcon from 'phosphor-svelte/lib/ChartLineUpIcon';

	/**
	 * Period-over-period growth, in percent.
	 *
	 * `null` means the prior period had ZERO activity, so a percent change is
	 * mathematically undefined — the UI renders a "NEW" badge in that case
	 * instead of pretending the move was "+100%". `0` means no change.
	 * Values are uncapped (3 → 100 leads correctly returns 3233).
	 */
	type Trends = {
		leads30d: number | null;
		leads7d: number | null;
		views30d: number | null;
		views7d: number | null;
		uniqueVisitors30d: number | null;
		uniqueVisitors7d: number | null;
	};
	type KPIs = {
		totalPosts: number;
		publishedPosts: number;
		leads30d: number;
		leads7d: number;
		views30d: number;
		views7d: number;
		uniqueVisitors30d: number;
		uniqueVisitors7d: number;
		leads30dPrev: number;
		views30dPrev: number;
		uniqueVisitors30dPrev: number;
		leadConversionRate: number;
		leadConversionRatePrev: number;
		unreadContacts: number;
		emailDelivered30d: number;
		emailOpened30d: number;
		emailClicked30d: number;
		windowDays: number;
		shortWindowDays: number;
		emailOpenRate: number;
		emailClickRate: number;
		analyticsSource: 'event_pipeline' | 'sqlite' | 'postgres' | 'hybrid';
		trends: Trends;
	};
	type ActivityItem = {
		type: 'lead' | 'contact' | 'post';
		id: number;
		title: string;
		subtitle: string;
		timestamp: Date | null;
	};
	type DailyData = { date: string; views: number; visitors: number };
	type DailyLeadData = { date: string; count: number };
	type TopPage = { path: string; views: number; visitors: number };
	type DashboardPayload = {
		kpis: KPIs;
		activity: ActivityItem[];
		dailyViews: DailyData[];
		dailyLeads: DailyLeadData[];
		topPages: TopPage[];
	};

	let loading = $state(true);
	let loadError = $state<string | null>(null);
	let kpis = $state<KPIs | null>(null);
	let activity = $state<ActivityItem[]>([]);
	let dailyViews = $state<DailyData[]>([]);
	let dailyLeads = $state<DailyLeadData[]>([]);
	let topPages = $state<TopPage[]>([]);
	let lastUpdated = $state<Date | null>(null);
	const rangeOptions = [
		{ label: 'Last 7 days', days: 7 },
		{ label: 'Last 30 days', days: 30 },
		{ label: 'Last 90 days', days: 90 },
		{ label: 'Last 180 days', days: 180 },
		{ label: 'Last 365 days', days: 365 }
	] as const;
	let selectedDays = $state<number>(30);
	/** The range whose numbers are on screen. A failed change reverts to it. */
	let shownDays = 30;
	/** Inline report of a failed range change; the previous range stays on screen. */
	let rangeError = $state<string | null>(null);
	/** Monotonic id so stale in-flight loads (interval refresh vs range change) never overwrite UI. */
	let loadGeneration = 0;
	const dashboardCache: Record<
		number,
		{ expiresAt: number; payload: DashboardPayload } | undefined
	> = {};
	const DASHBOARD_CACHE_TTL_MS = 30_000;
	let disposed = false;
	const requestTimeouts = new SvelteSet<ReturnType<typeof setTimeout>>();
	/** Race a promise against a timeout so remote calls never hang indefinitely. */
	async function withTimeout<T>(promise: Promise<T>, ms = 15_000): Promise<T> {
		let timer: ReturnType<typeof setTimeout> | undefined;
		try {
			return await Promise.race([
				promise,
				new Promise<never>((_, reject) => {
					timer = setTimeout(() => reject(new Error(`Request timed out after ${ms / 1000}s`)), ms);
					requestTimeouts.add(timer);
				})
			]);
		} finally {
			clearTimeout(timer);
			if (timer !== undefined) requestTimeouts.delete(timer);
		}
	}

	onMount(() => {
		// Schedule outside Svelte's effect context — SvelteKit remote queries
		// cannot be awaited synchronously from inside effect contexts.
		// setTimeout(_, 0) defers to the next task, escaping the context.
		const initialLoad = setTimeout(loadDashboard, 0);
		// We deliberately do NOT poll. A 30s interval used to live here, but
		// each poll re-fetched the entire KPI bundle and ANY ±1 jitter in a
		// metric kicked off the KpiCard count-up animation and a D3 spark
		// redraw — visually the "page views / visitors / most viewed pages"
		// numbers appeared to flicker every 30 seconds for no operator
		// benefit. Fresh data is one click away (range selector / browser
		// reload); we'll add an explicit "Refresh" button if the data
		// staleness ever becomes a real complaint.
		return () => {
			disposed = true;
			loadGeneration++;
			clearTimeout(initialLoad);
			for (const timer of requestTimeouts) clearTimeout(timer);
			requestTimeouts.clear();
		};
	});

	async function loadDashboard() {
		if (disposed) return;
		const gen = ++loadGeneration;
		const isInitialLoad = !kpis;
		if (isInitialLoad) loading = true;
		loadError = null;
		rangeError = null;
		const daysSnapshot = selectedDays;
		const cached = dashboardCache[daysSnapshot];
		if (cached && cached.expiresAt > Date.now()) {
			applyDashboardPayload(cached.payload, daysSnapshot);
			loading = false;
			loadError = null;
			return;
		}
		try {
			const payload = await withTimeout(fetchDashboardBundle({ days: daysSnapshot }));
			if (disposed || gen !== loadGeneration) return;
			dashboardCache[daysSnapshot] = {
				expiresAt: Date.now() + DASHBOARD_CACHE_TTL_MS,
				payload: payload as DashboardPayload
			};
			applyDashboardPayload(payload as DashboardPayload, daysSnapshot);
		} catch (err) {
			if (disposed || gen !== loadGeneration) return;
			console.error('Dashboard load error:', err);
			const reason = err instanceof Error ? err.message : 'request failed';
			if (!kpis) {
				loadError =
					err instanceof Error ? err.message : 'Failed to load dashboard. Please refresh.';
			} else {
				// Data for another range is on screen. Leaving the new selection in
				// place would label those numbers with a range they do not cover.
				rangeError = `Could not load ${rangeLabel(daysSnapshot)} (${reason}). Still showing ${rangeLabel(shownDays)}.`;
				selectedDays = shownDays;
			}
		} finally {
			if (!disposed && gen === loadGeneration) {
				loading = false;
			}
		}

		// Event pipeline (Fly.io Rust server) has been decommissioned.
		// eventKpis, topPages, topReferrers will remain null/empty — template guards hide them.
	}

	function rangeLabel(days: number): string {
		return rangeOptions.find((option) => option.days === days)?.label ?? `Last ${days} days`;
	}

	function applyDashboardPayload(payload: DashboardPayload, days: number) {
		shownDays = days;
		kpis = payload.kpis;
		activity = payload.activity;
		dailyViews = payload.dailyViews;
		dailyLeads = payload.dailyLeads;
		topPages = payload.topPages;
		lastUpdated = new Date();
	}

	function fmt(n: number): string {
		if (n >= 10000) return (n / 1000).toFixed(0) + 'k';
		if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
		return n.toLocaleString();
	}

	function timeAgo(date: Date | string | null): string {
		if (!date) return '';
		const d = typeof date === 'string' ? new Date(date) : date;
		const s = Math.floor((Date.now() - d.getTime()) / 1000);
		if (s < 60) return 'just now';
		if (s < 3600) return Math.floor(s / 60) + 'm ago';
		if (s < 86400) return Math.floor(s / 3600) + 'h ago';
		if (s < 604800) return Math.floor(s / 86400) + 'd ago';
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	function shortPath(path: string): string {
		if (!path) return '/';
		if (path === '/') return '/';
		return path.length > 34 ? path.slice(0, 31) + '...' : path;
	}

	let pageViewSparkData = $derived(dailyViews.map((d) => d.views));
	let visitorSparkData = $derived(dailyViews.map((d) => d.visitors));
	let leadSparkData = $derived(dailyLeads.map((d) => d.count));
	let sparkDates = $derived(dailyViews.map((d) => d.date));
	let leadSparkDates = $derived(dailyLeads.map((d) => d.date));
	let topPageItems = $derived(topPages.map((p) => ({ label: shortPath(p.path), value: p.views })));
	let totalTopPageViews = $derived(topPages.reduce((sum, p) => sum + p.views, 0));
</script>

<SEO title="Dashboard | Admin" description="Admin dashboard overview" noindex={true} />

<div class="dash">
	<header class="dash__hd">
		<div>
			<h1>Dashboard</h1>
			<p class="dash__sub">
				Real-time overview
				{#if lastUpdated}
					· Updated {timeAgo(lastUpdated)}
				{/if}
			</p>
		</div>
		<div class="dash__actions">
			<AdminNotifications />
			<select
				id="dash-range"
				name="dashRange"
				class="dash__range"
				aria-label="Time range"
				bind:value={selectedDays}
				onchange={() => void loadDashboard()}
			>
				{#each rangeOptions as opt (opt.days)}
					<option value={opt.days}>{opt.label}</option>
				{/each}
			</select>
			<a
				href={resolve('/')}
				target="_blank"
				rel="noopener noreferrer"
				class="dash__btn dash__btn--ghost">View Site ↗</a
			>
			<a href={resolve('/admin/posts')} class="dash__btn">New Post +</a>
		</div>
	</header>

	{#if rangeError}
		<p class="dash__range-error" role="alert">{rangeError}</p>
	{/if}

	{#if loading}
		<div class="dash__loading">
			<div class="pulse-ring"></div>
			<p>Loading dashboard...</p>
		</div>
	{:else if loadError}
		<div class="dash__error">
			<p class="dash__error-msg">⚠ {loadError}</p>
			<button type="button" class="dash__btn" onclick={() => loadDashboard()}>Retry</button>
		</div>
	{:else if kpis}
		<!-- ── KPI Cards ─────────────────────────────────────────────── -->
		<div class="kpi-grid">
			<!-- Page Views / Visitors / Leads use the SAME KpiCard as
			     /admin/analytics. They were hand-rolled `.kpi` markup wrapping a
			     raw SparkArea, which has no interaction, so the sparklines here
			     were dead while the identical metric on the analytics page showed
			     a value on hover. One card component, one behaviour
			     (2026-07-28 audit). -->
			<KpiCard
				label="Page Views"
				value={kpis.views30d}
				previousValue={kpis.views30dPrev}
				color="#c5a059"
				subtitle={`last ${kpis.windowDays} days`}
				sparkData={pageViewSparkData}
				{sparkDates}
				sparkValueLabel="view"
			>
				{#snippet icon()}<EyeIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>

			<KpiCard
				label="Visitors"
				value={kpis.uniqueVisitors30d}
				previousValue={kpis.uniqueVisitors30dPrev}
				color="#60a5fa"
				subtitle={`unique in last ${kpis.windowDays} days`}
				sparkData={visitorSparkData}
				{sparkDates}
				sparkValueLabel="visitor"
			>
				{#snippet icon()}<UsersIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>

			<KpiCard
				label="Leads"
				value={kpis.leads30d}
				previousValue={kpis.leads30dPrev}
				color="#34d399"
				subtitle={`last ${kpis.windowDays} days`}
				sparkData={leadSparkData}
				sparkDates={leadSparkDates}
				sparkValueLabel="lead"
				sparkType="bar"
			>
				{#snippet icon()}<UserPlusIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>

			<KpiCard
				label="Lead Conversion"
				value={kpis.leadConversionRate}
				previousValue={kpis.leadConversionRatePrev}
				suffix="%"
				color="#a78bfa"
				subtitle={`${fmt(kpis.leads30d)} leads / ${fmt(kpis.uniqueVisitors30d)} visitors`}
			>
				{#snippet icon()}<FunnelSimpleIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>

			<!-- Email Open Rate -->
			<div class="kpi">
				<div class="kpi__body">
					<div class="kpi__icon-wrap kpi__icon-wrap--amber">
						<EnvelopeOpenIcon size={20} weight="duotone" />
					</div>
					<span class="kpi__label">Email Open Rate</span>
					<div class="kpi__value">{kpis.emailOpenRate}<span class="kpi__unit">%</span></div>
					<div class="kpi__meta">
						<span class="kpi__sub">
							{fmt(kpis.emailOpened30d)} opens / {fmt(kpis.emailDelivered30d)} delivered (last {kpis.windowDays}d)
						</span>
					</div>
				</div>
				<div class="kpi__chart kpi__chart--gauge">
					<div class="kpi__gauge">
						<div class="kpi__gauge-track">
							<div
								class="kpi__gauge-fill"
								style="width: {Math.min(kpis.emailOpenRate, 100)}%"
							></div>
						</div>
						<div class="kpi__gauge-labels">
							<span>0%</span><span>50%</span><span>100%</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Email CTR -->
			<div class="kpi">
				<div class="kpi__body">
					<div class="kpi__icon-wrap kpi__icon-wrap--violet">
						<CursorClickIcon size={20} weight="duotone" />
					</div>
					<span class="kpi__label">Email CTR</span>
					<div class="kpi__value">{kpis.emailClickRate}<span class="kpi__unit">%</span></div>
					<div class="kpi__meta">
						<span class="kpi__sub">
							{fmt(kpis.emailClicked30d)} clicks / {fmt(kpis.emailDelivered30d)} delivered (last {kpis.windowDays}d)
						</span>
					</div>
				</div>
				<div class="kpi__chart kpi__chart--gauge">
					<div class="kpi__gauge">
						<div class="kpi__gauge-track">
							<div
								class="kpi__gauge-fill kpi__gauge-fill--violet"
								style="width: {Math.min(kpis.emailClickRate, 100)}%"
							></div>
						</div>
						<div class="kpi__gauge-labels">
							<span>0%</span><span>50%</span><span>100%</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Unread Messages -->
			<div class="kpi">
				<div class="kpi__body">
					<div class="kpi__icon-wrap kpi__icon-wrap--pink">
						<ChatCircleDotsIcon size={20} weight="duotone" />
					</div>
					<span class="kpi__label">Unread Inbox</span>
					<div class="kpi__value">
						{kpis.unreadContacts}
						{#if kpis.unreadContacts > 0}<span class="kpi__pulse"></span>{/if}
					</div>
					<div class="kpi__meta">
						<a href={resolve('/admin/inbox')} class="kpi__link">Open inbox →</a>
					</div>
				</div>
				<div class="kpi__chart">
					<div class="kpi__empty"><ChatCircleDotsIcon size={28} weight="thin" /></div>
				</div>
			</div>
		</div>

		<!-- ── Charts ────────────────────────────────────────────────── -->
		<div class="charts">
			<ChartCard title="Page Views & Visitors">
				{#if dailyViews.length > 1}
					<D3AreaChart data={dailyViews} />
				{:else}
					<div class="chart-card__empty">No page view data yet.</div>
				{/if}
			</ChartCard>

			<div class="chart-card">
				<div class="chart-card__hd">
					<h3>Lead Captures</h3>
					<span class="chart-card__total">{fmt(kpis.leads30d)} in {kpis.windowDays}d</span>
				</div>
				{#if dailyLeads.length > 1 && leadSparkData.some((n) => n > 0)}
					<div class="chart-card__body">
						<SparkBar data={leadSparkData} color="#34d399" width={600} height={180} />
					</div>
					<div class="chart-card__x">
						<span>{dailyLeads[0]?.date ?? ''}</span>
						<span>{dailyLeads[Math.floor(dailyLeads.length / 2)]?.date ?? ''}</span>
						<span>{dailyLeads[dailyLeads.length - 1]?.date ?? ''}</span>
					</div>
				{:else}
					<div class="chart-card__empty">No leads captured in this period.</div>
				{/if}
			</div>

			<div class="chart-card">
				<div class="chart-card__hd">
					<h3>Most Visited Pages</h3>
					<span class="chart-card__total">{fmt(totalTopPageViews)} views</span>
				</div>
				{#if topPages.length > 0}
					<D3BarList items={topPageItems} color="#60a5fa" maxItems={8} />
				{:else}
					<div class="chart-card__empty">No page view data yet.</div>
				{/if}
			</div>
		</div>

		<!-- ── Quick Links ───────────────────────────────────────────── -->
		<div class="qlinks">
			<a href={resolve('/admin/posts')} class="ql"
				><span class="ql__ic"><ArticleIcon size={18} /></span> Manage Posts</a
			>
			<a href={resolve('/admin/leads')} class="ql"
				><span class="ql__ic"><FunnelSimpleIcon size={18} /></span> Lead Pipeline</a
			>
			<a href={resolve('/admin/inbox')} class="ql">
				<span class="ql__ic"><TrayIcon size={18} /></span> Inbox
				{#if kpis.unreadContacts > 0}<span class="ql__dot"></span>{/if}
			</a>
			<a href={resolve('/admin/analytics')} class="ql"
				><span class="ql__ic"><ChartLineUpIcon size={18} /></span> Analytics</a
			>
		</div>

		<!-- ── Activity Feed ─────────────────────────────────────────── -->
		<div class="feed">
			<h3 class="feed__title">Recent Activity</h3>
			{#if activity.length > 0}
				<div class="feed__list">
					{#each activity as item (item.type + '-' + item.id)}
						<div class="feed__row">
							<div
								class={[
									'feed__dot',
									{
										lead: item.type === 'lead',
										contact: item.type === 'contact',
										post: item.type === 'post'
									}
								]}
							></div>
							<div class="feed__body">
								<span class="feed__name">{item.title}</span>
								<span class="feed__meta">{item.subtitle}</span>
							</div>
							<span class="feed__time">{timeAgo(item.timestamp)}</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="feed__empty">No activity yet.</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* ── Layout ────────────────────────────────────────────────────── */
	.dash {
		padding: 2rem;
		max-width: 1280px;
		margin: 0 auto;
	}
	.dash__hd {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 1rem;
	}
	.dash__hd h1 {
		font-family: var(--font-heading);
		font-size: 1.75rem;
		font-weight: 800;
		color: #fff;
		margin: 0;
		letter-spacing: -0.02em;
	}
	.dash__sub {
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.85rem;
		margin: 0.25rem 0 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.dash__actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.dash__range-error {
		margin: 1rem 0 0;
		padding: 0.625rem 0.875rem;
		border: 1px solid rgba(248, 113, 113, 0.35);
		border-radius: 0.5rem;
		background: rgba(248, 113, 113, 0.08);
		color: #fca5a5;
		font-size: 0.85rem;
	}
	.dash__range {
		padding: 0.5rem 0.625rem;
		border-radius: 0.5rem;
		font-size: 0.8rem;
		font-weight: 600;
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
	.dash__btn {
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.8rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.15s ease;
		background: #c5a059;
		color: #0a0a0f;
		border: none;
		cursor: pointer;
	}
	.dash__btn:hover {
		background: #d4b06a;
		transform: translateY(-1px);
	}
	.dash__btn--ghost {
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
	.dash__btn--ghost:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
	}

	/* ── Loading ───────────────────────────────────────────────────── */
	.dash__loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 6rem;
		color: rgba(255, 255, 255, 0.4);
		gap: 1.5rem;
	}
	.pulse-ring {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: 3px solid rgba(197, 160, 89, 0.15);
		border-top-color: #c5a059;
		animation: spin 0.7s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* ── Error State ───────────────────────────────────────────────── */
	.dash__error {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		padding: 4rem 2rem;
	}
	.dash__error-msg {
		color: #f87171;
		font-size: 0.9rem;
		text-align: center;
		max-width: 28rem;
	}

	/* ── KPI Grid ──────────────────────────────────────────────────── */
	/* Seven tiles (four KpiCards + three .kpi tiles): one row on wide screens. */
	.kpi-grid {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 1rem;
		margin-top: 1.75rem;
	}
	.kpi {
		background: rgba(255, 255, 255, 0.025);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 0.875rem;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease,
			transform 0.2s ease;
	}
	.kpi:hover {
		border-color: rgba(255, 255, 255, 0.12);
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
		transform: translateY(-2px);
	}

	/* ── KPI Body (top content area) ── */
	.kpi__body {
		padding: 1.125rem 1.125rem 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}
	.kpi__icon-wrap {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 0.5rem;
		flex-shrink: 0;
		margin-bottom: 0.375rem;
	}
	.kpi__icon-wrap--amber {
		background: rgba(251, 191, 36, 0.12);
		color: #fbbf24;
	}
	.kpi__icon-wrap--pink {
		background: rgba(244, 114, 182, 0.12);
		color: #f472b6;
	}
	.kpi__icon-wrap--violet {
		background: rgba(167, 139, 250, 0.12);
		color: #a78bfa;
	}
	.kpi__label {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: rgba(255, 255, 255, 0.4);
	}
	.kpi__value {
		font-family: var(--font-heading);
		font-size: 2rem;
		font-weight: 800;
		color: #fff;
		line-height: 1.1;
		letter-spacing: -0.03em;
		font-variant-numeric: tabular-nums;
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}
	.kpi__unit {
		font-size: 1rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.4);
	}
	/* Static dot. It blinked on a 2s infinite loop, which is an attention
	   grab for a count that is not urgent and cannot be dismissed by reading
	   it. A persistent blink trains the operator to ignore it (2026-07-28). */
	.kpi__pulse {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #f472b6;
	}

	/* ── KPI Meta (trend badge + subtitle) ── */
	.kpi__meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}
	/* `NEW` badge — rendered when the prior period had zero activity, so a
	   percentage trend would be mathematically undefined (you can't divide
	   by zero — going from 0 → anything is infinite growth, not "+100%").
	   Visually distinct from up/down trends so operators read it as an
	   information state rather than a percentage. */
	.kpi__sub {
		font-size: 0.72rem;
		color: rgba(255, 255, 255, 0.28);
	}
	.kpi__link {
		font-size: 0.72rem;
		color: #f472b6;
		text-decoration: none;
		font-weight: 500;
	}
	.kpi__link:hover {
		text-decoration: underline;
	}

	@keyframes pulse-badge {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	/* ── KPI Chart (bottom area — D3 sparklines) ── */
	.kpi__chart {
		margin-top: auto;
		height: 72px;
		position: relative;
	}
	.kpi__empty {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: rgba(255, 255, 255, 0.06);
	}

	/* ── Gauge variant (Email Open Rate) ── */
	.kpi__chart--gauge {
		height: auto;
		padding: 0.25rem 1.125rem 1rem;
	}
	.kpi__gauge-track {
		height: 6px;
		background: rgba(255, 255, 255, 0.06);
		border-radius: 3px;
		overflow: hidden;
	}
	.kpi__gauge-fill {
		height: 100%;
		background: linear-gradient(90deg, rgba(251, 191, 36, 0.5), #fbbf24);
		border-radius: 3px;
		transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.kpi__gauge-fill--violet {
		background: linear-gradient(90deg, rgba(167, 139, 250, 0.5), #a78bfa);
	}
	.kpi__gauge-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.6rem;
		color: rgba(255, 255, 255, 0.15);
		margin-top: 0.25rem;
		font-variant-numeric: tabular-nums;
	}

	/* ── Chart Cards ───────────────────────────────────────────────── */
	.charts {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-top: 1.25rem;
	}
	.chart-card {
		background: rgba(255, 255, 255, 0.025);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 0.875rem;
		padding: 1.25rem;
		position: relative;
		/* NO `overflow: hidden`. It clipped the D3AreaChart hover tooltip at the
		   card edge: this card is narrow on the dashboard grid (the chart renders
		   ~124px wide), so the tooltip is wider than the chart and MUST float
		   over the card to be readable. `.an-chart-card` on /admin/analytics has
		   never set overflow, which is why the same component reads correctly
		   there. Matching it (2026-07-28). */
	}
	.chart-card__hd {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}
	.chart-card__hd h3 {
		font-size: 0.85rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.6);
		margin: 0;
	}
	.chart-card__total {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.3);
		font-variant-numeric: tabular-nums;
	}
	.chart-card__body {
		height: 180px;
		position: relative;
	}
	.chart-card__x {
		display: flex;
		justify-content: space-between;
		font-size: 0.65rem;
		color: rgba(255, 255, 255, 0.18);
		margin-top: 0.375rem;
		font-variant-numeric: tabular-nums;
	}
	.chart-card__empty {
		padding: 3rem;
		text-align: center;
		color: rgba(255, 255, 255, 0.18);
		font-size: 0.8rem;
	}

	/* ── Quick Links ───────────────────────────────────────────────── */
	.qlinks {
		display: flex;
		gap: 0.5rem;
		margin-top: 1.25rem;
		flex-wrap: wrap;
	}
	.ql {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 0.625rem;
		color: rgba(255, 255, 255, 0.6);
		text-decoration: none;
		font-size: 0.8rem;
		font-weight: 500;
		transition: all 0.15s ease;
		position: relative;
	}
	.ql:hover {
		background: rgba(255, 255, 255, 0.06);
		color: #fff;
		border-color: rgba(255, 255, 255, 0.12);
		transform: translateY(-1px);
	}
	.ql__ic {
		font-size: 0.9rem;
		display: flex;
		align-items: center;
	}
	.ql__dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #f472b6;
		position: absolute;
		top: 6px;
		right: 6px;
		animation: pulse-badge 2s ease-in-out infinite;
	}

	/* ── Activity Feed ─────────────────────────────────────────────── */
	.feed {
		margin-top: 1.25rem;
		background: rgba(255, 255, 255, 0.025);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 0.875rem;
		padding: 1.25rem;
	}
	.feed__title {
		font-size: 0.85rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.6);
		margin: 0 0 0.75rem;
	}
	.feed__empty {
		color: rgba(255, 255, 255, 0.2);
		font-size: 0.8rem;
		text-align: center;
		padding: 2rem;
	}
	.feed__list {
		display: flex;
		flex-direction: column;
	}
	.feed__row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.03);
	}
	.feed__row:last-child {
		border-bottom: none;
	}
	.feed__row:hover {
		background: rgba(255, 255, 255, 0.015);
		margin: 0 -0.5rem;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		border-radius: 0.375rem;
	}
	.feed__dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
		box-shadow: 0 0 6px currentColor;
	}
	.feed__dot.lead {
		background: #c5a059;
		color: rgba(197, 160, 89, 0.4);
	}
	.feed__dot.contact {
		background: #34d399;
		color: rgba(52, 211, 153, 0.4);
	}
	.feed__dot.post {
		background: #60a5fa;
		color: rgba(96, 165, 250, 0.4);
	}
	.feed__body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.0625rem;
	}
	.feed__name {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.8);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.feed__meta {
		font-size: 0.7rem;
		color: rgba(255, 255, 255, 0.3);
	}
	.feed__time {
		font-size: 0.7rem;
		color: rgba(255, 255, 255, 0.2);
		white-space: nowrap;
		flex-shrink: 0;
		font-variant-numeric: tabular-nums;
	}

	/* ── Responsive ────────────────────────────────────────────────── */
	@media (max-width: 1279px) {
		.kpi-grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
	@media (max-width: 1024px) {
		.kpi-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	@media (max-width: 768px) {
		.dash {
			padding: 1rem;
		}
		.kpi-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.charts {
			grid-template-columns: 1fr;
		}
		.dash__hd {
			flex-direction: column;
		}
	}
	@media (max-width: 480px) {
		.kpi-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
