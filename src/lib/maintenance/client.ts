// Form setup is independent from the chart/motion modules and their loading failures.
const form = document.querySelector<HTMLFormElement>('#waitlist-form');
const status = document.querySelector<HTMLElement>('#waitlist-status');
const submit = form?.querySelector<HTMLButtonElement>('button[type=submit]');
if (form && status && submit)
	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		if (!form.reportValidity()) return;
		submit.disabled = true;
		status.textContent = 'Saving your request…';
		try {
			const response = await fetch(form.action, {
				method: 'POST',
				body: new FormData(form),
				headers: { accept: 'application/json' }
			});
			const result: { message?: string; error?: string } = await response.json();
			if (!response.ok) throw new Error(result.error || 'Unable to save. Please try again.');
			status.textContent =
				result.message || 'Request saved. Check your email to confirm your address.';
			form.reset();
			void import('gsap')
				.then(({ gsap }) => {
					if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
						gsap.fromTo(status, { opacity: 0.4, y: 5 }, { opacity: 1, y: 0, duration: 0.25 });
				})
				.catch(() => undefined);
		} catch (error) {
			status.textContent =
				error instanceof Error ? error.message : 'Unable to save. Please try again.';
		} finally {
			submit.disabled = false;
		}
	});
const retry = document.querySelector<HTMLButtonElement>('#maintenance-retry');
if (retry) {
	retry.hidden = false;
	retry.addEventListener('click', () => location.reload());
}
void import('./chart.ts')
	.then(({ mountChart }) => mountChart())
	.catch(() => {
		const note = document.querySelector('#chart-fallback');
		if (note) note.textContent = 'Chart unavailable. The candle table below remains available.';
	});
