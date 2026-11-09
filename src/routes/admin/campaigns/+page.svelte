<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import SEO from '#lib/components/SEO.svelte';
	import { toast } from '#lib/stores/toast.svelte.js';
	import { confirmAction } from '#lib/stores/confirm.svelte.js';
	import { isAuthError } from '#lib/utils/http-error.js';
	import { safeCtaHref } from '#lib/shared/safe-href.js';
	import {
		fetchCampaigns,
		fetchCampaign,
		fetchCampaignStats,
		createCampaignCmd,
		updateCampaignCmd,
		deleteCampaignCmd
	} from '#lib/remote/admin/campaigns.remote.js';

	const SESSION_EXPIRED_MSG = 'Your session expired. Please sign in again.';

	type CampaignRow = {
		id: number;
		name: string;
		type: string;
		status: string;
	};
	type VariantDraft = {
		clientId: number;
		key: string;
		weight: number;
		content: Record<string, unknown>;
	};
	type StatRow = { variantKey: string; impressions: number; conversions: number; ctr: number };

	// `loading` gates the first paint only. A refetch after save, archive or
	// delete sets `refreshing`, which dims the list in place: flipping
	// `loading` swapped the whole list for "Loading…" after every mutation.
	let loading = $state(true);
	let refreshing = $state(false);
	let loadError = $state<string | null>(null);
	let loadGeneration = 0;
	let campaigns = $state<CampaignRow[]>([]);

	// editingId: null = list; 0 = new; >0 = existing.
	let editingId = $state<number | null>(null);
	let saving = $state(false);
	let draftName = $state('');
	let draftType = $state<'popup' | 'cta_swap' | 'banner'>('popup');
	let draftStatus = $state<'draft' | 'active' | 'paused' | 'archived'>('draft');
	let draftPathPrefixes = $state('');
	let draftVariants = $state<VariantDraft[]>([]);
	let stats = $state.raw<StatRow[]>([]);
	let nextVariantClientId = 1;

	function handleRemoteError(err: unknown, msg: string): boolean {
		if (isAuthError(err)) {
			toast.error(SESSION_EXPIRED_MSG);
			void goto(resolve('/admin'), { refreshAll: true });
			return true;
		}
		toast.error(msg);
		return false;
	}

	onMount(() => {
		void load('initial');
	});

	async function load(mode: 'initial' | 'refresh') {
		const generation = ++loadGeneration;
		if (mode === 'initial') loading = true;
		else refreshing = true;
		loadError = null;
		try {
			const rows = (await fetchCampaigns()) as CampaignRow[];
			if (generation !== loadGeneration) return;
			campaigns = rows;
		} catch (err) {
			if (generation !== loadGeneration) return;
			if (isAuthError(err)) {
				loadError = SESSION_EXPIRED_MSG;
				void goto(resolve('/admin'), { refreshAll: true });
			} else {
				loadError = err instanceof Error ? err.message : 'Failed to load campaigns.';
			}
		} finally {
			if (generation === loadGeneration) {
				loading = false;
				refreshing = false;
			}
		}
	}

	function newVariant(key: string): VariantDraft {
		return { clientId: nextVariantClientId++, key, weight: 50, content: {} };
	}

	function variantKeyAt(index: number): string {
		let key = '';
		let remaining = index;
		do {
			key = String.fromCharCode(65 + (remaining % 26)) + key;
			remaining = Math.floor(remaining / 26) - 1;
		} while (remaining >= 0);
		return key;
	}

	function nextVariantKey(): string {
		const used = new Set(draftVariants.map((variant) => variant.key));
		let index = 0;
		while (used.has(variantKeyAt(index))) index += 1;
		return variantKeyAt(index);
	}

	function startNew() {
		editingId = 0;
		draftName = '';
		draftType = 'popup';
		draftStatus = 'draft';
		draftPathPrefixes = '';
		draftVariants = [newVariant('A'), newVariant('B')];
		stats = [];
	}

	async function startEdit(id: number) {
		try {
			const [c, st] = await Promise.all([fetchCampaign({ id }), fetchCampaignStats({ id })]);
			if (!c) {
				toast.error('Campaign not found');
				return;
			}
			editingId = id;
			draftName = c.name;
			draftType = c.type as typeof draftType;
			draftStatus = c.status as typeof draftStatus;
			const targeting = (c.targetingJson ?? {}) as { pathPrefixes?: string[] };
			draftPathPrefixes = (targeting.pathPrefixes ?? []).join(', ');
			draftVariants = c.variants.map((v) => ({
				clientId: nextVariantClientId++,
				key: v.key,
				weight: v.weight,
				content: (v.contentJson as Record<string, unknown>) ?? {}
			}));
			stats = st as StatRow[];
		} catch (err) {
			handleRemoteError(err, 'Failed to open campaign');
		}
	}

	function cancelEdit() {
		editingId = null;
	}

	function addVariant() {
		draftVariants = [...draftVariants, newVariant(nextVariantKey())];
	}
	function removeVariant(i: number) {
		draftVariants = draftVariants.filter((_, idx) => idx !== i);
	}

	// Content is edited as simple key fields per type.
	function contentField(v: VariantDraft, key: string): string {
		const val = v.content[key];
		return typeof val === 'string' ? val : '';
	}
	function setContentField(i: number, key: string, value: string) {
		draftVariants = draftVariants.map((v, idx) =>
			idx === i ? { ...v, content: { ...v.content, [key]: value } } : v
		);
	}

	async function save() {
		if (!draftName.trim()) {
			toast.error('Name is required');
			return;
		}
		// The schema refuses these too, but a refused command only reaches the
		// operator as a generic failure, so say which variant and why.
		const unsafeLink = draftVariants.find(
			(v) => contentField(v, 'ctaHref').trim() !== '' && !safeCtaHref(v.content['ctaHref'])
		);
		if (unsafeLink) {
			toast.error(
				`Variant ${unsafeLink.key}: CTA link must be a relative path or an http(s), mailto: or tel: link`
			);
			return;
		}
		saving = true;
		try {
			const pathPrefixes = draftPathPrefixes
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
			const payload = {
				name: draftName.trim(),
				type: draftType,
				status: draftStatus,
				targeting: pathPrefixes.length ? { pathPrefixes, device: 'any' as const } : undefined,
				variants: draftVariants.map((v) => ({ key: v.key, weight: v.weight, content: v.content }))
			};
			if (editingId && editingId > 0) {
				await updateCampaignCmd({ id: editingId, ...payload });
				toast.success('Campaign updated');
			} else {
				await createCampaignCmd(payload);
				toast.success('Campaign created');
			}
			editingId = null;
			await load('refresh');
		} catch (err) {
			handleRemoteError(err, 'Failed to save campaign');
		} finally {
			saving = false;
		}
	}

	async function handleDelete(id: number) {
		const ok = await confirmAction({
			title: 'Archive campaign?',
			message: 'This removes it from the site. Stats are retained.',
			confirmLabel: 'Archive',
			tone: 'danger'
		});
		if (!ok) return;
		try {
			await deleteCampaignCmd({ id });
			toast.success('Campaign archived');
			await load('refresh');
		} catch (err) {
			handleRemoteError(err, 'Failed to archive campaign');
		}
	}

	// Field set shown in the editor depends on campaign type.
	let contentKeys = $derived<Array<[string, string]>>(
		draftType === 'banner'
			? [
					['text', 'Banner text'],
					['ctaLabel', 'CTA label'],
					['ctaHref', 'CTA link']
				]
			: [
					['heading', 'Heading'],
					['body', 'Body'],
					['ctaLabel', 'CTA label'],
					['ctaHref', 'CTA link']
				]
	);
