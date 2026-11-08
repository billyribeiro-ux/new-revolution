export function scrollToSection(id: string): void {
	if (typeof document === 'undefined') return;
	const target = document.getElementById(id);
	if (!target) return;
	const reducedMotion =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	target.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' });
}
