<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import SEO from '#lib/components/SEO.svelte';
	import { toast } from '#lib/stores/toast.svelte.js';
	import { confirmAction } from '#lib/stores/confirm.svelte.js';
	import { isAuthError, refusalMessage } from '#lib/utils/http-error.js';
	import {
		fetchSequences,
		fetchSequence,
		createSequenceCmd,
		updateSequenceCmd,
		deleteSequenceCmd
	} from '#lib/remote/admin/sequences.remote.js';

	const SESSION_EXPIRED_MSG = 'Your session expired. Please sign in again.';

	type SequenceRow = {
		id: number;
		name: string;
		triggerSource: string;
		isActive: boolean;
		stepCount: number;
	};
	type StepDraft = {
		clientId: number;
		delayDays: number;
		subject: string;
		bodyHtml: string;
		isActive: boolean;
	};

	// `loading` gates the first paint only. A refetch after save, archive or
	// delete sets `refreshing`, which dims the list in place: flipping
	// `loading` swapped the whole list for "Loading…" after every mutation.
	let loading = $state(true);
	let refreshing = $state(false);
	let loadError = $state<string | null>(null);
	let loadGeneration = 0;
	let sequences = $state<SequenceRow[]>([]);

	// Editor state. editingId === null = list view; 0 = new; >0 = existing.
	let editingId = $state<number | null>(null);
	let saving = $state(false);
	let draftName = $state('');
	let draftTrigger = $state('lead_magnet');
	let draftActive = $state(false);
	let draftSteps = $state<StepDraft[]>([]);
	let nextStepClientId = 1;

	function newStep(): StepDraft {
		return {
			clientId: nextStepClientId++,
			delayDays: 7,
			subject: '',
			bodyHtml: '',
			isActive: true
		};
	}

	function handleRemoteError(err: unknown, fallbackMsg: string): boolean {
		if (isAuthError(err)) {
			toast.error(SESSION_EXPIRED_MSG);
			void goto(resolve('/admin'), { refreshAll: true });
			return true;
		}
		toast.error(refusalMessage(err, fallbackMsg));
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
			const rows = (await fetchSequences()) as SequenceRow[];
			if (generation !== loadGeneration) return;
			sequences = rows;
		} catch (err) {
			if (generation !== loadGeneration) return;
			if (isAuthError(err)) {
				loadError = SESSION_EXPIRED_MSG;
				void goto(resolve('/admin'), { refreshAll: true });
			} else {
				loadError = err instanceof Error ? err.message : 'Failed to load sequences.';
			}
		} finally {
			if (generation === loadGeneration) {
				loading = false;
				refreshing = false;
			}
		}
	}

	function startNew() {
		editingId = 0;
		draftName = '';
		draftTrigger = 'lead_magnet';
		draftActive = false;
		draftSteps = [newStep()];
	}

	async function startEdit(id: number) {
		try {
			const seq = await fetchSequence({ id });
			if (!seq) {
				toast.error('Sequence not found');
				return;
			}
			editingId = id;
			draftName = seq.name;
			draftTrigger = seq.triggerSource;
			draftActive = seq.isActive;
			draftSteps = seq.steps.map((s) => ({
				clientId: nextStepClientId++,
				delayDays: s.delayDays,
				subject: s.subject,
				bodyHtml: s.bodyHtml,
				isActive: s.isActive
			}));
		} catch (err) {
			handleRemoteError(err, 'Failed to open sequence');
		}
	}

	function cancelEdit() {
		editingId = null;
	}

	function addStep() {
		draftSteps = [...draftSteps, newStep()];
	}

	function removeStep(index: number) {
		draftSteps = draftSteps.filter((_, i) => i !== index);
	}

	async function save() {
		if (!draftName.trim()) {
			toast.error('Name is required');
			return;
		}
		if (draftSteps.some((s) => !s.subject.trim() || !s.bodyHtml.trim())) {
			toast.error('Every step needs a subject and body');
			return;
		}
		saving = true;
		try {
			const payload = {
				name: draftName.trim(),
				triggerSource: draftTrigger.trim() || 'lead_magnet',
				isActive: draftActive,
				steps: draftSteps.map((s, stepIndex) => ({
					stepIndex,
					delayDays: s.delayDays,
					subject: s.subject,
					bodyHtml: s.bodyHtml,
					isActive: s.isActive
				}))
			};
			if (editingId && editingId > 0) {
				await updateSequenceCmd({ id: editingId, ...payload });
				toast.success('Sequence updated');
			} else {
				await createSequenceCmd(payload);
				toast.success('Sequence created');
			}
			editingId = null;
			await load('refresh');
		} catch (err) {
			handleRemoteError(err, 'Failed to save sequence');
		} finally {
			saving = false;
		}
	}

	async function handleDelete(id: number) {
		const ok = await confirmAction({
			title: 'Delete sequence?',
			message:
				'This removes the sequence, its steps, and all recipient enrollments. This cannot be undone.',
			confirmLabel: 'Delete',
			tone: 'danger'
		});
		if (!ok) return;
		try {
			await deleteSequenceCmd({ id });
			toast.success('Sequence deleted');
			await load('refresh');
		} catch (err) {
			handleRemoteError(err, 'Failed to delete sequence');
		}
	}
