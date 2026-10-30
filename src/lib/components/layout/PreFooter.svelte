<script lang="ts">
	import HaveQuestions from './HaveQuestions.svelte';
	import PressStrip from './PressStrip.svelte';
	import SocialShareBar from './SocialShareBar.svelte';

	interface Props {
		/** Recognition strip (Inc. 500 / media). Homepage only. */
		showPress?: boolean;
		onPreviewNavigate?: (href: string, targetId?: string, event?: MouseEvent) => void;
	}

	let { showPress = false, onPreviewNavigate }: Props = $props();
</script>

<!-- Stack above the footer, top to bottom: press (homepage) → have questions → social share -->
{#if showPress}
	<PressStrip />
{/if}
<HaveQuestions {onPreviewNavigate} />
<SocialShareBar />
