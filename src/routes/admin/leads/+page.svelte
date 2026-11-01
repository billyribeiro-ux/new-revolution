<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import SEO from '#lib/components/SEO.svelte';
	import KpiCard from '#lib/components/admin/KpiCard.svelte';
	import D3BarList from '#lib/components/admin/D3BarList.svelte';
	import EnvelopeSimpleIcon from 'phosphor-svelte/lib/EnvelopeSimpleIcon';
	import SparkleIcon from 'phosphor-svelte/lib/SparkleIcon';
	import CheckCircleIcon from 'phosphor-svelte/lib/CheckCircleIcon';
	import TrendUpIcon from 'phosphor-svelte/lib/TrendUpIcon';
	import TrashIcon from 'phosphor-svelte/lib/TrashIcon';
	import ArrowCounterClockwiseIcon from 'phosphor-svelte/lib/ArrowCounterClockwiseIcon';
	import ArrowClockwiseIcon from 'phosphor-svelte/lib/ArrowClockwiseIcon';
	import CursorClickIcon from 'phosphor-svelte/lib/CursorClickIcon';
	import EnvelopeOpenIcon from 'phosphor-svelte/lib/EnvelopeOpenIcon';
	import FunnelIcon from 'phosphor-svelte/lib/FunnelIcon';
	import MagnifyingGlassIcon from 'phosphor-svelte/lib/MagnifyingGlassIcon';
	import ConfirmDialog from '#lib/components/admin/ConfirmDialog.svelte';
	import { toast } from '#lib/stores/toast.svelte.js';
	import { refusalMessage } from '#lib/utils/http-error.js';
	import { SvelteSet } from 'svelte/reactivity';
	import {
		fetchLeadsDashboard,
		fetchTrashedLeads,
		fetchTrashedLeadsCount,
		fetchLead,
		updateLeadStatusCmd,
		trashLeadCmd,
		trashLeadsBulkCmd,
		restoreLeadCmd,
		restoreLeadsBulkCmd,
		permanentlyDeleteLeadCmd,
		emptyLeadsTrashCmd,
		fetchLeadsCsv
	} from '#lib/remote/admin/leads.remote.js';
	import type { Lead } from '#lib/types/db.js';

	type Tab = 'active' | 'trash';
	type Status = 'new' | 'contacted' | 'converted' | 'unsubscribed';
	type EngagementFilter =
		'all' | 'no_email' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained';
	type LeadRow = Lead & {
		emailEngagement?: Exclude<EngagementFilter, 'all'>;
		latestEmailEvent?: string | null;
		latestEmailEventAt?: Date | null;
		deliveredAt?: Date | null;
		openedAt?: Date | null;
		clickedAt?: Date | null;
		bouncedAt?: Date | null;
		complainedAt?: Date | null;
	};
	type LeadDashboardData = {
		overview: {
			total: number;
			totalPrevious: number;
			trend: number | null;
			newLeads: number;
			contactedLeads: number;
			convertedLeads: number;
			unsubscribedLeads: number;
			emailSent: number;
			delivered: number;
			opened: number;
			clicked: number;
			bounced: number;
			complained: number;
			deliveryRate: number;
			openRate: number;
			clickRate: number;
			conversionRate: number;
			windowDays: number;
			lastUpdated: Date;
			source: 'postgres';
		};
		dailyLeads: { date: string; count: number }[];
		sourceBreakdown: {
			source: string;
			count: number;
			converted: number;
			sent: number;
			opened: number;
			clicked: number;
		}[];
		funnel: { label: string; value: number; color: string }[];
		leads: LeadRow[];
		totalMatching: number;
	};

	let tab = $state<Tab>('active');
	// `loading` gates the first paint and an error retry; `refreshing` covers
	// filter changes and post-mutation refetches. See loadAll below.
	let loading = $state(true);
	let refreshing = $state(false);
	let loadError = $state<string | null>(null);
	let loadGeneration = 0;
	let disposed = false;
	let dashboard = $state<LeadDashboardData | null>(null);
	let leads = $state<LeadRow[]>([]);
	let trashCount = $state(0);
	let filterStatus = $state<Status | ''>('');
	let filterSource = $state('');
	let filterSearch = $state('');
	let filterEngagement = $state<EngagementFilter>('all');
	let filterDays = $state(30);
	let filterDateFrom = $state('');
	let filterDateTo = $state('');

	/**
	 * Notification deep links (`/admin/leads?lead=<id>`, written by
	 * services/notifications.ts). `linkedLeadId` is the row the link selected;
	 * `linkNotice` explains a link whose lead is not in the list on screen, so a
	 * trashed, filtered-out or deleted lead is never a silent no-op.
	 */
	type LinkNotice =
		| { kind: 'missing'; text: string }
		| { kind: 'trashed'; text: string; leadId: number }
		| { kind: 'filtered'; text: string; leadId: number; email: string; createdOn: string | null };
	let linkedLeadId = $state<number | null>(null);
	let linkNotice = $state<LinkNotice | null>(null);
	let linkGeneration = 0;
	let requestedLead = $derived(page.url.searchParams.get('lead'));

	// Bulk-select state. SvelteSet is already reactive, wrapping it in $state
	// would just add a redundant proxy. Reset on tab switch / reload ,
	// selection is intentionally non-persistent.
	const selectedIds = new SvelteSet<number>();

	// Confirm-dialog plumbing. The dialog is generic; we set `confirmConfig`
	// to control title / message / tone / handler per action.
	type ConfirmConfig = {
		title: string;
		message?: string;
		confirmLabel: string;
		tone: 'warning' | 'danger';
		run: () => Promise<void>;
	};
	let confirmOpen = $state(false);
	let confirmConfig = $state<ConfirmConfig | null>(null);

	function openConfirm(config: ConfirmConfig): void {
		confirmConfig = config;
		confirmOpen = true;
	}

	async function withTimeout<T>(promise: Promise<T>, ms = 15_000): Promise<T> {
		let timeout: ReturnType<typeof setTimeout> | undefined;
		try {
			return await Promise.race([
				promise,
				new Promise<never>((_, reject) => {
					timeout = setTimeout(
						() => reject(new Error(`Request timed out after ${ms / 1000}s`)),
						ms
					);
				})
			]);
		} finally {
			clearTimeout(timeout);
		}
	}

	let overview = $derived(dashboard?.overview ?? null);
	let totalLeads = $derived(overview?.total ?? leads.length);
	let newLeads = $derived(overview?.newLeads ?? leads.filter((l) => l.status === 'new').length);
	let contactedLeads = $derived(
		overview?.contactedLeads ?? leads.filter((l) => l.status === 'contacted').length
	);
	let convertedLeads = $derived(
		overview?.convertedLeads ?? leads.filter((l) => l.status === 'converted').length
	);
	let conversionRate = $derived(overview?.conversionRate ?? 0);
	let dailyLeadSpark = $derived(dashboard?.dailyLeads.map((item) => item.count) ?? []);
	let dailyLeadDates = $derived(dashboard?.dailyLeads.map((item) => item.date) ?? []);
	let sourceBarItems = $derived(
		dashboard?.sourceBreakdown.map((item) => ({
			label: item.source,
			value: item.count,
			secondary: `${item.converted} converted`
		})) ?? []
	);
	let sourceOptions = $derived(dashboard?.sourceBreakdown.map((item) => item.source) ?? []);

	// Header-checkbox state. `null` = no rows or no selection; `true` = every
	// rendered row selected; `false` = mixed selection (indeterminate).
	let allSelected = $derived(leads.length > 0 && leads.every((l) => selectedIds.has(l.id)));
	let someSelected = $derived(leads.some((l) => selectedIds.has(l.id)));

	onMount(() => {
		const initialLoad = setTimeout(() => void loadAll('initial'), 0);
		return () => {
			disposed = true;
			loadGeneration++;
			linkGeneration++;
			clearTimeout(initialLoad);
		};
	});

	// Act on `?lead=` once the list is on screen, and again whenever a link
	// arrives while the page is already open: a same-route navigation reuses
	// this component instead of remounting it, so onMount does not run again.
	$effect(() => {
		const raw = requestedLead;
		if (raw === null || loading || loadError) return;
		// Remote queries are awaited outside the effect context, as in onMount.
		const timer = setTimeout(() => void openLinkedLead(raw), 0);
		return () => clearTimeout(timer);
	});

	/** Remove one consumed query parameter, keeping every other one. */
	async function dropQueryParam(name: string): Promise<void> {
		if (!page.url.searchParams.has(name)) return;
		// `page.url` is read-only in SvelteKit 3: edit a copy.
		const next = new URL(page.url.href);
		next.searchParams.delete(name);
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- dynamic query removal
		await goto(`${next.pathname}${next.search}${next.hash}`, { replaceState: true });
	}

	async function openLinkedLead(raw: string): Promise<void> {
		if (disposed) return;
		const generation = ++linkGeneration;
		// Consume the parameter first so a later link to the same lead is a new
		// URL (and so a reload does not replay this one).
		await dropQueryParam('lead');
		if (disposed || generation !== linkGeneration) return;
		linkNotice = null;
		const id = Number(raw);
		if (!Number.isSafeInteger(id) || id <= 0) {
			linkedLeadId = null;
			linkNotice = { kind: 'missing', text: 'This link does not name a valid lead.' };
			return;
		}
		if (leads.some((lead) => lead.id === id)) {
			await revealLead(id);
			return;
		}
		try {
			const found = await fetchLead({ id });
			if (disposed || generation !== linkGeneration) return;
			linkedLeadId = null;
			if (!found) {
				linkNotice = {
					kind: 'missing',
					text: `Lead #${id} no longer exists. It may have been permanently deleted.`
				};
			} else if (found.deletedAt) {
				linkNotice = { kind: 'trashed', text: `${found.email} is in Trash.`, leadId: id };
			} else {
				linkNotice = {
					kind: 'filtered',
					text: `${found.email} is not in the current view.`,
					leadId: id,
					email: found.email,
					// The dashboard reads a bare From date as UTC midnight, so the
					// lead's UTC calendar day always includes it.
					createdOn: found.createdAt ? new Date(found.createdAt).toISOString().slice(0, 10) : null
				};
			}
		} catch (err) {
			if (disposed || generation !== linkGeneration) return;
			linkNotice = {
				kind: 'missing',
				text: `Could not look up lead #${id} (${err instanceof Error ? err.message : 'request failed'}).`
			};
		}
	}

	/** Mark the linked row, then bring it into view and give it focus. */
	async function revealLead(id: number): Promise<void> {
		linkedLeadId = id;
		await tick();
		const row = document.getElementById(`lead-row-${id}`);
		row?.scrollIntoView?.({ block: 'center' });
		row?.focus({ preventScroll: true });
	}

	async function showLinkedLeadInTrash(id: number): Promise<void> {
		linkNotice = null;
		if (tab !== 'trash') {
			tab = 'trash';
			await loadAll('refresh');
		}
		if (disposed) return;
		if (leads.some((lead) => lead.id === id)) await revealLead(id);
		else linkNotice = { kind: 'missing', text: `Lead #${id} is no longer in Trash.` };
	}

	async function showFilteredLead(notice: Extract<LinkNotice, { kind: 'filtered' }>) {
		linkNotice = null;
		tab = 'active';
		filterStatus = '';
		filterSource = '';
		filterEngagement = 'all';
		filterSearch = notice.email;
		filterDateFrom = notice.createdOn ?? '';
		filterDateTo = '';
		if (!notice.createdOn) filterDays = 365;
		await loadAll('refresh');
		if (disposed) return;
		if (leads.some((lead) => lead.id === notice.leadId)) await revealLead(notice.leadId);
		else linkNotice = { kind: 'missing', text: `Lead #${notice.leadId} could not be shown.` };
	}

	/**
	 * `mode` is passed explicitly at every call site rather than defaulted:
	 * binding this function directly as a change handler would otherwise hand
	 * the DOM Event in as the first argument.
	 *
	 * Only the first load and an error retry blank the page. The seven filter
	 * controls and every post-mutation refresh pass 'refresh', which dims the
	 * table in place. Flipping `loading` for those tore the whole table, the
	 * KPI row and the current selection out of the DOM on each keystroke-level
	 * filter change.
	 */
	async function loadAll(
		mode: 'initial' | 'refresh',
		retainSelectedIds: readonly number[] = []
	): Promise<void> {
		if (disposed) return;
		const generation = ++loadGeneration;
		const requestedTab = tab;
		if (mode === 'initial') loading = true;
		else refreshing = true;
		loadError = null;
		selectedIds.clear();
		try {
			const [payload, count] = await withTimeout(
				Promise.all([
					requestedTab === 'active'
						? fetchLeadsDashboard(buildDashboardFilters())
						: fetchTrashedLeads(),
					fetchTrashedLeadsCount()
				])
			);
			if (disposed || generation !== loadGeneration) return;
			if (requestedTab === 'active') {
				dashboard = payload as LeadDashboardData;
				leads = (payload as LeadDashboardData).leads;
			} else {
				dashboard = null;
				leads = payload as LeadRow[];
			}
			trashCount = count;
			if (requestedTab === 'trash') {
				const visibleIds = new SvelteSet(leads.map((lead) => lead.id));
				for (const id of retainSelectedIds) if (visibleIds.has(id)) selectedIds.add(id);
			}
		} catch (err) {
			if (disposed || generation !== loadGeneration) return;
			console.error('Failed to load leads:', err);
			loadError = err instanceof Error ? err.message : 'Failed to load leads. Please refresh.';
		} finally {
			if (!disposed && generation === loadGeneration) {
				loading = false;
				refreshing = false;
			}
		}
	}

	function buildDashboardFilters(): {
		status?: Status;
		source?: string;
		search?: string;
		engagement: EngagementFilter;
		dateFrom?: string;
		dateTo?: string;
		days: number;
		limit: number;
		offset: number;
	} {
		const filters: {
			status?: Status;
			source?: string;
			search?: string;
			engagement: EngagementFilter;
			dateFrom?: string;
			dateTo?: string;
			days: number;
			limit: number;
			offset: number;
		} = {
			engagement: filterEngagement,
			days: filterDays,
			limit: 1000,
			offset: 0
		};
		if (filterStatus) filters.status = filterStatus;
		if (filterSource.trim()) filters.source = filterSource.trim();
		if (filterSearch.trim()) filters.search = filterSearch.trim();
		if (filterDateFrom) filters.dateFrom = filterDateFrom;
		if (filterDateTo) filters.dateTo = filterDateTo;
		return filters;
	}

	function switchTab(next: Tab): void {
		if (tab === next) return;
		tab = next;
		void loadAll('refresh');
	}

	function toggleSelect(id: number, checked: boolean): void {
		// Mutate the SvelteSet in place, assignment to the same instance
		// triggers reactivity in Svelte 5, no need to clone.
		if (checked) selectedIds.add(id);
		else selectedIds.delete(id);
	}

	function toggleSelectAll(checked: boolean): void {
		selectedIds.clear();
		if (checked) for (const l of leads) selectedIds.add(l.id);
	}

	/**
	 * The select is one-way bound to `lead.status`, so a failed save changes no
	 * state and Svelte never rewrites the control: it kept showing the value
	 * that was never saved. Put it back explicitly.
	 */
	async function changeStatus(lead: LeadRow, select: HTMLSelectElement): Promise<void> {
		const status = select.value as Status;
		try {
			await updateLeadStatusCmd({ id: lead.id, status });
		} catch (err) {
			select.value = lead.status ?? 'new';
			toast.error(refusalMessage(err, 'Failed to update lead status'));
			return;
		}
		toast.success(`Lead marked as ${status}`);
		await loadAll('refresh');
	}

	function confirmTrashOne(lead: Lead): void {
		openConfirm({
			title: 'Move lead to Trash?',
			message: `${lead.email} will be moved to Trash. You can restore it later.`,
			confirmLabel: 'Move to Trash',
			tone: 'warning',
			run: async () => {
				try {
					await trashLeadCmd({ id: lead.id });
					await loadAll('refresh');
					toast.success('Lead moved to Trash');
				} catch (err) {
					toast.error(refusalMessage(err, 'Failed to move lead to Trash'));
				}
			}
		});
	}

	function confirmTrashSelected(): void {
		const ids = [...selectedIds];
		if (ids.length === 0) return;
		openConfirm({
			title: `Move ${ids.length} lead${ids.length === 1 ? '' : 's'} to Trash?`,
			message: 'They will stay in Trash until permanently deleted.',
			confirmLabel: 'Move to Trash',
			tone: 'warning',
			run: async () => {
				try {
					const result = await trashLeadsBulkCmd({ ids });
					await loadAll('refresh');
					toast.success(`${result.trashed} lead${result.trashed === 1 ? '' : 's'} moved to Trash`);
				} catch {
					toast.error('Failed to move leads to Trash');
				}
			}
		});
	}

	function confirmRestoreOne(lead: Lead): void {
		openConfirm({
			title: 'Restore lead?',
			message: `${lead.email} will be moved back to the active list.`,
			confirmLabel: 'Restore',
			tone: 'warning',
			run: async () => {
				try {
					const result = await restoreLeadCmd({ id: lead.id });
					if (disposed) return;
					if (result.success && tab === 'trash') {
						leads = leads.filter((l) => l.id !== lead.id);
						selectedIds.delete(lead.id);
					}
					await loadAll('refresh', [...selectedIds]);
					if (result.success) toast.success('Lead restored');
					else
						toast.warning(
							'This lead stayed in Trash because an active lead already uses this email.'
						);
				} catch (err) {
					toast.error(refusalMessage(err, 'Failed to restore lead'));
				}
			}
		});
	}

	function confirmRestoreSelected(): void {
		const ids = [...selectedIds];
		if (ids.length === 0) return;
		openConfirm({
			title: `Restore ${ids.length} lead${ids.length === 1 ? '' : 's'}?`,
			message: 'They will be moved back to the active list.',
			confirmLabel: 'Restore',
			tone: 'warning',
			run: async () => {
				try {
					const result = await restoreLeadsBulkCmd({ ids });
					if (disposed) return;
					const restoredIds = new SvelteSet(result.restoredIds);
					if (tab === 'trash') {
						leads = leads.filter((l) => !restoredIds.has(l.id));
						for (const id of restoredIds) selectedIds.delete(id);
					}
					await loadAll('refresh', [...selectedIds]);
					if (result.restored > 0) {
						toast.success(`${result.restored} lead${result.restored === 1 ? '' : 's'} restored`);
					}
					const conflicts = result.conflictedIds.length;
					if (conflicts > 0) {
						toast.warning(
							conflicts === 1
								? '1 lead stayed in Trash because an active lead already uses that email.'
								: `${conflicts} leads stayed in Trash because active leads already use those email addresses.`
						);
					}
				} catch {
					toast.error('Failed to restore leads');
				}
			}
		});
	}

	function confirmPermanentDeleteOne(lead: Lead): void {
		openConfirm({
			title: 'Permanently delete lead?',
			message: `${lead.email} and its email-event history will be removed forever. This cannot be undone.`,
			confirmLabel: 'Delete forever',
			tone: 'danger',
			run: async () => {
				try {
					await permanentlyDeleteLeadCmd({ id: lead.id });
					leads = leads.filter((l) => l.id !== lead.id);
					trashCount = Math.max(0, trashCount - 1);
					toast.success('Lead permanently deleted');
				} catch (err) {
					toast.error(refusalMessage(err, 'Failed to delete lead'));
				}
			}
		});
	}

	function confirmEmptyTrash(): void {
		if (trashCount === 0) return;
		openConfirm({
			title: `Empty Trash?`,
			message: `${trashCount} lead${trashCount === 1 ? '' : 's'} and their email-event history will be removed forever. This cannot be undone.`,
			confirmLabel: 'Empty Trash',
			tone: 'danger',
			run: async () => {
				try {
					const result = await emptyLeadsTrashCmd();
					leads = [];
					trashCount = 0;
					selectedIds.clear();
					toast.success(
						`${result.deleted} lead${result.deleted === 1 ? '' : 's'} permanently deleted`
					);
				} catch {
					toast.error('Failed to empty Trash');
				}
			}
		});
	}

	async function exportCsv(): Promise<void> {
		try {
			const csv = await fetchLeadsCsv();
			const blob = new Blob([csv], { type: 'text/csv' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
			a.click();
			URL.revokeObjectURL(url);
			toast.success('Leads exported');
		} catch {
			toast.error('Failed to export leads');
		}
	}

	function formatDate(date: Date | null): string {
		if (!date) return '-';
		const d = new Date(date);
		return d.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function statusColor(status: string | null): string {
		switch (status) {
			case 'new':
				return '#c5a059';
			case 'contacted':
				return '#60a5fa';
			case 'converted':
				return '#34d399';
			case 'unsubscribed':
				return '#f87171';
			default:
				return 'rgba(255,255,255,0.4)';
		}
	}

	function engagementLabel(value: LeadRow['emailEngagement']): string {
		switch (value) {
			case 'no_email':
				return 'No email';
			case 'sent':
				return 'Sent';
			case 'delivered':
				return 'Delivered';
			case 'opened':
				return 'Opened';
			case 'clicked':
				return 'Clicked';
			case 'bounced':
				return 'Bounced';
			case 'complained':
				return 'Complained';
			default:
				return 'Unknown';
		}
	}

	function engagementColor(value: LeadRow['emailEngagement']): string {
		switch (value) {
			case 'clicked':
				return '#34d399';
			case 'opened':
				return '#fbbf24';
			case 'delivered':
				return '#60a5fa';
			case 'sent':
				return '#c5a059';
			case 'bounced':
			case 'complained':
				return '#f87171';
			default:
				return 'rgba(255,255,255,0.45)';
		}
	}

	function sourceLabel(value: string | null): string {
		return value?.trim() || 'unknown';
	}

	function trendLabel(value: number | null): string {
		if (value === null) return 'new vs prior period';
		if (value === 0) return 'flat vs prior period';
		return `${value > 0 ? '+' : ''}${value}% vs prior period`;
	}

	function resetFilters(): void {
		filterStatus = '';
		filterSource = '';
		filterSearch = '';
		filterEngagement = 'all';
		filterDays = 30;
		filterDateFrom = '';
		filterDateTo = '';
		void loadAll('refresh');
	}
</script>

<SEO title="Leads | Admin" description="Manage captured leads" noindex={true} />

<div class="leads-page">
	<header class="leads-page__header">
		<div>
			<h1>Leads</h1>
			<p class="leads-page__subtitle">
				{tab === 'active'
					? `${totalLeads.toLocaleString()} active leads · ${trendLabel(overview?.trend ?? null)}`
					: `${leads.length} in Trash`}
			</p>
		</div>
		<div class="leads-page__actions">
			{#if tab === 'active'}
				<button
					type="button"
					class="btn btn--ghost"
					onclick={() => loadAll('refresh')}
					disabled={loading || refreshing}
				>
					<ArrowClockwiseIcon size={14} weight="bold" />
					Refresh
				</button>
				<button type="button" class="btn btn--primary" onclick={exportCsv}>Export CSV</button>
			{:else}
				<button
					type="button"
					class="btn btn--danger"
					onclick={confirmEmptyTrash}
					disabled={trashCount === 0}
				>
					Empty Trash
				</button>
			{/if}
		</div>
	</header>

	<!-- Tabs -->
	<nav class="leads-page__tabs" aria-label="Lead lifecycle">
		<button
			type="button"
			class={['tab', { 'tab--active': tab === 'active' }]}
			onclick={() => switchTab('active')}
		>
			Active
		</button>
		<button
			type="button"
			class={['tab', { 'tab--active': tab === 'trash' }]}
			onclick={() => switchTab('trash')}
		>
			Trash
			{#if trashCount > 0}
				<span class="tab__badge">{trashCount}</span>
			{/if}
		</button>
	</nav>

	<div class="link-notice-region" role="status">
		{#if linkNotice}
			<div class="link-notice">
				<p>{linkNotice.text}</p>
				{#if linkNotice.kind === 'trashed'}
					{@const leadId = linkNotice.leadId}
					<button type="button" class="btn btn--ghost" onclick={() => showLinkedLeadInTrash(leadId)}
						>Show it in Trash</button
					>
				{:else if linkNotice.kind === 'filtered'}
					{@const notice = linkNotice}
					<button type="button" class="btn btn--ghost" onclick={() => showFilteredLead(notice)}
						>Show this lead</button
					>
				{/if}
				<button type="button" class="btn btn--ghost" onclick={() => (linkNotice = null)}
					>Dismiss</button
				>
			</div>
		{/if}
	</div>

	{#if tab === 'active'}
		<section class="lead-filter-panel" aria-label="Lead filters">
			<div class="lead-filter-panel__title">
				<FunnelIcon size={16} weight="duotone" />
				<span>Enterprise filters</span>
			</div>
			<label>
				<span>Status</span>
				<select
					id="lead-filter-status"
					name="status"
					class="filter-select"
					bind:value={filterStatus}
					onchange={() => loadAll('refresh')}
				>
					<option value="">All statuses</option>
					<option value="new">New</option>
					<option value="contacted">Contacted</option>
					<option value="converted">Converted</option>
					<option value="unsubscribed">Unsubscribed</option>
				</select>
			</label>
			<label>
				<span>Engagement</span>
				<select
					id="lead-filter-engagement"
					name="engagement"
					class="filter-select"
					bind:value={filterEngagement}
					onchange={() => loadAll('refresh')}
				>
					<option value="all">All engagement</option>
					<option value="no_email">No email</option>
					<option value="sent">Sent</option>
					<option value="delivered">Delivered</option>
					<option value="opened">Opened</option>
					<option value="clicked">Clicked</option>
					<option value="bounced">Bounced</option>
					<option value="complained">Complained</option>
				</select>
			</label>
			<label>
				<span>Source</span>
				<input
					id="lead-filter-source"
					name="source"
					class="filter-input"
					list="lead-source-options"
					bind:value={filterSource}
					onchange={() => loadAll('refresh')}
					placeholder="Any source"
				/>
				<datalist id="lead-source-options">
					{#each sourceOptions as source (source)}
						<option value={source}></option>
					{/each}
				</datalist>
			</label>
			<label>
				<span>Window</span>
				<select
					id="lead-filter-window"
					name="days"
					class="filter-select"
					bind:value={filterDays}
					onchange={() => loadAll('refresh')}
				>
					<option value={7}>7 days</option>
					<option value={30}>30 days</option>
					<option value={90}>90 days</option>
					<option value={365}>365 days</option>
				</select>
			</label>
			<label>
				<span>From</span>
				<input
					id="lead-filter-date-from"
					name="dateFrom"
					class="filter-input"
					type="date"
					bind:value={filterDateFrom}
					onchange={() => loadAll('refresh')}
				/>
			</label>
			<label>
				<span>To</span>
				<input
					id="lead-filter-date-to"
					name="dateTo"
					class="filter-input"
					type="date"
					bind:value={filterDateTo}
					onchange={() => loadAll('refresh')}
				/>
			</label>
			<label class="lead-filter-panel__search">
				<span>Search</span>
				<div class="lead-search">
					<MagnifyingGlassIcon size={15} />
					<input
						id="lead-filter-search"
						name="search"
						bind:value={filterSearch}
						onchange={() => loadAll('refresh')}
						placeholder="Name, email, source, page"
					/>
				</div>
			</label>
			<button type="button" class="btn btn--ghost" onclick={resetFilters}>Reset</button>
		</section>
	{/if}

	{#if !loading && tab === 'active'}
		<div class="leads-kpi-row">
			<KpiCard
				label="Captured Leads"
				value={totalLeads}
				previousValue={overview?.totalPrevious ?? 0}
				color="#c5a059"
				subtitle={`${overview?.windowDays ?? filterDays} day window`}
				sparkData={dailyLeadSpark}
				sparkDates={dailyLeadDates}
				sparkValueLabel="lead"
			>
				{#snippet icon()}<EnvelopeSimpleIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>
			<KpiCard
				label="New Leads"
				value={newLeads}
				color="#fbbf24"
				subtitle={`${contactedLeads.toLocaleString()} contacted`}
				sparkData={dailyLeadSpark}
				sparkType="bar"
			>
				{#snippet icon()}<SparkleIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>
			<KpiCard
				label="Email Opens"
				value={overview?.opened ?? 0}
				color="#60a5fa"
				subtitle={`${overview?.openRate ?? 0}% open rate`}
				sparkData={[]}
			>
				{#snippet icon()}<EnvelopeOpenIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>
			<KpiCard
				label="Email Clicks"
				value={overview?.clicked ?? 0}
				color="#34d399"
				subtitle={`${overview?.clickRate ?? 0}% click-to-open rate`}
				sparkData={[]}
			>
				{#snippet icon()}<CursorClickIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>
			<KpiCard
				label="Converted"
				value={convertedLeads}
				color="#86efac"
				subtitle={`${conversionRate}% conversion`}
				sparkData={[]}
			>
				{#snippet icon()}<CheckCircleIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>
			<KpiCard
				label="Delivery Rate"
				value={Math.round(overview?.deliveryRate ?? 0)}
				suffix="%"
				color="#f59e0b"
				subtitle={`${overview?.delivered ?? 0} delivered`}
				sparkData={[]}
			>
				{#snippet icon()}<TrendUpIcon size={18} weight="duotone" />{/snippet}
			</KpiCard>
		</div>

		{#if dashboard}
			<div class="lead-insights-grid">
				<section class="lead-insight-card lead-insight-card--funnel">
					<div class="lead-insight-card__header">
						<div>
							<span class="lead-insight-card__eyebrow">Email observations</span>
							<h2>Observed engagement</h2>
						</div>
						<FunnelIcon size={20} weight="duotone" />
					</div>
					<p>Independent observations. A click may be recorded without an open.</p>
					<D3BarList items={dashboard.funnel} />
				</section>
				<section class="lead-insight-card">
					<div class="lead-insight-card__header">
						<div>
							<span class="lead-insight-card__eyebrow">Attribution</span>
							<h2>Top sources</h2>
						</div>
						<TrendUpIcon size={20} weight="duotone" />
					</div>
					{#if sourceBarItems.length > 0}
						<D3BarList items={sourceBarItems} color="#c5a059" maxItems={8} />
					{:else}
						<p class="lead-insight-card__empty">No source data for the selected filters.</p>
					{/if}
				</section>
			</div>
		{/if}
	{/if}

	<!-- Sticky bulk-action toolbar (visible when at least one row is selected) -->
	{#if !loading && someSelected}
		<div class="bulk-toolbar" role="toolbar" aria-label="Bulk actions">
			<span class="bulk-toolbar__count">{selectedIds.size} selected</span>
			<div class="bulk-toolbar__actions">
				{#if tab === 'active'}
					<button type="button" class="btn btn--danger" onclick={confirmTrashSelected}>
						<TrashIcon size={14} weight="bold" />
						Move to Trash
					</button>
				{:else}
					<button type="button" class="btn btn--primary" onclick={confirmRestoreSelected}>
						<ArrowCounterClockwiseIcon size={14} weight="bold" />
						Restore
					</button>
				{/if}
				<button type="button" class="btn btn--ghost" onclick={() => selectedIds.clear()}>
					Clear
				</button>
			</div>
		</div>
	{/if}

	{#if loading}
		<div class="leads-page__loading">
			<div class="spinner"></div>
			<p>Loading leads...</p>
		</div>
	{:else if loadError}
		<div class="leads-page__error">
			<p class="leads-page__error-msg">⚠ {loadError}</p>
			<button type="button" class="btn btn--primary" onclick={() => loadAll('initial')}
				>Retry</button
			>
		</div>
	{:else if leads.length === 0}
		<div class="leads-page__empty">
			<p>
				{tab === 'active'
					? `No leads found${filterStatus ? ` with status "${filterStatus}"` : ''}.`
					: 'Trash is empty.'}
			</p>
		</div>
	{:else}
		<div class={['leads-table-wrap', { 'is-refreshing': refreshing }]} aria-busy={refreshing}>
			<table class="leads-table">
				<thead>
					<tr>
						<th class="leads-table__check">
							<input
								id="lead-select-all"
								name="leadSelectAll"
								type="checkbox"
								aria-label={allSelected ? 'Deselect all' : 'Select all'}
								checked={allSelected}
								indeterminate={someSelected && !allSelected}
								onchange={(e) => toggleSelectAll((e.currentTarget as HTMLInputElement).checked)}
							/>
						</th>
						<th>Lead</th>
						<th>Source</th>
						{#if tab === 'active'}<th>Engagement</th>{/if}
						<th>Status</th>
						<th>{tab === 'active' ? 'Signed up' : 'Trashed'}</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each leads as lead (lead.id)}
						<tr
							id="lead-row-{lead.id}"
							class={{
								'row--selected': selectedIds.has(lead.id),
								'row--linked': linkedLeadId === lead.id
							}}
							aria-current={linkedLeadId === lead.id ? 'true' : undefined}
							tabindex={linkedLeadId === lead.id ? -1 : undefined}
						>
							<td class="leads-table__check">
								<input
									id="lead-select-{lead.id}"
									name="leadSelect"
									type="checkbox"
									aria-label="Select {lead.email}"
									checked={selectedIds.has(lead.id)}
									onchange={(e) =>
										toggleSelect(lead.id, (e.currentTarget as HTMLInputElement).checked)}
								/>
							</td>
							<td class="leads-table__lead">
								<span class="leads-table__name">{lead.name ?? 'Unnamed lead'}</span>
								<span class="leads-table__email">{lead.email}</span>
							</td>
							<td class="leads-table__source">
								<span>{sourceLabel(lead.source)}</span>
								{#if lead.sourcePage}
									<small>{lead.sourcePage}</small>
								{/if}
							</td>
							{#if tab === 'active'}
								<td>
									<span
										class="engagement-badge"
										style="--engagement-color: {engagementColor(lead.emailEngagement)}"
										title={lead.latestEmailEventAt
											? `${lead.latestEmailEvent ?? 'event'} · ${formatDate(lead.latestEmailEventAt)}`
											: 'No Resend event recorded'}
									>
										{engagementLabel(lead.emailEngagement)}
									</span>
								</td>
							{/if}
							<td>
								<span class="status-badge" style="--badge-color: {statusColor(lead.status)}">
									{lead.status ?? 'new'}
								</span>
							</td>
							<td class="leads-table__date">
								{formatDate(tab === 'active' ? lead.createdAt : lead.deletedAt)}
							</td>
							<td class="leads-table__actions">
								{#if tab === 'active'}
									<select
										id="lead-status-{lead.id}"
										name="lead-status-{lead.id}"
										class="status-select"
										aria-label="Status for {lead.email}"
										value={lead.status ?? 'new'}
										onchange={(e) => changeStatus(lead, e.currentTarget)}
									>
										<option value="new">New</option>
										<option value="contacted">Contacted</option>
										<option value="converted">Converted</option>
										<option value="unsubscribed">Unsubscribed</option>
									</select>
									<button
										type="button"
										class="icon-btn icon-btn--danger"
										onclick={() => confirmTrashOne(lead)}
										title="Move to Trash"
										aria-label="Move {lead.email} to Trash"
									>
										<TrashIcon size={16} />
									</button>
								{:else}
									<button
										type="button"
										class="icon-btn"
										onclick={() => confirmRestoreOne(lead)}
										title="Restore"
										aria-label="Restore {lead.email}"
									>
										<ArrowCounterClockwiseIcon size={16} />
									</button>
									<button
										type="button"
										class="icon-btn icon-btn--danger"
										onclick={() => confirmPermanentDeleteOne(lead)}
										title="Permanently delete"
										aria-label="Permanently delete {lead.email}"
									>
										<TrashIcon size={16} />
									</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

{#if confirmConfig}
	<ConfirmDialog
		bind:open={confirmOpen}
		title={confirmConfig.title}
		message={confirmConfig.message ?? ''}
		confirmLabel={confirmConfig.confirmLabel}
		tone={confirmConfig.tone}
		onConfirm={confirmConfig.run}
	/>
{/if}

<style>
	.leads-page {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.leads-page__header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.leads-page__header h1 {
		font-family: var(--font-heading);
		font-size: 1.75rem;
		font-weight: 700;
		color: #fff;
		margin: 0;
	}

	.leads-page__subtitle {
		color: rgba(255, 255, 255, 0.45);
		font-size: 0.9rem;
		margin: 0.25rem 0 0;
	}

	.leads-page__actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.link-notice {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		border: 1px solid rgba(197, 160, 89, 0.3);
		border-radius: 0.5rem;
		background: rgba(197, 160, 89, 0.08);
		color: rgba(255, 255, 255, 0.85);
		font-size: 0.875rem;
	}
	.link-notice p {
		flex: 1;
		margin: 0;
	}

	/* Tabs */
	.leads-page__tabs {
		display: flex;
		gap: 0.25rem;
		margin-top: 1.25rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}
	.tab {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 0.875rem;
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		color: rgba(255, 255, 255, 0.55);
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			color 0.15s ease,
			border-color 0.15s ease;
	}
	.tab:hover {
		color: rgba(255, 255, 255, 0.85);
	}
	.tab--active {
		color: #fff;
		border-bottom-color: #c5a059;
	}
	.tab__badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		padding: 0 0.4rem;
		height: 1.25rem;
		font-size: 0.7rem;
		font-weight: 700;
		color: rgba(0, 0, 0, 0.85);
		background: #c5a059;
		border-radius: 0.625rem;
	}

	/* Bulk toolbar */
	.bulk-toolbar {
		position: sticky;
		top: 0;
		z-index: 5;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		margin-top: 1rem;
		background: rgba(20, 20, 26, 0.92);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.5rem;
	}
	.bulk-toolbar__count {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.7);
		font-weight: 600;
	}
	.bulk-toolbar__actions {
		display: flex;
		gap: 0.5rem;
	}

	.filter-select,
	.filter-input,
	.status-select {
		padding: 0.5rem 0.75rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.8);
		border-radius: 0.375rem;
		font-size: 0.85rem;
		cursor: pointer;
	}
	.filter-input {
		cursor: text;
	}
	.filter-select:focus,
	.filter-input:focus,
	.status-select:focus {
		outline: none;
		border-color: rgba(197, 160, 89, 0.55);
		box-shadow: 0 0 0 3px rgba(197, 160, 89, 0.12);
	}
	.status-select {
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
	}

	.leads-table__actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.3rem;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.375rem;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.icon-btn:hover {
		background: rgba(255, 255, 255, 0.05);
		color: #fff;
		border-color: rgba(255, 255, 255, 0.2);
	}
	.icon-btn--danger {
		border-color: rgba(248, 113, 113, 0.2);
		color: rgba(248, 113, 113, 0.6);
	}
	.icon-btn--danger:hover {
		background: rgba(248, 113, 113, 0.1);
		color: #f87171;
		border-color: rgba(248, 113, 113, 0.4);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.btn--primary {
		background: #c5a059;
		color: #0a0a0f;
	}
	.btn--primary:hover:not(:disabled) {
		background: #d4af6a;
	}
	.btn--ghost {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: rgba(255, 255, 255, 0.75);
	}
	.btn--ghost:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.04);
		color: #fff;
	}
	.btn--danger {
		background: rgba(248, 113, 113, 0.12);
		border: 1px solid rgba(248, 113, 113, 0.3);
		color: #f87171;
	}
	.btn--danger:hover:not(:disabled) {
		background: rgba(248, 113, 113, 0.2);
		border-color: rgba(248, 113, 113, 0.5);
	}

	.leads-page__loading,
	.leads-page__empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem;
		color: rgba(255, 255, 255, 0.5);
		gap: 1rem;
	}
	.leads-page__error {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		padding: 4rem 2rem;
	}
	.leads-page__error-msg {
		color: #f87171;
		font-size: 0.9rem;
		text-align: center;
		max-width: 28rem;
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

	.leads-table-wrap {
		margin-top: 1rem;
		overflow-x: auto;
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 0.75rem;
	}
	/* Refetching after a filter change dims the table in place instead of
	   swapping it for a spinner, so the row positions do not jump. */
	.leads-table-wrap.is-refreshing {
		opacity: 0.55;
		transition: opacity 0.15s ease;
	}
	@media (prefers-reduced-motion: reduce) {
		.leads-table-wrap.is-refreshing {
			transition: none;
		}
	}
	.leads-table {
		width: 100%;
		border-collapse: collapse;
	}
	.leads-table th {
		text-align: left;
		padding: 0.75rem 1rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: rgba(255, 255, 255, 0.45);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		background: rgba(255, 255, 255, 0.02);
	}
	.leads-table td {
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.75);
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
	}
	.leads-table tr:hover td {
		background: rgba(255, 255, 255, 0.02);
	}
	.leads-table tr.row--selected td {
		background: rgba(197, 160, 89, 0.06);
	}
	/* The row a notification deep link opened. */
	.leads-table tr.row--linked td {
		background: rgba(197, 160, 89, 0.12);
	}
	.leads-table tr.row--linked td:first-child {
		box-shadow: inset 3px 0 0 #c5a059;
	}
	.leads-table tr.row--linked:focus-visible {
		outline: 2px solid #c5a059;
		outline-offset: -2px;
	}
	.leads-table__check {
		width: 1.5rem;
	}
	.leads-table__check input {
		cursor: pointer;
		accent-color: #c5a059;
	}
	.leads-table__lead {
		min-width: 14rem;
	}
	.leads-table__name,
	.leads-table__email {
		display: block;
		font-weight: 500;
		color: #fff !important;
	}
	.leads-table__email {
		margin-top: 0.15rem;
		font-size: 0.78rem;
		color: rgba(255, 255, 255, 0.52) !important;
	}
	.leads-table__source {
		color: rgba(255, 255, 255, 0.45) !important;
		font-size: 0.8rem !important;
	}
	.leads-table__source span,
	.leads-table__source small {
		display: block;
		max-width: 15rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.leads-table__source small {
		margin-top: 0.15rem;
		color: rgba(255, 255, 255, 0.32);
	}
	.leads-table__date {
		font-size: 0.8rem !important;
		color: rgba(255, 255, 255, 0.4) !important;
		white-space: nowrap;
	}

	.status-badge {
		display: inline-block;
		padding-block: 0.2rem;
		padding-inline: 0.5rem;
		border-radius: 1rem;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--badge-color);
		background: color-mix(in oklch, var(--badge-color) 12%, transparent);
	}
	.engagement-badge {
		display: inline-block;
		padding-block: 0.2rem;
		padding-inline: 0.5rem;
		border-radius: 1rem;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--engagement-color);
		background: color-mix(in oklch, var(--engagement-color) 12%, transparent);
		border: 1px solid color-mix(in oklch, var(--engagement-color) 24%, transparent);
	}

	/* KPI Summary Row */
	.leads-kpi-row {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
		margin-top: 1.5rem;
	}
	.lead-filter-panel {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: 0.85rem;
		margin-top: 1rem;
		padding: 1rem;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.018));
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 1rem;
	}
	.lead-filter-panel label,
	.lead-filter-panel__search {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.lead-filter-panel label span,
	.lead-filter-panel__title {
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: rgba(255, 255, 255, 0.42);
	}
	.lead-filter-panel__title {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		align-self: center;
		color: #c5a059;
	}
	.lead-search {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		min-width: min(22rem, 100%);
		padding: 0.5rem 0.75rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.375rem;
		color: rgba(255, 255, 255, 0.55);
	}
	.lead-search input {
		width: 100%;
		min-width: 0;
		background: transparent;
		border: 0;
		color: rgba(255, 255, 255, 0.84);
		outline: 0;
	}
	.lead-insights-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
		gap: 1rem;
		margin-top: 1rem;
	}
	.lead-insight-card {
		min-width: 0;
		padding: 1.1rem;
		background: linear-gradient(145deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.015));
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 1rem;
		overflow: hidden;
	}
	.lead-insight-card__header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1rem;
		color: #c5a059;
	}
	.lead-insight-card__eyebrow {
		display: block;
		margin-bottom: 0.25rem;
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgba(255, 255, 255, 0.38);
	}
	.lead-insight-card h2 {
		margin: 0;
		font-family: var(--font-heading);
		font-size: 1rem;
		color: #fff;
	}
	.lead-insight-card__empty {
		margin: 0;
		color: rgba(255, 255, 255, 0.45);
	}

	@media (max-width: 1024px) {
		.leads-kpi-row {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.lead-insights-grid {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 640px) {
		.leads-page {
			padding: 1rem;
		}
		.leads-page__header {
			flex-direction: column;
		}
		.leads-page__actions,
		.bulk-toolbar,
		.bulk-toolbar__actions {
			flex-wrap: wrap;
		}
		.lead-filter-panel {
			align-items: stretch;
		}
		.lead-filter-panel label,
		.lead-filter-panel__search,
		.filter-select,
		.filter-input {
			width: 100%;
		}
		.leads-kpi-row {
			grid-template-columns: 1fr;
		}
	}
</style>
