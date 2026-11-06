# Public Svelte copy review: November 5, 2026

Read the [current blog handoff](../../BLOG_AGENT_HANDOFF.md) before changing blog behavior. This record covers contextual copy edits assigned to the article agent. The lead owns data modules, admin, Sunday Alpha Alerts and overall release checks.

## Scope and decisions

Reviewed `168` exact replacement snippets in `17` public Svelte components. These are contextual sentence, heading and clause edits: conjunctions, commas, semicolons, colons, periods and parenthetical punctuation were chosen per sentence. No blanket dash replacement was applied. Statements inside blockquotes, testimonial text, attribution separators, source comments and the status/title separator were preserved. Existing financial, historical and performance claims were not revalidated or expanded by this punctuation pass.

Official Svelte MCP `svelte_autofixer` analyzed all 17 changed copy components using installed Svelte 5.57.3; every result had empty issues and suggestions. Targeted Vite+ formatting/lint and Svelte ESLint passed. A later whole-project `pnpm check` passed with 0 errors and 0 warnings. Integrated browser/SEO acceptance remains a separate release gate.

## Exact reviewed snippets

### `src/lib/components/home/PersonasSection.svelte`

```diff
-match your life—while staying realistic about the risks.
+match your life while staying realistic about the risks.
```

### `src/lib/components/home/StoreToolsSection.svelte`

```diff
-market conditions clearly—not sell false certainty
+market conditions clearly without selling false certainty
```

### `src/routes/about/+page.svelte`

```diff
-McGoldrick—one of the highest-earning proprietary traders in Goldman Sachs history—who
+McGoldrick, one of the highest-earning proprietary traders in Goldman Sachs history, who
```

```diff
-on the way down—and then panicked
+on the way down and then panicked
```

```diff
-You cannot buy your way in—every applicant
+You cannot buy your way in; every applicant
```

```diff
-Feared by Wall Street—Fighting
+Feared by Wall Street, Fighting
```

```diff
-searching for—not based on hype
+searching for, based on neither hype
```

```diff
-rented lifestyles, or lies, but on
+rented lifestyles nor lies, but on
```

```diff
-</strong>—who called me
+</strong>, who called me
```

```diff
-in hindsight screenshots—but bleed
+in hindsight screenshots but bleed
```

```diff
-didn't come from a retail chatroom—it came
+didn't come from a retail chatroom; it came
```

```diff
-hedge fund door—or charging
+hedge fund door, or charging
```

```diff
-fees like fake internet gurus—I founded
+fees like fake internet gurus, I founded
```

```diff
-McGoldrick—built on real
+McGoldrick, built on real
```

```diff
-path forward—regardless
+path forward, regardless
```

```diff
-</strong>—or capture
+</strong>, or capture
```

```diff
-roof—built to take
+roof, built to take
```

### `src/routes/alert-services/spx-profit-pulse/+page.svelte`

```diff
-as price rises—fueling
+as price rises, fueling
```

```diff
-OXY Put Options trade—fading
+OXY Put Options trade, fading
```

```diff
-Each week—and before key market sessions—Billy
+Each week, and before key market sessions, Billy
```

```diff
-the week—both winners and disciplined stops—and lay out
+the week (both winners and disciplined stops) and lay out
```

```diff
-capital gains rate—regardless
+capital gains rate, regardless
```

```diff
-cannot be exercised early—eliminating
+cannot be exercised early, eliminating
```

```diff
-One SPX contract equals 10x SPY—reducing
+One SPX contract equals 10x SPY, reducing
```

```diff
-prop desk he was mentored by—every alert
+prop desk he was mentored by; every alert
```

```diff
-Options Alerts—Catch
+Options Alerts: Catch
```

```diff
-searching for—not a chaotic
+searching for: not a chaotic
```

```diff
-</strong>—who explicitly called me
+</strong>, who explicitly called me
```

```diff
-</em>—I learned
+</em>, I learned
```

```diff
-instant mobile alerts—no screen addiction
+instant mobile alerts without screen addiction
```

```diff
-more than a text notification—it is
+more than a text notification; it is
```

```diff
-</strong>—who explicitly called Billy
+</strong>, who explicitly called Billy
```

### `src/routes/live-trading-rooms/day-trading-room/+page.svelte`

```diff
-Live discipline enforcement—knowing
+Live discipline enforcement: knowing
```

```diff
-delta/gamma profiles—capturing
+delta/gamma profiles, capturing
```

