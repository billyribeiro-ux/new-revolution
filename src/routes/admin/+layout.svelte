<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	import ConfirmDialogHost from '#lib/components/admin/ConfirmDialogHost.svelte';
	import Toast from '#lib/components/Toast.svelte';
	import SquaresFourIcon from 'phosphor-svelte/lib/SquaresFourIcon';
	import ArticleIcon from 'phosphor-svelte/lib/ArticleIcon';
	import ImagesIcon from 'phosphor-svelte/lib/ImagesIcon';
	import EnvelopeSimpleIcon from 'phosphor-svelte/lib/EnvelopeSimpleIcon';
	import UsersThreeIcon from 'phosphor-svelte/lib/UsersThreeIcon';
	import PaperPlaneTiltIcon from 'phosphor-svelte/lib/PaperPlaneTiltIcon';
	import ChartLineUpIcon from 'phosphor-svelte/lib/ChartLineUpIcon';
	import CalendarCheckIcon from 'phosphor-svelte/lib/CalendarCheckIcon';
	import TrayIcon from 'phosphor-svelte/lib/TrayIcon';
	import BellIcon from 'phosphor-svelte/lib/BellIcon';
	import ChartBarIcon from 'phosphor-svelte/lib/ChartBarIcon';
	import CookieIcon from 'phosphor-svelte/lib/CookieIcon';
	import MegaphoneIcon from 'phosphor-svelte/lib/MegaphoneIcon';
	import PlugsConnectedIcon from 'phosphor-svelte/lib/PlugsConnectedIcon';
	import ArrowLeftIcon from 'phosphor-svelte/lib/ArrowLeftIcon';
	import SignOutIcon from 'phosphor-svelte/lib/SignOutIcon';
	import CaretLeftIcon from 'phosphor-svelte/lib/CaretLeftIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';

	let { data, children }: LayoutProps = $props();

	let sidebarCollapsed = $state(false);
	const isLoginRoute = $derived(page.route.id === '/admin/login');
	const currentPath = $derived(page.url.pathname);

	const navItems = [
		{ href: '/admin', label: 'Dashboard', icon: 'dashboard' },
		{ href: '/admin/posts', label: 'Posts', icon: 'posts' },
		{ href: '/admin/media', label: 'Media', icon: 'media' },
		{ href: '/admin/leads', label: 'Leads', icon: 'leads' },
		{ href: '/admin/subscribers', label: 'Subscribers', icon: 'subscribers' },
		{ href: '/admin/sequences', label: 'Sequences', icon: 'sequences' },
		{ href: '/admin/email-analytics', label: 'Email Analytics', icon: 'email-analytics' },
		{ href: '/admin/calls', label: 'Calls', icon: 'calls' },
		{ href: '/admin/inbox', label: 'Inbox', icon: 'inbox' },
		{ href: '/admin/notifications', label: 'Notifications', icon: 'notifications' },
		{ href: '/admin/analytics', label: 'Analytics', icon: 'analytics' },
		{ href: '/admin/consent', label: 'Consent', icon: 'consent' },
		{ href: '/admin/campaigns', label: 'Campaigns', icon: 'campaigns' },
		{ href: '/admin/integrations', label: 'Integrations', icon: 'integrations' }
	] as const;

	function isActive(href: string): boolean {
		if (href === '/admin') return currentPath === '/admin';
		return currentPath === href || currentPath.startsWith(`${href}/`);
	}

	/** Editor routes sit under the Posts nav item but are different pages. */
	const subPageTitles: Record<string, string> = {
		'/admin/posts/new': 'New post',
		'/admin/posts/[id]': 'Edit post'
	};

	/** One title per page, taken from the nav list so the tab, history and route announcements match the sidebar. */
	const pageTitle = $derived(
		(page.route.id && subPageTitles[page.route.id]) ||
			navItems.find((item) => isActive(item.href))?.label ||
			'Admin'
	);
</script>