</script>

<SEO title="Email Sequences | Admin" description="Drip follow-up sequences" noindex={true} />

<div class="page">
	{#if editingId === null}
		<header class="page__head">
			<div>
				<h1>Email Sequences</h1>
				<p class="page__sub">Automated weekly follow-up emails sent to subscribers.</p>
			</div>
			<button type="button" class="btn btn--primary" onclick={startNew}>New sequence</button>
		</header>

		{#if loading}
			<p class="state">Loading…</p>
		{:else if loadError}
			<p class="state state--error">{loadError}</p>
		{:else if sequences.length === 0}
			<p class="state">No sequences yet. Create one to start sending weekly follow-ups.</p>
		{:else}
			<div class={['table-wrap', { 'is-refreshing': refreshing }]} aria-busy={refreshing}>
				<table class="tbl">
					<thead>
						<tr>
							<th>Name</th>
							<th>Trigger</th>
							<th>Steps</th>
							<th>Status</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each sequences as seq (seq.id)}
							<tr>
								<td>{seq.name}</td>
								<td class="muted">{seq.triggerSource}</td>
								<td>{seq.stepCount}</td>
								<td>
									<span class={['badge', { 'badge--active': seq.isActive }]}>
										{seq.isActive ? 'Active' : 'Inactive'}
									</span>
								</td>
								<td class="row-actions">
									<button type="button" class="link" onclick={() => startEdit(seq.id)}>Edit</button>
									<button
										type="button"
										class="link link--danger"
										onclick={() => handleDelete(seq.id)}
									>
										Delete
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
				<h1>{editingId > 0 ? 'Edit sequence' : 'New sequence'}</h1>
				<p class="page__sub">Each step sends N days after the previous one.</p>
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
				<label for="seq-name">Name</label>
				<input id="seq-name" name="sequenceName" type="text" bind:value={draftName} placeholder="Lead Nurture" />
			</div>
			<div class="field field--row">
				<div>
					<label for="seq-trigger">Trigger source</label>
					<input id="seq-trigger" name="sequenceTrigger" type="text" bind:value={draftTrigger} />
				</div>
				<label class="checkbox" for="seq-active">
					<input id="seq-active" name="sequenceActive" type="checkbox" bind:checked={draftActive} />
					Active (only one per trigger)
				</label>
			</div>

			<h2 class="steps-head">Steps</h2>
			{#each draftSteps as step, i (step.clientId)}
				<div class="step">
					<div class="step__top">
						<span class="step__num">Step {i + 1}</span>
						<label class="step__delay" for="seq-step-{step.clientId}-delay">
							Send
							<input
								id="seq-step-{step.clientId}-delay"
								name="stepDelay_{step.clientId}"
								type="number"
								min="0"
								max="365"
								bind:value={step.delayDays}
							/>
							days after {i === 0 ? 'signup' : 'previous'}
						</label>
						<button type="button" class="link link--danger" onclick={() => removeStep(i)}>
							Remove
						</button>
					</div>
					<label class="sr-only" for="seq-step-{step.clientId}-subject">Step {i + 1} subject</label>
					<input
						id="seq-step-{step.clientId}-subject"
						name="stepSubject_{step.clientId}"
						type="text"
						class="step__subject"
						bind:value={step.subject}
						placeholder="Subject"
					/>
					<label class="sr-only" for="seq-step-{step.clientId}-body">Step {i + 1} body</label>
					<textarea
						id="seq-step-{step.clientId}-body"
						name="stepBody_{step.clientId}"
						class="step__body"
						bind:value={step.bodyHtml}
						rows="6"
						placeholder="Email body (HTML allowed)"></textarea>
				</div>
			{/each}
			<button type="button" class="btn" onclick={addStep}>Add step</button>
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
		transition: background 0.15s ease;
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
		background: rgba(255, 255, 255, 0.07);
		color: rgba(255, 255, 255, 0.55);
	}
	.badge--active {
		background: rgba(52, 211, 153, 0.12);
		color: #34d399;
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
		align-items: flex-end;
		gap: 1.5rem;
	}
	.field label,
	.steps-head {
		font-size: 0.8rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.55);
	}
	.steps-head {
		margin: 1rem 0 0;
		font-size: 1rem;
		color: #fff;
	}
	.checkbox {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.7);
	}
	input[type='text'],
	input[type='number'],
	textarea {
		padding: 0.5rem 0.75rem;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.5rem;
		color: #fff;
		font-size: 0.875rem;
		font-family: inherit;
	}
	input:focus,
	textarea:focus {
		outline: none;
		border-color: #c5a059;
	}
	input[type='number'] {
		width: 70px;
	}
	.step {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.75rem;
		background: rgba(255, 255, 255, 0.015);
	}
	.step__top {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.step__num {
		font-weight: 700;
		color: #c5a059;
		font-size: 0.85rem;
	}
	.step__delay {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.6);
		margin-inline-start: auto;
	}
	.step__body {
		resize: vertical;
		font-family: var(--font-sans);
		font-size: 0.82rem;
		line-height: 1.5;
	}
</style>
