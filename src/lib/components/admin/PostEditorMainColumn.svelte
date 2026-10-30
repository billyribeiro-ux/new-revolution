<script lang="ts">
	import RichTextEditor from './RichTextEditor.svelte';
	import type { PostEditorFormState } from './post-editor/form-actions';
	import type { SeoScoreResult } from '#lib/shared/seo/score';
	import {
		META_TITLE_MAX,
		META_DESCRIPTION_MAX,
		OG_TITLE_MAX,
		OG_DESCRIPTION_MAX,
		TWITTER_TITLE_MAX,
		TWITTER_DESCRIPTION_MAX
	} from '#lib/shared/seo/meta-budget';
	import {
		POST_SCHEMA_TYPE_VALUES,
		TWITTER_CARD_TYPE_VALUES,
		POST_TEMPLATE_VALUES,
		POST_FORMAT_VALUES
	} from '#lib/shared/schemas/posts';

	interface Props {
		form: PostEditorFormState;
		seoEvaluation: SeoScoreResult;
		slugAvailable: boolean | null;
		slugChecking: boolean;
		onTitleChange: (title: string) => void;
		onSlugChange: (slug: string) => void;
		onResetSlugFromTitle: () => void;
		onContentChange: (html: string) => void;
		onStatsChange: (stats: { words: number; chars: number; readingTime: number }) => void;
		onPickCoverImage: () => void;
		onPickOgImage: () => void;
		onPickTwitterImage: () => void;
		onOpenEditorMediaPicker: (
			callback: (payload: {
				url: string;
				alt: string;
				width?: number | null;
				height?: number | null;
				caption?: string;
				size?: string;
				align?: string;
				mediaId?: string;
			}) => void
		) => void;
	}

	let {
		form = $bindable(),
		seoEvaluation,
		slugAvailable,
		slugChecking,
		onTitleChange,
		onSlugChange,
		onResetSlugFromTitle,
		onContentChange,
		onStatsChange,
		onPickCoverImage,
		onPickOgImage,
		onPickTwitterImage,
		onOpenEditorMediaPicker
	}: Props = $props();

	let activeBottomTab = $state<'seo' | 'social' | 'faq' | 'advanced'>('seo');
	let newSecondaryKeyword = $state('');

	function addSecondaryKeyword() {
		const clean = newSecondaryKeyword.trim();
		if (!clean) return;
		if (!form.secondaryKeywords.includes(clean)) {
			form.secondaryKeywords = [...form.secondaryKeywords, clean];
		}
		newSecondaryKeyword = '';
	}

	function removeSecondaryKeyword(kw: string) {
		form.secondaryKeywords = form.secondaryKeywords.filter((k) => k !== kw);
	}

	function addFaqRow() {
		form.faqItems = [...form.faqItems, { question: '', answer: '' }];
	}

	function removeFaqRow(idx: number) {
		form.faqItems = form.faqItems.filter((_, i) => i !== idx);
	}

	function addCustomFieldRow() {
		form.customFields = [...form.customFields, { key: '', value: '' }];
	}

	function removeCustomFieldRow(idx: number) {
		form.customFields = form.customFields.filter((_, i) => i !== idx);
	}

	let blockingIssues = $derived(seoEvaluation.issues.filter((i) => i.blocking));
	let nonBlockingIssues = $derived(seoEvaluation.issues.filter((i) => !i.blocking));
</script>

