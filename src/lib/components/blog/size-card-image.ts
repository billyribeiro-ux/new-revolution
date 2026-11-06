import type { Attachment } from 'svelte/attachments';

/**
 * `sizes` font units use the initial font, unlike the card's CSS rem caps. Preserve the server
 * fallback, then track the actual image slot so larger text and wrapping can select enough pixels.
 */
export function sizeCardImage(
	image: HTMLImageElement,
	fallbackSizes = image.sizes
): ReturnType<Attachment<HTMLImageElement>> {
	if (!image.srcset || !fallbackSizes) return;
	let active = true;
	let frame = 0;
	const update = () => {
		frame = 0;
		if (!active) return;
		const width = Math.ceil(image.getBoundingClientRect().width);
		if (width > 0 && image.sizes !== `${width}px`) image.sizes = `${width}px`;
	};
	const schedule = () => {
		if (active && !frame) frame = requestAnimationFrame(update);
	};
	update();
	const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
	observer?.observe(image);
	window.addEventListener('resize', schedule, { passive: true });
	return () => {
		active = false;
		observer?.disconnect();
		window.removeEventListener('resize', schedule);
		if (frame) cancelAnimationFrame(frame);
	};
}
