<script lang="ts">
	interface Props {
		coverImage: string;
		coverImageAlt: string;
		coverImageCaption: string;
		/** Post title, only used to flag an alt text that merely repeats it. */
		title?: string;
		/** Real dimensions of the picked media item, when known (the server stores them on save). */
		dimensions?: { width: number | null; height: number | null } | null;
		onPick?: () => void;
		onChange?: () => void;
	}

	let {
		coverImage = $bindable(),
		coverImageAlt = $bindable(),
		coverImageCaption = $bindable(),
		title = '',
		dimensions = null,
		onPick,
		onChange
	}: Props = $props();

	let failedUrl = $state('');
	let loadFailed = $derived(Boolean(coverImage) && failedUrl === coverImage);
	let aspect = $derived(
		dimensions?.width && dimensions.height ? `${dimensions.width} / ${dimensions.height}` : '16 / 9'
	);
	let altMissing = $derived(coverImage.trim() !== '' && coverImageAlt.trim() === '');
	let altEqualsTitle = $derived(
		coverImageAlt.trim() !== '' &&
			title.trim() !== '' &&
			coverImageAlt.trim().toLowerCase() === title.trim().toLowerCase()
	);

	function remove() {
		coverImage = '';
		coverImageAlt = '';
		coverImageCaption = '';
		onChange?.();
	}
</script>

<div class="featured-panel" data-testid="featured-image-panel">
	{#if coverImage}
		<div class="preview" style:aspect-ratio={aspect}>
			{#if loadFailed}
				<p class="preview-error" role="alert">
					The image could not be loaded from <code>{coverImage}</code>.
				</p>
			{:else}
				<img
					src={coverImage}
					alt={coverImageAlt}
					style:aspect-ratio={aspect}
					decoding="async"
					onerror={() => (failedUrl = coverImage)}
				/>
			{/if}
		</div>
		{#if dimensions?.width && dimensions.height}
			<p class="meta" data-testid="featured-image-dimensions">
				{dimensions.width} &times; {dimensions.height} px
			</p>
		{/if}
	{/if}

	<div class="actions">
		{#if onPick}
			<button type="button" class="btn" onclick={onPick}>
				{coverImage ? 'Replace image' : 'Choose from Media Library'}
			</button>
		{/if}
		{#if coverImage}
			<button type="button" class="btn danger" onclick={remove}>Remove</button>
		{/if}
	</div>

	<label class="field">
		<span class="label">Cover Image URL</span>
		<input
			type="url"
			class="input"
			placeholder="https://..."
			bind:value={coverImage}
			oninput={() => onChange?.()}
		/>
	</label>

	<label class="field">
		<span class="label">
			Alt Text
			<span class={['required', { missing: altMissing }]}>
				{altMissing ? 'Required: add alt text to publish' : '(required, must differ from Title)'}
			</span>
		</span>
		<input
			type="text"
			class={['input', { invalid: altMissing }]}
			placeholder="Describe the image itself..."
			required={coverImage.trim() !== ''}
			aria-invalid={altMissing}
			bind:value={coverImageAlt}
			oninput={() => onChange?.()}
		/>
		{#if altEqualsTitle}
			<span class="hint warn">Alt text repeats the post title; describe the image instead.</span>
		{/if}
	</label>

	<label class="field">
		<span class="label">Caption (optional)</span>
		<input
			type="text"
			class="input"
			placeholder="Optional figure credit..."
			bind:value={coverImageCaption}
			oninput={() => onChange?.()}
		/>
	</label>
</div>

<style>
	.featured-panel {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.preview {
		width: 100%;
		border-radius: 8px;
		overflow: hidden;
		border: 1px solid var(--line);
		background: var(--bg);
	}

	.preview img {
		display: block;
		width: 100%;
		height: auto;
		object-fit: contain;
	}

	.preview-error {
		margin: 0;
		padding: 0.75rem;
		font-size: 0.78rem;
		color: var(--coral);
		overflow-wrap: anywhere;
	}

	.meta {
		margin: 0;
		font-size: 0.74rem;
		color: var(--muted);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.btn {
		flex: 1 1 auto;
		min-width: 0;
		padding: 0.4rem 0.65rem;
		border-radius: 6px;
		border: 1px solid var(--line-strong);
		background: var(--panel2);
		color: var(--text);
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
	}

	.btn.danger {
		border-color: var(--coral);
		background: transparent;
		color: var(--coral);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.label {
		font-size: 0.76rem;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.required {
		font-weight: 500;
		color: var(--muted);
	}

	.required.missing {
		color: var(--coral);
		font-weight: 700;
	}

	.input {
		padding: 0.45rem 0.65rem;
		border-radius: 6px;
		border: 1px solid var(--line-strong);
		background: var(--bg);
		color: var(--text);
		font-family: var(--font-sans);
		font-size: 0.84rem;
	}

	.input.invalid {
		border-color: var(--coral);
	}

	.hint.warn {
		font-size: 0.74rem;
		color: var(--coral);
	}
</style>