```diff
-distribution high—never averaging down
+distribution high, never averaging down
```

```diff
-searching for—not a chaotic
+searching for: not a chaotic
```

```diff
-</strong>—who explicitly called me
+</strong>, who explicitly called me
```

```diff
-</em>—I became
+</em>, I became
```

```diff
-entry—plus the exact options strike
+entry, plus the exact options strike
```

```diff
-Blow Up—And Why
+Blow Up and Why
```

```diff
-Live Day Trading Room—Or Choose
+Live Day Trading Room or Choose
```

### `src/routes/live-trading-rooms/small-accounts-room/+page.svelte`

```diff
-sweep high/low—keeping
+sweep high/low, keeping
```

```diff
-(vertical spreads)—drastically lowering the cost of entry, neutralizing time decay, and profitable execution even on moderate price moves.
+(vertical spreads), drastically lowering the cost of entry, neutralizing time decay, and supporting profitable execution even on moderate price moves.
```

```diff
-before entry—zero margin surprises and zero Theta bleed traps.
+before entry, with zero margin surprises and zero Theta bleed traps.
```

```diff
-late into media hype—becoming
+late into media hype, becoming
```

```diff
-(PDT) rule—or hold
+(PDT) rule or hold
```

```diff
-count as day trades—allowing
+count as day trades, allowing
```

```diff
-for courses—wiping out
+for courses, wiping out
```

```diff
-searching for—not a reckless
+searching for: not a reckless
```

```diff
-for six-figure portfolios—where
+for six-figure portfolios, where
```

```diff
-</strong>—who called me
+</strong>, who called me
```

```diff
-</em>—I became
+</em>, I became
```

```diff
-before we enter—eliminating
+before we enter, eliminating
```

```diff
-four distinct capital brackets—each with
+four distinct capital brackets, each with
```

```diff
-We never water down our institutional edge for small accounts—we right-size the vehicle.
+We never water down our institutional edge for small accounts; we right-size the vehicle.
```

```diff
-Small Accounts Room—Or Compare
+Small Accounts Room or Compare
```

### `src/routes/live-trading-rooms/swing-trading-room/+page.svelte`

```diff
-Before the trading week begins—and each evening after the market closes—we map
+Before the trading week begins, and each evening after the market closes, we map
```

```diff
-Exact entry trigger zone—never vague
+Exact entry trigger zone instead of vague
```

```diff
-why a setup worked—building
+why a setup worked, building
```

```diff
-into leading sectors—or pivot
+into leading sectors or pivot
```

```diff
-institutional precision—selecting
+institutional precision, selecting
```

```diff
-100% defined capital at risk per trade—knowing your maximum dollar risk before you ever submit the order.
+100% defined capital at risk per trade, with your maximum dollar risk known before you ever submit the order.
```

```diff
-searching for—not hype, not fake
+searching for: not hype, not fake
```

```diff
-</strong>—who explicitly called me
+</strong>, who explicitly called me
```

```diff
-</em>—I became
+</em>, I became
```

```diff
-trigger the swing—allowing
+trigger the swing, allowing
```

```diff
-You don’t lose to Wall Street because you have a full-time job—you lose when you try to
+You don’t lose to Wall Street because you have a full-time job. You lose when you try to
```

```diff
-Fail Working Professionals—And How
+Fail Working Professionals and How
```

```diff
-Enroll in the Swing Trading Room—Or Select
+Enroll in the Swing Trading Room or Select
```

### `src/routes/mentorship/+page.svelte`

```diff
-major macro inflection points—suffering
+major macro inflection points, suffering
```

```diff
-McGoldrick—the same methodology
+McGoldrick, the same methodology
```

```diff
-contract or share size—giving back
+contract or share size, giving back
```

```diff
-dependent on us forever—it is to make
+dependent on us forever; it is to make
```

```diff
->There isn’t one—because
+>There isn’t one, because
```

```diff
-fake "holy grail" indicators—I know exactly
+fake "holy grail" indicators, I know exactly
```

```diff
-Respect Our Edge—And Why
+Respect Our Edge and Why
```

```diff
-face every day—being
+face every day: being
```

```diff
-on macro cycle turns—combined with
+on macro cycle turns, combined with
```

```diff
-very next cycle—calling
+very next cycle, calling
```

### `src/routes/our-mission/+page.svelte`

