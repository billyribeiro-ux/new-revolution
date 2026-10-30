<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { slide } from 'svelte/transition';
	import { prefersReducedMotion } from 'svelte/motion';
	import logo from '#lib/assets/REvolution-Trading-Pros-logo.png?enhanced';
	import { MAIN_NAVIGATION } from '#lib/data/homepage.ts';
	import ArrowUpRightIcon from 'phosphor-svelte/lib/ArrowUpRightIcon';
	import BookOpenIcon from 'phosphor-svelte/lib/BookOpenIcon';
	import ShieldCheckIcon from 'phosphor-svelte/lib/ShieldCheckIcon';
	import StudentIcon from 'phosphor-svelte/lib/StudentIcon';
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';
	import ListIcon from 'phosphor-svelte/lib/ListIcon';
	import SignInIcon from 'phosphor-svelte/lib/SignInIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import { NAV_ICONS } from './nav-icons.ts';

	interface Props {
		scrollPercent?: number;
		onPreviewNavigate?: (href: string, targetId?: string, event?: MouseEvent) => void;
	}

	let { scrollPercent = 0, onPreviewNavigate }: Props = $props();

	let pathname = $derived(page.url.pathname);

	function isActive(href: string | undefined) {
		if (!href) return false;
		return pathname === href || pathname.startsWith(`${href}/`);
	}

	function isGroupActive(item: (typeof MAIN_NAVIGATION)[number]) {
		return isActive(item.href) || (item.children?.some((child) => isActive(child.href)) ?? false);
	}

	let slideDuration = $derived(prefersReducedMotion.current ? 0 : 220);

	let mobileMenuOpen = $state(false);
	let openDropdownId = $state<string | null>(null);
	let openMobileSubmenuId = $state<string | null>('live-trading-rooms');

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
		if (typeof document !== 'undefined') {
			document.body.classList.toggle('menu-open', mobileMenuOpen);
		}
	}

	function closeAllMenus() {
		mobileMenuOpen = false;
		openDropdownId = null;
		if (typeof document !== 'undefined') {
			document.body.classList.remove('menu-open');
		}
	}

	function toggleDropdown(id: string) {
		openDropdownId = openDropdownId === id ? null : id;
	}

	function handleDropdownFocusOut(id: string, event: FocusEvent) {
		const currentTarget = event.currentTarget as HTMLElement | null;
		const relatedTarget = event.relatedTarget as Node | null;
		if (!currentTarget || !relatedTarget || !currentTarget.contains(relatedTarget)) {
			if (openDropdownId === id) {
				openDropdownId = null;
			}
		}
	}

	function toggleMobileSubmenu(id: string) {
		openMobileSubmenuId = openMobileSubmenuId === id ? null : id;
	}

	function handleLinkClick(href: string, targetId: string | undefined, event: MouseEvent) {
		closeAllMenus();
		onPreviewNavigate?.(href, targetId, event);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeAllMenus();
		}
	}

	function handleWindowClick(event: MouseEvent) {
		if (!openDropdownId) return;
		const target = event.target as Element | null;
		if (!target?.closest('.nav-item')) {
			openDropdownId = null;
		}
	}

	function handleResize() {
		if (typeof window !== 'undefined' && window.innerWidth >= 1024 && mobileMenuOpen) {
			closeAllMenus();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} onclick={handleWindowClick} onresize={handleResize} />

<div class="announcement">
	<div class="container">
		<div class="announcement-message">
			<span class="announcement-tag">
				<ShieldCheckIcon size={14} weight="fill" aria-hidden="true" />
				PEOPLE OVER PROFITS
			</span>
			<span>Real education. Risk-first trading. No “magic arrow” promises.</span>
		</div>
		<div class="announcement-links">
			<a
				href={resolve('/mentorship' as '/')}
				onclick={(e) => handleLinkClick('/mentorship', 'mentorship', e)}
			>
				<StudentIcon size={16} weight="bold" aria-hidden="true" />
				1-on-1 Mentorship
				<ArrowUpRightIcon size={13} weight="bold" aria-hidden="true" />
			</a>
			<a
				href={resolve('/resources/free-trading-ebook' as '/')}
				onclick={(e) => handleLinkClick('/resources/free-trading-ebook', 'ebook', e)}
			>
				<BookOpenIcon size={16} weight="bold" aria-hidden="true" />
				Free Trading eBook
				<ArrowUpRightIcon size={13} weight="bold" aria-hidden="true" />
			</a>
		</div>
	</div>
</div>

<header class={['nav-shell', { 'menu-open': mobileMenuOpen }]} id="top">
	<div class="container nav">
		<a
			class="brand"
			href={resolve('/')}
			aria-label="Revolution Trading Pros homepage"
			onclick={(e) => handleLinkClick('/', 'top', e)}
		>
			<span class="brand-logo-wrap">
				<enhanced:img src={logo} alt="Revolution Trading Pros emblem" fetchpriority="high" />
			</span>
			<span class="brand-text">
				<span class="brand-name">REVOLUTION<br />TRADING PROS</span>
				<span class="brand-tagline">EDUCATE • INNOVATE • PROSPER</span>
			</span>
		</a>

		<nav class="nav-links" aria-label="Primary navigation">
			{#each MAIN_NAVIGATION as item (item.id)}
				{#if item.children && item.children.length > 0}
					<div
						class={['nav-item', { open: openDropdownId === item.id, active: isGroupActive(item) }]}
						onfocusout={(e) => handleDropdownFocusOut(item.id, e)}
					>
						<button
							type="button"
							class="nav-dropdown-trigger"
							aria-haspopup="true"
							aria-expanded={openDropdownId === item.id}
							onclick={() => toggleDropdown(item.id)}
						>
							<span>{item.label}</span>
							<span class="caret-icon" aria-hidden="true">
								<CaretDownIcon size={10} weight="fill" />
							</span>
						</button>
						<ul
							class="dropdown-menu"
							aria-label="{item.label} submenu"
							onfocusin={() => (openDropdownId = item.id)}
						>
							{#each item.children as sub (sub.href)}
								{@const SubIcon = sub.icon ? NAV_ICONS[sub.icon] : null}
								<li>
									<a
										class="dropdown-link"
										href={resolve(sub.href as '/')}
										data-desc={sub.description}
										aria-current={isActive(sub.href) ? 'page' : undefined}
										onclick={(e) => handleLinkClick(sub.href, sub.previewTarget, e)}
									>
										{#if SubIcon}
											<span class="dropdown-icon" aria-hidden="true">
												<SubIcon size={22} weight="duotone" />
											</span>
										{/if}
										<span class="dropdown-label">{sub.label}</span>
										<span class="dropdown-go" aria-hidden="true">
											<ArrowUpRightIcon size={14} weight="bold" />
										</span>
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{:else if item.href}
					<div class="nav-item">
						<a
							class="nav-link"
							href={resolve(item.href as '/')}
							aria-current={isActive(item.href) ? 'page' : undefined}
							onclick={(e) => handleLinkClick(item.href!, item.previewTarget, e)}
						>
							{item.label}
						</a>
					</div>
				{/if}
			{/each}
		</nav>

		<div class="nav-actions">
			<a
				href={resolve('/login' as '/')}
				class="btn btn-outline"
				onclick={(e) => handleLinkClick('/login', undefined, e)}
			>
				Member Login
			</a>
			<a
				href={resolve('/memberships' as '/')}
				class="btn btn-primary"
				onclick={(e) => handleLinkClick('/memberships', 'memberships', e)}
			>
				Explore Memberships <ArrowUpRightIcon size={14} weight="bold" aria-hidden="true" />
			</a>
		</div>

		<button
			type="button"
			class="mobile-toggle"
			id="mobileToggle"
			aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
			aria-controls="mobileNavigation"
			aria-expanded={mobileMenuOpen}
			onclick={toggleMobileMenu}
		>
			{#if mobileMenuOpen}
				<XIcon size={22} weight="bold" aria-hidden="true" />
			{:else}
				<ListIcon size={22} weight="bold" aria-hidden="true" />
			{/if}
		</button>
	</div>

	<nav
		class={['mobile-nav', { open: mobileMenuOpen }]}
		id="mobileNavigation"
		aria-label="Mobile navigation"
	>
		<ul class="mobile-nav-list">
			{#each MAIN_NAVIGATION as item (item.id)}
				{@const ItemIcon = item.icon ? NAV_ICONS[item.icon] : null}
				<li class={['mobile-nav-item', { active: isGroupActive(item) }]}>
					{#if item.children && item.children.length > 0}
						<button
							type="button"
							class="mobile-nav-trigger"
							aria-expanded={openMobileSubmenuId === item.id}
							onclick={() => toggleMobileSubmenu(item.id)}
						>
							<span class="mobile-nav-label">
								{#if ItemIcon}
									<span class="mobile-nav-icon" aria-hidden="true">
										<ItemIcon size={20} weight="duotone" />
									</span>
								{/if}
								<span>{item.label}</span>
							</span>
							<span class="mobile-caret" aria-hidden="true">
								<CaretDownIcon size={12} weight="fill" />
							</span>
						</button>
						{#if openMobileSubmenuId === item.id}
							<ul class="mobile-submenu" transition:slide={{ duration: slideDuration }}>
								{#each item.children as sub (sub.href)}
									{@const SubIcon = sub.icon ? NAV_ICONS[sub.icon] : null}
									<li>
										<a
											href={resolve(sub.href as '/')}
											data-desc={sub.description}
											aria-current={isActive(sub.href) ? 'page' : undefined}
											onclick={(e) => handleLinkClick(sub.href, sub.previewTarget, e)}
										>
											{#if SubIcon}
												<span class="mobile-sub-icon" aria-hidden="true">
													<SubIcon size={20} weight="duotone" />
												</span>
											{/if}
											<span class="mobile-sub-label">{sub.label}</span>
										</a>
									</li>
								{/each}
							</ul>
						{/if}
					{:else if item.href}
						<a
							class="mobile-nav-link"
							href={resolve(item.href as '/')}
							aria-current={isActive(item.href) ? 'page' : undefined}
							onclick={(e) => handleLinkClick(item.href!, item.previewTarget, e)}
						>
							<span class="mobile-nav-label">
								{#if ItemIcon}
									<span class="mobile-nav-icon" aria-hidden="true">
										<ItemIcon size={20} weight="duotone" />
									</span>
								{/if}
								<span>{item.label}</span>
							</span>
							<span class="mobile-caret mobile-caret--go" aria-hidden="true">
								<ArrowUpRightIcon size={16} weight="bold" />
							</span>
						</a>
					{/if}
				</li>
			{/each}
		</ul>

		<div class="mobile-nav-actions">
			<a
				href={resolve('/login' as '/')}
				class="btn btn-outline"
				onclick={(e) => handleLinkClick('/login', undefined, e)}
			>
				<SignInIcon size={16} weight="bold" aria-hidden="true" /> Member Login
			</a>
			<a
				href={resolve('/memberships' as '/')}
				class="btn btn-primary"
				onclick={(e) => handleLinkClick('/memberships', 'memberships', e)}
			>
				Explore Memberships <ArrowUpRightIcon size={15} weight="bold" aria-hidden="true" />
			</a>
		</div>
	</nav>

	<div
		class="scroll-meter"
		id="scrollMeter"
		style:width="{scrollPercent}%"
		aria-hidden="true"
	></div>
</header>

<style>
	/* Top Trust Bar (Announcement) */
	.announcement {
		background: var(--acid);
		color: var(--ink);
		border-block-end: 1px solid rgba(0, 0, 0, 0.18);
	}

	.announcement .container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-block-size: 52px;
		padding-block: 8px;
		gap: 1.125rem;
	}

	.announcement-message {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.375rem;
		inline-size: 100%;
		font-family: var(--font-sans);
		font-weight: 600;
		font-size: 0.9375rem;
		line-height: 1.35;
		letter-spacing: 0.005em;
		white-space: normal;
	}

	.announcement-tag {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		line-height: 1;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		inline-size: fit-content;
		background: var(--ink);
		color: var(--acid);
		padding: 7px 10px;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.announcement-links {
		display: none;
		align-items: center;
		gap: 0.625rem;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.8125rem;
		letter-spacing: 0.02em;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.announcement-links a {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 7px 12px;
		border: 1px solid rgba(17, 21, 26, 0.45);
		transition:
			background-color 0.2s var(--ease-out),
			color 0.2s var(--ease-out),
			border-color 0.2s var(--ease-out);
	}

	.announcement-links a:hover,
	.announcement-links a:focus-visible {
		background: var(--ink);
		border-color: var(--ink);
		color: var(--acid);
	}

	/* Sticky Navigation & Dropdown Architecture */
	.nav-shell {
		position: sticky;
		inset-block-start: 0;
		z-index: 80;
		background: rgba(11, 14, 18, 0.96);
		backdrop-filter: blur(18px);
		border-block-end: 1px solid #252a30;
	}

	.nav {
		min-block-size: var(--nav-height);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
		min-inline-size: 0;
	}

	.brand-logo-wrap {
		inline-size: 36px;
		block-size: 36px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.brand-logo-wrap :global(picture),
	.brand-logo-wrap :global(img) {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		object-position: left center;
	}

	.brand-text {
		display: flex;
		flex-direction: column;
	}

	.brand-name {
		display: block;
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 0.9375rem;
		line-height: 1.02;
		letter-spacing: -0.025em;
		text-transform: uppercase;
		inline-size: fit-content;
		color: var(--text);
	}

	.brand-tagline {
		display: block;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.52rem;
		line-height: 1.1;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		inline-size: fit-content;
		color: var(--acid);
		margin-block-start: 3px;
	}

	.nav-links {
		display: none;
		align-items: center;
		gap: 1.125rem;
		margin-inline-start: auto;
	}

	.nav-item {
		position: relative;
		display: flex;
		align-items: center;
	}

	.nav-link,
	.nav-dropdown-trigger {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 0.875rem;
		line-height: 1.2;
		letter-spacing: 0.01em;
		inline-size: fit-content;
		color: #c6cbd0;
		background: none;
		border: 0;
		padding: 0.5rem 0.25rem;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		white-space: nowrap;
		transition: color 0.2s var(--ease-out);
	}

	.nav-link,
	.nav-dropdown-trigger {
		position: relative;
	}

	.nav-link::after,
	.nav-dropdown-trigger::after {
		content: '';
		position: absolute;
		inset-inline: 0.25rem;
		inset-block-end: 0;
		block-size: 2px;
		background: var(--acid);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.25s var(--ease-out);
	}

	.nav-link:hover,
	.nav-dropdown-trigger:hover,
	.nav-item:focus-within > .nav-dropdown-trigger,
	.nav-dropdown-trigger[aria-expanded='true'],
	.nav-link[aria-current='page'],
	.nav-item.active > .nav-dropdown-trigger {
		color: var(--acid);
	}

	.nav-link:hover::after,
	.nav-dropdown-trigger:hover::after,
	.nav-item:hover > .nav-dropdown-trigger::after,
	.nav-dropdown-trigger[aria-expanded='true']::after,
	.nav-link[aria-current='page']::after,
	.nav-item.active > .nav-dropdown-trigger::after {
		transform: scaleX(1);
	}

	.caret-icon {
		display: inline-flex;
		align-items: center;
		margin-inline-start: 3px;
		opacity: 0.65;
		transition:
			transform 0.22s var(--ease-out),
			opacity 0.2s var(--ease-out);
	}

	.nav-dropdown-trigger:hover .caret-icon,
	.nav-item:focus-within .caret-icon,
	.nav-dropdown-trigger[aria-expanded='true'] .caret-icon,
	.nav-item.active .caret-icon {
		opacity: 1;
	}

	.nav-item:hover .caret-icon,
	.nav-dropdown-trigger[aria-expanded='true'] .caret-icon {
		transform: rotate(180deg);
	}

	.dropdown-menu {
		position: absolute;
		inset-block-start: calc(100% + 10px);
		inset-inline-start: -16px;
		inline-size: 372px;
		padding: 8px;
		list-style: none;
		margin: 0;
		background: linear-gradient(180deg, #141a20, #0f1418);
		border: 1px solid #2f363d;
		border-block-start: 2px solid var(--acid);
		box-shadow:
			0 28px 64px rgba(0, 0, 0, 0.6),
			0 0 0 1px rgba(255, 255, 255, 0.02);
		opacity: 0;
		visibility: hidden;
		transform: translateY(8px);
		transition:
			opacity 0.2s var(--ease-out),
			transform 0.2s var(--ease-out),
			visibility 0s linear 0.2s;
		z-index: 100;
	}

	/* Invisible bridge so the pointer can travel from trigger to panel without closing it */
	.dropdown-menu::before {
		content: '';
		position: absolute;
		inset-inline: 0;
		inset-block-end: 100%;
		block-size: 14px;
	}

	.nav-item:nth-last-child(-n + 3) > .dropdown-menu {
		inset-inline-start: auto;
		inset-inline-end: -16px;
	}

	.nav-item:hover > .dropdown-menu,
	.nav-item:focus-within > .dropdown-menu,
	.nav-item.open > .dropdown-menu {
		opacity: 1;
		visibility: visible;
		transform: translateY(0);
		transition-delay: 0s;
	}

	.dropdown-menu li + li {
		margin-block-start: 2px;
	}

	.dropdown-link {
		display: grid;
		grid-template-columns: 44px minmax(0, 1fr) 28px;
		grid-template-rows: auto auto;
		column-gap: 14px;
		align-items: center;
		padding: 12px;
		color: var(--text);
		inline-size: 100%;
		border: 1px solid transparent;
		transition:
			background-color 0.18s var(--ease-out),
			border-color 0.18s var(--ease-out);
	}

	.dropdown-icon {
		grid-row: 1 / span 2;
		display: grid;
		place-items: center;
		inline-size: 44px;
		block-size: 44px;
		color: var(--acid);
		border: 1px solid rgba(220, 255, 101, 0.28);
		background: rgba(220, 255, 101, 0.06);
		transition:
			background-color 0.18s var(--ease-out),
			color 0.18s var(--ease-out),
			border-color 0.18s var(--ease-out);
	}

	.dropdown-label {
		grid-column: 2;
		grid-row: 1;
		align-self: end;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.875rem;
		line-height: 1.25;
		letter-spacing: -0.005em;
	}

	/* Description lives in a pseudo-element so link text stays exactly the label (SEO/a11y name + e2e contract) */
	.dropdown-link::after {
		content: attr(data-desc);
		grid-column: 2;
		grid-row: 2;
		align-self: start;
		margin-block-start: 2px;
		font-family: var(--font-sans);
		font-weight: 400;
		font-size: 0.8125rem;
		line-height: 1.4;
		color: #98a1a7;
	}

	.dropdown-go {
		grid-column: 3;
		grid-row: 1 / span 2;
		display: grid;
		place-items: center;
		inline-size: 28px;
		block-size: 28px;
		color: var(--acid);
		opacity: 0;
		transform: translate(-4px, 4px);
		transition:
			opacity 0.18s var(--ease-out),
			transform 0.18s var(--ease-out);
	}

	.dropdown-link:hover,
	.dropdown-link:focus-visible {
		background: rgba(220, 255, 101, 0.07);
		border-color: rgba(220, 255, 101, 0.35);
		outline: none;
	}

	.dropdown-link:hover .dropdown-icon,
	.dropdown-link:focus-visible .dropdown-icon {
		background: var(--acid);
		border-color: var(--acid);
		color: var(--ink);
	}

	.dropdown-link:hover .dropdown-go,
	.dropdown-link:focus-visible .dropdown-go {
		opacity: 1;
		transform: translate(0, 0);
	}

	.dropdown-link[aria-current='page'] {
		border-color: rgba(220, 255, 101, 0.22);
	}

	.dropdown-link[aria-current='page'] .dropdown-label {
		color: var(--acid);
	}

	.nav-actions {
		display: none;
		align-items: center;
		gap: 0.5rem;
		margin-inline-start: 0.5rem;
		flex-shrink: 0;
	}

	.nav-actions .btn {
		min-block-size: 40px;
		min-inline-size: auto;
		padding: 10px 14px;
		font-size: 0.75rem;
	}

	.mobile-toggle {
		display: flex;
		margin-inline-start: auto;
		inline-size: 48px;
		block-size: 48px;
		flex-shrink: 0;
		background: none;
		color: var(--text);
		border: 1px solid var(--line);
		align-items: center;
		justify-content: center;
		transition:
			color 0.2s var(--ease-out),
			border-color 0.2s var(--ease-out),
			background-color 0.2s var(--ease-out);
	}

	.mobile-toggle:hover,
	.mobile-toggle[aria-expanded='true'] {
		color: var(--acid);
		border-color: var(--acid);
		background: rgba(220, 255, 101, 0.06);
	}

	.mobile-nav {
		display: none;
		position: absolute;
		inset-block-start: var(--nav-height);
		inset-inline: 0;
		background: linear-gradient(180deg, #11161a, #0d1115);
		border-block-end: 1px solid #343b41;
		max-block-size: calc(100dvh - var(--nav-height));
		overflow: auto;
		overscroll-behavior: contain;
		padding: 12px 18px 27px;
	}

	.mobile-nav.open {
		display: block;
	}

	.mobile-nav-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.mobile-nav-item {
		border-block-end: 1px solid #252c32;
	}

	.mobile-nav-link,
	.mobile-nav-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		inline-size: 100%;
		min-block-size: 56px;
		padding: 8px 0;
		background: none;
		border: 0;
		color: var(--text);
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1rem;
		letter-spacing: 0.005em;
		text-align: left;
		transition: color 0.18s var(--ease-out);
	}

	.mobile-nav-label {
		display: inline-flex;
		align-items: center;
		gap: 14px;
	}

	.mobile-nav-icon,
	.mobile-sub-icon {
		display: inline-grid;
		place-items: center;
		flex: none;
		inline-size: 40px;
		block-size: 40px;
		color: var(--acid);
		border: 1px solid rgba(220, 255, 101, 0.28);
		background: rgba(220, 255, 101, 0.06);
	}

	.mobile-caret {
		display: inline-grid;
		place-items: center;
		inline-size: 32px;
		block-size: 32px;
		color: var(--muted);
		transition:
			transform 0.22s var(--ease-out),
			color 0.18s var(--ease-out);
	}

	.mobile-nav-trigger[aria-expanded='true'] .mobile-caret {
		transform: rotate(180deg);
		color: var(--acid);
	}

	.mobile-nav-link:hover,
	.mobile-nav-trigger:hover,
	.mobile-nav-link[aria-current='page'],
	.mobile-nav-item.active > .mobile-nav-trigger {
		color: var(--acid);
	}

	.mobile-nav-link:hover .mobile-caret--go {
		color: var(--acid);
	}

	.mobile-submenu {
		list-style: none;
		margin: 0;
		padding: 2px 0 14px 18px;
		border-inline-start: 1px solid #2c343a;
		margin-inline-start: 19px;
	}

	.mobile-submenu a {
		display: grid;
		grid-template-columns: 40px minmax(0, 1fr);
		column-gap: 14px;
		align-items: center;
		min-block-size: 56px;
		padding: 8px 8px 8px 0;
		color: var(--text);
		transition: color 0.18s var(--ease-out);
	}

	.mobile-sub-icon {
		grid-row: 1 / span 2;
	}

	.mobile-sub-label {
		grid-column: 2;
		align-self: end;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 0.9375rem;
		line-height: 1.25;
	}

	.mobile-submenu a::after {
		content: attr(data-desc);
		grid-column: 2;
		grid-row: 2;
		font-family: var(--font-sans);
		font-weight: 400;
		font-size: 0.8125rem;
		line-height: 1.4;
		color: #98a1a7;
	}

	.mobile-submenu a:hover,
	.mobile-submenu a[aria-current='page'] {
		color: var(--acid);
	}

	.mobile-submenu a:hover .mobile-sub-icon {
		background: var(--acid);
		color: var(--ink);
	}

	.mobile-nav-actions {
		display: grid;
		gap: 10px;
		margin-block-start: 20px;
	}

	.mobile-nav-actions .btn {
		inline-size: 100%;
		max-inline-size: none;
	}

	.scroll-meter {
		position: absolute;
		block-size: 2px;
		inset-inline-start: 0;
		inset-block-end: -1px;
		inline-size: 0;
		background: var(--acid);
		z-index: 2;
		transition: width 0.08s linear;
	}

	@media (min-width: 480px) {
		.nav {
			gap: 1.25rem;
		}

		.brand {
			gap: 0.75rem;
		}

		.brand-name {
			font-size: clamp(1.05rem, 1.5vw, 1.35rem);
		}

		.brand-tagline {
			font-size: 0.65rem;
			letter-spacing: 0.16em;
			margin-block-start: 5px;
		}

		.mobile-nav-actions .btn {
			inline-size: 100%;
			max-inline-size: none;
		}
	}

	@media (min-width: 640px) {
		.brand-logo-wrap {
			inline-size: 46px;
			block-size: 46px;
		}

		.mobile-nav {
			padding-inline: 35px;
		}
	}

	@media (min-width: 768px) {
		.announcement .container {
			min-block-size: 52px;
		}

		.announcement-message {
			flex-direction: row;
			align-items: center;
			inline-size: auto;
			flex: 1 1 auto;
			min-inline-size: 0;
			white-space: normal;
			font-size: 0.875rem;
			gap: 0.625rem;
		}

		/* Tablet: the tagline and both quick links share one row, so the badge steps aside */
		.announcement-tag {
			display: none;
		}

		.announcement-links {
			display: flex;
		}
	}

	@media (min-width: 1024px) {
		.announcement-message {
			font-size: 0.875rem;
			gap: 0.75rem;
		}

		.announcement-tag {
			display: inline-flex;
		}

		.announcement-links {
			gap: 0.75rem;
		}

		.nav {
			gap: 0.35rem;
		}

		.brand {
			gap: 0.45rem;
		}

		.brand-name {
			font-size: 0.8125rem;
		}

		.brand-tagline {
			font-size: 0.4375rem;
			letter-spacing: 0.04em;
			margin-block-start: 3px;
		}

		.nav-links {
			display: flex;
			gap: 0.125rem;
		}

		.nav-link,
		.nav-dropdown-trigger {
			font-size: 0.6875rem;
			letter-spacing: -0.01em;
			padding: 0.35rem 0.1rem;
			gap: 0.1rem;
		}

		.nav-actions {
			display: flex;
			gap: 0.25rem;
			margin-inline-start: 0.15rem;
		}

		.nav-actions .btn {
			min-block-size: 36px;
			min-inline-size: 0;
			inline-size: auto;
			padding: 6px 7px;
			font-size: 0.625rem;
			letter-spacing: 0.01em;
			gap: 0.2rem;
		}

		.mobile-toggle {
			display: none;
		}

		.mobile-nav,
		.mobile-nav.open {
			display: none;
		}
	}

	@media (min-width: 1280px) {
		.announcement-message {
			white-space: nowrap;
			font-size: 0.9375rem;
		}

		.nav {
			gap: 0.5rem;
		}

		.brand {
			gap: 0.625rem;
		}

		.brand-name {
			font-size: 1.05rem;
		}

		.brand-tagline {
			font-size: 0.55rem;
			letter-spacing: 0.1em;
			margin-block-start: 4px;
		}

		.nav-links {
			gap: 0.35rem;
		}

		.nav-link,
		.nav-dropdown-trigger {
			font-size: 0.78125rem;
			letter-spacing: 0;
			padding: 0.45rem 0.15rem;
			gap: 0.15rem;
		}

		.nav-actions {
			gap: 0.35rem;
			margin-inline-start: 0.25rem;
		}

		.nav-actions .btn {
			min-block-size: 40px;
			padding: 8px 10px;
			font-size: 0.6875rem;
			letter-spacing: 0.02em;
			gap: 0.25rem;
		}
	}

	@media (min-width: 1536px) {
		.nav {
			gap: 1.125rem;
		}

		.brand {
			gap: 0.75rem;
		}

		.brand-name {
			font-size: clamp(1.05rem, 1.5vw, 1.35rem);
		}

		.brand-tagline {
			font-size: 0.65rem;
			letter-spacing: 0.16em;
			margin-block-start: 5px;
		}

		.nav-links {
			gap: 0.9rem;
		}

		.nav-link,
		.nav-dropdown-trigger {
			font-size: 0.875rem;
			padding: 0.5rem 0.25rem;
			gap: 0.3rem;
		}

		.nav-actions {
			gap: 0.5rem;
			margin-inline-start: 0.5rem;
		}

		.nav-actions .btn {
			padding: 10px 14px;
			font-size: 0.75rem;
			letter-spacing: 0.04em;
			gap: 0.45rem;
		}
	}
</style>
