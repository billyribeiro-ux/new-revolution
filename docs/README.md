# Documentation Index (`docs/`)

> **Start at [`AGENTS.md`](../AGENTS.md) at the repository root.** It is the primary Single Source of Truth (SSOT) defining all mandatory engineering, typography, CSS, Svelte 5 / SvelteKit 3, and SEO standards.

This directory contains specialized technical documentation, architectural specifications, and operational runbooks for engineers and AI agents working on Revolution Trading Pros.

---

## 1. Core Engineering & UI Standards

| Document                                                     | Purpose & Scope                                                                                                                                                      |
| :----------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`AGENTS.md`](../AGENTS.md)                                  | **Primary SSOT.** Mandatory engineering, metadata, JSON-LD, typography, and checklist standards.                                                                     |
| [`CSS_STANDARDS.md`](CSS_STANDARDS.md)                       | Native CSS rules, design tokens, Geist typography stacks, 1536px (96rem) container, and responsive breakpoints.                                                      |
| [`NEW_PAGE_PLAYBOOK.md`](NEW_PAGE_PLAYBOOK.md)               | Step-by-step playbook and code templates for creating new marketing routes, layouts, and components.                                                                 |
| [`FONT_AND_FRAGMENT_POLICY.md`](FONT_AND_FRAGMENT_POLICY.md) | Mandatory self-hosted font loading policy (static `@font-face` in `src/app.css` only; no external font CDNs or `<link as="font">`) and zero `#` URL fragment policy. |
| [`VITE_PLUS_WORKFLOW.md`](VITE_PLUS_WORKFLOW.md)             | Toolchain command contracts (`pnpm build`, `pnpm check`, `pnpm lint`, `pnpm test:unit`, `pnpm exec vp`).                                                             |

---

## 2. Technical SEO & Search Architecture

| Document                                              | Purpose & Scope                                                                                                            |
| :---------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [`docs/seo/SEO_STANDARD.md`](seo/SEO_STANDARD.md)     | **Technical SEO SSOT.** Google Search Central and SvelteKit 3 crawlability, indexing, metadata, and structured data rules. |
| [`docs/seo/DECISIONS.md`](seo/DECISIONS.md)           | Recorded owner decisions on hosts, locales, noindex sections, and crawl controls.                                          |
| [`docs/seo/OPERATIONS.md`](seo/OPERATIONS.md)         | Operational guidelines for search console verification, sitemap submissions, and monitoring.                               |
| [`docs/seo/LAUNCH_TRACKER.md`](seo/LAUNCH_TRACKER.md) | Checklist tracking indexing eligibility and launch gates for store, articles, and products.                                |
| [`docs/SEO_EVIDENCE.md`](SEO_EVIDENCE.md)             | Primary-source documentation citations and verified evidence log from Google Search Central.                               |
| [`seo-audit.md`](../seo-audit.md)                     | End-to-end technical SEO audit runbook and adversarial testing procedure.                                                  |
| [`seo-verify.md`](../seo-verify.md)                   | Adversarial clean-room verification workflow for completed SEO audits.                                                     |

---

## 3. Administration, Security & Multi-Agent Coordination

| Document                                         | Purpose & Scope                                                                          |
| :----------------------------------------------- | :--------------------------------------------------------------------------------------- |
| [`ADMIN_AUTH_PLAN.md`](ADMIN_AUTH_PLAN.md)       | Better Auth architecture, session guards, role enforcement, and CMS security plan.       |
| [`ADMIN_LOCAL_LOGIN.md`](ADMIN_LOCAL_LOGIN.md)   | Operational guide for local admin seed account, login testing, and publishing gates.     |
| [`AGENT_COORDINATION.md`](AGENT_COORDINATION.md) | Protocol for multi-agent coordination, branch management, and avoiding race conditions.  |
| [`TEMPORARY.md`](TEMPORARY.md)                   | Registry of all temporary items, test credentials, mocks, and explicit removal criteria. |

---

## 4. Platform Infrastructure, Media & Maintenance

| Document                                                           | Purpose & Scope                                                                          |
| :----------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| [`MAINTENANCE.md`](MAINTENANCE.md)                                 | Deployment-time maintenance mode switch, preview limitations, and operations.            |
| [`MAINTENANCE_EXPERIENCE_PLAN.md`](MAINTENANCE_EXPERIENCE_PLAN.md) | Architecture for maintenance countdown, simulated market chart playback, and waitlist.   |
| [`MEDIA_STORAGE.md`](MEDIA_STORAGE.md)                             | Media storage drivers (production Vercel Blob store vs. local disk dev driver).          |
| [`MEDIA_UI_CONTRACT.md`](MEDIA_UI_CONTRACT.md)                     | Image aspect ratios, responsive `srcset`, alt text requirements, and LCP priority rules. |
| [`WAITLIST_SETUP.md`](WAITLIST_SETUP.md)                           | Setup and verification workflow for waitlist capture and transactional email delivery.   |

---

## 5. Blog System & Publishing (CMS)

| Document                                                                     | Purpose & Scope                                                                       |
| :--------------------------------------------------------------------------- | :------------------------------------------------------------------------------------ |
| [`BLOG_AGENT_HANDOFF.md`](BLOG_AGENT_HANDOFF.md)                             | Verified status, live CMS publication workflow, and shared listing contract.          |
| [`blog implementation.md`](../blog%20implementation.md)                      | Authoring, publishing, image optimization, and editorial compliance for CMS articles. |
| [`blog/LAYOUT_AND_CONTENT_CONTRACT.md`](blog/LAYOUT_AND_CONTENT_CONTRACT.md) | Shared 1536px outer frame, typography, and TOC interaction contract.                  |
| [`blog/AUTOMATION_PLAN.md`](blog/AUTOMATION_PLAN.md)                         | Proposed intake automation and feed synchronization plan.                             |
| [`blog/COVERAGE_MATRIX.md`](blog/COVERAGE_MATRIX.md)                         | Editorial keyword coverage, category mapping, and topic clusters.                     |
| [`blog/FRESHNESS.md`](blog/FRESHNESS.md)                                     | Content lifecycle, scheduled refresh, and cache invalidation policies.                |
