<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import SEO from '#lib/components/SEO.svelte';
	import { toast } from '#lib/stores/toast.svelte.js';
	import { isAuthError } from '#lib/utils/http-error.js';
	import { fetchSubscribers, fetchSubscribersCsv } from '#lib/remote/admin/subscribers.remote.js';

	const SESSION_EXPIRED_MSG = 'Your session expired. Please sign in again.';

	type SubscriberRow = {
		id: number;
		email: string;
		name: string | null;
		source: string | null;
		createdAt: Date | null;
		enrollmentStatus: string | null;
		currentStep: number | null;
	};

	// `loading` gates the first paint only; a search sets `refreshing`, which
	// keeps the current rows on screen (dimmed) while the server answers.
	let loading = $state(true);
	let refreshing = $state(false);
	let loadError = $state<string | null>(null);
	let subscribers = $state<SubscriberRow[]>([]);
	// True alive-only count(*) from the server, of matches when searching; the
	// fetched list itself is capped (250 rows), so `subscribers.length`
	// under-reports once the roster outgrows the cap.
	let total = $state(0);
	let search = $state('');
	/**
	 * The search the rows on screen answer. Search runs on the server: it used
	 * to filter only the capped rows already in the browser, so anyone past the
	 * first 250 was reported as "No matches."
	 */
	let shownSearch = $state('');
	const SEARCH_DEBOUNCE_MS = 300;
	let searchTimer: ReturnType<typeof setTimeout> | undefined;
	let loadGeneration = 0;

	let disposed = false;
	const requestTimeouts = new SvelteSet<ReturnType<typeof setTimeout>>();
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
		const initialLoad = setTimeout(() => void load('initial'), 0);
		return () => {
			disposed = true;
			loadGeneration++;
			clearTimeout(initialLoad);
			clearTimeout(searchTimer);
			for (const timer of requestTimeouts) clearTimeout(timer);
			requestTimeouts.clear();
		};
	});

	async function load(mode: 'initial' | 'refresh') {
		if (disposed) return;
		const generation = ++loadGeneration;
		const query = search.trim();
		if (mode === 'initial') loading = true;
		else refreshing = true;
		loadError = null;
		try {
			const result = (await withTimeout(fetchSubscribers(query ? { search: query } : {}))) as {
				subscribers: SubscriberRow[];
				total: number;
			};
			if (disposed || generation !== loadGeneration) return;
			subscribers = result.subscribers;
			total = result.total;
			shownSearch = query;
		} catch (err) {
			if (disposed || generation !== loadGeneration) return;
			if (isAuthError(err)) {
				loadError = SESSION_EXPIRED_MSG;
				void goto(resolve('/admin'));
			} else {
				loadError =
					err instanceof Error ? err.message : 'Failed to load subscribers. Please refresh.';
			}
		} finally {
			if (!disposed && generation === loadGeneration) {
				loading = false;
				refreshing = false;
			}
		}
	}

	function handleSearchInput() {
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => void load('refresh'), SEARCH_DEBOUNCE_MS);
	}

	async function exportCsv() {
		try {
			const csv = await fetchSubscribersCsv();
			if (disposed) return;
			const blob = new Blob([csv], { type: 'text/csv' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
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
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function statusLabel(status: string | null): string {
		switch (status) {
			case 'active':
				return 'In sequence';
			case 'completed':
				return 'Completed';
			case 'paused':
				return 'Paused';
			case 'unsubscribed':
				return 'Unsubscribed';
			default:
				return 'Not enrolled';
		}
	}
</script>

<SEO title="Subscribers | Admin" description="Free-guide signups" noindex={true} />

<div class="page">
	<header class="page__head">
		<div>
			<h1>Subscribers</h1>
			<p class="page__sub">Everyone who signed up for the free guide.</p>
		</div>
		<div class="page__actions">
			<input
				type="search"
				class="page__search"
				placeholder="Search name or email…"
				bind:value={search}
				oninput={handleSearchInput}
				aria-label="Search subscribers"
			/>
			<button type="button" class="btn" onclick={exportCsv} disabled={loading}>Export CSV</button>
		</div>
	</header>

	{#if loading}
		<p class="state">Loading subscribers…</p>
	{:else if loadError}
		<p class="state state--error">{loadError}</p>
	{:else if subscribers.length === 0}
		<p class="state" aria-busy={refreshing}>
			{shownSearch ? 'No matches.' : 'No subscribers yet.'}
		</p>
	{:else}
		<div class={['table-wrap', { 'is-refreshing': refreshing }]} aria-busy={refreshing}>
			<table class="tbl">
				<thead>
					<tr>
						<th>Name</th>
						<th>Email</th>
						<th>Signed up</th>
						<th>Follow-up</th>
					</tr>
				</thead>
				<tbody>
					{#each subscribers as s (s.id)}
						<tr>
							<td>{s.name ?? '-'}</td>
							<td class="tbl__email">{s.email}</td>
							<td>{formatDate(s.createdAt)}</td>
							<td>
								<span class="badge badge--{s.enrollmentStatus ?? 'none'}">
									{statusLabel(s.enrollmentStatus)}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="count">
			{#if shownSearch}
				{total} match{total === 1 ? '' : 'es'}
			{:else}
				{total} subscriber{total === 1 ? '' : 's'}
			{/if}{#if subscribers.length < total}
				· showing first {subscribers.length}{/if}
		</p>
	{/if}
</div>

<style>
	/* A search dims the list in place instead of swapping it
	   for "Loading…" (as admin/inbox and admin/leads do). */
	.is-refreshing {
		opacity: 0.55;
		transition: opacity 0.15s ease;
	}
	@media (prefers-reduced-motion: reduce) {
		.is-refreshing {
			transition: none;
		}
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
	.page__search {
		padding: 0.5rem 0.75rem;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.5rem;
		color: #fff;
		font-size: 0.875rem;
		min-width: 220px;
	}
	.page__search:focus {
		outline: none;
		border-color: #c5a059;
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
		transition: background 0.15s ease;
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
	.tbl tr:last-child td {
		border-block-end: none;
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
		background: rgba(255, 255, 255, 0.07);
		color: rgba(255, 255, 255, 0.6);
	}
	.badge--active {
		background: rgba(52, 211, 153, 0.12);
		color: #34d399;
	}
	.badge--completed {
		background: rgba(96, 165, 250, 0.12);
		color: #60a5fa;
	}
	.badge--unsubscribed {
		background: rgba(248, 113, 113, 0.12);
		color: #f87171;
	}
	.count {
		margin-top: 0.75rem;
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.8rem;
	}
</style>
