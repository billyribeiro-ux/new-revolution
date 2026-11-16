/**
 * Runtime enrollment & preview feature flags (`T14` in `docs/TEMPORARY.md`).
 * Keep `CONCEPT_PREVIEW = false` and `COMMERCE_ENABLED = false` until processor,
 * legal sign-off, entitlements, and checkout E2E verification are enabled.
 */
export const CONCEPT_PREVIEW = false;
export const COMMERCE_ENABLED = false;
export const DEVELOPMENT_NOTICE =
	'Enrollment preview mode. Educational pages and public calculators are live for review.';
export const PURCHASE_HISTORY_NOTICE =
	'Self-serve online checkout is currently paused outside scheduled enrollment windows.';
export const DEVELOPMENT_PURPOSE =
	'Contact the desk directly for room, watchlist, or mentorship inquiries.';
export const AI_CONTENT_NOTICE =
	'All calculators, scenarios, and market-structure examples are strictly for educational study.';
export const PROPOSED_SERVICE_NOTICE =
	'Published schedules, features, and membership tiers remain subject to desk updates.';

/** Opens the informational dialog when `CONCEPT_PREVIEW` is active; routes to `/contact` when turned off. */
export function openConceptOffer(): void {
	if (!CONCEPT_PREVIEW) {
		if (typeof window !== 'undefined') {
			window.location.assign('/contact');
		}
		return;
	}
	const dialog = document.getElementById('concept-purchase-dialog');
	if (dialog instanceof HTMLDialogElement && !dialog.open) dialog.showModal();
}
