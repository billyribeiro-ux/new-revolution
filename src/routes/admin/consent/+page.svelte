<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import SEO from '#lib/components/SEO.svelte';
	import { toast } from '#lib/stores/toast.svelte.js';
	import { isAuthError } from '#lib/utils/http-error.js';
	import {
		fetchConsentRecords,
		fetchConsentStats,
		fetchConsentCsv,
		eraseConsentForVisitor,
		eraseConsentRecords,
		purgeExpiredConsent
	} from '#lib/remote/admin/consent.remote.js';
	import { confirmAction } from '#lib/stores/confirm.svelte.js';

	const SESSION_EXPIRED_MSG = 'Your session expired. Please sign in again.';

	type ConsentRow = {
		id: bigint;
		anonId: string;
		categories: Record<string, boolean> | null;
		policyVersion: number;
		createdAt: Date | null;
	};
	type Stats = { total: number; analyticsGranted: number; marketingGranted: number };

	// `loading` gates the first paint only. Paging and every post-mutation
	// refetch set `refreshing`, which dims the list in place: flipping
	// `loading` swapped the table for "Loading…" after each delete or purge.
	let loading = $state(true);
	let refreshing = $state(false);
	let loadError = $state<string | null>(null);
	let loadGeneration = 0;
	let records = $state<ConsentRow[]>([]);
	let stats = $state<Stats>({ total: 0, analyticsGranted: 0, marketingGranted: 0 });

	/** Server-side pagination. The list was capped at 250 with no controls, so
	 *  at 283 records the oldest 33 were unreachable (2026-07-28 audit). */
	const PAGE_SIZE = 50;
	let page = $state(0);
	let total = $state(0);
	let busy = $state(false);
	let totalPages = $derived(Math.max(1, Math.ceil(total / PAGE_SIZE)));
	let rangeFrom = $derived(total === 0 ? 0 : page * PAGE_SIZE + 1);
	let rangeTo = $derived(Math.min(total, (page + 1) * PAGE_SIZE));

	let analyticsRate = $derived(
		stats.total ? Math.round((stats.analyticsGranted / stats.total) * 100) : 0
	);
	let marketingRate = $derived(
		stats.total ? Math.round((stats.marketingGranted / stats.total) * 100) : 0
	);

	let disposed = false;
	onMount(() => {
		const initialLoad = setTimeout(() => void load('initial'), 0);
		return () => {
			disposed = true;
			loadGeneration++;
			clearTimeout(initialLoad);
		};
	});

	async function load(mode: 'initial' | 'refresh') {
		if (disposed) return;
		const generation = ++loadGeneration;
		if (mode === 'initial') loading = true;
		else refreshing = true;
		loadError = null;
		try {
			const [recs, st] = await Promise.all([
				fetchConsentRecords({ limit: PAGE_SIZE, offset: page * PAGE_SIZE }),
				fetchConsentStats()
			]);
			if (disposed || generation !== loadGeneration) return;
			records = recs.rows as ConsentRow[];
			total = recs.total;
			stats = st as Stats;
		} catch (err) {
			if (disposed || generation !== loadGeneration) return;
			if (isAuthError(err)) {
				loadError = SESSION_EXPIRED_MSG;
				void goto(resolve('/admin'), { refreshAll: true });
			} else {
				loadError = err instanceof Error ? err.message : 'Failed to load consent records.';
			}
		} finally {
			if (!disposed && generation === loadGeneration) {
				loading = false;
				refreshing = false;
			}
		}
	}

	async function exportCsv() {
		try {
			const csv = await fetchConsentCsv();
			if (disposed) return;
			const blob = new Blob([csv], { type: 'text/csv' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `consent-records-${new Date().toISOString().slice(0, 10)}.csv`;
			a.click();
			URL.revokeObjectURL(url);
			toast.success('CSV exported');
		} catch (err) {
			if (disposed) return;
			if (isAuthError(err)) {
				toast.error(SESSION_EXPIRED_MSG);
				void goto(resolve('/admin'), { refreshAll: true });
				return;
			}
			toast.error('Failed to export CSV');
		}
	}

	async function goToPage(next: number) {
		if (disposed || next < 0 || next >= totalPages || busy) return;
		page = next;
		await load('refresh');
	}

	/** GDPR Art. 17: erase every decision this visitor ever made, not just one row. */
	async function eraseVisitor(anonId: string) {
		const ok = await confirmAction({
			title: "Erase this visitor's consent history?",
			message:
				`Every consent record for visitor ${anonId.slice(0, 8)}… will be permanently deleted. ` +
				'This is the GDPR right-to-erasure action and cannot be undone.',
			confirmLabel: 'Erase records',
			tone: 'danger'
		});
		if (!ok || disposed) return;
		busy = true;
		try {
			const { deleted } = await eraseConsentForVisitor({ anonId });
			if (disposed) return;
			toast.success(`Erased ${deleted} record${deleted === 1 ? '' : 's'}`);
			if (records.length === 1 && page > 0) page -= 1;
			await load('refresh');
		} catch (err) {
			if (disposed) return;
			if (isAuthError(err)) {
				toast.error(SESSION_EXPIRED_MSG);
				void goto(resolve('/admin'), { refreshAll: true });
				return;
			}
			toast.error('Failed to erase records');
		} finally {
			if (!disposed) busy = false;
		}
	}

	/** Delete a single row, for operational cleanup rather than an erasure request. */
	async function eraseRow(id: bigint) {
		const ok = await confirmAction({
			title: 'Delete this record?',
			message: 'This single consent record will be permanently deleted.',
			confirmLabel: 'Delete record',
			tone: 'danger'
		});
		if (!ok || disposed) return;
		busy = true;
		try {
			// bigserial: send as string so precision survives the wire.
			const { deleted } = await eraseConsentRecords({ ids: [String(id)] });
			if (disposed) return;
			toast.success(`Deleted ${deleted} record`);
			if (records.length === 1 && page > 0) page -= 1;
			await load('refresh');
		} catch (err) {
			if (disposed) return;
			if (isAuthError(err)) {
				toast.error(SESSION_EXPIRED_MSG);
				void goto(resolve('/admin'), { refreshAll: true });
				return;
			}
			toast.error('Failed to delete record');
		} finally {
			if (!disposed) busy = false;
		}
	}

	/**
	 * Run the retention purge by hand.
	 *
	 * The daily cron enforces this automatically. The button exists because the
	 * `purgeExpiredConsent` command shipped in #249 imported by nothing, so the
	 * only documented answer to "prove you enforce storage limitation" was a
	 * function no operator could reach (docs/OPEN-ITEMS.md 2.1).
	 *
	 * Deleting nothing is the expected outcome most days, so the toast says so
	 * explicitly rather than reporting a bare "0" that reads like a failure.
	 */
	async function runRetentionPurge() {
		const ok = await confirmAction({
			title: 'Delete consent records past the retention window?',
			message:
				'Records older than the 730-day retention period will be permanently deleted. ' +
				'This is the same sweep the daily cron performs.',
			confirmLabel: 'Run purge',
			tone: 'danger'
		});
		if (!ok || disposed) return;
		busy = true;
		try {
			const { deleted, cutoff } = await purgeExpiredConsent();
			if (disposed) return;
			const cutoffLabel = new Date(cutoff).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			});
			toast.success(
				deleted === 0
					? `Nothing to delete. No records predate ${cutoffLabel}.`
					: `Deleted ${deleted} record${deleted === 1 ? '' : 's'} created before ${cutoffLabel}.`
			);
			await load('refresh');
		} catch (err) {
			if (disposed) return;
			if (isAuthError(err)) {
				toast.error(SESSION_EXPIRED_MSG);
				void goto(resolve('/admin'), { refreshAll: true });
				return;
			}
			toast.error('Failed to run the retention purge');
		} finally {
			if (!disposed) busy = false;
		}
	}

	function formatDate(date: Date | null): string {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function yn(v: boolean | undefined): string {
		return v ? 'Yes' : 'No';
	}
</script>

<SEO title="Consent | Admin" description="Cookie consent records" noindex={true} />

<div class="page">
	<header class="page__head">
		<div>
			<h1>Cookie Consent</h1>
			<p class="page__sub">Recorded consent decisions (GDPR audit log).</p>
		</div>
		<div class="page__actions">
			<button
				type="button"
				class="btn"
				onclick={runRetentionPurge}
				disabled={loading || busy}
				title="Delete records past the 730-day retention window (the daily cron does this automatically)"
			>
				Run retention purge
			</button>
			<button type="button" class="btn" onclick={exportCsv} disabled={loading}>Export CSV</button>
		</div>
	</header>

	{#if loading}
		<p class="state">Loading…</p>
	{:else if loadError}
		<p class="state state--error">{loadError}</p>
	{:else}
		<div class={{ 'is-refreshing': refreshing }} aria-busy={refreshing}>
			<div class="kpis">
				<div class="kpi">
					<span class="kpi__val">{stats.total}</span>
					<span class="kpi__label">Total decisions</span>
				</div>
				<div class="kpi">
					<span class="kpi__val">{analyticsRate}%</span>
					<span class="kpi__label">Analytics granted</span>
				</div>
				<div class="kpi">
					<span class="kpi__val">{marketingRate}%</span>
					<span class="kpi__label">Marketing granted</span>
				</div>
			</div>

			{#if records.length === 0}
				<p class="state">No consent decisions recorded yet.</p>
			{:else}
				<div class="table-wrap">
					<table class="tbl">
						<thead>
							<tr>
								<th>Date</th>
								<th>Visitor</th>
								<th>Analytics</th>
								<th>Marketing</th>
								<th>Policy</th>
								<th class="tbl__actions-h">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each records as r (r.id)}
								<tr>
									<td>{formatDate(r.createdAt)}</td>
									<td class="muted">{r.anonId.slice(0, 8)}…</td>
									<td>{yn(r.categories?.['analytics'])}</td>
									<td>{yn(r.categories?.['marketing'])}</td>
									<td>v{r.policyVersion}</td>
									<td class="tbl__actions">
										<button
											type="button"
											class="link-btn"
											disabled={busy}
											title="Delete this single record"
											onclick={() => eraseRow(r.id)}>Delete</button
										>
										<span class="sep">|</span>
										<button
											type="button"
											class="link-btn link-btn--danger"
											disabled={busy}
											title="Erase every record for this visitor (GDPR right to erasure)"
											onclick={() => eraseVisitor(r.anonId)}>Erase visitor</button
										>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<div class="pager">
					<p class="count">
						{rangeFrom} to {rangeTo} of {total} record{total === 1 ? '' : 's'}
					</p>
					{#if totalPages > 1}
						<div class="pager__ctrls">
							<button
								type="button"
								class="btn btn--sm"
								disabled={page === 0 || busy}
								onclick={() => goToPage(page - 1)}>Previous</button
							>
							<span class="pager__pos">Page {page + 1} of {totalPages}</span>
							<button
								type="button"
								class="btn btn--sm"
								disabled={page >= totalPages - 1 || busy}
								onclick={() => goToPage(page + 1)}>Next</button
							>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* A refetch after a mutation dims the list in place instead of swapping it
	   for "Loading…" (same treatment as admin/inbox and admin/leads). */
	.is-refreshing {
		opacity: 0.55;
		transition: opacity 0.15s ease;
	}
	@media (prefers-reduced-motion: reduce) {
		.is-refreshing {
			transition: none;
		}
	}
	.tbl__actions-h,
	.tbl__actions {
		width: 1%;
		white-space: nowrap;
		text-align: right;
	}
	.link-btn {
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
		cursor: pointer;
	}
	.link-btn:hover:not(:disabled) {
		color: var(--color-brand-gold, #c5a059);
	}
	.link-btn--danger:hover:not(:disabled) {
		color: #f87171;
	}
	.link-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.sep {
		color: rgba(255, 255, 255, 0.15);
		margin: 0 0.4rem;
		font-size: 0.7rem;
	}
	.pager {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		margin-top: 0.75rem;
	}
	.pager__ctrls {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	.pager__pos {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.45);
	}
	.btn--sm {
		padding: 0.3rem 0.7rem;
		font-size: 0.78rem;
	}
	.page {
		padding: clamp(1.25rem, 3vw, 2rem);
		color: rgba(255, 255, 255, 0.9);
	}
	.page__head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		margin-block-end: 1.5rem;
	}
	h1 {
		font-family: var(--font-heading);
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
		color: #fff;
	}
	.page__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.page__sub {
		margin: 0.25rem 0 0;
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.9rem;
	}
	.btn {
		padding: 0.5rem 1rem;
		background: rgba(197, 160, 89, 0.12);
		border: 1px solid rgba(197, 160, 89, 0.35);
		color: #c5a059;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
	}
	.btn:hover:not(:disabled) {
		background: rgba(197, 160, 89, 0.2);
	}
	.btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.kpis {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 1rem;
		margin-block-end: 1.5rem;
	}
	.kpi {
		padding: 1.25rem;
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 0.75rem;
		background: rgba(255, 255, 255, 0.015);
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.kpi__val {
		font-size: 1.75rem;
		font-weight: 700;
		color: #c5a059;
		font-family: var(--font-heading);
	}
	.kpi__label {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.5);
	}
	.state {
		color: rgba(255, 255, 255, 0.5);
		padding: 2rem 0;
	}
	.state--error {
		color: #f87171;
	}
	.table-wrap {
		overflow-x: auto;
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 0.75rem;
	}
	.tbl {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
	}
	.tbl th {
		text-align: left;
		padding: 0.75rem 1rem;
		color: rgba(255, 255, 255, 0.45);
		font-weight: 600;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		border-block-end: 1px solid rgba(255, 255, 255, 0.06);
	}
	.tbl td {
		padding: 0.75rem 1rem;
		border-block-end: 1px solid rgba(255, 255, 255, 0.04);
		color: rgba(255, 255, 255, 0.8);
	}
	.muted {
		color: rgba(255, 255, 255, 0.5);
		font-family: var(--font-sans);
		font-size: 0.8rem;
	}
	.count {
		margin-top: 0.75rem;
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.8rem;
	}
</style>
