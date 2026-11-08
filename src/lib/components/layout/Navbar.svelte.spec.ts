import { afterEach, describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser';
import { cleanup, render } from 'vitest-browser-svelte';
import '../../../app.css';
import Navbar from './Navbar.svelte';

const settle = () =>
	new Promise<void>((resolve) =>
		requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
	);

afterEach(() => {
	cleanup();
	document.documentElement.style.removeProperty('font-size');
	document.body.classList.remove('menu-open');
	window.scrollTo({ top: 0, behavior: 'instant' });
});

function overflowingControls() {
	return [
		...document.querySelectorAll<HTMLElement>(
			'.nav a, .nav button, .announcement a, .announcement-tag, .mobile-nav.open a, .mobile-nav.open button'
		)
	]
		.filter((element) => {
			const rect = element.getBoundingClientRect();
			return rect.width > 0 && rect.height > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
		})
		.map((element) => element.textContent?.replace(/\s+/g, ' ').trim());
}

describe('content-aware shared navigation', () => {
	it.each([320, 1180, 1440, 2440])(
		'keeps all controls reachable at %ipx and 200%% text',
		async (width) => {
			await page.viewport(width, 900);
			document.documentElement.style.fontSize = '32px';
			await render(Navbar);
			await document.fonts.ready;
			await settle();
			expect(document.querySelector('.nav-shell')!.classList.contains('is-compact')).toBe(true);
			expect(overflowingControls()).toEqual([]);
			expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
			await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
			await expect
				.element(page.getByRole('navigation', { name: 'Mobile navigation' }))
				.toBeVisible();
			await settle();
			expect(overflowingControls()).toEqual([]);
			await expect.element(page.getByRole('link', { name: 'Blog', exact: true })).toBeVisible();
		}
	);

	it('keeps the menu scrollable below the actual header in a short enlarged-text viewport', async () => {
		await page.viewport(320, 320);
		document.documentElement.style.fontSize = '32px';
		await render(Navbar);
		const pageContent = document.createElement('main');
		pageContent.style.blockSize = '2000px';
		document.querySelector('.nav-shell')!.parentElement!.append(pageContent);
		await document.fonts.ready;
		await settle();
		await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
		await settle();
		const menu = document.querySelector<HTMLElement>('.mobile-nav.open')!;
		const box = menu.getBoundingClientRect();
		expect(box.top).toBeGreaterThanOrEqual(
			document.querySelector('.nav-shell')!.getBoundingClientRect().bottom - 1
		);
		expect(box.bottom).toBeLessThanOrEqual(innerHeight + 1);
		const lastLink = menu.querySelector<HTMLElement>('.mobile-nav-actions a:last-child')!;
		lastLink.focus();
		await settle();

		await expect
			.poll(() => lastLink.getBoundingClientRect().bottom)
			.toBeLessThanOrEqual(innerHeight + 1);
		expect(overflowingControls()).toEqual([]);
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		await settle();
		expect(document.body.classList.contains('menu-open')).toBe(false);
		expect(document.querySelector('.mobile-toggle')!.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(document.querySelector('.mobile-toggle'));
	});

	it('returns Escape focus from a desktop submenu to its trigger', async () => {
		await page.viewport(1440, 900);
		await render(Navbar);
		await document.fonts.ready;
		await settle();
		const trigger = document.querySelector<HTMLButtonElement>('.nav-dropdown-trigger')!;
		trigger.click();
		await settle();
		const link = document.querySelector<HTMLElement>('.nav-item.open .dropdown-link')!;
		link.focus();
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		await settle();
		expect(document.activeElement).toBe(trigger);
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});

	it('switches dynamically when labels no longer fit and preserves keyboard focus', async () => {
		await page.viewport(1440, 900);
		await render(Navbar);
		await document.fonts.ready;
		await settle();
		const shell = document.querySelector<HTMLElement>('.nav-shell')!;
		await expect.poll(() => shell.classList.contains('is-compact')).toBe(false);
		const firstDesktop = document.querySelector<HTMLElement>('.nav-links button')!;
		firstDesktop.focus();
		document.documentElement.style.fontSize = '32px';
		await settle();
		await expect.poll(() => shell.classList.contains('is-compact')).toBe(true);
		expect(document.activeElement).toBe(document.querySelector('.mobile-toggle'));
		await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
		expect(document.body.classList.contains('menu-open')).toBe(true);
		document.querySelector<HTMLElement>('.mobile-nav.open .mobile-nav-trigger')!.focus();
		document.documentElement.style.fontSize = '16px';
		await settle();
		await expect.poll(() => shell.classList.contains('is-compact')).toBe(false);
		expect(document.body.classList.contains('menu-open')).toBe(false);
		expect(document.activeElement).toBe(firstDesktop);
	});

	it.each([1024, 1280, 1440, 1536, 1920, 2560])(
		'renders full desktop navigation centered between brand and actions at %ipx (100%% text)',
		async (width) => {
			await page.viewport(width, 900);
			await render(Navbar);
			await document.fonts.ready;
			await settle();
			const shell = document.querySelector<HTMLElement>('.nav-shell')!;
			const brand = document.querySelector<HTMLElement>('.brand')!;
			const primary = document.querySelector<HTMLElement>('.nav-links')!;
			const actions = document.querySelector<HTMLElement>('.nav-actions')!;
			const toggle = document.querySelector<HTMLElement>('.mobile-toggle')!;

			expect(shell.classList.contains('is-compact')).toBe(false);
			expect(getComputedStyle(primary).display).toBe('flex');
			expect(getComputedStyle(toggle).display).toBe('none');

			const bRect = brand.getBoundingClientRect();
			const pRect = primary.getBoundingClientRect();
			const aRect = actions.getBoundingClientRect();
			const leftGap = pRect.left - bRect.right;
			const rightGap = aRect.left - pRect.right;
			expect(leftGap).toBeGreaterThan(8);
			expect(Math.abs(leftGap - rightGap)).toBeLessThanOrEqual(1);
		}
	);

	it('opens the mobile drawer with all submenus collapsed and resets open submenus on close', async () => {
		await page.viewport(390, 844);
		await render(Navbar);
		await document.fonts.ready;
		await settle();

		const toggle = page.getByRole('button', { name: 'Open navigation', exact: true });
		await toggle.click();
		await settle();

		const triggers = [...document.querySelectorAll<HTMLButtonElement>('.mobile-nav-trigger')];
		expect(triggers.length).toBeGreaterThan(0);
		for (const trigger of triggers) {
			expect(trigger.getAttribute('aria-expanded')).toBe('false');
		}
		expect(document.querySelectorAll('.mobile-submenu').length).toBe(0);

		triggers[0].click();
		await settle();
		expect(triggers[0].getAttribute('aria-expanded')).toBe('true');
		expect(document.querySelectorAll('.mobile-submenu').length).toBe(1);

		await page.getByRole('button', { name: 'Close navigation', exact: true }).click();
		await settle();
		await toggle.click();
		await settle();
		expect(triggers[0].getAttribute('aria-expanded')).toBe('false');
		await expect.poll(() => document.querySelectorAll('.mobile-submenu').length).toBe(0);
	});

	it('preserves stable upper and lower layout geometry when toggling the mobile menu and submenus', async () => {
		await page.viewport(500, 844);
		await render(Navbar);
		const pageContent = document.createElement('main');
		pageContent.style.blockSize = '2400px';
		document.querySelector('.nav-shell')!.parentElement!.append(pageContent);
		await document.fonts.ready;
		await settle();

		expect(getComputedStyle(document.documentElement).scrollbarGutter).toBe('stable');
		expect(getComputedStyle(document.querySelector('.mobile-nav')!).scrollbarGutter).toBe('stable');

		const captureGeometry = () => {
			const announcement = document
				.querySelector<HTMLElement>('.announcement')!
				.getBoundingClientRect();
			const navShell = document.querySelector<HTMLElement>('.nav-shell')!.getBoundingClientRect();
			const brand = document.querySelector<HTMLElement>('.brand')!.getBoundingClientRect();
			const toggleBtn = document
				.querySelector<HTMLElement>('#mobileToggle')!
				.getBoundingClientRect();
			const mainRect = pageContent.getBoundingClientRect();
			return {
				annX: announcement.x,
				annY: announcement.y,
				annW: announcement.width,
				annH: announcement.height,
				navX: navShell.x,
				navY: navShell.y,
				navW: navShell.width,
				navH: navShell.height,
				brandX: brand.x,
				brandY: brand.y,
				toggleX: toggleBtn.x,
				toggleY: toggleBtn.y,
				mainX: mainRect.x,
				mainY: mainRect.y,
				mainW: mainRect.width
			};
		};

		const beforeOpen = captureGeometry();
		await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
		await settle();
		const afterOpen = captureGeometry();
		expect(afterOpen).toEqual(beforeOpen);

		const firstItem = document.querySelector<HTMLElement>('.mobile-nav-item')!;
		const actions = document.querySelector<HTMLElement>('.mobile-nav-actions')!;
		const itemWidthBefore = firstItem.getBoundingClientRect().width;
		const actionsWidthBefore = actions.getBoundingClientRect().width;

		document.querySelector<HTMLButtonElement>('.mobile-nav-trigger')!.click();
		await settle();

		expect(firstItem.getBoundingClientRect().width).toBe(itemWidthBefore);
		expect(actions.getBoundingClientRect().width).toBe(actionsWidthBefore);
	});
});
