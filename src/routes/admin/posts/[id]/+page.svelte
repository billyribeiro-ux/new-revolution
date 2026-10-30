<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let retryAttempt = $state(0);
	let editorModulePromise = $derived.by(() => {
		void retryAttempt;
		return import('#lib/components/admin/PostEditor.svelte');
	});
</script>

{#await editorModulePromise}
	<div class="editor-loading" role="status">
		<span>Loading post editor...</span>
	</div>
{:then { default: PostEditor }}
	<PostEditor
		initialPost={data.post as unknown as Record<string, unknown>}
		initialRevisions={data.revisions}
		initialPreviewToken={data.previewToken}
		categories={data.categories}
		tags={data.tags}
		authors={data.authors}
		allPosts={data.allPosts}
		onBack={() => {
			void goto(resolve('/admin/posts'));
		}}
	/>
{:catch}
	<div class="editor-load-error" role="alert">
		<p>Failed to load editor.</p>
		<button
			type="button"
			class="btn-retry"
			onclick={() => {
				retryAttempt += 1;
			}}
		>
			Retry
		</button>
	</div>
{/await}

<style>
	.editor-loading,
	.editor-load-error {
		min-height: 60vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		color: var(--muted);
		font-family: var(--font-sans);
	}

	.editor-load-error {
		color: var(--coral);
	}

	.btn-retry {
		padding: 0.5rem 1rem;
		border-radius: 7px;
		background: var(--acid);
		color: var(--ink);
		font-weight: 700;
		border: none;
		cursor: pointer;
	}
</style>
