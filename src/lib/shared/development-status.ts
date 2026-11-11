/** Owner-confirmed public concept status, November 11, 2026. */
export const CONCEPT_PREVIEW = true;
export const COMMERCE_ENABLED = false;
export const DEVELOPMENT_NOTICE =
	'Concept in progress. This website is being developed with AI and may contain errors, inaccuracies, or unfinished functionality.';
export const PURCHASE_HISTORY_NOTICE =
	'Purchases and paid subscriptions have never been made available. No orders, payments, deposits, or paid enrollment are accepted.';
export const DEVELOPMENT_PURPOSE =
	'This concept is public for real-browser testing and search visibility.';
export const AI_CONTENT_NOTICE =
	'AI-generated or AI-assisted text, code, charts, and demonstrations may be inaccurate, incomplete, or outdated. Verify material information against authoritative sources before relying on it.';
export const PROPOSED_SERVICE_NOTICE =
	'All described products and services are proposed concepts, not available offerings. Features, pricing, and availability may change; no launch or future availability is guaranteed.';

/** Opens the informational dialog only; it never starts checkout or collects payment details. */
export function openConceptOffer(): void {
	const dialog = document.getElementById('concept-purchase-dialog');
	if (dialog instanceof HTMLDialogElement && !dialog.open) dialog.showModal();
}
