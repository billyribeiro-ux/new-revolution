<script lang="ts">
	import BlogArchive from '#lib/components/blog/BlogArchive.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<BlogArchive
	listing={data}
	basePath="/blog"
	title="Institutional Stock &amp; Options Trading Blog"
	kicker="Market Intelligence &amp; Research"
	schema={data.jsonLdSchema}
	topics={data.categories.map((category) => ({
		id: category.id,
		name: category.name,
		postCount: category.postCount,
		path: `/blog/category/${category.slug}`
	}))}
/>
