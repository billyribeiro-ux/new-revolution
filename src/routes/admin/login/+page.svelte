<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	const uid = $props.id();
	const errorId = `${uid}-error`;
</script>

<svelte:head>
	<title>Admin sign in | Revolution Trading Pros</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<a class="skip" href="#admin-login-main">Skip to content</a>

<main id="admin-login-main" class="login-page">
	<div class="login-card">
		<p class="login-kicker">Content administration</p>
		<h1 class="login-title">Sign in</h1>

		<div aria-live="polite">
			{#if form?.message}
				<p class="login-error" role="alert" id={errorId}>{form.message}</p>
			{/if}
		</div>

		<form method="POST" use:enhance class="login-form">
			<div class="field">
				<label for="{uid}-email">Email</label>
				<input
					id="{uid}-email"
					name="email"
					type="email"
					autocomplete="email"
					autocapitalize="none"
					spellcheck="false"
					required
					value={form?.email ?? ''}
					aria-invalid={form?.message ? 'true' : undefined}
					aria-describedby={form?.message ? errorId : undefined}
				/>
			</div>

			<div class="field">
				<label for="{uid}-password">Password</label>
				<input
					id="{uid}-password"
					name="password"
					type="password"
					autocomplete="current-password"
					required
					aria-invalid={form?.message ? 'true' : undefined}
					aria-describedby={form?.message ? errorId : undefined}
				/>
			</div>

			<button type="submit" class="login-submit">Sign in</button>
		</form>
	</div>
</main>

<style>
	.login-page {
		min-height: 100vh;
		min-height: 100dvh;
		display: grid;
		place-items: center;
		padding: 24px 16px;
		box-sizing: border-box;
		background: var(--bg);
		color: var(--text);
		font-family: var(--font-sans);
	}

	.login-card {
		width: 100%;
		max-width: 420px;
		padding: 28px 24px;
		box-sizing: border-box;
		background: var(--panel);
		border: 1px solid var(--line);
	}

	.login-kicker {
		margin: 0 0 8px;
		font-family: var(--font-display);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.login-title {
		margin: 0 0 20px;
		font-family: var(--font-display);
		font-size: 28px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--text);
	}

	.login-error {
		margin: 0 0 16px;
		padding: 12px 14px;
		border: 1px solid var(--coral);
		background: var(--bg-soft);
		color: var(--coral);
		font-size: 15px;
		line-height: 1.4;
	}

	.login-form {
		display: grid;
		gap: 16px;
	}

	.field {
		display: grid;
		gap: 6px;
	}

	.field label {
		font-family: var(--font-display);
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.field input {
		width: 100%;
		min-height: 44px;
		padding: 10px 12px;
		box-sizing: border-box;
		background: var(--panel2);
		color: var(--text);
		border: 1px solid var(--line-strong);
		border-radius: 0;
		font: inherit;
		font-size: 16px;
	}

	.field input:focus-visible {
		outline: 3px solid var(--acid);
		outline-offset: 2px;
	}

	.field input[aria-invalid='true'] {
		border-color: var(--coral);
	}

	.login-submit {
		min-height: 44px;
		padding: 10px 16px;
		border: 1px solid var(--acid);
		border-radius: 0;
		background: var(--acid);
		color: var(--ink);
		font-family: var(--font-display);
		font-size: 15px;
		font-weight: 700;
		cursor: pointer;
	}

	.login-submit:hover {
		background: var(--btn-acid-hover);
	}

	.login-submit:focus-visible {
		outline: 3px solid var(--acid);
		outline-offset: 3px;
	}

	@media (prefers-reduced-motion: no-preference) {
		.login-submit {
			transition: background-color 150ms ease;
		}
	}
</style>