<!-- The login page sets its own head. Everything else under /admin is private: noindex, no marketing meta. -->
<svelte:head>
	{#if !isLoginRoute}
		<title>{pageTitle} | Admin | Revolution Trading Pros</title>
		<meta name="robots" content="noindex, nofollow" />
	{/if}
</svelte:head>

{#if isLoginRoute}
	{@render children()}
{:else}
	<a href="#admin-main-content" class="admin-skip-link">Skip to main content</a>
	<div class={['admin-shell', { collapsed: sidebarCollapsed }]}>
		<!-- Sidebar -->
		<aside class="sidebar">
			<div class="sidebar__header">
				<a href={resolve('/admin')} class="sidebar__brand">
					<span class="sidebar__brand-icon">
						<img
							src="/logo.png"
							alt="Revolution Trading Pros"
							width="32"
							height="32"
							loading="eager"
						/>
					</span>
					{#if !sidebarCollapsed}<span class="sidebar__brand-text">Admin</span>{/if}
				</a>
				<button
					type="button"
					class="sidebar__toggle"
					onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
					aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
				>
					{#if sidebarCollapsed}<CaretRightIcon size={16} />{:else}<CaretLeftIcon size={16} />{/if}
				</button>
			</div>

			<nav class="sidebar__nav" aria-label="Admin">
				{#each navItems as item (item.href)}
					<a
						href={resolve(item.href)}
						class={['sidebar__link', { active: isActive(item.href) }]}
						aria-current={isActive(item.href) ? 'page' : undefined}
						title={sidebarCollapsed ? item.label : undefined}
						data-tooltip={item.label}
					>
						<span class="sidebar__icon">
							{#if item.icon === 'dashboard'}
								<SquaresFourIcon size={20} />
							{:else if item.icon === 'posts'}
								<ArticleIcon size={20} />
							{:else if item.icon === 'media'}
								<ImagesIcon size={20} />
							{:else if item.icon === 'leads'}
								<EnvelopeSimpleIcon size={20} />
							{:else if item.icon === 'subscribers'}
								<UsersThreeIcon size={20} />
							{:else if item.icon === 'sequences'}
								<PaperPlaneTiltIcon size={20} />
							{:else if item.icon === 'email-analytics'}
								<ChartLineUpIcon size={20} />
							{:else if item.icon === 'calls'}
								<CalendarCheckIcon size={20} />
							{:else if item.icon === 'inbox'}
								<TrayIcon size={20} />
							{:else if item.icon === 'notifications'}
								<BellIcon size={20} />
							{:else if item.icon === 'analytics'}
								<ChartBarIcon size={20} />
							{:else if item.icon === 'consent'}
								<CookieIcon size={20} />
							{:else if item.icon === 'campaigns'}
								<MegaphoneIcon size={20} />
							{:else if item.icon === 'integrations'}
								<PlugsConnectedIcon size={20} />
							{/if}
						</span>
						{#if !sidebarCollapsed}<span class="sidebar__label">{item.label}</span>{/if}
					</a>
				{/each}
			</nav>

			<div class="sidebar__footer">
				{#if data.admin && !sidebarCollapsed}
					<div class="sidebar__user" title={data.admin.email}>
						{data.admin.name || data.admin.email}
					</div>
				{/if}
				<a
					href={resolve('/')}
					class="sidebar__link sidebar__link--subtle"
					aria-label="Back to Site"
					title={sidebarCollapsed ? 'Back to Site' : undefined}
					data-tooltip="Back to Site"
				>
					<span class="sidebar__icon">
						<ArrowLeftIcon size={20} />
					</span>
					{#if !sidebarCollapsed}<span class="sidebar__label">Back to Site</span>{/if}
				</a>
				<form method="POST" action={resolve('/admin/logout')} class="sidebar__logout-form">
					<button
						type="submit"
						class="sidebar__link sidebar__link--subtle sidebar__logout-btn admin-signout"
						aria-label="Sign out"
						title={sidebarCollapsed ? 'Sign out' : undefined}
						data-tooltip="Sign out"
					>
						<span class="sidebar__icon">
							<SignOutIcon size={20} />
						</span>
						{#if !sidebarCollapsed}<span class="sidebar__label">Sign out</span>{/if}
					</button>
				</form>
			</div>
		</aside>

		<!-- Main Content -->
		<main id="admin-main-content" class="admin-main" tabindex="-1">
			{@render children()}
		</main>

		<ConfirmDialogHost />
		<Toast />
	</div>
{/if}

<style>
	/* WCAG 2.2 SC 2.5.8 (AA): pointer targets are at least 24x24 CSS px. Native checkboxes render at
	   13x13, so every admin checkbox (row selects, category and tag lists, robots flags) is sized here once.
	   The rich-text editor's own task-list boxes are left to the editor's styles. */
	.admin-shell :global(input[type='checkbox']:not(.ProseMirror *)) {
		inline-size: 1.5rem;
		block-size: 1.5rem;
		margin: 0;
		flex: none;
		accent-color: var(--acid);
		cursor: pointer;
	}

	.admin-shell {
		--font-heading: var(--font-display);
		--font-body: var(--font-sans);
		--color-brand-gold: #c5a059;
		--color-brand-gold-light: #e2c27d;
		--color-brand-gold-dark: #a37e3b;
		display: flex;
		min-height: 100vh;
		background: #0a0a0f;
		color: #fff;
		font-family: var(--font-sans);
	}

	.sidebar {
		width: 240px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		background: #0d0d14;
		border-right: 1px solid rgba(255, 255, 255, 0.06);
		overflow-x: clip;
		transition: width 0.2s ease;
	}

	.collapsed .sidebar {
		width: 64px;
	}

	.sidebar__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		gap: 0.75rem;
		min-width: 0;
		transition:
			padding 0.2s ease,
			gap 0.2s ease;
	}

	.collapsed .sidebar__header {
		flex-direction: column;
		justify-content: flex-start;
		padding: 0.875rem 0.5rem;
	}

	.sidebar__brand {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		text-decoration: none;
		color: #fff;
		min-width: 0;
		overflow: hidden;
	}

	.collapsed .sidebar__brand {
		justify-content: center;
		width: 100%;
	}

	.sidebar__brand-icon {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.1);
		overflow: hidden;
		flex-shrink: 0;
	}

	.sidebar__brand-icon img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.sidebar__brand-text {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 1rem;
		letter-spacing: -0.01em;
	}

	.sidebar__toggle {
		padding: 0.375rem;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.375rem;
		color: rgba(255, 255, 255, 0.4);
		cursor: pointer;
		transition: all 0.15s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		flex: 0 0 32px;
	}

	.sidebar__toggle:hover {
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.7);
	}

	.sidebar__nav {
		flex: 1;
		padding: 0.75rem 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.sidebar__link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 0.75rem;
		border-radius: 0.5rem;
		color: rgba(255, 255, 255, 0.55);
		text-decoration: none;
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.15s ease;
		border: none;
		background: none;
		cursor: pointer;
		width: 100%;
		text-align: left;
	}

	.collapsed .sidebar__link {
		justify-content: center;
		gap: 0;
		padding-inline: 0;
		position: relative;
	}

	.collapsed .sidebar__link::after {
		content: attr(data-tooltip);
		position: absolute;
		left: calc(100% + 0.55rem);
		top: 50%;
		transform: translateY(-50%);
		z-index: 50;
		padding: 0.35rem 0.6rem;
		border-radius: 0.4rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: #14141e;
		color: rgba(255, 255, 255, 0.92);
		font-size: 0.78rem;
		font-weight: 600;
		line-height: 1;
		white-space: nowrap;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.12s ease;
	}

	.collapsed .sidebar__link:hover::after,
	.collapsed .sidebar__link:focus-visible::after {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.collapsed .sidebar__link::after {
			transition: none;
		}
	}

	.sidebar__link:hover {
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.85);
	}

	.sidebar__link.active {
		background: rgba(197, 160, 89, 0.1);
		color: #c5a059;
	}

	.sidebar__link--subtle {
		color: rgba(255, 255, 255, 0.35);
		font-size: 0.8125rem;
	}

	.sidebar__link--subtle:hover {
		color: rgba(255, 255, 255, 0.6);
	}

	.sidebar__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		flex-shrink: 0;
	}

	.sidebar__label {
		white-space: nowrap;
		overflow: hidden;
	}

	.sidebar__footer {
		padding: 0.75rem 0.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.sidebar__user {
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.45);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sidebar__logout-form {
		margin: 0;
	}

	.sidebar__logout-btn {
		font-family: var(--font-body);
	}

	.admin-skip-link {
		position: fixed;
		top: 0.5rem;
		left: 50%;
		z-index: 2000;
		padding: 0.65rem 1rem;
		background: var(--color-brand-gold, #c5a059);
		color: #0a0a0f;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 0.88rem;
		border-radius: 0.5rem;
		text-decoration: none;
		transform: translate(-50%, -200%);
		transition: transform 0.18s ease;
	}

	.admin-skip-link:focus-visible {
		transform: translate(-50%, 0);
		outline: 2px solid #fff;
		outline-offset: 2px;
	}

	.admin-main {
		flex: 1;
		min-width: 0;
		overflow-y: auto;
	}

	@media (max-width: 768px) {
		.sidebar {
			width: 64px;
		}
		.sidebar__header {
			flex-direction: column;
			justify-content: flex-start;
			padding: 0.875rem 0.5rem;
		}
		.sidebar__brand {
			justify-content: center;
			width: 100%;
		}
		.sidebar__link {
			justify-content: center;
			gap: 0;
			padding-inline: 0;
		}
		.sidebar__brand-text,
		.sidebar__label,
		.sidebar__user {
			display: none;
		}
	}
</style>
