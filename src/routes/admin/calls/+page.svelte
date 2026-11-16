<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import SEO from '#lib/components/SEO.svelte';
	import { toast } from '#lib/stores/toast.svelte.js';
	import { isAuthError } from '#lib/utils/http-error.js';
	import { fetchCalls, fetchCallsCsv } from '#lib/remote/admin/calls.remote.js';

	const SESSION_EXPIRED_MSG = 'Your session expired. Please sign in again.';

	type CallRow = {
		id: number;
		name: string | null;
		email: string;
		scheduledAt: Date | null;
		status: string;
	};

	type StatusFilter = '' | 'scheduled' | 'canceled' | 'completed';

	// `loading` gates the first paint only. A filter change sets `refreshing`,
	// which keeps the current list on screen, dimmed and aria-busy, until the
	// answer arrives (the inbox/leads/consent pattern); flipping `loading`
	// swapped the whole list for "Loading…" on every change.
	let loading = $state(true);
	let refreshing = $state(false);
	let loadError = $state<string | null>(null);
	let calls = $state<CallRow[]>([]);
	// True count(*) under the same filters; the fetched list is capped
	// (250 rows), so `calls.length` under-reports once bookings outgrow it.
	let total = $state(0);
	let filterStatus = $state<StatusFilter>('');
	// The filter the rows on screen answer, `null` until the server has
	// answered at all. While a refresh is pending the select already shows the
	// new filter, so the kept empty state must not claim "No completed calls."
	// before the server has said so; with no answer yet (a failed first load)
	// there is nothing to keep, so a refresh shows the loading state instead.
	let shownStatus = $state<StatusFilter | null>(null);

	let disposed = false;
	let loadGeneration = 0;
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
		if (mode === 'initial' || shownStatus === null) loading = true;
		else refreshing = true;
		loadError = null;
		const requestedStatus = filterStatus;
		try {
			const filters: { status?: 'scheduled' | 'canceled' | 'completed' } = {};
			if (requestedStatus) filters.status = requestedStatus;
			const result = (await fetchCalls(filters)) as { calls: CallRow[]; total: number };
			if (disposed || generation !== loadGeneration) return;
			calls = result.calls;
			total = result.total;
			shownStatus = requestedStatus;
		} catch (err) {
			if (disposed || generation !== loadGeneration) return;
			if (isAuthError(err)) {
				loadError = SESSION_EXPIRED_MSG;
				void goto(resolve('/admin'));
			} else {
				loadError = err instanceof Error ? err.message : 'Failed to load calls.';
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
			const csv = await fetchCallsCsv();
			if (disposed) return;
			const blob = new Blob([csv], { type: 'text/csv' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `scheduled-calls-${new Date().toISOString().slice(0, 10)}.csv`;
			a.click();
			URL.revokeObjectURL(url);
			toast.success('CSV exported');
		} catch (err) {
			if (disposed) return;
			if (isAuthError(err)) {
				toast.error(SESSION_EXPIRED_MSG);
				void goto(resolve('/admin'));
				return;
			}
			toast.error('Failed to export CSV');
		}
	}

	function formatDate(date: Date | null): string {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<SEO title="Calls | Admin" description="Scheduled calls" noindex={true} />

<div class="page">
	<header class="page__head">
		<div>
			<h1>Scheduled Calls</h1>
			<p class="page__sub">Everyone who booked a call.</p>
		</div>
		<div class="page__actions">
			<select
				id="calls-status-filter"
				name="filterStatus"
				bind:value={filterStatus}
				onchange={() => load('refresh')}
				aria-label="Filter by status"
			>
				<option value="">All</option>
				<option value="scheduled">Scheduled</option>
				<option value="canceled">Canceled</option>
				<option value="completed">Completed</option>
			</select>
			<button type="button" class="btn" onclick={exportCsv} disabled={loading}>Export CSV</button>
		</div>
	</header>

	{#if loading}
		<p class="state">Loading…</p>
	{:else if loadError}
		<p class="state state--error">{loadError}</p>
	{:else}
		<div class={{ 'is-refreshing': refreshing }} aria-busy={refreshing}>
			{#if calls.length === 0}
				<!-- With a filter on, an empty list says nothing about bookings in general. -->
				<p class="state">{shownStatus ? `No ${shownStatus} calls.` : 'No calls booked yet.'}</p>
			{:else}
				<div class="table-wrap">
					<table class="tbl">
						<thead>
							<tr>
								<th>Name</th>
								<th>Email</th>
								<th>When</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{#each calls as c (c.id)}
								<tr>
									<td>{c.name ?? '-'}</td>
									<td class="tbl__email">{c.email}</td>
									<td>{formatDate(c.scheduledAt)}</td>
									<td>
										<span class="badge badge--{c.status}">{c.status}</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<p class="count">
					{total} call{total === 1 ? '' : 's'}{#if calls.length < total}
						· showing first {calls.length}{/if}
				</p>
			{/if}
		</div>
	{/if}
</div>

<style>
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
	.page__sub {
		margin: 0.25rem 0 0;
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.9rem;
	}
	.page__actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	select {
		padding: 0.5rem 0.75rem;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.5rem;
		color: #fff;
		font-size: 0.875rem;
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
	.tbl__email {
		font-family: var(--font-sans);
		color: rgba(255, 255, 255, 0.65);
	}
	.badge {
		display: inline-block;
		padding: 0.15rem 0.55rem;
		border-radius: 999px;
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: capitalize;
		background: rgba(255, 255, 255, 0.07);
		color: rgba(255, 255, 255, 0.6);
	}
	.badge--scheduled {
		background: rgba(52, 211, 153, 0.12);
		color: #34d399;
	}
	.badge--canceled {
		background: rgba(248, 113, 113, 0.12);
		color: #f87171;
	}
	.badge--completed {
		background: rgba(96, 165, 250, 0.12);
		color: #60a5fa;
	}
	.count {
		margin-top: 0.75rem;
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.8rem;
	}
	/* A filter change dims the list in place instead of swapping it for
	   "Loading…" (same treatment as admin/inbox, admin/leads, admin/consent). */
	.is-refreshing {
		opacity: 0.55;
		transition: opacity 0.15s ease;
	}
	@media (prefers-reduced-motion: reduce) {
		.is-refreshing {
			transition: none;
		}
	}
</style>
