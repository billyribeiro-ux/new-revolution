<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import SEO from '#lib/components/SEO.svelte';
	import EyeIcon from 'phosphor-svelte/lib/EyeIcon';
	import UsersIcon from 'phosphor-svelte/lib/UsersIcon';
	import StackIcon from 'phosphor-svelte/lib/StackIcon';
	import LightningIcon from 'phosphor-svelte/lib/LightningIcon';
	import ChartLineUpIcon from 'phosphor-svelte/lib/ChartLineUpIcon';
	import GlobeIcon from 'phosphor-svelte/lib/GlobeIcon';
	import ArrowSquareOutIcon from 'phosphor-svelte/lib/ArrowSquareOutIcon';
	import ArticleIcon from 'phosphor-svelte/lib/ArticleIcon';
	import DevicesIcon from 'phosphor-svelte/lib/DevicesIcon';
	import BrowserIcon from 'phosphor-svelte/lib/BrowserIcon';
	import MapPinIcon from 'phosphor-svelte/lib/MapPinIcon';
	import CalendarDotsIcon from 'phosphor-svelte/lib/CalendarDotsIcon';
	import KpiCard from '#lib/components/admin/KpiCard.svelte';
	import D3AreaChart from '#lib/components/admin/D3AreaChart.svelte';
	import ChartCard from '#lib/components/admin/ChartCard.svelte';
	import D3BarList from '#lib/components/admin/D3BarList.svelte';
	import D3DonutChart from '#lib/components/admin/D3DonutChart.svelte';
	import D3HeatmapCalendar from '#lib/components/admin/D3HeatmapCalendar.svelte';
	import { fetchAnalyticsDashboard } from '#lib/remote/admin/analytics.remote.js';

	type OverviewData = {
		views30d: number;
		views7d: number;
		visitors30d: number;
		visitors7d: number;
		/** Page views in the period BEFORE `views30d` (same length). */
		views30dPrev: number;
		/** Unique visitors in the period BEFORE `visitors30d` (same length). */
		visitors30dPrev: number;
		sessions30d: number;
		sessions30dPrev: number;
		singlePageSessions: number;
		engagedSessions: number;
		bounceRate: number;
		engagementRate: number;
		viewsPerSession: number;
		leads30d: number;
		leads30dPrev: number;
		leadConversionRate: number;
		activeVisitors: number;
		windowDays?: number;
		shortWindowDays?: number;
		source?: 'event_pipeline' | 'sqlite' | 'postgres' | 'hybrid';
		lastUpdated?: Date;
		trends?: {
			views30d: number | null;
			visitors30d: number | null;
			sessions30d: number | null;
			leads30d: number | null;
		};
	};
	type DailyData = { date: string; views: number; visitors: number };
	type TopPage = { path: string; views: number; visitors: number };
	type Referrer = { referrer: string | null; views: number };
	// First-touch visitors: distinct visitors whose first tracked pageview
	// of the window landed on this path (NOT GA-style landing sessions).
	type LandingPage = { path: string; visitors: number };

	type BreakdownItem = { label: string; value: number };
	type AnalyticsPayload = {
		overview: OverviewData;
		dailyViews: DailyData[];
		topPages: TopPage[];
		topReferrers: Referrer[];
		topLandingPages: LandingPage[];
		popularPosts: TopPage[];
		browserBreakdown: BreakdownItem[];
		deviceBreakdown: BreakdownItem[];
		countryBreakdown: BreakdownItem[];
	};

	let loading = $state(true);
	let refreshing = $state(false);
	let loadError = $state<string | null>(null);
	let overview = $state<OverviewData | null>(null);
	let dailyViews = $state<DailyData[]>([]);
	let topPages = $state<TopPage[]>([]);
	let topReferrers = $state<Referrer[]>([]);
	let topLandingPages = $state<LandingPage[]>([]);
	let popularPosts = $state<TopPage[]>([]);
	let browserBreakdown = $state<BreakdownItem[]>([]);
	let deviceBreakdown = $state<BreakdownItem[]>([]);
	let countryBreakdown = $state<BreakdownItem[]>([]);
	let activeVisitors = $state(0);
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
	let loadGeneration = 0;
	const analyticsCache: Record<
		number,
		{ expiresAt: number; payload: AnalyticsPayload } | undefined
	> = {};
	const ANALYTICS_CACHE_TTL_MS = 30_000;

	let disposed = false;
	const requestTimeouts = new SvelteSet<ReturnType<typeof setTimeout>>();
	/**
	 * Race a remote call against a timeout. The timer is cleared when the call
	 * settles and on unmount; it used to be left running for the full 20 s
	 * after every load, and to fire into an unmounted page.
	 */
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
		// Defer to the next macrotask so the remote query is awaited outside Svelte's render/effect context.
		const initialLoad = setTimeout(loadAnalytics, 0);
		return () => {
			disposed = true;
			loadGeneration++;
			clearTimeout(initialLoad);
			for (const timer of requestTimeouts) clearTimeout(timer);
			requestTimeouts.clear();
		};
	});

	function rangeLabel(days: number): string {
		return rangeOptions.find((option) => option.days === days)?.label ?? `Last ${days} days`;
	}

	function applyAnalyticsPayload(payload: AnalyticsPayload, days: number) {
		shownDays = days;
		overview = payload.overview;
		dailyViews = payload.dailyViews;
		topPages = payload.topPages;
		topReferrers = payload.topReferrers;
		topLandingPages = payload.topLandingPages;
		popularPosts = payload.popularPosts;
		browserBreakdown = payload.browserBreakdown;
		deviceBreakdown = payload.deviceBreakdown;
		countryBreakdown = payload.countryBreakdown;
		activeVisitors = payload.overview.activeVisitors;
	}

	async function loadAnalytics(force = false) {
		if (disposed) return;
		const gen = ++loadGeneration;
		const daysSnapshot = selectedDays;
		rangeError = null;
		const cached = force ? undefined : analyticsCache[daysSnapshot];
		if (cached && cached.expiresAt > Date.now()) {
			applyAnalyticsPayload(cached.payload, daysSnapshot);
			loading = false;
			refreshing = false;
			loadError = null;
			return;
		}
		const isInitialLoad = !overview;
		if (isInitialLoad) loading = true;
		else refreshing = true;
		loadError = null;
		try {
			const payload = await withTimeout(fetchAnalyticsDashboard({ days: daysSnapshot }), 20_000);
			if (disposed || gen !== loadGeneration) return;
			analyticsCache[daysSnapshot] = {
				expiresAt: Date.now() + ANALYTICS_CACHE_TTL_MS,
				payload: payload as AnalyticsPayload
			};
			applyAnalyticsPayload(payload as AnalyticsPayload, daysSnapshot);
		} catch (err) {
			if (disposed || gen !== loadGeneration) return;
			console.error('Analytics load error:', err);
			if (!overview) {
				loadError =
					err instanceof Error ? err.message : 'Failed to load analytics. Please refresh.';
			} else {
				// Data for another range is on screen. Leaving the new selection in
				// place would label those numbers with a range they do not cover.
				const reason = err instanceof Error ? err.message : 'request failed';
				rangeError = `Could not load ${rangeLabel(daysSnapshot)} (${reason}). Still showing ${rangeLabel(shownDays)}.`;
				selectedDays = shownDays;
			}
		} finally {
			if (!disposed && gen === loadGeneration) {
				loading = false;
				refreshing = false;
			}
		}
	}

	function fmt(n: number): string {
		if (n >= 10000) return (n / 1000).toFixed(0) + 'k';
		if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
		return n.toLocaleString();
	}

	// Derived KPIs
	/**
	 * Average views per day across the SELECTED window (not just days that
	 * had traffic). Dividing by `dailyViews.length` would make "~10/day"
	 * look identical for "10 views every day for 30 days" and "10 views
	 * each on 3 days, zero on the rest", which is wrong. We anchor to
	 * `selectedDays` so the operator gets a real per-day rate.
	 */
	let selectedWindowDays = $derived(overview?.windowDays ?? selectedDays);
	let avgDailyViews = $derived(
		dailyViews.length > 0
			? Math.round(dailyViews.reduce((s, d) => s + d.views, 0) / Math.max(1, selectedWindowDays))
			: 0
	);
	let peakDay = $derived(
		dailyViews.length > 0
			? dailyViews.reduce((a, b) => (b.views > a.views ? b : a), dailyViews[0]!)
			: null
	);
	// Views per SESSION (sessions >= visitors, so this number is smaller
	// than a true pages-per-visitor figure). The KPI was previously
	// labeled "Pages / Visitor", which overstated what it measures
	// (audit 2026-06-11). The fallback keeps the old visitor-based ratio
	// only for payloads that predate viewsPerSession.
	let pagesPerSession = $derived(
		overview?.viewsPerSession ??
			(overview && overview.visitors30d > 0
				? Math.round((overview.views30d / overview.visitors30d) * 10) / 10
				: 0)
	);

	/**
	 * Format an ISO date for display in KPI subtitles (e.g. peak-day).
	 * Falls back to the raw string when the date is unparseable so we
	 * never silently render "Invalid Date" to the operator.
	 */
	function formatPeakDate(iso: string | undefined | null): string {
		if (!iso) return '-';
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return iso;
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	let viewSparkData = $derived(dailyViews.map((d) => d.views));
	let visitorSparkData = $derived(dailyViews.map((d) => d.visitors));
	let sparkDates = $derived(dailyViews.map((d) => d.date));
	let topPageItems = $derived(topPages.map((p) => ({ label: p.path, value: p.views })));
	let topLandingPageItems = $derived(
		topLandingPages.map((p) => ({
			label: p.path,
			value: p.visitors
		}))
	);
	let topReferrerItems = $derived(
		topReferrers.map((r) => ({
			label: r.referrer || 'Direct',
			value: r.views
		}))
	);
	let heatmapData = $derived(dailyViews.map((d) => ({ date: d.date, value: d.views })));
</script>

<SEO
	title="Analytics | Admin"
	description="Website traffic and engagement analytics"
	noindex={true}
/>

<div class="an">
	<header class="an__hd">
		<div>
			<h1>Analytics</h1>
			<p class="an__sub">Traffic & engagement</p>
		</div>
		<div class="an__actions">
			{#if refreshing}
				<span class="an__refreshing">Updating…</span>
			{/if}
			<select
				id="analytics-range"
				name="analyticsRange"
				class="an__range"
				aria-label="Time range"
				value={selectedDays}
				onchange={(e) => {
					selectedDays = Number((e.currentTarget as HTMLSelectElement).value) || 30;
					void loadAnalytics();
				}}
			>
				{#each rangeOptions as opt (opt.days)}
					<option value={opt.days}>{opt.label}</option>
				{/each}
			</select>
		</div>
		{#if activeVisitors > 0}
			<div class="an__active">
				<span class="an__active-dot"></span>
				<span class="an__active-count">{activeVisitors}</span>
				<span class="an__active-label">active now</span>
			</div>
		{/if}
	</header>

	{#if rangeError}
		<p class="an__range-error" role="alert">{rangeError}</p>
	{/if}

	{#if loading}
		<div class="an__loading">
			<div class="pulse-ring"></div>
			<p>Loading analytics...</p>
		</div>
	{:else if loadError}
		<div class="an__error">
			<p class="an__error-msg">⚠ {loadError}</p>
			<button type="button" class="an__btn" onclick={() => loadAnalytics()}>Retry</button>
		</div>
	{:else if overview}
		<!-- KPI Cards, D3 animated -->
		<div class="an-kpi-grid">
			<KpiCard
				label="Page Views"
				value={overview.views30d}
				previousValue={overview.views30dPrev}
				color="#c5a059"
				subtitle={`last ${overview.windowDays ?? selectedDays} days · ~${avgDailyViews}/day`}
				sparkData={viewSparkData}
				{sparkDates}
				sparkValueLabel="view"
			>
				{#snippet icon()}<EyeIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>

			<KpiCard
				label="Unique Visitors"
				value={overview.visitors30d}
				previousValue={overview.visitors30dPrev}
				color="#60a5fa"
				subtitle={`unique · last ${overview.windowDays ?? selectedDays} days`}
				sparkData={visitorSparkData}
				{sparkDates}
				sparkValueLabel="visitor"
			>
				{#snippet icon()}<UsersIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>

			<KpiCard
				label="Sessions"
				value={overview.sessions30d}
				previousValue={overview.sessions30dPrev}
				color="#a78bfa"
				subtitle={`${overview.engagedSessions.toLocaleString()} engaged sessions`}
				sparkData={[]}
			>
				{#snippet icon()}<StackIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>

			<KpiCard
				label="Lead Conversion"
				value={Math.round(overview.leadConversionRate)}
				previousValue={Math.round(
					overview.visitors30dPrev > 0
						? (overview.leads30dPrev / overview.visitors30dPrev) * 100
						: 0
				)}
				suffix="%"
				color="#86efac"
				subtitle={`${overview.leads30d.toLocaleString()} leads captured`}
				sparkData={[]}
			>
				{#snippet icon()}<ChartLineUpIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>

			<KpiCard
				label="Bounce Rate"
				value={Math.round(overview.bounceRate)}
				suffix="%"
				color="#f87171"
				subtitle={`${overview.singlePageSessions.toLocaleString()} single-page sessions`}
				sparkData={[]}
			>
				{#snippet icon()}<LightningIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>

			<!--
				Pages-per-session is a low-cardinality engagement ratio
				(typically 1 to 6). The KpiCard headline animates integers, so
				we round to a whole number for the big display and keep the
				exact one-decimal value in the subtitle. Previously the
				headline showed `pagesPerSession * 10` (a "store decimals
				as tenths" hack), which printed "23" for 2.3 and was just
				wrong.
			-->
			<KpiCard
				label="Pages / Session"
				value={Math.round(pagesPerSession)}
				color="#34d399"
				subtitle={pagesPerSession > 0
					? `${pagesPerSession.toFixed(1)} avg · engagement depth`
					: 'engagement depth'}
				sparkData={[]}
			>
				{#snippet icon()}<StackIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>

			<KpiCard
				label="Peak Day"
				value={peakDay?.views ?? 0}
				color="#fbbf24"
				subtitle={formatPeakDate(peakDay?.date)}
				sparkData={[]}
			>
				{#snippet icon()}<LightningIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>
		</div>

		<!-- Daily Traffic, D3 area chart with tooltips -->
		<ChartCard title="Daily Traffic">
			{#snippet icon()}<ChartLineUpIcon size={16} weight="bold" />{/snippet}
			{#snippet meta()}
				<span class="an-legend" style="--c: #c5a059">Views</span>
				<span class="an-legend" style="--c: #60a5fa">Visitors</span>
			{/snippet}
			{#if dailyViews.length > 1}
				<D3AreaChart data={dailyViews} height={240} />
			{:else}
				<div class="an-chart-card__empty">No page view data yet.</div>
			{/if}
		</ChartCard>

		<!-- Two-column: Top Pages + Top Referrers, D3 animated bars -->
		<div class="two-col">
			<div class="data-card">
				<h3 class="data-card__title">
					<GlobeIcon size={15} weight="bold" />
					Top Pages
				</h3>
				{#if topPages.length > 0}
					<D3BarList items={topPageItems} color="#c5a059" />
				{:else}
					<p class="data-card__empty">No data yet.</p>
				{/if}
			</div>

			<div class="data-card">
				<h3 class="data-card__title">
					<ArrowSquareOutIcon size={15} weight="bold" />
					Top Referrers
				</h3>
				{#if topReferrers.length > 0}
					<D3BarList items={topReferrerItems} color="#34d399" />
				{:else}
					<p class="data-card__empty">No referrer data yet.</p>
				{/if}
			</div>
		</div>

		<!-- Top Landing Pages: one metric, first-touch visitors -->
		<div class="data-card data-card--full">
			<h3 class="data-card__title">
				<GlobeIcon size={15} weight="bold" />
				Top Landing Pages
				<span class="data-card__metric">First-touch visitors</span>
			</h3>
			{#if topLandingPageItems.length > 0}
				<D3BarList items={topLandingPageItems} color="#a78bfa" />
			{:else}
				<p class="data-card__empty">No landing page data yet.</p>
			{/if}
		</div>

		<div class="data-card data-card--full">
			<h3 class="data-card__title">
				<ArticleIcon size={15} weight="bold" />
				Popular Blog Posts
			</h3>
			{#if popularPosts.length > 0}
				<table class="data-table">
					<thead>
						<tr>
							<th>Post URL</th>
							<th>Views</th>
							<th>Visitors</th>
						</tr>
					</thead>
					<tbody>
						{#each popularPosts as post (post.path)}
							<tr>
								<td
									><!-- eslint-disable-next-line svelte/no-navigation-without-resolve --><a
										href={post.path}
										target="_blank"
										rel="noopener noreferrer">{post.path.replace('/blog/', '')}</a
									></td
								>
								<td>{fmt(post.views)}</td>
								<td>{fmt(post.visitors)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{:else}
				<p class="data-card__empty">No blog views recorded yet.</p>
			{/if}
		</div>

		<!-- Audience Breakdown, D3 donut charts -->
		<div class="three-col">
			<div class="data-card">
				<h3 class="data-card__title">
					<DevicesIcon size={15} weight="bold" />
					Devices
				</h3>
				{#if deviceBreakdown.length > 0}
					<D3DonutChart data={deviceBreakdown} centerLabel="Devices" size={180} />
				{:else}
					<p class="data-card__empty">No device data yet.</p>
				{/if}
			</div>

			<div class="data-card">
				<h3 class="data-card__title">
					<BrowserIcon size={15} weight="bold" />
					Browsers
				</h3>
				{#if browserBreakdown.length > 0}
					<D3DonutChart data={browserBreakdown} centerLabel="Browsers" size={180} />
				{:else}
					<p class="data-card__empty">No browser data yet.</p>
				{/if}
			</div>

			<div class="data-card">
				<h3 class="data-card__title">
					<MapPinIcon size={15} weight="bold" />
					Countries
				</h3>
				{#if countryBreakdown.length > 0}
					<D3DonutChart data={countryBreakdown} centerLabel="Countries" size={180} />
				{:else}
					<p class="data-card__empty">No country data yet.</p>
				{/if}
			</div>
		</div>

		<!-- Traffic Heatmap Calendar, GitHub-style -->
		<div class="data-card data-card--full">
			<h3 class="data-card__title">
				<CalendarDotsIcon size={15} weight="bold" />
				Daily Activity Heatmap
			</h3>
			{#if dailyViews.length > 0}
				<D3HeatmapCalendar data={heatmapData} weeks={26} />
			{:else}
				<p class="data-card__empty">No traffic data yet.</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.an {
		padding: 2rem;
		max-width: 1280px;
		margin: 0 auto;
	}
	.an__hd {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	.an__hd h1 {
		font-family: var(--font-heading);
		font-size: 1.75rem;
		font-weight: 800;
		color: #fff;
		margin: 0;
		letter-spacing: -0.02em;
	}
	.an__sub {
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.85rem;
		margin: 0.25rem 0 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.an__actions {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}
	.an__refreshing {
		color: rgba(197, 160, 89, 0.75);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.02em;
	}
	.an__range-error {
		margin: 1rem 0 0;
		padding: 0.625rem 0.875rem;
		border: 1px solid rgba(248, 113, 113, 0.35);
		border-radius: 0.5rem;
		background: rgba(248, 113, 113, 0.08);
		color: #fca5a5;
		font-size: 0.85rem;
	}
	.an__range {
		padding: 0.5rem 0.625rem;
		border-radius: 0.5rem;
		font-size: 0.8rem;
		font-weight: 600;
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.an__active {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(52, 211, 153, 0.08);
		border: 1px solid rgba(52, 211, 153, 0.15);
		border-radius: 0.75rem;
		padding: 0.5rem 1rem;
	}
	.an__active-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #34d399;
		animation: pulse-dot 1.5s ease-in-out infinite;
	}
	@keyframes pulse-dot {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.4);
		}
		50% {
			box-shadow: 0 0 0 6px rgba(52, 211, 153, 0);
		}
	}
	.an__active-count {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		font-weight: 800;
		color: #34d399;
	}
	.an__active-label {
		font-size: 0.7rem;
		color: rgba(52, 211, 153, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-weight: 600;
	}

	.an__loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 6rem;
		color: rgba(255, 255, 255, 0.4);
		gap: 1.5rem;
	}
	.an__error {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		padding: 4rem 2rem;
	}
	.an__error-msg {
		color: #f87171;
		font-size: 0.9rem;
		text-align: center;
		max-width: 28rem;
	}
	.an__btn {
		padding: 0.5rem 1.25rem;
		border-radius: 0.5rem;
		font-size: 0.8rem;
		font-weight: 600;
		background: #c5a059;
		color: #0a0a0f;
		border: none;
		cursor: pointer;
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

	/* KPI Grid */
	.an-kpi-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.875rem;
		margin-top: 1.75rem;
	}

	/* Chart card chrome now lives in ChartCard.svelte (single source of
	   truth for both /admin and /admin/analytics). */
	.an-legend {
		font-size: 0.7rem;
		color: rgba(255, 255, 255, 0.4);
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}
	.an-legend::before {
		content: '';
		width: 10px;
		height: 3px;
		border-radius: 2px;
		background: var(--c);
	}
	.an-chart-card__empty {
		padding: 3rem;
		text-align: center;
		color: rgba(255, 255, 255, 0.2);
		font-size: 0.8rem;
	}

	/* Two Column Grid */
	.two-col {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.875rem;
		margin-top: 1.25rem;
	}
	/* Three Column Grid */
	.three-col {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.875rem;
		margin-top: 1.25rem;
	}

	/* Data Card */
	.data-card {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.035) 0%,
			rgba(255, 255, 255, 0.015) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 1rem;
		padding: 1.25rem;
		transition: border-color 0.25s ease;
	}
	.data-card:hover {
		border-color: rgba(255, 255, 255, 0.1);
	}
	.data-card--full {
		margin-top: 1.25rem;
	}
	.data-card__title {
		font-size: 0.85rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.65);
		margin: 0 0 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}
	.data-card__metric {
		margin-inline-start: auto;
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: rgba(255, 255, 255, 0.35);
	}
	.data-card__empty {
		color: rgba(255, 255, 255, 0.25);
		font-size: 0.8rem;
		text-align: center;
		padding: 2rem;
	}

	/* Data Table */
	.data-table {
		width: 100%;
		border-collapse: collapse;
	}
	.data-table th {
		text-align: left;
		padding: 0.625rem 0.75rem;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: rgba(255, 255, 255, 0.35);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}
	.data-table td {
		padding: 0.625rem 0.75rem;
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.65);
		border-bottom: 1px solid rgba(255, 255, 255, 0.03);
	}
	.data-table tr:hover td {
		background: rgba(255, 255, 255, 0.02);
	}
	.data-table a {
		color: #c5a059;
		text-decoration: none;
	}
	.data-table a:hover {
		text-decoration: underline;
	}

	@media (max-width: 1024px) {
		.an-kpi-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 768px) {
		.an {
			padding: 1rem;
		}
		.two-col,
		.three-col {
			grid-template-columns: 1fr;
		}
		.an-kpi-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