```diff
-Teach Real Institutional Market Mechanics—Never Recycled Retail Hype
+Teach Real Institutional Market Mechanics Without Recycled Retail Hype
```

```diff
-on the chart permanently—giving
+on the chart permanently, giving
```

```diff
-genuinely affordable—delivering
+genuinely affordable, delivering
```

```diff
-maximum accessibility—because
+maximum accessibility because
```

```diff
-No Fake "Holy Grail" Indicators—Ever
+No Fake "Holy Grail" Indicators. Ever.
```

```diff
-before execution—the same standard
+before execution, the same standard
```

```diff
-discipline, and work ethic—proving
+discipline, and work ethic, proving
```

```diff
-in lived market combat—forged
+in lived market combat, forged
```

```diff
-six hours a day—yet you refuse
+six hours a day, yet you refuse
```

```diff
-for $500+ accounts—teaching
+for $500+ accounts, teaching
```

```diff
-McGoldrick—not a generic pre-recorded webinar.
+McGoldrick rather than a generic pre-recorded webinar.
```

```diff
-Why We Focus on People—Not Making Money
+Why We Focus on People Over Making Money
```

```diff
-Stay Dependent—And Why
+Stay Dependent and Why
```

```diff
-</strong>—built to expose
+</strong>, built to expose
```

```diff
-absorb $2,000 drawdowns—leaving
+absorb $2,000 drawdowns, leaving
```

```diff
-isn't a marketing catchphrase—it is the exact
+isn't a marketing catchphrase; it is the exact
```

```diff
-not buying a subscription—you are entering
+not buying a subscription; you are entering
```

```diff
-every trader—from a $500 beginner or a busy working parent to a full-time options
-					scalper—has a dedicated home.
+every trader, from a $500 beginner or a busy working parent to a full-time options
+					scalper, has a dedicated home.
```

### `src/routes/resources/+page.svelte`

```diff
-your trading journey—without paying
+your trading journey without paying
```

```diff
-</strong>—who
+</strong>, who
```

### `src/routes/resources/etf-stocks-list/+page.svelte`

```diff
->—who called our founder <em>"the future of trading"</em>—we track
+>, who called our founder <em>"the future of trading"</em>, we track
```

```diff
-or earnings blowup risk—making
+or earnings blowup risk, making
```

```diff
-an underlying basket of assets—such as
+an underlying basket of assets, such as
```

```diff
-bonds, or physical commodities—allowing
+bonds, or physical commodities, allowing
```

```diff
-rarely leaves the market all at once—it rotates
+rarely leaves the market all at once; it rotates
```

```diff
-${item.ticker} — ${item.label}, chart opens in a new tab
+${item.ticker}: ${item.label}, chart opens in a new tab
```

### `src/routes/store/courses/+page.svelte`

```diff
-tablet, or phone—at your own pace
+tablet, or phone at your own pace
```

```diff
-taught by Billy Ribeiro—mentored by
+taught by Billy Ribeiro, mentored by
```

```diff
-for basic theory—wiping out
+for basic theory, wiping out
```

```diff
-searching for—not a marketer
+searching for: not a marketer
```

```diff
-</strong>—who described me as
+</strong>, who described me as
```

```diff
-</em>—I codified
+</em>, I codified
```

```diff
-traders"—where one moderator
+traders", where one moderator
```

```diff
-<strong>No—raw price, volume, and Options Greeks come first.</strong>
+<strong>No. Raw price, volume, and Options Greeks come first.</strong>
```

```diff
-United States and Canada—including
+United States and Canada, including
```

### `src/routes/store/courses/[slug]/+page.svelte`

```diff
-in any timeframe—before
+in any timeframe, before
```

```diff
-already 70% over—becoming
+already 70% over, becoming
```

```diff
-the signal never repaints—giving
+the signal never repaints, giving
```

```diff
-100% non-repainting code—zero lookahead bias and zero erased losing signals
+100% non-repainting code with zero lookahead bias and zero erased losing signals
```

```diff
-10 different chart tabs—ideal for
+10 different chart tabs, ideal for
```

```diff
-before compression fires—and flag
+before compression fires and flag
```

```diff
-Moves Earlier—And Lock
+Moves Earlier and Lock
```

```diff
-extreme of the move—helping
+extreme of the move, helping
```

```diff
-mathematical options structures—matching
+mathematical options structures, matching
```

```diff
-bought millions long—banking
+bought millions long, banking
```

```diff
-Billy Ribeiro — Founder of
+Billy Ribeiro, Founder of
```

