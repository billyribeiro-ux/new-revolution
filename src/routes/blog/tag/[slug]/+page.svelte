<script lang="ts">
	import BlogArchive from '#lib/components/blog/BlogArchive.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<BlogArchive
	listing={data}
	basePath={`/blog/tag/${data.tag.slug}`}
	title={data.tag.name}
	description={data.tag.description}
	kicker="Tag Archive"
	breadcrumb={data.tag.name}
	schema={data.jsonLdSchema}
	topicLabel="Topics and tags"
	topics={data.sidebarTags.map((topic) => ({
		id: topic.id,
		name: topic.name,
		postCount: topic.postCount,
		path: `/blog/tag/${topic.slug}`
	}))}
/>
