<script lang="ts">
	import RichTextEditor from './RichTextEditor.svelte';
	import {
		getObjectRowKey,
		loadActiveMainTab,
		saveActiveMainTab,
		type MainEditorTab,
		type PostEditorFormState
	} from './post-editor/form-actions';
	import type { SeoScoreResult } from '#lib/shared/seo/score';
	import { normalizePostHeadings } from '#lib/shared/seo/toc';
	import {
		META_TITLE_MAX,
		META_DESCRIPTION_MAX,
		OG_TITLE_MAX,
		OG_DESCRIPTION_MAX,
		TWITTER_TITLE_MAX,
		TWITTER_DESCRIPTION_MAX,
		computeRenderedTitle
	} from '#lib/shared/seo/meta-budget';
	import { POST_SCHEMA_TYPE_VALUES, TWITTER_CARD_TYPE_VALUES } from '#lib/shared/schemas/posts';
	import type { RevisionRecord } from './RevisionDiffViewer.svelte';

	interface Props {
		form: PostEditorFormState;
		seoEvaluation: SeoScoreResult;
		slugAvailable: boolean | null;
		slugChecking: boolean;
		revisions?: RevisionRecord[];
		onTitleChange: (title: string) => void;
		onSlugChange: (slug: string) => void;
		onSlugBlur?: () => void;
		onResetSlugFromTitle: () => void;
		onMetaTitleManualEdit?: (metaTitle: string) => void;
		onContentChange: (html: string) => void;
		onStatsChange: (stats: { words: number; chars: number; readingTime: number }) => void;
		onPickCoverImage: () => void;
		onPickOgImage: () => void;
		onPickTwitterImage: () => void;
		onInspectRevision?: (revision: RevisionRecord) => void;
		onOpenEditorMediaPicker: (
			callback: (payload: {
				url: string;
				alt: string;
				width?: number | null;
				height?: number | null;
				caption?: string;
				size?: string;
				align?: string;
				linkUrl?: string;
				mediaId?: string;
			}) => void
		) => void;
	}

	let {
		form = $bindable(),
		seoEvaluation,
		slugAvailable,
		slugChecking,
		revisions = [],
		onTitleChange,
		onSlugChange,
		onSlugBlur,
		onResetSlugFromTitle,
		onMetaTitleManualEdit,
		onContentChange,
		onStatsChange,
		onPickCoverImage,
		onPickOgImage,
		onPickTwitterImage,
		onInspectRevision,
		onOpenEditorMediaPicker
	}: Props = $props();

	let activeMainTab = $state<MainEditorTab>(loadActiveMainTab());
	let newSecondaryKeyword = $state('');

	export function refreshActiveTabFromStorage() {
		activeMainTab = loadActiveMainTab();
	}

	/**
	 * Opens the SEO panel (its issue list is inside a hidden body otherwise) and returns its toggle button so
	 * the caller can move focus there. Used when a publish is refused by the SEO gate.
	 */
	export function revealSeoPanel(): HTMLButtonElement | null {
		activeMainTab = 'seo';
		saveActiveMainTab('seo');
		return seoToggleEl;
	}

	let seoToggleEl: HTMLButtonElement | null = null;

	function toggleMainPanel(panel: Exclude<MainEditorTab, 'content'>) {
		const next: MainEditorTab = activeMainTab === panel ? 'content' : panel;
		activeMainTab = next;
		saveActiveMainTab(next);
	}

	function commitSecondaryKeywordsFromBuffer() {
		const parts = newSecondaryKeyword
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		if (parts.length === 0) {
			newSecondaryKeyword = '';
			return;
		}
		let updated = [...form.secondaryKeywords];
		for (const candidate of parts) {
			const exists = updated.some((existing) => existing.toLowerCase() === candidate.toLowerCase());
			if (!exists) {
				updated.push(candidate);
			}
		}
		form.secondaryKeywords = updated;
		newSecondaryKeyword = '';
	}

	function removeSecondaryKeyword(kw: string) {
		form.secondaryKeywords = form.secondaryKeywords.filter((k) => k !== kw);
	}

	function addFaqRow() {
		form.faqItems = [...form.faqItems, { question: '', answer: '' }];
	}

	function removeFaqRow(targetItem: { question: string; answer: string }) {
		form.faqItems = form.faqItems.filter((item) => item !== targetItem);
	}

	let blockingIssues = $derived(seoEvaluation.issues.filter((i) => i.blocking));
	let nonBlockingIssues = $derived(seoEvaluation.issues.filter((i) => !i.blocking));
	let orderedSeoIssues = $derived([...blockingIssues, ...nonBlockingIssues]);

	let seoToneClass = $derived(
		seoEvaluation.score >= 80 ? 'good' : seoEvaluation.score >= 50 ? 'warning' : 'bad'
	);

	let effectiveMetaTitleSource = $derived((form.metaTitle || form.title).trim());
	let renderedMetaTitle = $derived(computeRenderedTitle(effectiveMetaTitleSource));
	let brandSuffixDropped = $derived(
		effectiveMetaTitleSource.length > 0 && !renderedMetaTitle.brandAppended
	);

	let normalizedToc = $derived(normalizePostHeadings(form.content, form.title).toc);