</script>

<SEO title="Campaigns | Admin" description="Marketing campaigns" noindex={true} />

<div class="page">
	{#if editingId === null}
		<header class="page__head">
			<div>
				<h1>Campaigns</h1>
				<p class="page__sub">Popups, banners, and CTA swaps with A/B testing.</p>
			</div>
			<button type="button" class="btn btn--primary" onclick={startNew}>New campaign</button>
		</header>

		{#if loading}
			<p class="state">Loading…</p>
		{:else if loadError}
			<p class="state state--error">{loadError}</p>
		{:else if campaigns.length === 0}
			<p class="state">No campaigns yet.</p>
		{:else}
			<div class={['table-wrap', { 'is-refreshing': refreshing }]} aria-busy={refreshing}>
				<table class="tbl">
					<thead>
						<tr>
							<th>Name</th>
							<th>Type</th>
							<th>Status</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each campaigns as c (c.id)}
							<tr>
								<td>{c.name}</td>
								<td class="muted">{c.type}</td>
								<td><span class="badge badge--{c.status}">{c.status}</span></td>
								<td class="row-actions">
									<button type="button" class="link" onclick={() => startEdit(c.id)}>Edit</button>
									<button
										type="button"
										class="link link--danger"
										onclick={() => handleDelete(c.id)}
									>
										Archive
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{:else}
		<header class="page__head">
			<div>
				<h1>{editingId > 0 ? 'Edit campaign' : 'New campaign'}</h1>
				<p class="page__sub">Variant assignment is server-side (no layout shift).</p>
			</div>
			<div class="page__actions">
				<button type="button" class="btn" onclick={cancelEdit} disabled={saving}>Cancel</button>
				<button type="button" class="btn btn--primary" onclick={save} disabled={saving}>
					{saving ? 'Saving…' : 'Save'}
				</button>
			</div>
		</header>

		<div class="form">
			<div class="field">
				<label for="c-name">Name</label>
				<input id="c-name" name="campaignName" type="text" bind:value={draftName} placeholder="Spring promo" />
			</div>
			<div class="field field--row">
				<div>
					<label for="c-type">Type</label>
					<select id="c-type" name="campaignType" bind:value={draftType}>
						<option value="popup">Popup</option>
						<option value="banner">Banner</option>
						<option value="cta_swap">CTA swap</option>
					</select>
				</div>
				<div>
					<label for="c-status">Status</label>
					<select id="c-status" name="campaignStatus" bind:value={draftStatus}>
						<option value="draft">Draft</option>
						<option value="active">Active</option>
						<option value="paused">Paused</option>
					</select>
				</div>
			</div>
			<div class="field">
				<label for="c-paths">Path prefixes (comma-separated, blank = all pages)</label>
				<input
					id="c-paths"
					name="campaignPathPrefixes"
					type="text"
					bind:value={draftPathPrefixes}
					placeholder="/services, /blog"
				/>
			</div>

			<h2 class="sub-head">Variants (A/B)</h2>
			{#each draftVariants as v, i (v.clientId)}
				<div class="variant">
					<div class="variant__top">
						<span class="variant__key">Variant {v.key}</span>
						<label class="variant__weight" for={`c-variant-${v.clientId}-weight`}>
							Weight
							<input
								id={`c-variant-${v.clientId}-weight`}
								name={`variantWeight_${v.clientId}`}
								type="number"
								min="0"
								max="100"
								bind:value={v.weight}
							/>
						</label>
						{#if draftVariants.length > 1}
							<button type="button" class="link link--danger" onclick={() => removeVariant(i)}>
								Remove
							</button>
						{/if}
					</div>
					{#each contentKeys as [key, label] (key)}
						<label class="variant__field" for={`c-variant-${v.clientId}-${key}`}>
							<span>{label}</span>
							<input
								id={`c-variant-${v.clientId}-${key}`}
								name={`variant_${v.clientId}_${key}`}
								type="text"
								value={contentField(v, key)}
								oninput={(e) => setContentField(i, key, e.currentTarget.value)}
							/>
						</label>
					{/each}
				</div>
			{/each}
			<button type="button" class="btn" onclick={addVariant}>Add variant</button>

			{#if editingId > 0 && stats.length}
				<h2 class="sub-head">Performance</h2>
				<div class="table-wrap">
					<table class="tbl">
						<thead>
							<tr><th>Variant</th><th>Impressions</th><th>Conversions</th><th>CTR</th></tr>
						</thead>
						<tbody>
							{#each stats as s (s.variantKey)}
								<tr>
									<td>{s.variantKey}</td>
									<td>{s.impressions}</td>
									<td>{s.conversions}</td>
									<td>{s.ctr}%</td>
								</tr>
							{/each}
						</tbody>
					</table>
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
	}
	.btn {
		padding: 0.5rem 1rem;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		color: rgba(255, 255, 255, 0.85);
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
	}
	.btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
	}
	.btn--primary {
		background: rgba(197, 160, 89, 0.14);
		border-color: rgba(197, 160, 89, 0.4);
		color: #c5a059;
	}
	.btn--primary:hover:not(:disabled) {
		background: rgba(197, 160, 89, 0.22);
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
	.muted {
		color: rgba(255, 255, 255, 0.5);
		font-family: var(--font-sans);
		font-size: 0.8rem;
	}
	.badge {
		display: inline-block;
		padding: 0.15rem 0.55rem;
		border-radius: 999px;
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: capitalize;
		background: rgba(255, 255, 255, 0.07);
		color: rgba(255, 255, 255, 0.55);
	}
	.badge--active {
		background: rgba(52, 211, 153, 0.12);
		color: #34d399;
	}
	.badge--paused {
		background: rgba(234, 179, 8, 0.12);
		color: #eab308;
	}
	.row-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
	}
	.link {
		background: none;
		border: none;
		color: #c5a059;
		cursor: pointer;
		font-size: 0.8125rem;
		font-weight: 600;
		padding: 0;
	}
	.link:hover {
		text-decoration: underline;
	}
	.link--danger {
		color: #f87171;
	}
	.form {
		max-width: 720px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.field--row {
		flex-direction: row;
		gap: 1.5rem;
	}
	.field label,
	.sub-head {
		font-size: 0.8rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.55);
	}
	.sub-head {
		margin: 1rem 0 0;
		font-size: 1rem;
		color: #fff;
	}
	input[type='text'],
	input[type='number'],
	select {
		padding: 0.5rem 0.75rem;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.5rem;
		color: #fff;
		font-size: 0.875rem;
		font-family: inherit;
	}
	input:focus,
	select:focus {
		outline: none;
		border-color: #c5a059;
	}
	input[type='number'] {
		width: 80px;
	}
	.variant {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.75rem;
		background: rgba(255, 255, 255, 0.015);
	}
	.variant__top {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.variant__key {
		font-weight: 700;
		color: #c5a059;
		font-size: 0.85rem;
	}
	.variant__weight {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.6);
		margin-inline-start: auto;
	}
	.variant__field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.78rem;
		color: rgba(255, 255, 255, 0.55);
	}
</style>
