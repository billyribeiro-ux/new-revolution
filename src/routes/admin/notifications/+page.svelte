<script lang="ts">
	import { goto, refreshAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import type { PageData } from './$types';
	import type { AdminNotification } from '#lib/types/db.js';
	import SEO from '#lib/components/SEO.svelte';
	import { toast } from '#lib/stores/toast.svelte.js';
	import { isAuthError } from '#lib/utils/http-error.js';
	import {
		notificationTimeLabel,
		toNotificationDate as toDate
	} from '#lib/utils/notification-time.js';
	import {
		deleteNotificationCmd,
		markNotificationClickedCmd,
		markNotificationReadCmd,
		markNotificationUnreadCmd
	} from '#lib/remote/admin/notifications.remote.js';
	import BellIcon from 'phosphor-svelte/lib/BellIcon';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import ArrowUUpLeftIcon from 'phosphor-svelte/lib/ArrowUUpLeftIcon';
	import TrashIcon from 'phosphor-svelte/lib/TrashIcon';
	import ChartLineUpIcon from 'phosphor-svelte/lib/ChartLineUpIcon';
	import EnvelopeIcon from 'phosphor-svelte/lib/EnvelopeIcon';
	import WarningCircleIcon from 'phosphor-svelte/lib/WarningCircleIcon';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	// Source of truth = the server load. After every mutation we
	// refreshAll() and let the load re-run; the derived `notifications`
	// picks up the new list. This avoids the $state-of-prop pitfall
	// (svelte/prefer-writable-derived) and keeps the bell badge in the
	// admin toolbar consistent because both surfaces resync from the
	// same server data.
	let notifications = $derived(data.notifications as AdminNotification[]);
	let status = $derived(data.status);
	// SvelteSet for "currently-mutating" overlay so .add/.delete trigger
	// reactivity cleanly (svelte/prefer-svelte-reactivity lint rule).
	const busyIds = new SvelteSet<number>();

	const FILTERS: Array<{ value: 'all' | 'unread' | 'read'; label: string }> = [
		{ value: 'all', label: 'All' },
		{ value: 'unread', label: 'Unread' },
		{ value: 'read', label: 'Read' }
	];

	function setBusy(id: number, busy: boolean) {
		if (busy) busyIds.add(id);
		else busyIds.delete(id);
	}

	// SvelteKit 3 removed `keepFocus` and `noScroll` and merged both into a single
	// `reset` flag; `replaceState` became `replace`. `reset: false` keeps the
	// focused element AND the scroll position.
	//
	// This is a deliberate behaviour change, not a pure rename: the old options
	// kept focus but still reset scroll, because `noScroll` was never set. On a
	// filter toggle within the same list, holding the scroll position is the
	// better behaviour and is the closest available equivalent to the intent.
	const FILTER_NAV_OPTIONS = { replace: true, reset: false } as const;

	async function changeFilter(next: 'all' | 'unread' | 'read') {
		if (next === 'all') {
			await goto(resolve('/admin/notifications'), FILTER_NAV_OPTIONS);
		} else {
			await goto(resolve(`/admin/notifications?status=${next}`), FILTER_NAV_OPTIONS);
		}
	}

	async function gotoNotificationTarget(targetHref: string): Promise<void> {
		const target = new URL(targetHref, page.url.origin);
		if (target.origin !== page.url.origin) {
			await goto(resolve('/admin'));
			return;
		}

		switch (target.pathname) {
			case '/admin/leads': {
				const lead = target.searchParams.get('lead');
				if (lead) await goto(resolve(`/admin/leads?lead=${encodeURIComponent(lead)}`));
				else await goto(resolve('/admin/leads'));
				return;
			}
			case '/admin/inbox': {
				const contact = target.searchParams.get('contact');
				if (contact) await goto(resolve(`/admin/inbox?contact=${encodeURIComponent(contact)}`));
				else await goto(resolve('/admin/inbox'));
				return;
			}
			case '/admin/analytics':
				await goto(resolve('/admin/analytics'));
				return;
			case '/admin/email-analytics':
				await goto(resolve('/admin/email-analytics'));
				return;
			case '/admin/calls':
				await goto(resolve('/admin/calls'));
				return;
			default:
				await goto(resolve('/admin'));
		}
	}

	/**
	 * Run one row action. These were try/finally with no catch, so a failed
	 * command became an unhandled rejection and the operator saw the row
	 * un-dim with nothing changed and no explanation.
	 */
	async function runRowAction(
		n: AdminNotification,
		action: () => Promise<unknown>,
		failure: string
	): Promise<void> {
		setBusy(n.id, true);
		try {
			await action();
		} catch (err) {
			if (isAuthError(err)) {
				toast.error('Your session expired. Please sign in again.');
				void goto(resolve('/admin'), { refreshAll: true });
				return;
			}
			toast.error(failure);
		} finally {
			setBusy(n.id, false);
		}
	}

	function open(n: AdminNotification) {
		return runRowAction(
			n,
			async () => {
				await markNotificationClickedCmd({ id: n.id });
				await gotoNotificationTarget(n.targetHref);
			},
			'Unable to open notification.'
		);
	}

	function markRead(n: AdminNotification) {
		return runRowAction(
			n,
			async () => {
				await markNotificationReadCmd({ id: n.id });
				await refreshAll();
			},
			'Unable to mark notification as read.'
		);
	}

	function markUnread(n: AdminNotification) {
		return runRowAction(
			n,
			async () => {
				await markNotificationUnreadCmd({ id: n.id });
				await refreshAll();
			},
			'Unable to mark notification as unread.'
		);
	}

	function remove(n: AdminNotification) {
		return runRowAction(
			n,
			async () => {
				await deleteNotificationCmd({ id: n.id });
				await refreshAll();
			},
			'Unable to delete notification.'
		);
	}

	/*
	 * One zone for the whole list: UTC. Day groups (dayKey), their headings
	 * (dayLabel, including Today/Yesterday) and each row's time all use it, and
	 * the time says so. Grouping by UTC day while printing local times put a
	 * 21:30 Chicago row under the next day's heading. Local time throughout is
	 * not an option here: this page is server-rendered, the server runs in UTC,
	 * and no stored admin zone exists (notification_preferences.tz defaults to
	 * 'UTC' and nothing sets it), so a local format would paint different
	 * groups and times in the HTML than after hydration. UTC is also what
	 * 3121b9c pinned the headings to. Row times come from
	 * `#lib/utils/notification-time.js`, which the toolbar bell shares.
	 */
	function dayKey(occurredAt: Date | string): string {
		return toDate(occurredAt).toISOString().slice(0, 10);
	}

	function dayLabel(key: string): string {
		const date = new Date(`${key}T00:00:00Z`);
		const today = new Date();
		const todayKey = today.toISOString().slice(0, 10);
		const yesterdayKey = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
		if (key === todayKey) return 'Today';
		if (key === yesterdayKey) return 'Yesterday';
		// `key` is a UTC calendar day (see dayKey), so label it in UTC. Formatting
		// in the browser's zone named the previous day west of Greenwich.
		return new Intl.DateTimeFormat('en-US', {
			weekday: 'long',
			month: 'short',
			day: 'numeric',
			timeZone: 'UTC'
		}).format(date);
	}

	let grouped = $derived.by(() => {
		// SvelteMap so the rule lints clean; the map is throwaway-per-derivation
		// either way (re-computed on every notifications-array change), so
		// reactivity semantics are immaterial here. Using SvelteMap keeps the
		// codebase consistent with the project's preference.
		const groups = new SvelteMap<string, AdminNotification[]>();
		for (const n of notifications) {
			const key = dayKey(n.occurredAt);
			const list = groups.get(key) ?? [];
			list.push(n);
			groups.set(key, list);
		}
		return [...groups.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
	});
</script>

<SEO
	title="Notifications | Admin"
	description="Review and manage Team Consulting 360 administrative notifications, alerts, and activity."
	noindex={true}
/>

<section class="notifications-page">
	<header class="notifications-page__header">
		<h1>Notifications</h1>
		<nav class="notifications-page__filters" aria-label="Filter notifications by status">
			{#each FILTERS as filter (filter.value)}
				<button
					type="button"
					class="filter-chip"
					class:filter-chip--active={status === filter.value}
					aria-pressed={status === filter.value}
					onclick={() => changeFilter(filter.value)}
				>
					{filter.label}
				</button>
			{/each}
		</nav>
	</header>

	{#if notifications.length === 0}
		<div class="notifications-empty">
			<BellIcon size={36} />
			<strong>No notifications {status === 'all' ? 'yet' : `in '${status}'`}</strong>
			<span>
				New leads, contact submissions, traffic alerts and email digests will appear here.
			</span>
		</div>
	{:else}
		{#each grouped as [day, items] (day)}
			<section class="day-group">
				<h2>{dayLabel(day)}</h2>
				<ul class="day-group__list">
					{#each items as n (n.id)}
						<li
							class="notification-row"
							class:notification-row--unread={!n.readAt}
							class:notification-row--busy={busyIds.has(n.id)}
							data-severity={n.severity}
						>
							<span class="notification-row__icon" aria-hidden="true">
								{#if n.type === 'lead' || n.type === 'contact' || n.type === 'email'}
									<EnvelopeIcon size={20} weight="duotone" />
								{:else if n.type === 'analytics' || n.type === 'ctr'}
									<ChartLineUpIcon size={20} weight="duotone" />
								{:else}
									<WarningCircleIcon size={20} weight="duotone" />
								{/if}
							</span>
							<button
								type="button"
								class="notification-row__main"
								onclick={() => open(n)}
								disabled={busyIds.has(n.id)}
							>
								<strong>{n.title}</strong>
								{#if n.body}<span class="notification-row__body">{n.body}</span>{/if}
								<time class="notification-row__time" datetime={toDate(n.occurredAt).toISOString()}>
									{notificationTimeLabel(n.occurredAt)}
								</time>
							</button>
							<div class="notification-row__actions">
								{#if n.readAt}
									<button
										type="button"
										class="row-btn"
										aria-label="Mark as unread"
										title="Mark as unread"
										onclick={() => markUnread(n)}
										disabled={busyIds.has(n.id)}
									>
										<ArrowUUpLeftIcon size={16} />
									</button>
								{:else}
									<button
										type="button"
										class="row-btn"
										aria-label="Mark as read"
										title="Mark as read"
										onclick={() => markRead(n)}
										disabled={busyIds.has(n.id)}
									>
										<CheckIcon size={16} />
									</button>
								{/if}
								<button
									type="button"
									class="row-btn row-btn--danger"
									aria-label="Delete notification"
									title="Delete"
									onclick={() => remove(n)}
									disabled={busyIds.has(n.id)}
								>
									<TrashIcon size={16} />
								</button>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	{/if}
</section>

<style>
	.notifications-page {
		max-width: 880px;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
		color: rgba(255, 255, 255, 0.88);
	}

	.notifications-page__header {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.notifications-page__header h1 {
		margin: 0;
		font-family: var(--font-heading);
		font-size: 1.75rem;
		letter-spacing: -0.02em;
	}

	.notifications-page__filters {
		display: inline-flex;
		gap: 0.4rem;
		padding: 0.25rem;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.03);
	}

	.filter-chip {
		padding: 0.4rem 0.85rem;
		border: 1px solid transparent;
		border-radius: 999px;
		background: transparent;
		color: rgba(255, 255, 255, 0.62);
		font: inherit;
		font-size: 0.82rem;
		cursor: pointer;
		transition:
			background 0.2s ease,
			color 0.2s ease,
			border-color 0.2s ease;
	}

	.filter-chip:hover {
		color: #fff;
		background: rgba(255, 255, 255, 0.06);
	}

	.filter-chip--active {
		color: #fff;
		background: rgba(197, 160, 89, 0.18);
		border-color: rgba(197, 160, 89, 0.35);
	}

	.notifications-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 4rem 2rem;
		border: 1px dashed rgba(255, 255, 255, 0.1);
		border-radius: 1rem;
		text-align: center;
		color: rgba(255, 255, 255, 0.55);
	}

	.notifications-empty strong {
		color: #fff;
		font-size: 1.05rem;
	}

	.notifications-empty span {
		max-width: 380px;
		font-size: 0.88rem;
		line-height: 1.5;
	}

	.day-group {
		margin-bottom: 1.75rem;
	}

	.day-group h2 {
		margin: 0 0 0.7rem;
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.42);
	}

	.day-group__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.notification-row {
		display: grid;
		grid-template-columns: 36px 1fr auto;
		gap: 0.85rem;
		align-items: center;
		padding: 0.85rem 1rem;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.85rem;
		background: rgba(255, 255, 255, 0.035);
		transition:
			border-color 0.2s ease,
			background 0.2s ease,
			transform 0.2s ease,
			opacity 0.2s ease;
	}

	.notification-row--unread {
		border-color: rgba(197, 160, 89, 0.28);
		background: rgba(197, 160, 89, 0.08);
	}

	.notification-row--busy {
		opacity: 0.55;
		pointer-events: none;
	}

	.notification-row:hover {
		border-color: rgba(255, 255, 255, 0.16);
		transform: translateY(-1px);
	}

	.notification-row__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 0.7rem;
		background: rgba(52, 211, 153, 0.12);
		color: #34d399;
	}

	.notification-row[data-severity='warning'] .notification-row__icon {
		background: rgba(251, 191, 36, 0.12);
		color: #fbbf24;
	}

	.notification-row[data-severity='danger'] .notification-row__icon {
		background: rgba(248, 113, 113, 0.12);
		color: #f87171;
	}

	.notification-row[data-severity='info'] .notification-row__icon {
		background: rgba(96, 165, 250, 0.12);
		color: #60a5fa;
	}

	.notification-row__main {
		display: grid;
		gap: 0.2rem;
		min-width: 0;
		padding: 0;
		border: none;
		background: transparent;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}

	.notification-row__main:disabled {
		cursor: default;
	}

	.notification-row__main strong {
		color: #fff;
		font-size: 0.95rem;
	}

	.notification-row__body {
		color: rgba(255, 255, 255, 0.62);
		font-size: 0.82rem;
		line-height: 1.45;
	}

	.notification-row__time {
		margin-top: 0.15rem;
		color: rgba(255, 255, 255, 0.38);
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.notification-row__actions {
		display: inline-flex;
		gap: 0.35rem;
		flex-shrink: 0;
	}

	.row-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.55rem;
		background: rgba(255, 255, 255, 0.04);
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		transition:
			background 0.2s ease,
			color 0.2s ease,
			border-color 0.2s ease;
	}

	.row-btn:hover:not(:disabled) {
		color: #fff;
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.row-btn--danger:hover:not(:disabled) {
		background: rgba(248, 113, 113, 0.16);
		border-color: rgba(248, 113, 113, 0.34);
		color: #fca5a5;
	}

	.row-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 640px) {
		.notification-row {
			grid-template-columns: 32px 1fr;
		}

		.notification-row__actions {
			grid-column: 1 / -1;
			justify-content: flex-end;
		}
	}
</style>
