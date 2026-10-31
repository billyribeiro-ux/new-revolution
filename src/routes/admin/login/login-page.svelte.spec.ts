import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LoginPage from './+page.svelte';

describe('/admin/login form', () => {
	it('labels both fields and sets autocomplete hints for password managers', async () => {
		render(LoginPage, { form: null });

		await expect.element(page.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email');
		await expect
			.element(page.getByLabelText('Password'))
			.toHaveAttribute('autocomplete', 'current-password');
		await expect.element(page.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
	});

	it('announces a failure in role=alert and links it to both fields', async () => {
		render(LoginPage, {
			form: { message: 'Email or password is incorrect.', email: 'owner@example.com' }
		});

		await expect
			.element(page.getByRole('alert'))
			.toHaveTextContent('Email or password is incorrect.');
		await expect.element(page.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
		await expect.element(page.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
	});

	it('keeps the submitted email but never echoes a password back into the DOM', async () => {
		render(LoginPage, {
			form: { message: 'Email or password is incorrect.', email: 'owner@example.com' }
		});

		const email = document.querySelector('input[name="email"]') as HTMLInputElement;
		const password = document.querySelector('input[name="password"]') as HTMLInputElement;
		expect(email.value).toBe('owner@example.com');
		expect(password.value).toBe('');
		expect(password.getAttribute('value')).toBeNull();
	});

	it('is marked noindex, nofollow', async () => {
		render(LoginPage, { form: null });

		const robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
		expect(robots?.content).toBe('noindex,nofollow');
	});
});