```diff
-an institutional desk—and unlike
+an institutional desk, and unlike
```

```diff
-sell $3,000 courses—<strong>
+sell $3,000 courses, <strong>
```

```diff
-Don’t Miss This Opportunity—Start Trading
+Don’t Miss This Opportunity: Start Trading
```

### `src/routes/store/indicators/+page.svelte`

```diff
-historical screenshots—never traded live on screen.
+historical screenshots, never traded live on screen.
```

```diff
->—with zero repainting and zero hindsight lies.
+>, with zero repainting and zero hindsight lies.
```

```diff
-</strong>—who called me
+</strong>, who called me
```

```diff
-</em>—I engineered
+</em>, I engineered
```

```diff
-Destroy Accounts—And Why
+Destroy Accounts and Why
```

```diff
-into the rally—allowing us to enter
+into the rally, allowing us to enter
```

```diff
-2020 crash cascaded—and identified
+2020 crash cascaded and identified
```

### `src/routes/store/indicators/[slug]/+page.svelte`

```diff
-institutional moves—and never chase
+institutional moves and never chase
```

```diff
-volatile price action—giving you
+volatile price action, giving you
```

```diff
-stop-loss level—and once the candle closes, the signal never repaints.
+stop-loss level. Once the candle closes, the signal never repaints.
```

```diff
-top of your chart—calculating
+top of your chart, calculating
```

```diff
-chart configuration session—then watch
+chart configuration session, then watch
```

```diff
-in live markets—not cherry-picked hindsight slides.
+in live markets rather than cherry-picked hindsight slides.
```

```diff
-ever released—because it combines
+ever released because it combines
```

```diff
-</strong>—who called me
+</strong>, who called me
```

```diff
-</em>—everything changed.
+</em>, everything changed.
```

```diff
-forming—allowing you to get
+forming, allowing you to get
```

```diff
-people and member success—not making money off subscriptions
+people and member success rather than making money off subscriptions
```

```diff
-</strong>—who called Billy
+</strong>, who called Billy
```

```diff
-</em>—Billy engineered
+</em>, Billy engineered
```

### `src/routes/store/scanners/+page.svelte`

```diff
-in real time—identifying
+in real time, identifying
```

```diff
-accounts—with zero penny-stock garbage.
+accounts, with zero penny-stock garbage.
```

```diff
-per contract—pricing out small accounts.
+per contract, pricing out small accounts.
```

```diff
-institutional continuation—and which
+institutional continuation and which
```

```diff
-options liquidity—giving you
+options liquidity, giving you
```

```diff
-in real time—surfacing
+in real time, surfacing
```

```diff
-our own trading floor—helping us call
+our own trading floor, helping us call
```

```diff
-or vertical spread—ensuring
+or vertical spread, ensuring
```

```diff
-screener templates—plus a step-by-step
+screener templates, plus a step-by-step
```

### `src/routes/store/scanners/[slug]/+page.svelte`

```diff
-in real time—surfacing
+in real time, surfacing
```

```diff
-in seconds—reducing manual chart prep time by 90%
+in seconds, reducing manual chart prep time by 90%
```

```diff
-options criteria—including
+options criteria, including
```

```diff
-volatility behavior—showing
+volatility behavior, showing
```

```diff
-in under 5 minutes—then watch
+in under 5 minutes, then watch
```

```diff
-Scans stock price only—ignoring
+Scans stock price only, ignoring
```

```diff
-Engineered by Billy Ribeiro—mentored by
+Engineered by Billy Ribeiro, mentored by
```

```diff
-Lose Money—And How
+Lose Money and How
```

```diff
-Engineered by Billy Ribeiro — Mentored by
+Engineered by Billy Ribeiro, Mentored by
```

```diff
-</strong>—who explicitly called Billy
+</strong>, who explicitly called Billy
```

```diff
-</em>—Billy designed
+</em>, Billy designed
```

## Deliberately retained cases

The following remaining em-dash occurrences in this review scope are legitimate protected quotations, attribution/UI separators or non-rendered comments:

