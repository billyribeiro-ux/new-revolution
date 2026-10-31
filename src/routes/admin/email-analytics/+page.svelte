<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import SEO from '#lib/components/SEO.svelte';
	import EnvelopeSimpleIcon from 'phosphor-svelte/lib/EnvelopeSimpleIcon';
	import CheckCircleIcon from 'phosphor-svelte/lib/CheckCircleIcon';
	import EnvelopeOpenIcon from 'phosphor-svelte/lib/EnvelopeOpenIcon';
	import CursorClickIcon from 'phosphor-svelte/lib/CursorClickIcon';
	import WarningIcon from 'phosphor-svelte/lib/WarningIcon';

	import ChartLineUpIcon from 'phosphor-svelte/lib/ChartLineUpIcon';
	import FunnelIcon from 'phosphor-svelte/lib/FunnelIcon';
	import TargetIcon from 'phosphor-svelte/lib/TargetIcon';
	import KpiCard from '#lib/components/admin/KpiCard.svelte';
	import D3AreaChart from '#lib/components/admin/D3AreaChart.svelte';
	import D3BarList from '#lib/components/admin/D3BarList.svelte';
	import {
		fetchEmailMetrics,
		fetchDailyEmailStats,
		fetchEmailFunnel,
		fetchTopEmailSources
	} from '#lib/remote/admin/email-analytics.remote.js';

	type EmailMetrics = {
		totalLeads: number;
		emailsSent: number;
		delivered: number;
		opened: number;
		clicked: number;
		bounced: number;
		complained: number;
		deliveryRate: number;
		openRate: number;
		clickRate: number;
		bounceRate: number;
		complaintRate: number;
		trends: {
			emailsSent: number | null;
			openRate: number | null;
			clickRate: number | null;
		};
	};
	type DailyStats = {
		date: string;
		sent: number;
		delivered: number;
		opened: number;
		clicked: number;
	};
	type FunnelStage = { stage: string; count: number; percentage: number; dropoff: number };
	type EmailSource = { source: string | null; sent: number; opened: number; clicked: number };

	let loading = $state(true);
	let loadError = $state<string | null>(null);
	let metrics = $state<EmailMetrics | null>(null);
	let dailyStats = $state<DailyStats[]>([]);
	let funnel = $state<FunnelStage[]>([]);
	let topSources = $state<EmailSource[]>([]);

	let disposed = false;
	const requestTimeouts = new SvelteSet<ReturnType<typeof setTimeout>>();
	/**
	 * Race a remote call against a timeout. The timer is cleared when the call
	 * settles and on unmount; it used to be left running for the full 15 s
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
		// Remote queries must run outside the mount effect context.
		const initialLoad = setTimeout(loadEmailAnalytics, 0);
		return () => {
			disposed = true;
			clearTimeout(initialLoad);
			for (const timer of requestTimeouts) clearTimeout(timer);
			requestTimeouts.clear();
		};
	});

	async function loadEmailAnalytics() {
		if (disposed) return;
		loading = true;
		loadError = null;
		try {
			const [m, ds, f, ts] = await withTimeout(
				Promise.all([
					fetchEmailMetrics(),
					fetchDailyEmailStats(),
					fetchEmailFunnel(),
					fetchTopEmailSources()
				])
			);
			if (disposed) return;
			metrics = m;
			dailyStats = ds;
			funnel = f;
			topSources = ts;
		} catch (err) {
			if (disposed) return;
			console.error('Email analytics load error:', err);
			loadError =
				err instanceof Error ? err.message : 'Failed to load email analytics. Please refresh.';
		} finally {
			if (!disposed) loading = false;
		}
	}

	function fmt(n: number): string {
		if (n >= 10000) return (n / 1000).toFixed(0) + 'k';
		if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
		return n.toLocaleString();
	}

	function fmtPct(n: number): string {
		return n.toFixed(1) + '%';
	}

	// Transform daily stats for D3AreaChart (expects {date, views, visitors})
	let chartData = $derived(
		dailyStats.map((d) => ({
			date: d.date,
			views: d.sent,
			visitors: d.opened
		}))
	);
</script>

<SEO
	title="Email Analytics | Admin"
	description="Email engagement and delivery analytics"
	noindex={true}
/>

<div class="email-analytics">
	<header class="email-analytics__header">
		<div>
			<h1>Email Analytics</h1>
			<p class="email-analytics__subtitle">
				Messages sent in the selected period and their observed engagement · Last 30 days
			</p>
		</div>
	</header>

	{#if loading}
		<div class="email-analytics__loading">
			<div class="spinner"></div>
			<p>Loading email analytics...</p>
		</div>
	{:else if loadError}
		<div class="email-analytics__error">
			<p class="email-analytics__error-msg">⚠ {loadError}</p>
			<button type="button" class="email-analytics__btn" onclick={() => loadEmailAnalytics()}
				>Retry</button
			>
		</div>
	{:else if metrics}
		<!-- KPI Cards -->
		<div class="kpi-grid">
			<KpiCard
				label="Emails Sent"
				value={metrics.emailsSent}
				trend={metrics.trends.emailsSent}
				color="#c5a059"
				subtitle={`${fmt(metrics.totalLeads)} total leads`}
				sparkData={dailyStats.map((d) => d.sent)}
			>
				{#snippet icon()}<EnvelopeSimpleIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>

			<!--
				These three cards rendered a tenths-scaled integer with no suffix, so a
				98.5% delivery rate displayed as the bare number "985". `/admin/analytics`
				carries a comment recording that this exact "store decimals as tenths"
				hack was removed there for being wrong; it survived here.

				Whole percent in the value, exact figure in the subtitle: the card is a
				glanceable number, and an operator who needs the decimal has it one line
				down without having to divide by ten in their head.
			-->
			<KpiCard
				label="Delivery Rate"
				value={Math.round(metrics.deliveryRate)}
				suffix="%"
				color="#34d399"
				subtitle={`${fmt(metrics.delivered)} delivered (${metrics.deliveryRate.toFixed(1)}%)`}
				sparkData={[]}
			>
				{#snippet icon()}<CheckCircleIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>

			<KpiCard
				label="Open Rate"
				value={Math.round(metrics.openRate)}
				suffix="%"
				color="#60a5fa"
				subtitle={`${fmt(metrics.opened)} opened (${metrics.openRate.toFixed(1)}%)`}
				sparkData={dailyStats.map((d) => d.opened)}
			>
				{#snippet icon()}<EnvelopeOpenIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>

			<KpiCard
				label="Click Rate"
				value={Math.round(metrics.clickRate)}
				suffix="%"
				color="#fbbf24"
				subtitle={`${fmt(metrics.clicked)} clicked (${metrics.clickRate.toFixed(1)}%)`}
				sparkData={dailyStats.map((d) => d.clicked)}
			>
				{#snippet icon()}<CursorClickIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>
		</div>

		<!-- Daily Email Chart -->
		<div class="chart-card">
			<div class="chart-card__header">
				<h3 class="chart-card__title">
					<ChartLineUpIcon size={16} weight="bold" />
					Messages by Send Date
				</h3>
				<div class="chart-card__legend">
					<span class="legend-item" style="--c: #c5a059">Sent</span>
					<span class="legend-item" style="--c: #60a5fa">Opened</span>
				</div>
			</div>
			{#if chartData.length > 1}
				<D3AreaChart
					data={chartData}
					height={240}
					seriesLabels={{ views: 'sent', visitors: 'opened' }}
				/>
			{:else}
				<div class="chart-card__empty">No email data yet.</div>
			{/if}
		</div>

		<!-- Two Column: Funnel + Sources -->
		<div class="two-col">
			<!-- Email Funnel — D3 visualization -->
			<div class="data-card">
				<h3 class="data-card__title">
					<FunnelIcon size={15} weight="bold" />
					Observed Engagement
				</h3>
				<p class="data-card__empty">
					Independent observations. A click may be recorded without an open.
				</p>
				{#if funnel.length > 0}
					<D3BarList
						items={funnel.map((s) => ({
							label: s.stage,
							value: s.count
						}))}
					/>
				{:else}
					<p class="data-card__empty">No engagement data yet.</p>
				{/if}
			</div>

			<!-- Top Sources — D3 bar list -->
			<div class="data-card">
				<h3 class="data-card__title">
					<TargetIcon size={15} weight="bold" />
					Top Email Sources
				</h3>
				{#if topSources.length > 0}
					<D3BarList
						items={topSources.map((s) => ({
							label: s.source ?? 'Unknown',
							value: s.sent
						}))}
						color="#c5a059"
					/>
				{:else}
					<p class="data-card__empty">No source data yet.</p>
				{/if}
			</div>
		</div>

		<!-- Warning Metrics -->
		{#if metrics.bounceRate > 5 || metrics.complaintRate > 0.5}
			<div class="warning-card">
				<WarningIcon size={20} weight="bold" />
				<div>
					<h4>Email Health Warnings</h4>
					{#if metrics.bounceRate > 5}
						<p>
							High bounce rate: <strong>{fmtPct(metrics.bounceRate)}</strong> ({fmt(
								metrics.bounced
							)} bounced)
						</p>
					{/if}
					{#if metrics.complaintRate > 0.5}
						<p>
							Spam complaints: <strong>{fmtPct(metrics.complaintRate)}</strong> ({fmt(
								metrics.complained
							)} complaints)
						</p>
					{/if}
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.email-analytics {
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.email-analytics__header {
		margin-bottom: 2rem;
	}

	.email-analytics__header h1 {
		font-family: var(--font-heading);
		font-size: 1.75rem;
		font-weight: 700;
		color: #fff;
		margin: 0;
	}

	.email-analytics__subtitle {
		color: rgba(255, 255, 255, 0.45);
		font-size: 0.9rem;
		margin: 0.25rem 0 0;
	}

	.email-analytics__loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem;
		color: rgba(255, 255, 255, 0.5);
		gap: 1rem;
	}
	.email-analytics__error {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		padding: 4rem 2rem;
	}
	.email-analytics__error-msg {
		color: #f87171;
		font-size: 0.9rem;
		text-align: center;
		max-width: 28rem;
	}
	.email-analytics__btn {
		padding: 0.5rem 1.25rem;
		border-radius: 0.5rem;
		font-size: 0.8rem;
		font-weight: 600;
		background: #c5a059;
		color: #0a0a0f;
		border: none;
		cursor: pointer;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid rgba(255, 255, 255, 0.1);
		border-top-color: #c5a059;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.kpi-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.chart-card {
		background: rgba(255, 255, 255, 0.025);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 0.75rem;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.chart-card__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.chart-card__title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.95rem;
		font-weight: 700;
		color: #fff;
		margin: 0;
	}

	.chart-card__legend {
		display: flex;
		gap: 1rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.6);
	}

	.legend-item::before {
		content: '';
		width: 12px;
		height: 12px;
		border-radius: 2px;
		background: var(--c);
	}

	.chart-card__empty {
		padding: 3rem;
		text-align: center;
		color: rgba(255, 255, 255, 0.3);
		font-size: 0.875rem;
	}

	.two-col {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.data-card {
		background: rgba(255, 255, 255, 0.025);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 0.75rem;
		padding: 1.5rem;
	}

	.data-card__title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.95rem;
		font-weight: 700;
		color: #fff;
		margin: 0 0 1.25rem;
	}

	.data-card__empty {
		padding: 2rem;
		text-align: center;
		color: rgba(255, 255, 255, 0.3);
		font-size: 0.875rem;
	}

	/* Warning Card */
	.warning-card {
		display: flex;
		gap: 1rem;
		padding: 1.25rem 1.5rem;
		background: rgba(248, 113, 113, 0.1);
		border: 1px solid rgba(248, 113, 113, 0.3);
		border-radius: 0.75rem;
		color: #f87171;
	}

	.warning-card h4 {
		margin: 0 0 0.5rem;
		font-size: 0.95rem;
		font-weight: 700;
	}

	.warning-card p {
		margin: 0.25rem 0;
		font-size: 0.85rem;
		color: rgba(248, 113, 113, 0.8);
	}

	@media (max-width: 1024px) {
		.kpi-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.two-col {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 640px) {
		.email-analytics {
			padding: 1rem;
		}
		.kpi-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