</script>

<div class="editor-main-column">
	<!-- 1. Title, 2. Permalink/Slug, 3. Add Media, 5. Subtitle & Excerpt -->
	<section class="editor-card">
		<div class="title-field-wrap">
			<label for="post-title" class="sr-only">Post Title</label>
			<input
				id="post-title"
				type="text"
				class="title-input"
				placeholder="Add title"
				value={form.title}
				oninput={(e) => onTitleChange((e.currentTarget as HTMLInputElement).value)}
			/>
			<span class="char-counter">{form.title.length} chars</span>
		</div>

		<div class="slug-row">
			<span class="slug-prefix">revolutiontradingpros.com/blog/</span>
			<input
				id="post-slug"
				type="text"
				class="slug-input"
				aria-label="Post slug"
				maxlength={75}
				placeholder="article-url-slug"
				value={form.slug}
				oninput={(e) => onSlugChange((e.currentTarget as HTMLInputElement).value)}
				onblur={() => onSlugBlur?.()}
			/>
			<span class={['slug-counter', { 'is-amber': form.slug.length < 3 || form.slug.length > 75 }]}>
				{form.slug.length}/75
			</span>
			<button
				type="button"
				class="btn-inline"
				onclick={onResetSlugFromTitle}
				title="Regenerate slug from title"
			>
				Reset from Title
			</button>
			<button type="button" class="btn-inline" onclick={onPickCoverImage}> Add Media </button>
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

			<label class="field-block" for="post-excerpt">
				<span class="field-label">
					Excerpt / Summary
					<span class={['counter-inline', { 'is-amber': form.excerpt.length > 160 }]}>
						({form.excerpt.length}/160)
					</span>
				</span>
				<textarea
					id="post-excerpt"
					class="textarea-input"
					rows={3}
					placeholder="Concise summary for blog index cards and feeds (auto-fills from body if blank)..."
					bind:value={form.excerpt}></textarea>
			</label>
		</div>
	</section>

	<!-- 4. Rich Text Editor Section -->
	<section class="editor-card rte-section">
		<RichTextEditor
			content={form.content}
			onChange={onContentChange}
			{onStatsChange}
			onOpenMediaPicker={onOpenEditorMediaPicker}
		/>
	</section>

	<!-- 7. Collapsible Main-Column Disclosure Panels (one open at a time, persisted in wp-editor-active-tab) -->

	<!-- Panel 1: SEO -->
	<section class="editor-card metabox-card">
		<h3 class="metabox-h3">
			<button
				type="button"
				class="metabox-toggle"
				bind:this={seoToggleEl}
				aria-expanded={activeMainTab === 'seo'}
				aria-controls="panel-seo"
				onclick={() => toggleMainPanel('seo')}
			>
				<span>SEO &amp; Search Preview</span>
				<span class={['metabox-badge', seoToneClass]}>
					{seoEvaluation.score}/100 ({seoEvaluation.label})
				</span>
			</button>
		</h3>

		<div id="panel-seo" class="metabox-body" hidden={activeMainTab !== 'seo'}>
			<div class={['gate-summary-box', seoToneClass]}>
				<div class="gate-header">
					<strong>
						SEO Audit Score: {seoEvaluation.score}/100 ({seoEvaluation.label})
					</strong>
					<span>
						{seoEvaluation.publishable
							? 'Ready to Publish'
							: `${blockingIssues.length} Blocking Issue(s) Must Be Resolved Before Publishing`}
					</span>
				</div>

				{#if orderedSeoIssues.length === 0}
					<p class="all-passed-msg">All checks passed!</p>
				{:else}
					<ul class="issue-list">
						{#each orderedSeoIssues as issue (issue.id)}
							<li class={['issue-item', { 'is-blocking': issue.blocking }]}>
								<span class="issue-severity-badge">
									{issue.blocking ? '[BLOCKING]' : '[ADVISORY]'}
								</span>
								<span class="issue-points">-{issue.points}pt</span>
								<span>{issue.message}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<div class="two-col">
				<label class="field-block">
					<span class="field-label">Focus Keyword</span>
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
							aria-label="Secondary keywords"
							placeholder="Type keyword, press Enter or comma..."
							bind:value={newSecondaryKeyword}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ',') {
									e.preventDefault();
									commitSecondaryKeywordsFromBuffer();
								} else if (
									e.key === 'Backspace' &&
									newSecondaryKeyword.length === 0 &&
									form.secondaryKeywords.length > 0
								) {
									form.secondaryKeywords = form.secondaryKeywords.slice(0, -1);
								}
							}}
							onblur={commitSecondaryKeywordsFromBuffer}
						/>
						<button type="button" class="btn-inline" onclick={commitSecondaryKeywordsFromBuffer}>
							Add
						</button>
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

			<label class="field-block" for="post-meta-title">
				<span class="field-label">
					Meta Title ({renderedMetaTitle.length}/{META_TITLE_MAX} rendered)
				</span>
				<input
					id="post-meta-title"
					type="text"
					class="text-input"
					maxlength={META_TITLE_MAX}
					placeholder="Follows Post Title until edited..."
					value={form.metaTitle}
					oninput={(e) => {
						const val = (e.currentTarget as HTMLInputElement).value;
						form.metaTitle = val;
						onMetaTitleManualEdit?.(val);
					}}
				/>
				{#if brandSuffixDropped}
					<span class="meta-info-note">
						Brand suffix " | Revolution Trading Pros" is omitted because the rendered title exceeds
						33 characters before the suffix.
					</span>
				{/if}
			</label>

			<label class="field-block">
				<span class="field-label">
					Meta Description ({form.metaDescription.length}/{META_DESCRIPTION_MAX} chars, target 120-160)
				</span>
				<textarea
					class="textarea-input"
					rows={2}
					maxlength={META_DESCRIPTION_MAX}
					placeholder="Auto-fills from Excerpt/Body if left blank..."
					bind:value={form.metaDescription}></textarea>
			</label>

			<!-- Live Google SERP Preview -->
			<div class="serp-preview">
				<span class="serp-label">Google Search Preview</span>
				<div class="serp-url">
					revolutiontradingpros.com › blog › {form.slug || 'article-slug'}
				</div>
				<div class="serp-title">
					{renderedMetaTitle.renderedTitle || 'Article Headline | Revolution Trading Pros'}
				</div>
				<div class="serp-desc">
					{form.metaDescription ||
						form.excerpt ||
						'Article summary will appear here in Google search results...'}
				</div>
			</div>

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
					rows={2}
					maxlength={OG_DESCRIPTION_MAX}
					placeholder="Defaults to Meta Description"
					bind:value={form.ogDescription}></textarea>
			</label>

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

				<label class="field-block">
					<span class="field-label">Schema Type</span>
					<select class="select-input" bind:value={form.schemaType}>
						{#each POST_SCHEMA_TYPE_VALUES as st (st)}
							<option value={st}>{st}</option>
						{/each}
					</select>
				</label>
			</div>

			<div class="field-block">
				<span class="field-label">Robots Directives</span>
				<div class="checkbox-row">
					<label class="chk-label">
						<input
							type="checkbox"
							bind:checked={form.noindex}
							onchange={() => {
								form.robotsNoindex = form.noindex;
							}}
						/>
						<span>noindex</span>
					</label>
					<label class="chk-label">
						<input
							type="checkbox"
							bind:checked={form.nofollow}
							onchange={() => {
								form.robotsNofollow = form.nofollow;
							}}
						/>
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
	</section>

	<!-- Panel 2: Social (Twitter / X) -->
	<section class="editor-card metabox-card">
		<h3 class="metabox-h3">
			<button
				type="button"
				class="metabox-toggle"
				aria-expanded={activeMainTab === 'twitter'}
				aria-controls="panel-twitter"
				onclick={() => toggleMainPanel('twitter')}
			>
				<span>Social (X / Twitter Card)</span>
				<span class="metabox-sub">{form.twitterCardType}</span>
			</button>
		</h3>

		<div id="panel-twitter" class="metabox-body" hidden={activeMainTab !== 'twitter'}>
			<div class="two-col">
				<label class="field-block">
					<span class="field-label">Twitter Card Type</span>
					<select class="select-input" bind:value={form.twitterCardType}>
						{#each TWITTER_CARD_TYPE_VALUES as ct (ct)}
							<option value={ct}>{ct}</option>
						{/each}
					</select>
				</label>

				<div class="field-block">
					<span class="field-label">Twitter Image</span>
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
						Twitter Title ({form.twitterTitle.length}/{TWITTER_TITLE_MAX})
					</span>
					<input
						type="text"
						class="text-input"
						maxlength={TWITTER_TITLE_MAX}
						placeholder="Defaults to OG / Meta Title"
						bind:value={form.twitterTitle}
					/>
				</label>

				<label class="field-block">
					<span class="field-label">
						Twitter Description ({form.twitterDescription.length}/{TWITTER_DESCRIPTION_MAX})
					</span>
					<input
						type="text"
						class="text-input"
						maxlength={TWITTER_DESCRIPTION_MAX}
						placeholder="Defaults to OG / Meta Description"
						bind:value={form.twitterDescription}
					/>
				</label>
			</div>

			<div class="serp-preview">
				<span class="serp-label">X / Twitter Card Preview ({form.twitterCardType})</span>
				{#if form.twitterImage || form.ogImage || form.coverImage}
					<div class="twitter-preview-img-wrap">
						<img
							src={form.twitterImage || form.ogImage || form.coverImage}
							alt="Social card preview"
							class="cover-preview-img"
							loading="lazy"
						/>
					</div>
				{/if}
				<div class="serp-title">
					{form.twitterTitle || form.ogTitle || form.metaTitle || form.title || 'Post Title'}
				</div>
				<div class="serp-desc">
					{form.twitterDescription ||
						form.ogDescription ||
						form.metaDescription ||
						form.excerpt ||
						'Social card summary preview...'}
				</div>
				<div class="serp-url">revolutiontradingpros.com</div>
			</div>
		</div>
	</section>

	<!-- Panel 3: FAQ -->
	<section class="editor-card metabox-card">
		<h3 class="metabox-h3">
			<button
				type="button"
				class="metabox-toggle"
				aria-expanded={activeMainTab === 'faq'}
				aria-controls="panel-faq"
				onclick={() => toggleMainPanel('faq')}
			>
				<span>FAQ Schema &amp; Q&amp;A</span>
				<span class="metabox-sub">{form.faqItems.length} item(s)</span>
			</button>
		</h3>

		<div id="panel-faq" class="metabox-body" hidden={activeMainTab !== 'faq'}>
			<p class="muted-note">
				Aim for 3 or more items with answers over 40 characters. FAQ rich results were retired by
				Google in May 2026, but FAQPage markup is still emitted for Bing Copilot and visible Q&amp;A
				helps AI answer surfaces.
			</p>

			<div class="repeater-header">
				<strong class="field-label">FAQ Items (1:1 Visible Accordion + JSON-LD)</strong>
				<button type="button" class="btn-inline" onclick={addFaqRow}> + Add FAQ Item </button>
			</div>

			{#if form.faqItems.length === 0}
				<p class="muted-note">No FAQ items added yet.</p>
			{:else}
				<div class="repeater-list">
					{#each form.faqItems as faq, idx (getObjectRowKey(faq))}
						<div class="repeater-card">
							<div class="repeater-card-top">
								<strong>Question #{idx + 1}</strong>
								<button
									type="button"
									class="btn-inline is-danger"
									onclick={() => removeFaqRow(faq)}
								>
									Remove
								</button>
							</div>
							<input
								type="text"
								class="text-input"
								aria-label="FAQ question {idx + 1}"
								placeholder="Question..."
								bind:value={faq.question}
							/>
							<textarea
								class="textarea-input"
								rows={2}
								aria-label="FAQ answer {idx + 1}"
								placeholder="Answer (aim for 40+ characters)..."
								bind:value={faq.answer}></textarea>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<!-- Panel 4: Advanced -->
	<section class="editor-card metabox-card">
		<h3 class="metabox-h3">
			<button
				type="button"
				class="metabox-toggle"
				aria-expanded={activeMainTab === 'advanced'}
				aria-controls="panel-advanced"
				onclick={() => toggleMainPanel('advanced')}
			>
				<span>Advanced &amp; Revisions</span>
				<span class="metabox-sub">{revisions.length} revision(s)</span>
			</button>
		</h3>

		<div id="panel-advanced" class="metabox-body" hidden={activeMainTab !== 'advanced'}>
			<div class="checkbox-row">
				<label class="chk-label">
					<input type="checkbox" bind:checked={form.pingbacksEnabled} />
					<span>Allow Pingbacks &amp; Trackbacks</span>
				</label>
				<label class="chk-label">
					<input type="checkbox" bind:checked={form.excludeFromSearch} />
					<span>Exclude from internal site search</span>
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

			<label class="field-block">
				<span class="field-label">Custom JSON-LD Override (optional valid JSON object)</span>
				<textarea
					class="textarea-input code-textarea"
					rows={4}
					placeholder={`{"@context": "https://schema.org", ...}`}
					bind:value={form.customJsonLd}></textarea>
			</label>

			<div class="revision-section">
				<strong class="field-label">Revision History ({revisions.length})</strong>
				{#if revisions.length === 0}
					<p class="muted-note">No saved revisions yet.</p>
				{:else}
					<ul class="revision-list">
						{#each revisions as rev (rev.id)}
							<li class="revision-row">
								<div class="revision-meta">
									<strong>#{rev.id} ({rev.changeType})</strong>
									<span>{new Date(rev.createdAt).toLocaleString()}</span>
									<span>{rev.wordCount} words</span>
								</div>
								{#if onInspectRevision}
									<button type="button" class="btn-inline" onclick={() => onInspectRevision(rev)}>
										Compare &amp; Restore
									</button>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	</section>

	<!-- Panel 5: Readability -->
	<section class="editor-card metabox-card">
		<h3 class="metabox-h3">
			<button
				type="button"
				class="metabox-toggle"
				aria-expanded={activeMainTab === 'readability'}
				aria-controls="panel-readability"
				onclick={() => toggleMainPanel('readability')}
			>
				<span>Readability &amp; Structure</span>
				<span class="metabox-sub">{form.wordCount} words · {normalizedToc.length} headings</span>
			</button>
		</h3>

		<div id="panel-readability" class="metabox-body" hidden={activeMainTab !== 'readability'}>
			<div class="readability-stats-grid">
				<div class="readability-stat-box">
					<span class="field-label">Word Count</span>
					<strong>{form.wordCount} words (min 300 to publish)</strong>
				</div>
				<div class="readability-stat-box">
					<span class="field-label">Estimated Reading Time</span>
					<strong>{form.readingTime} min read</strong>
				</div>
				<div class="readability-stat-box">
					<span class="field-label">Section Headings (H1-H6)</span>
					<strong>{normalizedToc.length} heading(s)</strong>
				</div>
			</div>
			<p class="muted-note">
				Keep paragraphs concise, include at least two subheadings (H2/H3) to break up long analysis,
				and link to at least one internal resource and one authoritative external reference.
			</p>
		</div>
	</section>
</div>

<style>
	.editor-main-column {
		display: flex;
		flex-direction: column;
		gap: 1.15rem;
		min-width: 0;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
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

	.metabox-card {
		padding: 0;
		gap: 0;
		overflow: hidden;
	}

	.metabox-h3 {
		margin: 0;
		font-size: 0.95rem;
	}

	.metabox-toggle {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.95rem 1.35rem;
		border: 0;
		background: var(--panel);
		color: var(--text);
		font-family: var(--font-display);
		font-size: 0.92rem;
		font-weight: 700;
		text-align: left;
		cursor: pointer;
	}

	.metabox-toggle:hover {
		background: var(--panel2);
	}

	.metabox-body {
		padding: 1.15rem 1.35rem 1.35rem;
		border-top: 1px solid var(--line);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.metabox-body[hidden] {
		display: none;
	}

	.metabox-badge {
		padding: 0.22rem 0.6rem;
		border-radius: 999px;
		font-family: var(--font-mono);
		font-size: 0.74rem;
		font-weight: 700;
		border: 1px solid var(--line);
	}

	.metabox-badge.good {
		background: rgba(220, 255, 101, 0.14);
		border-color: var(--acid);
		color: var(--acid);
	}

	.metabox-badge.warning {
		background: rgba(222, 195, 161, 0.14);
		border-color: var(--status-amber-border);
		color: var(--status-amber-text);
	}

	.metabox-badge.bad {
		background: rgba(255, 121, 105, 0.14);
		border-color: var(--coral);
		color: var(--coral);
	}

	.metabox-sub {
		font-family: var(--font-mono);
		font-size: 0.76rem;
		color: var(--muted);
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

	.slug-counter,
	.counter-inline {
		font-family: var(--font-mono);
		font-size: 0.76rem;
		color: var(--muted);
	}

	.slug-counter.is-amber,
	.counter-inline.is-amber {
		color: var(--status-amber-text);
		font-weight: 700;
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
	.two-col,
	.readability-stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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

	.meta-info-note {
		font-size: 0.76rem;
		color: var(--muted);
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

	.repeater-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
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

	.cover-preview-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.twitter-preview-img-wrap {
		width: 220px;
		aspect-ratio: 16 / 9;
		border-radius: 6px;
		overflow: hidden;
		border: 1px solid var(--line);
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

	.gate-summary-box.good {
		border-color: var(--acid);
	}

	.gate-summary-box.warning {
		border-color: var(--status-amber-border);
	}

	.gate-summary-box.bad {
		border-color: var(--coral);
	}

	.gate-header {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.5rem;
		font-size: 0.86rem;
	}

	.all-passed-msg {
		margin: 0;
		color: var(--acid);
		font-size: 0.85rem;
		font-weight: 700;
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

	.issue-severity-badge {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 700;
		margin-right: 0.35rem;
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

	.revision-section {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}

	.revision-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.revision-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.55rem 0.75rem;
		border-radius: 6px;
		border: 1px solid var(--line);
		background: var(--bg-soft);
		font-size: 0.8rem;
	}

	.revision-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		color: var(--text-secondary);
	}

	.readability-stat-box {
		padding: 0.75rem 0.9rem;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--bg-soft);
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.85rem;
	}

	.muted-note {
		margin: 0;
		font-size: 0.84rem;
		color: var(--muted);
	}
</style>
