<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { AdminNotification } from '#lib/types/db.js';
	import {
		fetchAdminNotifications,
		markNotificationClickedCmd,
		markNotificationReadCmd,
		archiveNotificationCmd,
		unarchiveNotificationCmd,
		deleteNotificationCmd
	} from '#lib/remote/admin/notifications.remote.js';
	import BellIcon from 'phosphor-svelte/lib/BellIcon';
	import BellRingingIcon from 'phosphor-svelte/lib/BellRingingIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import CheckCircleIcon from 'phosphor-svelte/lib/CheckCircleIcon';
	import WarningCircleIcon from 'phosphor-svelte/lib/WarningCircleIcon';
	import ArchiveIcon from 'phosphor-svelte/lib/ArchiveIcon';
	import ArrowCounterClockwiseIcon from 'phosphor-svelte/lib/ArrowCounterClockwiseIcon';
	import TrashIcon from 'phosphor-svelte/lib/TrashIcon';
	import { focusTrap } from '#lib/attachments/focusTrap.js';
	import { refusalMessage } from '#lib/utils/http-error.js';
	import { notificationDateTimeLabel, toNotificationDate } from '#lib/utils/notification-time.js';

	/**
	 * Polling cadence — see /api/admin/notifications/head for the math.
	 * 20s visible / 60s hidden / pause after 10 min hidden. ETag short-
	 * circuits ~80% of polls to 304 so this is genuinely cheap.
	 */
	const POLL_VISIBLE_MS = 20_000;
	const POLL_HIDDEN_MS = 60_000;
	const HIDDEN_PAUSE_AFTER_MS = 10 * 60_000;
	const BROADCAST_CHANNEL = 'rtp-notif-poll';
	/**
	 * A follower that hears nothing for this many of its own poll intervals
	 * takes over. The leader broadcasts after every successful poll, 304s
	 * included, so silence means the leader closed, paused or stalled.
	 */
	const FOLLOWER_TAKEOVER_INTERVALS = 2;

	interface HeadPayload {
		unread: number;
		maxId: number | null;
		latestOccurredAt: string | null;
	}

	let notifications = $state<AdminNotification[]>([]);
	let notificationCount = $state(0);
	let notificationsOpen = $state(false);
	// Space from the bell's left edge to the viewport's right edge, minus a
	// margin. The panel anchors LEFT to the bell (see .notification-panel),
	// so a fixed 340px width overflowed narrow phones (390px viewport, bell
	// at x=60 put the right edge at 400). CSS alone cannot know the anchor's
	// offset, so we measure it while the panel is open. A one-shot measure at
	// click time is not enough: collapsing the sidebar animates its width
	// (240px to 64px over 0.2s, see the admin layout), which reflows the bell
	// AFTER the panel opened.
	//
	// This was a requestAnimationFrame loop that re-measured every frame for
	// as long as the panel stayed open. A ResizeObserver delivers the same
	// frames of that width transition while costing nothing when the layout is
	// static. It reports size changes rather than movement, so the bell alone
	// is not enough to observe: the element that resizes is an ancestor. The
	// whole ancestor chain is observed instead of naming one, which keeps this
	// correct if the shell's layout changes.
	let panelMaxWidth = $state('340px');
	let panelMaxHeight = $state('460px');
	function measurePanel(bell: HTMLButtonElement) {
		const measure = () => {
			const rect = bell.getBoundingClientRect();
			panelMaxWidth = `${Math.max(240, Math.floor(window.innerWidth - rect.left - 12))}px`;
			// The panel opens 0.5rem below the bell, so its height must fit the
			// space left under that, with the same 12px margin. A viewport-only cap
			// (`100vh - 6rem`) let a long list run 5px off a 320x700 phone.
			panelMaxHeight = `${Math.max(200, Math.floor(window.innerHeight - rect.bottom - 8 - 12))}px`;
		};

		measure();

		const observer = new ResizeObserver(measure);
		for (let el: Element | null = bell; el; el = el.parentElement) {
			observer.observe(el);
		}
		// A viewport resize changes innerWidth without necessarily resizing any
		// observed box, and scrolling moves the bell without resizing anything,
		// so both need their own listeners.
		window.addEventListener('resize', measure, { passive: true });
		window.addEventListener('scroll', measure, { passive: true, capture: true });

		return () => {
			observer.disconnect();
			window.removeEventListener('resize', measure);
			window.removeEventListener('scroll', measure, { capture: true });
		};
	}
	let notificationsLoading = $state(false);
	let notificationError = $state('');
	/** Which folder the dropdown is showing. Badge always reflects Active unread. */
	let folder = $state<'active' | 'archived'>('active');
	const FOLDERS = [
		{ value: 'active', label: 'Active' },
		{ value: 'archived', label: 'Archive' }
	] as const;

	let pollTimer: ReturnType<typeof setTimeout> | null = null;
	let lastEtag: string | null = null;
	let lastMaxId: number | null = null;
	let hiddenSince: number | null = null;
	let leaderTab = true; // BroadcastChannel: first tab to claim is the leader
	let channel: BroadcastChannel | null = null;
	let disposed = false;
	let headController: AbortController | null = null;
	let listGeneration = 0;
	const mutationVersions: Record<number, number> = {};

	onMount(() => {
		// BroadcastChannel: only the foreground tab actually polls.
		// Followers subscribe and rebroadcast the head payload to keep
		// their own badge in sync without burning their own polls.
		try {
			channel = new BroadcastChannel(BROADCAST_CHANNEL);
			channel.postMessage({ kind: 'hello' });
			channel.addEventListener('message', onChannelMessage);
		} catch {
			channel = null;
		}

		document.addEventListener('visibilitychange', onVisibilityChange);

		// Initial probe + start the poll cycle.
		const initialPoll = setTimeout(() => {
			void pollHead();
			schedulePoll();
		}, 0);

		return () => {
			disposed = true;
			listGeneration++;
			clearTimeout(initialPoll);
			headController?.abort();
			if (pollTimer !== null) clearTimeout(pollTimer);
			pollTimer = null;
			document.removeEventListener('visibilitychange', onVisibilityChange);
			channel?.removeEventListener('message', onChannelMessage);
			channel?.close();
			channel = null;
		};
	});

	function onChannelMessage(event: MessageEvent) {
		const data = event.data as { kind?: string; head?: HeadPayload } | undefined;
		if (!data) return;
		if (data.kind === 'hello') {
			// Another tab woke up. A leader with a head broadcasts it so the new
			// tab paints instantly without its own DB hit (and follows us).
			if (leaderTab && lastMaxId !== null) {
				broadcastHead();
			} else {
				// Nothing to share yet: yield, so the newer tab's first poll
				// leads. (This used to set `leaderTab = true`, the opposite of
				// the comment it sat under.) The watchdog armed by schedulePoll
				// recovers if that tab never broadcasts.
				leaderTab = false;
				schedulePoll();
			}
			return;
		}
		if (data.kind === 'head' && data.head) {
			// Follower path: trust the leader's head, and restart the watchdog.
			notificationCount = data.head.unread;
			lastMaxId = data.head.maxId;
			leaderTab = false;
			schedulePoll();
		}
	}

	function broadcastHead() {
		channel?.postMessage({
			kind: 'head',
			head: { unread: notificationCount, maxId: lastMaxId, latestOccurredAt: null }
		});
	}

	function onVisibilityChange() {
		if (document.visibilityState === 'visible') {
			hiddenSince = null;
			// Reclaim leadership on visibility — the foreground tab should
			// always be the polling driver so badge updates are timely.
			leaderTab = true;
			void pollHead();
			schedulePoll();
		} else {
			hiddenSince = Date.now();
			schedulePoll();
		}
	}

	function schedulePoll() {
		if (pollTimer !== null) clearTimeout(pollTimer);
		pollTimer = null;
		if (disposed) return;
		if (hiddenSince !== null && Date.now() - hiddenSince > HIDDEN_PAUSE_AFTER_MS) {
			// Fully paused, leader or follower: visibilitychange will re-prime.
			return;
		}
		const interval = document.visibilityState === 'visible' ? POLL_VISIBLE_MS : POLL_HIDDEN_MS;
		if (!leaderTab) {
			// Follower watchdog. Without it a follower waited forever, so a closed
			// leader tab, or two tabs that each demoted the other, left nothing
			// polling and the badge frozen. The jitter keeps two followers that
			// heard the same last message from taking over in lockstep.
			const jitter = Math.floor(Math.random() * (interval / 4));
			pollTimer = setTimeout(
				() => {
					pollTimer = null;
					leaderTab = true;
					void pollHead().finally(schedulePoll);
				},
				interval * FOLLOWER_TAKEOVER_INTERVALS + jitter
			);
			return;
		}
		pollTimer = setTimeout(() => {
			void pollHead().finally(schedulePoll);
		}, interval);
	}

	async function pollHead() {
		if (disposed || !leaderTab || headController) return;
		const controller = new AbortController();
		headController = controller;
		try {
			const headers: HeadersInit = { accept: 'application/json' };
			if (lastEtag) headers['if-none-match'] = lastEtag;
			const response = await fetch('/api/admin/notifications/head', {
				headers,
				credentials: 'same-origin',
				signal: controller.signal
			});
			if (disposed || controller.signal.aborted) return;
			// Another tab's head arrived while this request was in flight and made
			// this tab a follower. Broadcasting now would demote that leader too
			// and leave no tab polling, so its head stands and this result is
			// dropped.
			if (!leaderTab) return;
			if (response.status === 304) {
				// Nothing changed, but followers still need to hear the leader is
				// alive, or their watchdog would take over.
				broadcastHead();
				return;
			}
			if (!response.ok) return;
			const payload = (await response.json()) as HeadPayload;
			if (disposed || controller.signal.aborted || !leaderTab) return;
			const etag = response.headers.get('etag');
			if (etag) lastEtag = etag;
			const previousMaxId = lastMaxId;
			notificationCount = payload.unread;
			lastMaxId = payload.maxId;
			channel?.postMessage({ kind: 'head', head: payload });
			// If a new row landed (or panel is open + the list is stale),
			// refresh the full list so the dropdown renders the latest items.
			if (notificationsOpen && payload.maxId !== previousMaxId) {
				await refreshList();
			}
		} catch {
			// Silent — polling is best-effort; an error here doesn't
			// surface to the user, and the next tick will retry.
		} finally {
			if (headController === controller) headController = null;
		}
	}

	async function refreshList() {
		if (disposed) return;
		const generation = ++listGeneration;
		try {
			notificationError = '';
			const query = fetchAdminNotifications({ status: 'all', folder, limit: 20 });
			// Calling the query again can reuse a cached list from before a mutation.
			await query.refresh();
			const list = await query;
			if (!disposed && generation === listGeneration) notifications = list;
		} catch {
			if (!disposed && generation === listGeneration)
				notificationError = 'Unable to load notifications.';
		}
	}

	async function switchFolder(next: 'active' | 'archived') {
		if (folder === next) return;
		folder = next;
		notificationsLoading = true;
		await refreshList();
		notificationsLoading = false;
	}

	async function archiveNotification(notification: AdminNotification, event: MouseEvent) {
		event.stopPropagation();
		try {
			await archiveNotificationCmd({ id: notification.id });
			mutationVersions[notification.id] = (mutationVersions[notification.id] ?? 0) + 1;
			listGeneration++;
			const wasUnread = notifications.some(
				(item) => item.id === notification.id && !item.readAt && !item.archivedAt
			);
			// Drop it from the Active list; archiving also marks read.
			notifications = notifications.filter((item) => item.id !== notification.id);
			if (wasUnread) notificationCount = Math.max(0, notificationCount - 1);
			await refreshList();
		} catch (err) {
			notificationError = refusalMessage(err, 'Unable to archive notification.');
		}
	}

	async function unarchiveNotification(notification: AdminNotification, event: MouseEvent) {
		event.stopPropagation();
		try {
			await unarchiveNotificationCmd({ id: notification.id });
			mutationVersions[notification.id] = (mutationVersions[notification.id] ?? 0) + 1;
			listGeneration++;
			// It returns to Active; remove from the Archive view we're looking at.
			notifications = notifications.filter((item) => item.id !== notification.id);
			await refreshList();
		} catch (err) {
			notificationError = refusalMessage(err, 'Unable to restore notification.');
		}
	}

	async function deleteNotification(notification: AdminNotification, event: MouseEvent) {
		event.stopPropagation();
		try {
			await deleteNotificationCmd({ id: notification.id });
			mutationVersions[notification.id] = (mutationVersions[notification.id] ?? 0) + 1;
			listGeneration++;
			const wasUnread = notifications.some(
				(item) => item.id === notification.id && !item.readAt && !item.archivedAt
			);
			notifications = notifications.filter((item) => item.id !== notification.id);
			if (wasUnread) notificationCount = Math.max(0, notificationCount - 1);
			await refreshList();
		} catch (err) {
			notificationError = refusalMessage(err, 'Unable to delete notification.');
		}
	}

	async function toggleNotifications() {
		notificationsOpen = !notificationsOpen;
		if (notificationsOpen) {
			notificationsLoading = true;
			await refreshList();
			notificationsLoading = false;
		}
	}

	async function openNotification(notification: AdminNotification) {
		const wasUnread = !notification.readAt;
		try {
			const updated = await markNotificationClickedCmd({ id: notification.id });
			listGeneration++;
			notifications = notifications.map((item) => (item.id === updated.id ? updated : item));
			if (wasUnread) notificationCount = Math.max(0, notificationCount - 1);
			notificationsOpen = false;
			// targetHref is a runtime app-path string from the DB (e.g. /admin/analytics),
			// not a statically-known route ID — goto() accepts a plain string directly,
			// so resolve()'s typed-route overload (which rejects bare string) is not used here.
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- runtime DB path string
			await goto(notification.targetHref);
		} catch (err) {
			notificationError = refusalMessage(err, 'Unable to open notification.');
		}
	}

	async function markNotificationRead(notification: AdminNotification, event: MouseEvent) {
		event.stopPropagation();
		if (notification.readAt) return;
		const version = mutationVersions[notification.id] ?? 0;
		try {
			const updated = await markNotificationReadCmd({ id: notification.id });
			// A later archive/delete already removed this row and adjusted its count.
			if (disposed || version !== (mutationVersions[notification.id] ?? 0)) return;
			listGeneration++;
			notifications = notifications.map((item) => (item.id === updated.id ? updated : item));
			notificationCount = Math.max(0, notificationCount - 1);
			await refreshList();
		} catch (err) {
			notificationError = refusalMessage(err, 'Unable to update notification.');
		}
	}

	function closeNotifications() {
		notificationsOpen = false;
	}

	/**
	 * WAI-ARIA tabs keyboard model (automatic activation): arrows move to the
	 * neighbouring tab and wrap, Home/End jump to the ends. Only the selected
	 * tab is in the Tab order (see the roving `tabindex` below).
	 */
	function handleTabKeydown(event: KeyboardEvent, index: number) {
		let next: number;
		switch (event.key) {
			case 'ArrowRight':
				next = (index + 1) % FOLDERS.length;
				break;
			case 'ArrowLeft':
				next = (index - 1 + FOLDERS.length) % FOLDERS.length;
				break;
			case 'Home':
				next = 0;
				break;
			case 'End':
				next = FOLDERS.length - 1;
				break;
			default:
				return;
		}
		event.preventDefault();
		const target = FOLDERS[next]!.value;
		document.getElementById(`admin-notification-tab-${target}`)?.focus();
		void switchFolder(target);
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') closeNotifications();
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<div class="notification-center">
	<button
		type="button"
		class={['notification-bell', { active: notificationsOpen }]}
		{@attach notificationsOpen && measurePanel}
		onclick={toggleNotifications}
		aria-label={`Notifications${notificationCount ? `, ${notificationCount} unread` : ''}`}
		aria-haspopup="dialog"
		aria-expanded={notificationsOpen}
		aria-controls="admin-notification-panel"
		data-testid="admin-notification-bell"
	>
		{#if notificationCount > 0}
			<BellRingingIcon size={18} weight="fill" />
			<span class="notification-badge">{notificationCount > 99 ? '99+' : notificationCount}</span>
		{:else}
			<BellIcon size={18} />
		{/if}
	</button>

	{#if notificationsOpen}
		<button
			type="button"
			class="notification-scrim"
			aria-label="Close notifications"
			onclick={closeNotifications}
		></button>
		<div
			id="admin-notification-panel"
			class="notification-panel"
			style:--panel-max-width={panelMaxWidth}
			style:--panel-max-height={panelMaxHeight}
			role="dialog"
			aria-modal="true"
			aria-labelledby="admin-notification-title"
			data-testid="admin-notification-panel"
			{@attach focusTrap}
		>
			<header class="notification-panel__header">
				<div>
					<p class="notification-panel__eyebrow">Command center</p>
					<h2 id="admin-notification-title">Notifications</h2>
				</div>
				<button
					type="button"
					class="notification-close"
					aria-label="Close notifications"
					onclick={closeNotifications}
				>
					<XIcon size={18} />
				</button>
			</header>

			<div class="notification-tabs" role="tablist" aria-label="Notification folders">
				{#each FOLDERS as tab, index (tab.value)}
					<button
						type="button"
						role="tab"
						id="admin-notification-tab-{tab.value}"
						aria-selected={folder === tab.value}
						aria-controls="admin-notification-tabpanel"
						tabindex={folder === tab.value ? 0 : -1}
						class={['notification-tab', { active: folder === tab.value }]}
						onclick={() => switchFolder(tab.value)}
						onkeydown={(event) => handleTabKeydown(event, index)}
					>
						{tab.label}
					</button>
				{/each}
			</div>

			<div
				id="admin-notification-tabpanel"
				class="notification-tabpanel"
				role="tabpanel"
				aria-labelledby="admin-notification-tab-{folder}"
				tabindex="0"
			>
				{#if notificationError}
					<div class="notification-error">{notificationError}</div>
				{/if}

				{#if notificationsLoading}
					<div class="notification-loading">Loading notifications...</div>
				{:else}
					<div class="notification-list">
						{#each notifications as notification (notification.id)}
							<article
								class={['notification-item', { unread: !notification.readAt }]}
								data-severity={notification.severity}
							>
								<button
									type="button"
									class="notification-item__main"
									onclick={() => openNotification(notification)}
								>
									<span class="notification-item__icon">
										{#if notification.severity === 'danger' || notification.severity === 'warning'}
											<WarningCircleIcon size={15} weight="fill" />
										{:else}
											<CheckCircleIcon size={15} weight="fill" />
										{/if}
									</span>
									<span class="notification-item__content">
										<strong>{notification.title}</strong>
										{#if notification.body}<span>{notification.body}</span>{/if}
										<!-- UTC and labelled, as on /admin/notifications (shared helper). -->
										<time datetime={toNotificationDate(notification.occurredAt).toISOString()}>
											{notificationDateTimeLabel(notification.occurredAt)}
										</time>
									</span>
								</button>
								<div class="notification-item__actions">
									{#if folder === 'archived'}
										<button
											type="button"
											class="notification-item__act"
											title="Restore to Active"
											aria-label="Restore notification"
											onclick={(event) => unarchiveNotification(notification, event)}
										>
											<ArrowCounterClockwiseIcon size={15} />
										</button>
									{:else}
										{#if !notification.readAt}
											<button
												type="button"
												class="notification-item__read"
												onclick={(event) => markNotificationRead(notification, event)}
											>
												Mark read
											</button>
										{/if}
										<button
											type="button"
											class="notification-item__act"
											title="Archive"
											aria-label="Archive notification"
											onclick={(event) => archiveNotification(notification, event)}
										>
											<ArchiveIcon size={15} />
										</button>
									{/if}
									<button
										type="button"
										class="notification-item__act notification-item__act--danger"
										title="Delete"
										aria-label="Delete notification"
										onclick={(event) => deleteNotification(notification, event)}
									>
										<TrashIcon size={15} />
									</button>
								</div>
							</article>
						{:else}
							<div class="notification-empty">
								<BellIcon size={28} />
								<strong
									>{folder === 'archived' ? 'Archive is empty' : 'No notifications yet'}</strong
								>
								<span>
									{folder === 'archived'
										? 'Notifications you archive will appear here.'
										: 'New emails, traffic changes, and contact messages will appear here.'}
								</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.notification-center {
		position: relative;
		display: inline-flex;
		align-items: center;
		z-index: 80;
	}

	.notification-bell {
		position: relative;
		width: 38px;
		height: 38px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		color: #f8e2ac;
		cursor: pointer;
		transition:
			transform 0.2s ease,
			border-color 0.2s ease,
			background 0.2s ease,
			box-shadow 0.2s ease;
	}

	.notification-bell:hover,
	.notification-bell.active {
		transform: translateY(-1px);
		border-color: rgba(197, 160, 89, 0.46);
		background: rgba(197, 160, 89, 0.12);
		box-shadow: 0 0 0 4px rgba(197, 160, 89, 0.08);
	}

	.notification-badge {
		position: absolute;
		top: -0.4rem;
		right: -0.4rem;
		min-width: 1.25rem;
		height: 1.25rem;
		padding: 0 0.28rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 2px solid #0a0a0f;
		border-radius: 999px;
		background: #f87171;
		color: #fff;
		font-size: 0.66rem;
		font-weight: 800;
		line-height: 1;
		box-shadow: 0 10px 22px rgba(248, 113, 113, 0.35);
	}

	.notification-scrim {
		position: fixed;
		inset: 0;
		z-index: 79;
		border: none;
		background: rgba(0, 0, 0, 0.18);
		cursor: default;
	}

	.notification-panel {
		position: absolute;
		top: calc(100% + 0.5rem);
		/* The bell is the LEFT-most item in the dashboard header actions, so the
		   panel opens RIGHTWARD from the bell's left edge — sitting directly
		   below/beside it, into the open space (not flung across the page to the
		   left, which `right: 0` did). The max-width guard prevents overflow. */
		left: 0;
		right: auto;
		z-index: 81;
		/* Compact, professional width — sized like enterprise notification
		   dropdowns (GitHub/Linear), not a half-screen sheet. The measured
		   --panel-max-width (set at open time) is the distance from the bell
		   to the viewport's right edge: because the panel is LEFT-anchored to
		   the bell, a plain 100vw guard could not prevent right-edge overflow
		   on narrow phones. */
		width: min(340px, calc(100vw - 1.5rem), var(--panel-max-width, 340px));
		max-width: calc(100vw - 1.5rem);
		max-height: min(460px, calc(100vh - 6rem), var(--panel-max-height, 460px));
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.85rem;
		background: linear-gradient(180deg, rgba(20, 20, 30, 0.98), rgba(12, 12, 18, 0.98));
		box-shadow:
			0 18px 50px rgba(0, 0, 0, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.06);
		backdrop-filter: blur(20px);
	}

	.notification-panel__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.75rem 0.85rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.notification-panel__eyebrow {
		margin: 0 0 0.1rem;
		color: rgba(197, 160, 89, 0.92);
		font-size: 0.6rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.notification-panel h2 {
		margin: 0;
		color: #fff;
		font-family: var(--font-heading);
		font-size: 0.95rem;
		letter-spacing: -0.01em;
	}

	.notification-close {
		flex-shrink: 0;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.45rem;
		background: rgba(255, 255, 255, 0.04);
		color: rgba(255, 255, 255, 0.58);
		cursor: pointer;
		transition:
			background 0.2s ease,
			color 0.2s ease;
	}

	.notification-close:hover {
		background: rgba(255, 255, 255, 0.08);
		color: #fff;
	}

	.notification-error,
	.notification-loading {
		margin: 1rem;
		padding: 0.85rem 0.95rem;
		border-radius: 0.85rem;
		font-size: 0.86rem;
	}

	.notification-error {
		border: 1px solid rgba(248, 113, 113, 0.24);
		background: rgba(248, 113, 113, 0.1);
		color: #fca5a5;
	}

	.notification-loading {
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.04);
		color: rgba(255, 255, 255, 0.7);
	}

	.notification-list {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		padding: 0.85rem;
		overflow-y: auto;
	}

	.notification-item {
		position: relative;
		/* Vertical layout: content row (full width) on top, actions row below.
		   The old `grid 1fr auto` put the action buttons BESIDE the text, which
		   starved the title column and wrapped it one word per line. */
		display: flex;
		flex-direction: column;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.7rem;
		background: rgba(255, 255, 255, 0.035);
		transition:
			border-color 0.2s ease,
			background 0.2s ease;
	}

	.notification-item.unread {
		border-color: rgba(197, 160, 89, 0.24);
		background: rgba(197, 160, 89, 0.08);
	}

	.notification-item:hover {
		transform: translateY(-1px);
		border-color: rgba(255, 255, 255, 0.14);
		background: rgba(255, 255, 255, 0.055);
	}

	.notification-item__main {
		width: 100%;
		min-width: 0;
		display: grid;
		grid-template-columns: 28px 1fr;
		gap: 0.6rem;
		align-items: start;
		padding: 0.7rem 0.75rem;
		border: none;
		background: transparent;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}

	.notification-item__icon {
		width: 28px;
		height: 28px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5rem;
		background: rgba(52, 211, 153, 0.12);
		color: #34d399;
	}

	.notification-item[data-severity='warning'] .notification-item__icon {
		background: rgba(251, 191, 36, 0.12);
		color: #fbbf24;
	}

	.notification-item[data-severity='danger'] .notification-item__icon {
		background: rgba(248, 113, 113, 0.12);
		color: #f87171;
	}

	.notification-item__content {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.notification-item__content strong {
		color: #fff;
		font-size: 0.83rem;
		font-weight: 600;
		line-height: 1.35;
		letter-spacing: -0.01em;
	}

	.notification-item__content span {
		color: rgba(255, 255, 255, 0.62);
		font-size: 0.78rem;
		line-height: 1.4;
	}

	.notification-item__content time {
		margin-top: 0.1rem;
		color: rgba(255, 255, 255, 0.36);
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	/* Actions sit in a row BELOW the content (right-aligned), separated by a
	   hairline — so the title above always gets the full panel width. */
	.notification-item__actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.35rem;
		padding: 0.4rem 0.6rem 0.55rem;
		margin-top: -0.1rem;
	}

	.notification-item__read {
		margin-right: auto;
		padding: 0.32rem 0.55rem;
		border: 1px solid rgba(197, 160, 89, 0.26);
		border-radius: 0.45rem;
		background: rgba(197, 160, 89, 0.08);
		color: #f8e2ac;
		font-size: 0.68rem;
		font-weight: 700;
		cursor: pointer;
		white-space: nowrap;
	}

	.notification-item__act {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.4rem;
		background: rgba(255, 255, 255, 0.04);
		color: rgba(255, 255, 255, 0.62);
		cursor: pointer;
		transition:
			background 0.15s ease,
			color 0.15s ease,
			border-color 0.15s ease;
	}

	.notification-item__act:hover {
		background: rgba(255, 255, 255, 0.09);
		color: #fff;
		border-color: rgba(255, 255, 255, 0.18);
	}

	.notification-item__act--danger:hover {
		background: rgba(248, 113, 113, 0.14);
		color: #fca5a5;
		border-color: rgba(248, 113, 113, 0.32);
	}

	/* Holds the error, loading and list states for the selected folder. A
	   flex column with min-height 0 so the list keeps scrolling inside the
	   height-capped panel. */
	.notification-tabpanel {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		min-height: 0;
	}

	.notification-tabpanel:focus-visible {
		outline: 2px solid rgba(197, 160, 89, 0.6);
		outline-offset: -2px;
	}

	.notification-tabs {
		display: flex;
		gap: 0.25rem;
		padding: 0.3rem 0.85rem 0;
	}

	.notification-tab {
		padding: 0.4rem 0.65rem;
		border: none;
		border-bottom: 2px solid transparent;
		background: transparent;
		color: rgba(255, 255, 255, 0.55);
		font-size: 0.8rem;
		font-weight: 700;
		cursor: pointer;
		transition:
			color 0.15s ease,
			border-color 0.15s ease;
	}

	.notification-tab:hover {
		color: rgba(255, 255, 255, 0.82);
	}

	.notification-tab.active {
		color: #f8e2ac;
		border-bottom-color: rgba(197, 160, 89, 0.7);
	}

	.notification-empty {
		min-height: 230px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 2rem;
		color: rgba(255, 255, 255, 0.44);
		text-align: center;
	}

	.notification-empty strong {
		color: #fff;
		font-size: 0.98rem;
	}

	.notification-empty span {
		max-width: 260px;
		font-size: 0.82rem;
		line-height: 1.45;
	}

	/* The panel always opens rightward from the bell's left edge (`left: 0`), so
	   it never gets flung across the page or clipped on the left. The only
	   responsive concern is width: shrink it as the viewport narrows. The
	   `min(…, 100vw - 1.5rem)` + `max-width` on the base rule already cap it to
	   the viewport, so these queries just tighten the cap on small screens. */
	@media (max-width: 480px) {
		.notification-panel {
			/* Keep the measured anchor clamp here too: this rule wins the
			   cascade, and without the var the panel overflowed 390px phones
			   (bell at x=80 + 320px width = right edge at 400). */
			width: min(320px, calc(100vw - 1.5rem), var(--panel-max-width, 320px));
			max-height: min(75vh, calc(100vh - 6rem), var(--panel-max-height, 75vh));
		}
	}
</style>