<div class="editor-main-column">
	<!-- Title, Permalink, Subtitle, Excerpt Card -->
	<section class="editor-card">
		<div class="title-field-wrap">
			<input
				type="text"
				class="title-input"
				placeholder="Enter article headline..."
				value={form.title}
				oninput={(e) => onTitleChange((e.currentTarget as HTMLInputElement).value)}
			/>
			<span class="char-counter">{form.title.length} chars</span>
		</div>

		<div class="slug-row">
			<span class="slug-prefix">revolutiontradingpros.com/blog/</span>
			<input
				type="text"
				class="slug-input"
				placeholder="article-url-slug"
				value={form.slug}
				oninput={(e) => onSlugChange((e.currentTarget as HTMLInputElement).value)}
			/>
			<button
				type="button"
				class="btn-inline"
				onclick={onResetSlugFromTitle}
				title="Regenerate slug from title"
			>
				Reset from Title
			</button>
			{#if slugChecking}
				<span class="slug-badge is-checking">Checking...</span>
			{:else if slugAvailable === true}
				<span class="slug-badge is-ok">Available</span>
			{:else if slugAvailable === false}
				<span class="slug-badge is-err">Slug Unavailable</span>
			{/if}
		</div>

		<div class="sub-excerpt-grid">
			<label class="field-block">
				<span class="field-label">Subtitle / Deck</span>
				<input
					type="text"
					class="text-input"
					placeholder="Optional secondary deck headline..."
					bind:value={form.subtitle}
				/>
			</label>

			<label class="field-block">
				<span class="field-label">
					Excerpt / Summary ({form.excerpt.length}/160 chars, auto-fills from body if blank)
				</span>
				<textarea
					class="textarea-input"
					rows="2"
					placeholder="Concise summary for blog index cards and feeds..."
					bind:value={form.excerpt}></textarea>
			</label>
		</div>
	</section>

	<!-- Cover Image Card -->
	<section class="editor-card">
		<div class="card-header-row">
			<h2 class="card-h2">Featured Cover Image</h2>
			<div class="card-actions">
				<button type="button" class="btn-inline" onclick={onPickCoverImage}>
					Choose from Media Library
				</button>
				{#if form.coverImage}
					<button
						type="button"
						class="btn-inline is-danger"
						onclick={() => {
							form.coverImage = '';
							form.coverImageAlt = '';
							form.coverImageCaption = '';
						}}
					>
						Remove Cover
					</button>
				{/if}
			</div>
		</div>

		<div class="cover-grid">
			{#if form.coverImage}
				<div class="cover-preview-box">
					<img
						src={form.coverImage}
						alt={form.coverImageAlt || form.title || 'Cover preview'}
						class="cover-preview-img"
					/>
				</div>
			{/if}
			<div class="cover-fields">
				<label class="field-block">
					<span class="field-label">Cover Image URL</span>
					<input
						type="url"
						class="text-input"
						placeholder="https://..."
						bind:value={form.coverImage}
					/>
				</label>

				<div class="two-col">
					<label class="field-block">
						<span class="field-label">
							Cover Alt Text (Required for Publish Gate, must differ from Title)
						</span>
						<input
							type="text"
							class="text-input"
							placeholder="Describe the chart or visual..."
							bind:value={form.coverImageAlt}
						/>
					</label>

					<label class="field-block">
						<span class="field-label">Cover Caption (optional)</span>
						<input
							type="text"
							class="text-input"
							placeholder="Optional figure credit or note..."
							bind:value={form.coverImageCaption}
						/>
					</label>
				</div>
			</div>
		</div>
	</section>

	<!-- Rich Text Editor Section -->
	<section class="editor-card rte-section">
		<RichTextEditor
			content={form.content}
			onChange={onContentChange}
			{onStatsChange}
			onOpenMediaPicker={onOpenEditorMediaPicker}
		/>
	</section>

	<!-- Bottom Tabbed Inspector Panels (SEO, Social, FAQ/Schema, Advanced) -->
	<section class="editor-card">
		<div class="inspector-tabs" role="tablist">
			<button
				type="button"
				role="tab"
				aria-selected={activeBottomTab === 'seo'}
				class={['tab-btn', { 'is-active': activeBottomTab === 'seo' }]}
				onclick={() => (activeBottomTab = 'seo')}
			>
				SEO & Publish Gate ({seoEvaluation.score}/100)
			</button>
			<button
				type="button"
				role="tab"
				aria-selected={activeBottomTab === 'social'}
				class={['tab-btn', { 'is-active': activeBottomTab === 'social' }]}
				onclick={() => (activeBottomTab = 'social')}
			>
				Social Cards (OG & X)
			</button>
			<button
				type="button"
				role="tab"
				aria-selected={activeBottomTab === 'faq'}
				class={['tab-btn', { 'is-active': activeBottomTab === 'faq' }]}
				onclick={() => (activeBottomTab = 'faq')}
			>
				Schema & FAQs ({form.faqItems.length})
			</button>
			<button
				type="button"
				role="tab"
				aria-selected={activeBottomTab === 'advanced'}
				class={['tab-btn', { 'is-active': activeBottomTab === 'advanced' }]}
				onclick={() => (activeBottomTab = 'advanced')}
			>
				Advanced & Custom Fields
			</button>
		</div>

		{#if activeBottomTab === 'seo'}
			<div class="tab-panel">
				<!-- Publish Gate Checklist -->
				<div class="gate-summary-box">
					<div class="gate-header">
						<strong>
							29-Rule SEO Audit: {seoEvaluation.score}/100 ({seoEvaluation.label})
						</strong>
						<span>
							{seoEvaluation.publishable
								? 'Ready to Publish'
								: `${blockingIssues.length} Blocking Issue(s) Must Be Resolved Before Publishing`}
						</span>
					</div>

					{#if blockingIssues.length > 0}
						<div class="issue-group">
							<h3 class="issue-group-title is-blocking">
								Publish-Blocking Requirements ({blockingIssues.length})
							</h3>
							<ul class="issue-list">
								{#each blockingIssues as issue (issue.id)}
									<li class="issue-item is-blocking">
										<span class="issue-points">-{issue.points}pt</span>
										<span>{issue.message}</span>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if nonBlockingIssues.length > 0}
						<div class="issue-group">
							<h3 class="issue-group-title">
								Optimization Recommendations ({nonBlockingIssues.length})
							</h3>
							<ul class="issue-list">
								{#each nonBlockingIssues as issue (issue.id)}
									<li class="issue-item">
										<span class="issue-points">-{issue.points}pt</span>
										<span>{issue.message}</span>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>

				<div class="two-col">
					<label class="field-block">
						<span class="field-label">Primary Focus Keyword</span>
						<input
							type="text"
							class="text-input"
							placeholder="e.g. spx gamma exposure"
							bind:value={form.focusKeyword}
						/>
					</label>

					<div class="field-block">
						<span class="field-label">Secondary Keywords</span>
						<div class="kw-input-row">
							<input
								type="text"
								class="text-input"
								placeholder="Add keyword and press Enter..."
								bind:value={newSecondaryKeyword}
								onkeydown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										addSecondaryKeyword();
									}
								}}
							/>
							<button type="button" class="btn-inline" onclick={addSecondaryKeyword}> Add </button>
						</div>
						{#if form.secondaryKeywords.length > 0}
							<div class="chip-list">
								{#each form.secondaryKeywords as kw (kw)}
									<span class="kw-chip">
										{kw}
										<button
											type="button"
											class="chip-remove"
											onclick={() => removeSecondaryKeyword(kw)}
											aria-label="Remove {kw}"
										>
											x
										</button>
									</span>
								{/each}
							</div>
						{/if}
					</div>
				</div>

				<label class="field-block">
					<span class="field-label">
						Meta Title ({form.metaTitle.length}/{META_TITLE_MAX} chars, target 50-60)
					</span>
					<input
						type="text"
						class="text-input"
						maxlength={META_TITLE_MAX}
						placeholder="Auto-fills from Title if left blank..."
						bind:value={form.metaTitle}
					/>
				</label>

				<label class="field-block">
					<span class="field-label">
						Meta Description ({form.metaDescription.length}/{META_DESCRIPTION_MAX} chars, target 120-160)
					</span>
					<textarea
						class="textarea-input"
						rows="2"
						maxlength={META_DESCRIPTION_MAX}
						placeholder="Auto-fills from Excerpt/Body if left blank..."
						bind:value={form.metaDescription}></textarea>
				</label>

				<!-- Live Google SERP Preview -->
				<div class="serp-preview">
					<span class="serp-label">Google Search Preview</span>
					<div class="serp-url">
						https://revolutiontradingpros.com/blog/{form.slug || 'article-slug'}
					</div>
					<div class="serp-title">
						{form.metaTitle || form.title || 'Article Headline'} | Revolution Trading Pros
					</div>
					<div class="serp-desc">
						{form.metaDescription ||
							form.excerpt ||
							'Article summary will appear here in Google search results...'}
					</div>
				</div>

				<div class="two-col">
					<label class="field-block">
						<span class="field-label">Canonical URL Override</span>
						<input
							type="url"
							class="text-input"
							placeholder="https://revolutiontradingpros.com/blog/..."
							bind:value={form.canonicalUrl}
						/>
					</label>

					<div class="field-block">
						<span class="field-label">Robots Directives</span>
						<div class="checkbox-row">
							<label class="chk-label">
								<input type="checkbox" bind:checked={form.noindex} />
								<span>noindex</span>
							</label>
							<label class="chk-label">
								<input type="checkbox" bind:checked={form.nofollow} />
								<span>nofollow</span>
							</label>
							<label class="chk-label">
								<input type="checkbox" bind:checked={form.noarchive} />
								<span>noarchive</span>
							</label>
							<label class="chk-label">
								<input type="checkbox" bind:checked={form.nosnippet} />
								<span>nosnippet</span>
							</label>
						</div>
					</div>
				</div>
			</div>
		{:else if activeBottomTab === 'social'}
			<div class="tab-panel">
				<h3 class="sub-h3">OpenGraph (Facebook, LinkedIn, Discord)</h3>
				<div class="two-col">
					<label class="field-block">
						<span class="field-label">OG Title ({form.ogTitle.length}/{OG_TITLE_MAX})</span>
						<input
							type="text"
							class="text-input"
							maxlength={OG_TITLE_MAX}
							placeholder="Defaults to Meta Title"
							bind:value={form.ogTitle}
						/>
					</label>

					<div class="field-block">
						<span class="field-label">OG Image URL</span>
						<div class="kw-input-row">
							<input
								type="url"
								class="text-input"
								placeholder="Defaults to Cover Image"
								bind:value={form.ogImage}
							/>
							<button type="button" class="btn-inline" onclick={onPickOgImage}> Pick </button>
						</div>
					</div>
				</div>

				<label class="field-block">
					<span class="field-label">
						OG Description ({form.ogDescription.length}/{OG_DESCRIPTION_MAX})
					</span>
					<textarea
						class="textarea-input"
						rows="2"
						maxlength={OG_DESCRIPTION_MAX}
						placeholder="Defaults to Meta Description"
						bind:value={form.ogDescription}></textarea>
				</label>

				<h3 class="sub-h3">X / Twitter Card</h3>
				<div class="two-col">
					<label class="field-block">
						<span class="field-label">Card Type</span>
						<select class="select-input" bind:value={form.twitterCardType}>
							{#each TWITTER_CARD_TYPE_VALUES as ct (ct)}
								<option value={ct}>{ct}</option>
							{/each}
						</select>
					</label>

					<div class="field-block">
						<span class="field-label">X Image URL</span>
						<div class="kw-input-row">
							<input
								type="url"
								class="text-input"
								placeholder="Defaults to OG / Cover Image"
								bind:value={form.twitterImage}
							/>
							<button type="button" class="btn-inline" onclick={onPickTwitterImage}> Pick </button>
						</div>
					</div>
				</div>

				<div class="two-col">
					<label class="field-block">
						<span class="field-label">
							X Title ({form.twitterTitle.length}/{TWITTER_TITLE_MAX})
						</span>
						<input
							type="text"
							class="text-input"
							maxlength={TWITTER_TITLE_MAX}
							bind:value={form.twitterTitle}
						/>
					</label>

					<label class="field-block">
						<span class="field-label">
							X Description ({form.twitterDescription.length}/{TWITTER_DESCRIPTION_MAX})
						</span>
						<input
							type="text"
							class="text-input"
							maxlength={TWITTER_DESCRIPTION_MAX}
							bind:value={form.twitterDescription}
						/>
					</label>
				</div>
			</div>
		{:else if activeBottomTab === 'faq'}
			<div class="tab-panel">
				<div class="two-col">
					<label class="field-block">
						<span class="field-label">Primary Schema.org Type</span>
						<select class="select-input" bind:value={form.schemaType}>
							{#each POST_SCHEMA_TYPE_VALUES as st (st)}
								<option value={st}>{st}</option>
							{/each}
						</select>
					</label>
				</div>

				<div class="repeater-header">
					<h3 class="sub-h3">FAQPage Structured Data Items (1:1 Visible Accordion + JSON-LD)</h3>
					<button type="button" class="btn-inline" onclick={addFaqRow}> + Add FAQ Item </button>
				</div>

				{#if form.faqItems.length === 0}
					<p class="muted-note">No FAQ items added yet.</p>
				{:else}
					<div class="repeater-list">
						{#each form.faqItems as faq, idx (idx)}
							<div class="repeater-card">
								<div class="repeater-card-top">
									<strong>Question #{idx + 1}</strong>
									<button
										type="button"
										class="btn-inline is-danger"
										onclick={() => removeFaqRow(idx)}
									>
										Remove
									</button>
								</div>
								<input
									type="text"
									class="text-input"
									placeholder="Question..."
									bind:value={faq.question}
								/>
								<textarea
									class="textarea-input"
									rows="2"
									placeholder="Answer..."
									bind:value={faq.answer}></textarea>
							</div>
						{/each}
					</div>
				{/if}

				<label class="field-block">
					<span class="field-label">Custom JSON-LD Override (optional valid JSON object)</span>
					<textarea
						class="textarea-input code-textarea"
						rows="4"
						placeholder={`{"@context": "https://schema.org", ...}`}
						bind:value={form.customJsonLd}></textarea>
				</label>
			</div>
		{:else}
			<div class="tab-panel">
				<div class="two-col">
					<label class="field-block">
						<span class="field-label">Layout Template</span>
						<select class="select-input" bind:value={form.template}>
							{#each POST_TEMPLATE_VALUES as tpl (tpl)}
								<option value={tpl}>{tpl}</option>
							{/each}
						</select>
					</label>

					<label class="field-block">
						<span class="field-label">Post Format</span>
						<select class="select-input" bind:value={form.format}>
							{#each POST_FORMAT_VALUES as fmt (fmt)}
								<option value={fmt}>{fmt}</option>
							{/each}
						</select>
					</label>
				</div>

				<div class="two-col">
					<label class="field-block">
						<span class="field-label">Series Name</span>
						<input
							type="text"
							class="text-input"
							placeholder="e.g. Options Greeks Masterclass"
							bind:value={form.seriesName}
						/>
					</label>

					<label class="field-block">
						<span class="field-label">Series Part / Order</span>
						<input
							type="number"
							class="text-input"
							min="1"
							value={form.seriesOrder ?? ''}
							oninput={(e) => {
								const v = (e.currentTarget as HTMLInputElement).value;
								form.seriesOrder = v ? Number(v) : null;
							}}
						/>
					</label>
				</div>

				<div class="repeater-header">
					<h3 class="sub-h3">Custom Metadata Fields</h3>
					<button type="button" class="btn-inline" onclick={addCustomFieldRow}>
						+ Add Custom Field
					</button>
				</div>

				{#if form.customFields.length > 0}
					<div class="repeater-list">
						{#each form.customFields as cf, idx (idx)}
							<div class="custom-field-row">
								<input type="text" class="text-input" placeholder="Key" bind:value={cf.key} />
								<input type="text" class="text-input" placeholder="Value" bind:value={cf.value} />
								<button
									type="button"
									class="btn-inline is-danger"
									onclick={() => removeCustomFieldRow(idx)}
								>
									Remove
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</section>
</div>

<style>
	.editor-main-column {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		min-width: 0;
	}

	.editor-card {
		background: var(--panel);
		border: 1px solid var(--line-strong);
		border-radius: 12px;
		padding: 1.25rem 1.4rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.rte-section {
		padding: 0;
		border: 0;
		background: transparent;
	}

	.title-field-wrap {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border-bottom: 1px solid var(--line);
		padding-bottom: 0.65rem;
	}

	.title-input {
		flex: 1;
		border: 0;
		background: transparent;
		font-family: var(--font-display);
		font-size: clamp(1.35rem, 2.2vw, 1.85rem);
		font-weight: 800;
		color: var(--text);
		outline: none;
	}

	.char-counter {
		font-size: 0.76rem;
		color: var(--muted);
		white-space: nowrap;
	}

	.slug-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.83rem;
	}

	.slug-prefix {
		color: var(--muted);
		font-family: var(--font-mono);
		font-size: 0.78rem;
	}

	.slug-input {
		flex: 1 1 180px;
		padding: 0.35rem 0.6rem;
		border-radius: 6px;
		border: 1px solid var(--line-strong);
		background: var(--bg);
		color: var(--acid);
		font-family: var(--font-mono);
		font-size: 0.82rem;
	}

	.slug-badge {
		padding: 0.22rem 0.55rem;
		border-radius: 999px;
		font-size: 0.74rem;
		font-weight: 700;
	}

	.slug-badge.is-ok {
		background: rgba(220, 255, 101, 0.14);
		color: var(--acid);
	}

	.slug-badge.is-err {
		background: rgba(255, 121, 105, 0.16);
		color: var(--coral);
	}

	.slug-badge.is-checking {
		color: var(--muted);
	}

	.sub-excerpt-grid,
	.two-col {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 0.9rem;
	}

	.field-block {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.field-label {
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--text-secondary);
	}

	.text-input,
	.textarea-input,
	.select-input {
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		border: 1px solid var(--line-strong);
		background: var(--bg);
		color: var(--text);
		font-family: var(--font-sans);
		font-size: 0.88rem;
	}

	.code-textarea {
		font-family: var(--font-mono);
		font-size: 0.82rem;
	}

	.card-header-row,
	.repeater-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.card-h2,
	.sub-h3 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.96rem;
		font-weight: 700;
		color: var(--text);
	}

	.card-actions {
		display: flex;
		gap: 0.45rem;
	}

	.btn-inline {
		padding: 0.38rem 0.75rem;
		border-radius: 6px;
		border: 1px solid var(--line-strong);
		background: var(--panel2);
		color: var(--text);
		font-family: var(--font-sans);
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
	}

	.btn-inline.is-danger {
		color: var(--coral);
		border-color: var(--coral);
	}

	.cover-grid {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		flex-wrap: wrap;
	}

	.cover-preview-box {
		width: 180px;
		aspect-ratio: 16 / 9;
		border-radius: 8px;
		overflow: hidden;
		border: 1px solid var(--line);
		background: var(--bg);
	}

	.cover-preview-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.cover-fields {
		flex: 1 1 320px;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.inspector-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		border-bottom: 1px solid var(--line);
		padding-bottom: 0.75rem;
	}

	.tab-btn {
		padding: 0.45rem 0.9rem;
		border-radius: 6px;
		border: 1px solid var(--line);
		background: var(--panel2);
		color: var(--text-secondary);
		font-family: var(--font-sans);
		font-size: 0.82rem;
		font-weight: 700;
		cursor: pointer;
	}

	.tab-btn.is-active {
		background: var(--acid);
		border-color: var(--acid);
		color: var(--ink);
	}

	.tab-panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.gate-summary-box {
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid var(--line-strong);
		background: var(--bg-soft);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.gate-header {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.5rem;
		font-size: 0.86rem;
	}

	.issue-group-title {
		margin: 0 0 0.35rem;
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--muted);
	}

	.issue-group-title.is-blocking {
		color: var(--coral);
	}

	.issue-list {
		margin: 0;
		padding-left: 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.82rem;
	}

	.issue-item.is-blocking {
		color: var(--coral);
	}

	.issue-points {
		font-family: var(--font-mono);
		font-weight: 700;
		margin-right: 0.35rem;
	}

	.kw-input-row {
		display: flex;
		gap: 0.4rem;
	}

	.kw-input-row .text-input {
		flex: 1;
	}

	.chip-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-top: 0.35rem;
	}

	.kw-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		background: var(--panel2);
		border: 1px solid var(--line);
		font-size: 0.76rem;
	}

	.chip-remove {
		border: 0;
		background: transparent;
		color: var(--coral);
		cursor: pointer;
		font-weight: 700;
	}

	.serp-preview {
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--bg);
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.serp-label {
		font-size: 0.72rem;
		text-transform: uppercase;
		color: var(--muted);
		font-weight: 700;
	}

	.serp-url {
		font-size: 0.78rem;
		color: var(--text-secondary);
	}

	.serp-title {
		font-size: 1rem;
		font-weight: 700;
		color: var(--acid);
	}

	.serp-desc {
		font-size: 0.84rem;
		color: var(--muted);
	}

	.checkbox-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem;
		padding-top: 0.3rem;
	}

	.chk-label {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.83rem;
		cursor: pointer;
	}

	.repeater-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.repeater-card {
		padding: 0.85rem;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--bg-soft);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.repeater-card-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.82rem;
	}

	.custom-field-row {
		display: grid;
		grid-template-columns: 1fr 1fr auto;
		gap: 0.5rem;
	}

	.muted-note {
		margin: 0;
		font-size: 0.84rem;
		color: var(--muted);
	}
</style>
