<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	/*
	 * The shell is branched on `page.route.id` rather than on the URL. The route id is exact (no trailing-slash or
	 * query ambiguity) and matches the server guard in +layout.server.ts. Route groups are not an option here
	 * because the existing admin pages already live at /admin/posts and /admin/media.
	 */
	const isLoginRoute = $derived(page.route.id === '/admin/login');
	const pathname = $derived(page.url.pathname);

	const navLinks = [
		{ label: 'Dashboard', href: resolve('/admin'), current: (p: string) => p === '/admin' },
		{
			label: 'Posts',
			href: resolve('/admin/posts'),
			current: (p: string) => p === '/admin/posts' || p.startsWith('/admin/posts/')
		},
		{
			label: 'Media',
			href: resolve('/admin/media'),
			current: (p: string) => p === '/admin/media' || p.startsWith('/admin/media/')
		},
		{ label: 'View site', href: resolve('/blog'), current: () => false }
	];
</script>

{#if isLoginRoute}
	{@render children()}
{:else}
	<a class="skip" href="#admin-content">Skip to content</a>

	<div class="admin-shell">
		<header class="admin-header">
			<a class="admin-brand" href={resolve('/admin')}>Admin</a>

			<nav class="admin-nav" aria-label="Admin">
				<ul>
					{#each navLinks as link (link.label)}
						<li>
							<a
								href={link.href}
								aria-current={link.current(pathname) ? 'page' : undefined}
								class={['admin-nav__link', { 'is-current': link.current(pathname) }]}
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>

			<div class="admin-account">
				{#if data.admin}
					<span class="admin-user" title={data.admin.email}>{data.admin.name}</span>
				{/if}
				<form method="POST" action={resolve('/admin/logout')}>
					<button type="submit" class="admin-signout">Sign out</button>
				</form>
			</div>
		</header>

		<div id="admin-content" class="admin-content" tabindex="-1">
			{@render children()}
		</div>
	</div>
{/if}

<style>
	.admin-shell {
		min-height: 100vh;
		min-height: 100dvh;
		background: var(--bg);
		color: var(--text);
		font-family: var(--font-sans);
	}

	.admin-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 24px;
		padding: 12px 16px;
		box-sizing: border-box;
		background: var(--bg-soft);
		border-bottom: 1px solid var(--line);
	}

	.admin-brand {
		font-family: var(--font-display);
		font-size: 16px;
		font-weight: 800;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--acid);
		text-decoration: none;
		min-height: 44px;
		display: inline-flex;
		align-items: center;
	}

	.admin-nav ul {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.admin-nav__link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 12px;
		font-family: var(--font-display);
		font-size: 14px;
		font-weight: 600;
		color: var(--text-secondary);
		text-decoration: none;
		border-bottom: 2px solid transparent;
	}

	.admin-nav__link:hover {
		color: var(--text);
	}

	.admin-nav__link.is-current {
		color: var(--text);
		border-bottom-color: var(--acid);
	}

	.admin-account {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-left: auto;
		flex-wrap: wrap;
	}

	.admin-user {
		font-size: 14px;
		color: var(--muted);
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.admin-signout {
		min-height: 44px;
		padding: 0 14px;
		font-family: var(--font-display);
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
		background: var(--panel2);
		border: 1px solid var(--line-strong);
		border-radius: 0;
		cursor: pointer;
	}

	.admin-signout:hover {
		background: var(--btn-dark-hover);
	}

	.admin-content {
		padding: 24px 16px 48px;
		box-sizing: border-box;
	}
</style>
