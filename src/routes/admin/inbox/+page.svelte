<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import SEO from '#lib/components/SEO.svelte';
	import { toast } from '#lib/stores/toast.svelte.js';
	import { confirmAction } from '#lib/stores/confirm.svelte.js';
	import { isAuthError, refusalMessage } from '#lib/utils/http-error.js';
	import {
		fetchContacts,
		fetchContactCounts,
		fetchContact,
		markRead,
		archiveContactCmd,
		deleteContact
	} from '#lib/remote/admin/contacts.remote.js';
	import type { ContactSubmission } from '#lib/types/db.js';

	const SESSION_EXPIRED_MSG = 'Your session expired. Please sign in again.';

	/**
	 * A remote-function call failed. If it's a 401/403 the admin session lapsed
	 *, surface a re-auth prompt and bounce to `/admin` (where the layout shows
	 * the inline login form), instead of a generic "failed" message. `goto` with
	 * `refreshAll` re-runs the layout load so the gate re-reads the session.
	 * Returns true if it handled an auth error, so callers can stop.
	 */
	function handleRemoteError(err: unknown, fallbackMsg: string): boolean {
		if (isAuthError(err)) {
			toast.error(SESSION_EXPIRED_MSG);
			void goto(resolve('/admin'));
			return true;
		}
		toast.error(refusalMessage(err, fallbackMsg));
		return false;
	}

	// `loading` gates the FIRST paint only. Changing the filter sets
	// `refreshing` instead: flipping `loading` replaced the message list and
	// the open message with a full-page spinner on every filter change, so
	// the reader lost the message they were on and watched the pane blank out
	// for the length of the round trip.
	let loading = $state(true);
	let refreshing = $state(false);
	let loadError = $state<string | null>(null);
	let loadGeneration = 0;
	let disposed = false;
	let contacts = $state<ContactSubmission[]>([]);
	// True totals from count(*) on the server. The list fetch is capped
	// (50 rows), so header counts derived from `contacts` would lie once
	// the inbox outgrows the cap.
	let totalCount = $state(0);
	let unreadCount = $state(0);
	let filterStatus = $state('');
	let selectedContact = $state<ContactSubmission | null>(null);
	const contactMutationVersions: Record<number, number> = {};

	/**
	 * Notification deep links (`/admin/inbox?contact=<id>`, written by
	 * services/notifications.ts notifyNewContact). A link whose message cannot
	 * be opened says why in `linkNotice` rather than doing nothing.
	 */
	let linkNotice = $state<string | null>(null);
	let linkGeneration = 0;
	let requestedContact = $derived(page.url.searchParams.get('contact'));

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

	onMount(() => {
		// Remote queries cannot be awaited from inside the mount effect context.
		const initialLoad = setTimeout(() => void loadContacts('initial'), 0);
		return () => {
			disposed = true;
			loadGeneration++;
			linkGeneration++;
			clearTimeout(initialLoad);
		};
	});

	// Act on `?contact=` once the list is on screen, and again whenever a link
	// arrives while the inbox is already open: a same-route navigation reuses
	// this component instead of remounting it, so onMount does not run again.
	$effect(() => {
		const raw = requestedContact;
		if (raw === null || loading || loadError) return;
		// Remote queries are awaited outside the effect context, as in onMount.
		const timer = setTimeout(() => void openLinkedContact(raw), 0);
		return () => clearTimeout(timer);
	});

	/** Remove one consumed query parameter, keeping every other one. */
	async function dropQueryParam(name: string): Promise<void> {
		if (!page.url.searchParams.has(name)) return;
		// `page.url` is read-only in SvelteKit 3: edit a copy.
		const next = new URL(page.url.href);
		next.searchParams.delete(name);
		await goto(resolve(`${next.pathname}${next.search}${next.hash}` as '/'), {
			replace: true,
			reset: false
		});
	}

	async function openLinkedContact(raw: string): Promise<void> {
		if (disposed) return;
		const generation = ++linkGeneration;
		// Consume the parameter first so a later link to the same message is a
		// new URL (and so a reload does not replay this one).
		await dropQueryParam('contact');
		if (disposed || generation !== linkGeneration) return;
		linkNotice = null;
		const id = Number(raw);
		if (!Number.isSafeInteger(id) || id <= 0) {
			linkNotice = 'This link does not name a valid message.';
			return;
		}
		let linked = contacts.find((c) => c.id === id) ?? null;
		if (!linked) {
			try {
				// The list is capped and filtered, so an older or differently
				// filed message is looked up directly.
				const query = fetchContact({ id });
				await query.refresh();
				linked = await query;
			} catch (err) {
				if (disposed || generation !== linkGeneration) return;
				if (isAuthError(err)) handleRemoteError(err, SESSION_EXPIRED_MSG);
				else linkNotice = `Could not open message #${id}. Please try again.`;
				return;
			}
			if (disposed || generation !== linkGeneration) return;
			if (!linked) {
				linkNotice = `Message #${id} no longer exists. It may have been deleted.`;
				return;
			}
		}
		selectContact(linked);
		await tick();
		document.getElementById('inbox-detail-heading')?.focus();
	}

	/**
	 * `mode` is passed explicitly at every call site rather than defaulted:
	 * binding this function directly as a change handler would otherwise hand
	 * the DOM Event in as the first argument.
	 */
	async function loadContacts(mode: 'initial' | 'refresh') {
		if (disposed) return;
		const generation = ++loadGeneration;
		if (mode === 'initial') loading = true;
		else refreshing = true;
		loadError = null;
		try {
			const filters: { status?: 'unread' | 'read' | 'archived'; limit?: number; offset?: number } =
				{};
			if (filterStatus === 'unread' || filterStatus === 'read' || filterStatus === 'archived') {
				filters.status = filterStatus;
			}
			const listQuery = fetchContacts(filters);
			const countsQuery = fetchContactCounts();
			const [list, counts] = await withTimeout(
				(async () => {
					// Reusing query arguments can return a cached pre-mutation list.
					await Promise.all([listQuery.refresh(), countsQuery.refresh()]);
					return Promise.all([listQuery, countsQuery]);
				})()
			);
			if (disposed || generation !== loadGeneration) return;
			contacts = list;
			totalCount = counts.total;
			unreadCount = counts.unread;
		} catch (err) {
			if (disposed || generation !== loadGeneration) return;
			if (isAuthError(err)) {
				loadError = SESSION_EXPIRED_MSG;
				void goto(resolve('/admin'));
			} else {
				console.error('Failed to load contacts:', err);
				loadError = err instanceof Error ? err.message : 'Failed to load contacts. Please refresh.';
			}
		} finally {
			if (!disposed && generation === loadGeneration) {
				loading = false;
				refreshing = false;
			}
		}
	}

	async function handleMarkRead(id: number) {
		const version = contactMutationVersions[id] ?? 0;
		try {
			const updated = await markRead({ id });
			// Archive/delete wins over the automatic read request started on selection.
			if (disposed || version !== (contactMutationVersions[id] ?? 0)) return;
			const wasUnread = contacts.some((c) => c.id === id && c.status === 'unread');
			if (wasUnread) unreadCount = Math.max(0, unreadCount - 1);
			contacts = contacts.map((c) =>
				c.id === id && c.status === 'unread'
					? { ...c, status: updated.status, readAt: updated.readAt }
					: c
			);
			if (selectedContact?.id === id && selectedContact.status === 'unread') {
				selectedContact = {
					...selectedContact,
					status: updated.status,
					readAt: updated.readAt
				};
			}
			toast.success('Marked as read');
			await loadContacts('refresh');
		} catch (err) {
			handleRemoteError(err, 'Failed to mark as read');
		}
	}

	async function handleArchive(id: number) {
		try {
			await archiveContactCmd({ id });
			contactMutationVersions[id] = (contactMutationVersions[id] ?? 0) + 1;
			const wasUnread = contacts.some((c) => c.id === id && c.status === 'unread');
			if (wasUnread) unreadCount = Math.max(0, unreadCount - 1);
			contacts = contacts.map((c) => (c.id === id ? { ...c, status: 'archived' } : c));
			if (selectedContact?.id === id) selectedContact = null;
			toast.success('Archived');
			await loadContacts('refresh');
		} catch (err) {
			handleRemoteError(err, 'Failed to archive');
		}
	}

	async function handleDelete(id: number) {
		const ok = await confirmAction({
			title: 'Delete message permanently?',
			message: 'This message will be removed forever. This cannot be undone.',
			confirmLabel: 'Delete forever',
			tone: 'danger'
		});
		if (!ok) return;
		try {
			await deleteContact({ id });
			contactMutationVersions[id] = (contactMutationVersions[id] ?? 0) + 1;
			const wasUnread = contacts.some((c) => c.id === id && c.status === 'unread');
			if (wasUnread) unreadCount = Math.max(0, unreadCount - 1);
			totalCount = Math.max(0, totalCount - 1);
			contacts = contacts.filter((c) => c.id !== id);
			if (selectedContact?.id === id) selectedContact = null;
			toast.success('Deleted');
			await loadContacts('refresh');
		} catch (err) {
			handleRemoteError(err, 'Failed to delete');
		}
	}

	function selectContact(contact: ContactSubmission) {
		linkNotice = null;
		selectedContact = contact;
		if (contact.status === 'unread') {
			handleMarkRead(contact.id);
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

	function timeAgo(date: Date | null): string {
		if (!date) return '';
		const d = new Date(date);
		const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
		if (seconds < 60) return 'just now';
		if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
		if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
		return Math.floor(seconds / 86400) + 'd ago';
	}
</script>

<SEO title="Inbox | Admin" description="Contact form submissions" noindex={true} />

<div class="inbox-page">
	<header class="inbox-page__header">
		<div>
			<h1>Inbox</h1>
			<p class="inbox-page__subtitle">
				{unreadCount} unread of {totalCount} messages{#if contacts.length < totalCount}
					· showing latest {contacts.length}{/if}
			</p>
		</div>
		<div class="inbox-page__actions">
			<label for="inboxFilter" class="sr-only">Filter messages</label>
			<select
				id="inboxFilter"
				name="inboxFilter"
				class="filter-select"
				bind:value={filterStatus}
				onchange={() => loadContacts('refresh')}
				disabled={refreshing}
			>
				<option value="">All messages</option>
				<option value="unread">Unread</option>
				<option value="read">Read</option>
				<option value="archived">Archived</option>
			</select>
		</div>
	</header>

	<div class="link-notice-region" role="status">
		{#if linkNotice}
			<div class="link-notice">
				<p>{linkNotice}</p>
				<button type="button" class="btn btn--ghost" onclick={() => (linkNotice = null)}
					>Dismiss</button
				>
			</div>
		{/if}
	</div>

	{#if loading}
		<div class="inbox-page__loading">
			<div class="spinner"></div>
			<p>Loading messages...</p>
		</div>
	{:else if loadError}
		<div class="inbox-page__error">
			<p class="inbox-page__error-msg">⚠ {loadError}</p>
			<button type="button" class="btn-action" onclick={() => loadContacts('initial')}>Retry</button
			>
		</div>
	{:else}
		<div class={['inbox-split', { 'is-refreshing': refreshing }]} aria-busy={refreshing}>
			<!-- Message List -->
			<div class="message-list">
				{#if contacts.length === 0}
					<div class="message-list__empty">No messages found.</div>
				{:else}
					{#each contacts as contact (contact.id)}
						<button
							type="button"
							class={[
								'message-item',
								{
									unread: contact.status === 'unread',
									selected: selectedContact?.id === contact.id
								}
							]}
							onclick={() => selectContact(contact)}
						>
							<div class="message-item__header">
								<span class="message-item__name">{contact.name}</span>
								<span class="message-item__time">{timeAgo(contact.createdAt)}</span>
							</div>
							<div class="message-item__email">{contact.email}</div>
							<div class="message-item__preview">
								{contact.message.slice(0, 80)}{contact.message.length > 80 ? '...' : ''}
							</div>
						</button>
					{/each}
				{/if}
			</div>

			<!-- Message Detail -->
			<div class="message-detail">
				{#if selectedContact}
					<div class="message-detail__header">
						<div>
							<h2 id="inbox-detail-heading" tabindex="-1">{selectedContact.name}</h2>
							<p class="message-detail__meta">
								<a href="mailto:{selectedContact.email}">{selectedContact.email}</a>
								{#if selectedContact.phone}
									· {selectedContact.phone}{/if}
								{#if selectedContact.company}
									· {selectedContact.company}{/if}
							</p>
							<p class="message-detail__date">{formatDate(selectedContact.createdAt)}</p>
						</div>
						<div class="message-detail__actions">
							<a href="mailto:{selectedContact.email}" class="btn btn--primary">Reply</a>
							<button
								type="button"
								class="btn btn--ghost"
								onclick={() => handleArchive(selectedContact!.id)}>Archive</button
							>
							<button
								type="button"
								class="btn btn--danger"
								onclick={() => handleDelete(selectedContact!.id)}>Delete</button
							>
						</div>
					</div>
					<div class="message-detail__body">
						{selectedContact.message}
					</div>
				{:else}
					<div class="message-detail__empty">
						<p>Select a message to read</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.inbox-page {
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
		height: calc(100vh - 1rem);
		display: flex;
		flex-direction: column;
	}

	.inbox-page__header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 1rem;
		flex-shrink: 0;
	}

	.inbox-page__header h1 {
		font-family: var(--font-heading);
		font-size: 1.75rem;
		font-weight: 700;
		color: #fff;
		margin: 0;
	}

	.inbox-page__subtitle {
		color: rgba(255, 255, 255, 0.45);
		font-size: 0.9rem;
		margin: 0.25rem 0 0;
	}

	.inbox-page__actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.filter-select {
		padding: 0.5rem 0.75rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.8);
		border-radius: 0.375rem;
		font-size: 0.85rem;
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

	.inbox-page__loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 4rem;
		color: rgba(255, 255, 255, 0.5);
		gap: 1rem;
	}
	.inbox-page__error {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		padding: 4rem 2rem;
	}
	.inbox-page__error-msg {
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

	/* Split Layout */
	/* Refetching after a filter change dims the list in place instead of
	   swapping it for a spinner, so the open message stays put. */
	.inbox-split.is-refreshing {
		opacity: 0.55;
		transition: opacity 0.15s ease;
	}
	@media (prefers-reduced-motion: reduce) {
		.inbox-split.is-refreshing {
			transition: none;
		}
	}

	.inbox-split {
		display: flex;
		gap: 0;
		margin-top: 1.5rem;
		flex: 1;
		min-height: 0;
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 0.75rem;
		overflow: hidden;
	}

	.message-list {
		width: 380px;
		flex-shrink: 0;
		border-right: 1px solid rgba(255, 255, 255, 0.06);
		overflow-y: auto;
		background: rgba(255, 255, 255, 0.01);
	}

	.message-list__empty {
		padding: 3rem;
		text-align: center;
		color: rgba(255, 255, 255, 0.3);
		font-size: 0.85rem;
	}

	.message-item {
		display: block;
		width: 100%;
		padding: 1rem 1.25rem;
		border: none;
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
		background: transparent;
		text-align: left;
		cursor: pointer;
		transition: background 0.1s ease;
		color: inherit;
		font-family: inherit;
	}

	.message-item:hover {
		background: rgba(255, 255, 255, 0.03);
	}
	.message-item.selected {
		background: rgba(197, 160, 89, 0.08);
	}

	.message-item.unread .message-item__name {
		color: #fff;
		font-weight: 700;
	}

	.message-item__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.25rem;
	}

	.message-item__name {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.75);
		font-weight: 500;
	}

	.message-item__time {
		font-size: 0.7rem;
		color: rgba(255, 255, 255, 0.3);
		flex-shrink: 0;
	}

	.message-item__email {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.35);
		margin-bottom: 0.375rem;
	}

	.message-item__preview {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.4);
		line-height: 1.4;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Detail Pane */
	.message-detail {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	.message-detail__empty {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		color: rgba(255, 255, 255, 0.25);
		font-size: 0.9rem;
	}

	.message-detail__header {
		padding: 1.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.message-detail__header h2 {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		font-weight: 700;
		color: #fff;
		margin: 0;
	}

	.message-detail__meta {
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.5);
		margin: 0.25rem 0 0;
	}

	.message-detail__meta a {
		color: #c5a059;
		text-decoration: none;
	}

	.message-detail__meta a:hover {
		text-decoration: underline;
	}

	.message-detail__date {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.3);
		margin: 0.25rem 0 0;
	}

	.message-detail__actions {
		display: flex;
		gap: 0.5rem;
	}

	.message-detail__body {
		padding: 1.5rem;
		font-size: 0.95rem;
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.7;
		white-space: pre-wrap;
		flex: 1;
	}

	.btn {
		padding: 0.5rem 0.875rem;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
	}

	.btn--primary {
		background: #c5a059;
		color: #0a0a0f;
	}
	.btn--primary:hover {
		background: #d4af6a;
	}

	.btn--ghost {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.7);
	}
	.btn--ghost:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
	}

	.btn--danger {
		background: rgba(220, 38, 38, 0.1);
		color: #f87171;
	}
	.btn--danger:hover {
		background: rgba(220, 38, 38, 0.2);
	}

	@media (max-width: 768px) {
		.inbox-page {
			padding: 1rem;
		}
		.message-list {
			width: 100%;
			border-right: none;
			border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		}
		.inbox-split {
			flex-direction: column;
		}
	}
</style>
