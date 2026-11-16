<script lang="ts">
	import BlogArchive from '#lib/components/blog/BlogArchive.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<BlogArchive
	listing={data}
	basePath={`/blog/category/${data.category.slug}`}
	title={data.category.name}
	description={data.category.description}
	kicker="Topic Archive"
	breadcrumb={data.category.name}
	schema={data.jsonLdSchema}
	topicLabel="Categories"
	topics={data.sidebarCategories.map((topic) => ({
		id: topic.id,
		name: topic.name,
		postCount: topic.postCount,
		path: `/blog/category/${topic.slug}`
	}))}
	sanitizedPillarHtml={data.category.pillarHtml}
/>
