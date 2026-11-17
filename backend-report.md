# Backend Audit Report

**Date:** November 16, 2026

**Evidence baseline:** `592f440de2d59ac380ad82181313cb5e9e41541a`

**Sources:** [Repository audit](audit.md), [claim-verification report](docs/audit/2026-11-16/verification-report.md), and the implementation references below.

## Owner decision — November 16, 2026

Backend work is deferred until the owner resumes the proper backend build. Track the items below as unfinished implementation, integration, and verification requirements in [todo.md §7.1](todo.md). Incorporate the recorded behavior into that build rather than starting a separate repair workstream now. The evidence remains a record of what the partial implementation currently does.

## How much of the audit concerns the backend?

**Six of the twelve findings (50%) are primarily backend-related.** Another **two findings partially overlap backend work**.

This classifies the existing audit findings. It does **not** mean the backend is 50% complete, that half the backend is broken, or that every unfinished workflow needs a separate repair project. A backend completion percentage would require a separate inventory of intended features, their implementation, integrations, and acceptance criteria.

The backend already contains substantial CMS, staff authentication, database, media, leads, email, analytics, and operational code. Several customer workflows and integrations remain unfinished or unwired. Implementation presence and a working end-to-end customer flow are different checks.

## Six primary backend findings

| Audit ID | Area                                  | Evidence-backed finding                                                                                                                                                                                               | Classification and limits                                                                                                                            |
| -------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A01**  | Authentication configuration          | Missing `BETTER_AUTH_SECRET` resolves to a known development fallback. Production-generated auth also accepts an eight-character test secret, with warnings.                                                          | Incomplete production authentication validation. Actual hosted secret strength and production compromise were not established.                       |
| **A03**  | Scheduled jobs                        | Repository and inspected Vercel configuration schedule publishing and waitlist delivery only. Daily analytics, weekly analytics, and sequence-email handlers exist without those configured schedules.                | Incomplete operational wiring. Another external scheduler was not inspected; absence of these schedules does not prove every related job has failed. |
| **A04**  | Database and authenticated test setup | Seed/app filesystem PGlite selection ignores the requested disposable path. Playwright uses `PLAYWRIGHT_DATABASE_URL`, otherwise `memory://e2e`, while the runbook assumes `DATABASE_URL` supplies the shared target. | Test infrastructure and documentation mismatch. This does not demonstrate corruption or failure of the hosted database.                              |
| **A05**  | Media responses                       | A nonexistent image on the inspected Vercel deployment returns a generated placeholder SVG with `200 OK`.                                                                                                             | Existing fallback behavior can conceal missing intended assets from status checks. This does not establish that all published media is missing.      |
| **A06**  | Server-side structured data           | The actual article loader removes a prohibited top-level node but retains a nested prohibited node and a conflicting duplicate entity ID.                                                                             | Incomplete validation in the current CMS/SEO path. Reproduced with isolated fixtures; equivalent payloads were not demonstrated in live CMS content. |
| **A07**  | Post-update dates                     | Full update preserves the editorial date when `minorEdit` is true; PATCH advances it. PATCH omits the field in both its schema and its update mapping.                                                                | Inconsistent support for a caller intending a minor edit. Normal editorial changes should still advance the modification date.                       |

### Implementation and evidence references

- **A01:** [Environment defaults](src/env.ts), [auth configuration](src/lib/server/auth.ts), and [production environment helper](src/lib/server/config/runtime.ts). Verification used production-mode generated application code, a rejecting negative control, and blocked networking.
- **A03:** [Vercel schedules](vercel.json), [daily analytics handler](src/routes/api/cron/analytics-daily/+server.ts), [weekly analytics handler](src/routes/api/cron/analytics-weekly/+server.ts), and [sequence-email handler](src/routes/api/cron/send-sequence-emails/+server.ts). The verification report includes the selected read-only hosted configuration observations.
- **A04:** [Database selection](src/lib/server/db/index.ts), [seed helper](scripts/seed-admin.ts), [Playwright configuration](playwright.config.ts), and [test runbook](docs/VITE_PLUS_WORKFLOW.md). Actual path selection was exercised in a disposable OS temporary directory.
- **A05:** [Image fallback handler](src/routes/images/blog/[...file]/+server.ts). Verification includes the response status, MIME type, placeholder marker, and response-body hash from the current Vercel domain.
- **A06:** [Schema filter](src/lib/seo/blog-seo.ts) and [article loader](src/routes/blog/[slug]/+page.server.ts). The probe invoked the actual loader against an in-memory article fixture.
- **A07:** [Post schemas](src/lib/shared/schemas/posts.ts), [post services](src/lib/server/services/posts.ts), and [atomic save logic](src/lib/server/db/save-post.ts). The probe compared actual full-update and PATCH services against the same fixed starting date.

The [verification report](docs/audit/2026-11-16/verification-report.md) preserves exact source-line citations, reproduction commands, captured results, and limits for each item.

## Two findings that overlap backend work

### A02 — Dependency security

The verified dependency advisories include a transitive non-development Zod path through Blob/OIDC/CLI configuration and development dependency paths through build/lint tooling. This overlaps backend and toolchain maintenance; it is not exclusively a backend finding.

Affected installed copies and primary advisory records were verified. An exploitable public application request path was not demonstrated. See **A02** in the audit and verification report before deciding how to remediate dependencies.

### A10 — Unfinished member and enrollment workflows

The generated TODO destinations include member login, registration, mentorship application, and enrollment. Completing these journeys requires frontend and backend work, such as member sessions/access, validation, persistence, onboarding, payment integration, and entitlement provisioning as the product scope requires.

Staff `/admin/login` and CMS authentication already exist. That does not establish that the separate customer member portal is complete. Likewise, implemented lead/email services do not make the full enrollment journey operational.

The 67 TODO shells include many resource and store pages as well; they are not 67 missing backend services. Their unfinished state is intentional development scope. See [the TODO registry](src/lib/data/todo-pages.ts) and [roadmap](todo.md).

## Findings outside the primary backend group

| Audit ID | Primary category                                       |
| -------- | ------------------------------------------------------ |
| A08      | Frontend accessibility and accessibility audit tooling |
| A09      | Repository-wide CI enforcement                         |
| A11      | Operational documentation and launch-scope clarity     |
| A12      | Evidence assets and founder portrait content           |

These can affect backend delivery or launch readiness, but their principal findings are not missing backend implementations. They remain tracked in the full audit.

## How to use this report while the backend is unfinished

- Incorporate the partial-path requirements (**A01, A05, A06, A07**), operational wiring (**A03**), test infrastructure (**A04**), and customer workflows (**A10**) into the future backend build.
- During that build, establish reliable database/test isolation before using authenticated test or seed instructions against shared data.
- Confirm a service is intended to operate and its provider configuration is ready before enabling its scheduled jobs. A schedule alone does not complete the underlying workflow.
- Keep commerce, store, and eBook gates in their documented states until the relevant implementation and owner authorization are complete. See [development flags](src/lib/shared/development-status.ts) and [launch gates](src/lib/data/launch-gate.ts).
- Treat the owner's deliberate main-domain removal as intentional. It is not a backend defect and does not authorize reattaching the domain.

This file is a backend-focused view of the existing findings. Remediation status remains in [audit.md](audit.md) and [todo.md](todo.md). Creating this report does not resolve findings or change application behavior.