- `src/lib/components/home/MentorshipSection.svelte:36` (blockquote/testimonial or its attribution): `The standard is commitment to the process—not the size of your credit card.`
- Root status/title separator was subsequently changed to a colon during integration.
- `src/routes/about/+page.svelte:252` (blockquote/testimonial or its attribution): `Prosper—we are the present and the future, we are the revolution!"`
- `src/routes/about/+page.svelte:280` (author/byline role separator): `<strong>{FOUNDER.name}</strong> — {FOUNDER.jobTitle} at Revolution Trading Pros (<time`
- `src/routes/alert-services/spx-profit-pulse/+page.svelte:630` (source comment; not rendered copy): `(Upgrades Simpler's 3-Column Package Section — Strictly Zero Prices Shown)`
- `src/routes/alert-services/spx-profit-pulse/+page.svelte:712` (author/byline role separator): `Billy Ribeiro — The Only Trader Feared by Wall Street`
- `src/routes/alert-services/spx-profit-pulse/+page.svelte:771` (blockquote/testimonial or its attribution): `<strong>— {t.author}</strong>`
- `src/routes/live-trading-rooms/day-trading-room/+page.svelte:258` (blockquote/testimonial or its attribution): `"Educate, Innovate, and Prosper. You don't just copy tickers here—you watch our screens`
- `src/routes/live-trading-rooms/swing-trading-room/+page.svelte:258` (blockquote/testimonial or its attribution): `trade like a Goldman Sachs prop desk—you need pre-planned institutional structure, exact`
- `src/routes/mentorship/+page.svelte:248` (blockquote/testimonial or its attribution): `direct 1-on-1 mentorship. Educate, Innovate, and Prosper—we are the present and the`
- `src/routes/our-mission/+page.svelte:275` (blockquote/testimonial or its attribution): `"We are the present and the future—we are the revolution! When you step inside our rooms,`
- `src/routes/resources/+page.svelte:221` (source comment; not rendered copy): `PURE NATIVE SCOPED CSS — BLACK & WHITE EDITORIAL RESOURCES HUB`
- `src/routes/resources/etf-stocks-list/+page.svelte:555` (source comment; not rendered copy): `PURE NATIVE SCOPED CSS — BLACK & WHITE EDITORIAL ETF DIRECTORY`
- `src/routes/store/courses/+page.svelte:368` (source comment; not rendered copy): `<!-- Top Header Split (Simpler Trading Pattern — Without Duplicate DOM Bug) -->`
- `src/routes/store/courses/[slug]/+page.svelte:360` (source comment; not rendered copy): `SECTION 1: BREADCRUMB BAR (CLEAN CANONICAL NAME — NO CRM CAMPAIGN LEAKS)`
- `src/routes/store/courses/[slug]/+page.svelte:551` (source comment; not rendered copy): `(Upgrades Simpler's 2-Column Package Section — Zero Prices Displayed)`
- `src/routes/store/courses/[slug]/+page.svelte:1067` (source comment; not rendered copy): `SECTION 6: ABOUT YOUR INSTRUCTOR (BILLY RIBEIRO — GOLDMAN SACHS LINEAGE)`
- `src/routes/store/courses/[slug]/+page.svelte:1139` (source comment; not rendered copy): `SECTION 7: WHAT OUR MEMBERS SAY (6 UNIQUE VERIFIED REVIEWS — ZERO DUPLICATES)`
- `src/routes/store/courses/[slug]/+page.svelte:1159` (blockquote/testimonial or its attribution): `<strong class="review-card__author">— {rev.author}</strong>`
- `src/routes/store/indicators/[slug]/+page.svelte:707` (source comment; not rendered copy): `(Upgrades Simpler's "Choose Your Package" Box — Zero Prices Displayed)`
- `src/routes/store/indicators/[slug]/+page.svelte:883` (blockquote/testimonial or its attribution): `<strong>— {rev.author}</strong>`
- `src/routes/store/scanners/+page.svelte:644` (source comment; not rendered copy): `SECTION 3: UPGRADED SCANNERS CATALOG GRID (CRAWLABLE <A> LINKS — NO GOTO BUG)`
- `src/routes/store/scanners/[slug]/+page.svelte:1055` (source comment; not rendered copy): `SECTION 7: ABOUT THE CREATOR (BILLY RIBEIRO — GOLDMAN SACHS LINEAGE)`
- `src/routes/store/scanners/[slug]/+page.svelte:1117` (blockquote/testimonial or its attribution): `<strong>— {rev.author}</strong>`

Integration follow-up: root error-title metadata now uses a colon; root social image descriptions and homepage Twitter title use colons. Earlier retained-error-separator notes are superseded. Numeric display ranges use en dashes. Actual transport email subjects are outside the website copy pass.
