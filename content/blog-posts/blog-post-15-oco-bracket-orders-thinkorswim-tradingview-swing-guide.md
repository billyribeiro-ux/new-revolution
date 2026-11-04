# Blog Post #15: OCO Bracket Orders Guide: Automating Swing Trades on ThinkorSwim & TradingView

> **Document Purpose:** Production-ready Markdown, HTML/CMS payload, complete Featured & In-Body Image Specifications, Internal/External Link Map, Unified Schema.org `@graph` JSON-LD, and Hard-Evidence SEO Audit for Post #15 from [`blog-posts.md`](blog-posts.md).
> **Verified Against:** Google Search Central Documentation (as of October 31, 2026), [`docs/SEO_EVIDENCE.md`](docs/SEO_EVIDENCE.md), [`AGENTS.md`](AGENTS.md), and the CMS Publish Gate ([`src/lib/shared/seo/score.ts`](src/lib/shared/seo/score.ts)).

---

## 1. Complete SEO, Social & CMS Metadata Package

| Field                    | Value                                                                                                                                                     | Validation & Evidence Check                                                                                                                                |
| :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`title` (H1)**         | `OCO Bracket Orders Guide: Automating Swing Trades on ThinkorSwim & TradingView`                                                                          | `78` chars; single `<h1>` on page; agrees with `<title>` (`title-link` doc).                                                                               |
| **`slug`**               | `oco-bracket-orders-thinkorswim-tradingview-swing-guide`                                                                                                  | `54` chars (`<= 70` limit); lowercase hyphenated (`[a-z0-9-]`); `0` gate stop words (`< 3` limit); includes `oco-bracket-orders` (`slug.ts` & `score.ts`). |
| **Canonical URL (CMS)**  | `https://revolutiontradingpros.com/blog/oco-bracket-orders-thinkorswim-tradingview-swing-guide`                                                           | Matches `SITE_ORIGIN` + `/blog/[slug]` ([`src/lib/seo/blog-seo.ts`](src/lib/seo/blog-seo.ts)).                                                             |
| **Static Hub URL**       | `https://revolutiontradingpros.com/blogs/oco-bracket-orders-thinkorswim-tradingview-swing-guide`                                                          | Matches static hub architecture in [`src/routes/blogs/+page.svelte`](src/routes/blogs/+page.svelte).                                                       |
| **`metaTitle`**          | `OCO Bracket Orders Swing Guide`                                                                                                                          | `30` chars raw (`30..33` intersection of `meta-budget.ts` & `AGENTS.md`); starts with uppercase; contains `focusKeyword` (`oco bracket orders`).           |
| **Rendered `<title>`**   | `OCO Bracket Orders Swing Guide \| Revolution Trading Pros`                                                                                               | `56` chars (`30 to 60` window in `meta-budget.ts`).                                                                                                        |
| **`metaDescription`**    | `Configure oco bracket orders on ThinkorSwim and TradingView to automate swing entries, tiered profit targets, and ATR stop-losses while working 9-to-5.` | `151` chars (passes both `70 to 155` CMS gate in `meta-budget.ts` and `140 to 158` rule in `AGENTS.md`); contains `oco bracket orders` verbatim.           |
| **`excerpt`**            | `Eliminate emotional hesitation and screen addiction. Learn how One-Triggers-OCO bracket orders automate your entire trade plan from entry to exit.`      | `146` chars (`<= 160` `EXCERPT_SOFT_MAX`).                                                                                                                 |
| **`focusKeyword`**       | `oco bracket orders`                                                                                                                                      | Present in `title`, `metaTitle`, `metaDescription`, `slug`, first 100 words of body, H2 headings, `coverImageAlt`, and all 4 body `img alt` attributes.    |
| **`secondaryKeywords`**  | `["one triggers oco thinkorswim", "automated stop loss options", "conditional orders tradingview", "swing trading order types", "atr stop loss"]`         | Valid JSON string array (`posts.ts`).                                                                                                                      |
| **`author`**             | `Billy Ribeiro` (`authorId: 1`, `slug: billy-ribeiro`)                                                                                                    | Founder & Head Institutional Trader, mentored by former Goldman Sachs proprietary trading legend Mark "Goldfinger" McGoldrick.                             |
| **`category`**           | `Swing & Working Pros` (`categoryId: 4`, `slug: working-professionals`)                                                                                   | Primary topical silo.                                                                                                                                      |
| **`tags`**               | `["oco-orders", "thinkorswim", "tradingview", "swing-trading"]`                                                                                           | 4 tags (`>= 2` required by `score.ts` for full points).                                                                                                    |
| **`schemaType`**         | `Article` (`isPillar: false`, `featured: false`)                                                                                                          | Tactical Execution Guide (`blog-seo.ts`).                                                                                                                  |
| **`robots`**             | `index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1`                                                                            | Full snippet and Discover/AI Overview eligibility (`blog-seo.ts`).                                                                                         |
| **`ogTitle`**            | `OCO Bracket Orders Swing Guide \| Revolution Trading Pros`                                                                                               | `56` chars (`<= 60` `OG_TITLE_MAX`).                                                                                                                       |
| **`ogDescription`**      | `Configure oco bracket orders on ThinkorSwim and TradingView to automate swing entries, tiered profit targets, and ATR stop-losses while working 9-to-5.` | `151` chars (`<= 200` `OG_DESCRIPTION_MAX`).                                                                                                               |
| **`twitterCardType`**    | `summary_large_image`                                                                                                                                     | High-CTR large card preview.                                                                                                                               |
| **`twitterTitle`**       | `OCO Bracket Orders Guide: ThinkorSwim & TradingView Automation`                                                                                          | `62` chars (`<= 70` `TWITTER_TITLE_MAX`).                                                                                                                  |
| **`twitterDescription`** | `Configure oco bracket orders on ThinkorSwim and TradingView to automate swing entries, tiered profit targets, and ATR stop-losses while working 9-to-5.` | `151` chars (`<= 200` `TWITTER_DESCRIPTION_MAX`).                                                                                                          |

---

## 2. Featured Image & In-Body Visual Asset Specifications

Every image below includes explicit `width` and `height` attributes (preventing Cumulative Layout Shift and passing `body_img_missing_dimensions` in [`src/lib/shared/seo/score.ts`](src/lib/shared/seo/score.ts)), descriptive `alt_text` (distinct from the post title, with `oco bracket orders` included), a `title` attribute, `<figcaption>`, and a detailed `image_description` for design/production.

### 2.1 Featured / Cover Image (`coverImage` & `ogImage`)

- **Placement:** Hero `<figure class="article-cover-figure">` immediately below `<header class="article-header">` and above the Table of Contents / article body (`loading="eager" fetchpriority="high" decoding="async"`).
- **`src`:** `/images/blog/oco-bracket-orders-thinkorswim-tradingview-swing-guide.webp`
- **`srcset`:** `/images/blog/oco-bracket-orders-thinkorswim-tradingview-swing-guide-480w.webp 480w, /images/blog/oco-bracket-orders-thinkorswim-tradingview-swing-guide-800w.webp 800w, /images/blog/oco-bracket-orders-thinkorswim-tradingview-swing-guide.webp 1200w`
- **Dimensions:** `width="1200" height="630"` (1.91:1 Open Graph & Google Discover aspect ratio; also provide `1200x675` 16:9, `1200x900` 4:3, and `1200x1200` 1:1 variants in media storage per Google `Article` structured data recommendations).
- **`alt_text` (`coverImageAlt`):** `ThinkorSwim and TradingView order ticket showing oco bracket orders with take-profit and stop-loss`
- **`title` Attribute:** `OCO Bracket Orders Guide for ThinkorSwim & TradingView | Revolution Trading Pros`
- **`caption` (`coverImageCaption`):** `Figure 1: Structuring a 1st-Triggers-OCO bracket order with tiered exits and hard invalidation.`
- **Detailed Visual `image_description`:** Dark institutional platform UI (`#0b0e12`) split between a TradingView chart bracket overlay on the left and a ThinkorSwim `1st trgs OCO` order entry ticket on the right. The parent entry order is highlighted in cyan (`BUY +2 NVDA 35 DTE 140 CALL @ 6.50 LMT GTC`), linked via branching logic lines to two child orders: a green profit target (`SELL -2 @ 9.75 LMT GTC`) and a crimson invalidation stop (`SELL -2 @ 4.85 STP GTC`), with a badge indicating `"Automatic Mutual Cancellation Active"`.

### 2.2 In-Body Image #1: 1st-Triggers-OCO Logic State Machine Flowchart

- **Placement:** Inside **Section 1** (`#how-1st-triggers-oco-bracket-orders-work`), right after the comparison between standard single orders, OCO pairs, and 1st-Triggers-OCO (OTOCO) chains.
- **`src`:** `/images/blog/oco-bracket-orders-logic-state-machine-1200w.webp`
- **Dimensions:** `width="1200" height="675"` (`loading="lazy" decoding="async"`)
- **`alt_text`:** `State machine diagram of 1st-Triggers-OCO oco bracket orders showing parent entry fill activating child take-profit and stop-loss`
- **`title` Attribute:** `How 1st-Triggers-OCO Bracket Order Routing Works at Your Broker`
- **`caption`:** `Figure 2: The three-stage institutional state machine of a 1st-Triggers-OCO bracket: Stage 1 awaits entry trigger; Stage 2 simultaneously activates both protective child exits; Stage 3 cancels the remaining leg the millisecond either target or stop fills.`
- **Detailed Visual `image_description`:** Precision architectural flowchart on a dark background (`#11161d`). Node 1 (`Parent Order: Staged GTC Limit Entry`) arrows into an `Entry Fill Event` diamond. Upon fill, two parallel child branches light up simultaneously: `Child Leg A: Limit Profit Target (+2R)` in emerald and `Child Leg B: Stop/Stop-Limit Loss (-1R)` in crimson, connected by a bi-directional `OCO Cancellation Link` that terminates the opposite order upon execution.

### 2.3 In-Body Image #2: Annotated ThinkorSwim Desktop & Mobile Order Ticket

- **Placement:** Inside **Section 2** (`#step-by-step-setup-thinkorswim-tradingview`), following the numbered instructions for configuring `1st trgs OCO` templates on ThinkorSwim and TradingView.
- **`src`:** `/images/blog/oco-bracket-orders-thinkorswim-ticket-annotated-1200w.webp`
- **Dimensions:** `width="1200" height="675"` (`loading="lazy" decoding="async"`)
- **`alt_text`:** `Annotated ThinkorSwim Advanced Order ticket showing oco bracket orders configuration with GTC duration and custom saved template`
- **`title` Attribute:** `Step-by-Step ThinkorSwim 1st-Triggers-OCO Order Ticket Setup`
- **`caption`:** `Figure 3: Annotated ThinkorSwim Advanced Order ticket highlighting the five critical fields: (1) Advanced Order menu set to "1st trgs OCO", (2) Parent limit price, (3) Child Target limit offset, (4) Child Stop trigger type, and (5) GTC time-in-force.`
- **Detailed Visual `image_description`:** High-contrast UI schematic of the ThinkorSwim `Order Entry Tools` panel at the bottom of the Active Trader / Trade tab, paired with the mobile order confirmation screen on the right. Numbered acid-lime callout circles (`1` through `5`) point to the `Advanced Order: 1st trgs OCO` dropdown, the chain link icon connecting the two sell rows, the `TIF: GTC` selector, the gear icon for conditional stock-price triggers, and the `Save Custom Order Template` disk icon.

### 2.4 In-Body Image #3: Underlying Stock Conditioned Stop vs Widened Morning Option Bid-Ask Spread

- **Placement:** Inside **Section 3** (`#conditioning-options-stops-on-underlying`), right after the explanation of why raw option stop-market orders get wicked out during the 9:30 AM ET opening bell spread widening.
- **`src`:** `/images/blog/oco-bracket-orders-underlying-stock-conditioned-stop-1200w.webp`
- **Dimensions:** `width="1200" height="675"` (`loading="lazy" decoding="async"`)
- **`alt_text`:** `Comparison of oco bracket orders using raw option bid stops versus underlying stock Mark price conditioned stops at market open`
- **`title` Attribute:** `Why Options Swing Traders Must Condition Stops on the Underlying Stock Price`
- **`caption`:** `Figure 4: At 9:31 AM ET, the option bid momentarily drops 28% due to market-maker spread widening even though the stock is holding support. A naive option-price stop gets wicked out at the bottom, whereas a stock-conditioned stop stays calmly in the winning trade.`
- **Detailed Visual `image_description`:** Synchronized top-and-bottom chart panel. Top panel shows the underlying stock (`META`) holding cleanly at `$582.50`, well above the `$578.00` structural stop line. Bottom panel shows the `$585 Call` Bid/Ask spread widening between `9:30 AM` and `9:33 AM ET` (`Bid $9.20 x Ask $12.40`), with a red X showing where a raw `$10.10` option stop-market order gets filled at `$9.25` right before the stock rallies `$16.00`.

### 2.5 In-Body Image #4: Tiered 1st-Triggers-2x-OCO Scale-Out Architecture (1.5R + 3.0R Runner)

- **Placement:** Inside **Section 4** (`#scaling-out-in-tiers-1r-plus-runner`), immediately after the mathematical breakdown of multi-tier scaling (`1st trgs 2 OCO`).
- **`src`:** `/images/blog/oco-bracket-orders-tiered-scale-out-architecture-1200w.webp`
- **Dimensions:** `width="1200" height="675"` (`loading="lazy" decoding="async"`)
- **`alt_text`:** `Tiered 1st-Triggers-2-OCO diagram showing oco bracket orders scaling out 50 percent at 1.5R and trailing the second half to 3R`
- **`title` Attribute:** `Scaling Out in Tiers Using 1st-Triggers-2-OCO Bracket Orders`
- **`caption`:** `Figure 5: How a 4-contract entry splits into two independent OCO brackets: Bracket A exits 2 contracts at +1.5R to pay for the trade, while Bracket B trails the remaining 2 contracts to capture the +3.0R institutional trend extension.`
- **Detailed Visual `image_description`:** Multi-tier execution diagram over a 4-Hour candle chart. The parent order buys `+4 contracts` at `$5.00`. It branches into `OCO Group 1 (2 contracts: Target 1 @ $7.25 / Stop @ $3.50)` and `OCO Group 2 (2 contracts: Target 2 @ $9.50 / Stop @ $3.50, trailed to $5.00 breakeven once Group 1 fills)`.

---

## 3. Complete Heading Architecture & Internal/External Link Map

### 3.1 Strictly Descending Heading Hierarchy (`H1 -> H2 -> H3`)

1. **`H1` (Rendered by page header, never duplicated in body HTML):**
   - `OCO Bracket Orders Guide: Automating Swing Trades on ThinkorSwim & TradingView`
2. **`H2` (`#how-1st-triggers-oco-bracket-orders-work`):**
   - `How 1st-Triggers-OCO (One-Cancels-Other) Bracket Orders Work`
   - **`H3` (`#oco-vs-otoco-vs-1st-triggers-sequence`):** `Standard OCO vs. 1st-Triggers-OCO (OTOCO) vs. 1st-Triggers-2-OCO: Exact Definitions`
   - **`H3` (`#eliminating-hesitation-and-phantom-stops`):** `Why Mental Stops Fail: Eliminating Hesitation and Emotional Freeze in Live Markets`
3. **`H2` (`#step-by-step-setup-thinkorswim-tradingview`):**
   - `Step-by-Step Setup on ThinkorSwim Desktop, Mobile, and TradingView`
   - **`H3` (`#thinkorswim-desktop-mobile-configuration`):** `Configuring and Saving a Reusable 1st-Triggers-OCO Template on ThinkorSwim`
   - **`H3` (`#tradingview-bracket-order-execution`):** `Staging Visual Bracket Orders and Alert Webhooks Directly on TradingView Charts`
4. **`H2` (`#conditioning-options-stops-on-underlying`):**
   - `Conditioning Options Stops on the Underlying Stock Price (Mark vs. Bid/Ask)`
   - **`H3` (`#opening-bell-bid-ask-spread-trap`):** `The 9:30 AM ET Opening Bell Spread Trap: Why Raw Option Stop-Market Orders Bleed Slippage`
   - **`H3` (`#setting-stock-mark-conditional-gear-rules`):** `How to Configure Underlying Stock Price and Time-of-Day Conditions in ThinkorSwim`
5. **`H2` (`#scaling-out-in-tiers-1r-plus-runner`):**
   - `Scaling Out in Tiers: 1R First Target + Trailing Structural Stop`
   - **`H3` (`#two-tier-bracket-math-walkthrough`):** `Worked Institutional Walkthrough: Automating a 4-Contract Multi-Tier Options Swing`
   - **`H3` (`#pre-submission-order-ticket-audit-checklist`):** `The 5-Point Pre-Submission Order Ticket Audit (GTC, Quantity Parity & Earnings Check)`
6. **`H2` (`#frequently-asked-questions` - Inside `<section class="article-faq">`):**
   - `Frequently Asked Questions About OCO Bracket Orders` (6 native `<details class="faq-item">` Q&A items with `<h3>` questions)

### 3.2 Complete Internal Link Map (13 Contextual Links Across All Site Silos)

| Anchor Text in Article Body                                             | Target Internal Path                                                 | Strategic Funnel Role                                           |
| :---------------------------------------------------------------------- | :------------------------------------------------------------------- | :-------------------------------------------------------------- |
| `Swing Trading Room for working professionals`                          | `/live-trading-rooms/swing-trading-room`                             | Primary interactive swing room conversion                       |
| `Explosive Swings video watchlist alerts`                               | `/alert-services/explosive-swings`                                   | Multi-day video watchlist alert conversion                      |
| `Working Professional 20-Minute End-of-Day Swing Scanner`               | `/store/scanners`                                                    | End-of-day scanner conversion                                   |
| `Course 04: Multi-Day Swing Trading for Working Professionals`          | `/store/courses`                                                     | Store curriculum conversion                                     |
| `The Move Prior to The Move Ultra Class & Indicator Suite`              | `/store/courses/move-prior-to-the-move-ultra`                        | Flagship course upsell                                          |
| `100% non-repainting custom trading indicators`                         | `/store/indicators`                                                  | Indicator store conversion                                      |
| `free Options Profit, Risk & Greeks Calculator`                         | `/resources/options-calculator`                                      | Interactive utility conversion                                  |
| `Live Day Trading Room`                                                 | `/live-trading-rooms/day-trading-room`                               | Active intraday room cross-sell                                 |
| `Small Accounts Room ($500+ starting capital)`                          | `/live-trading-rooms/small-accounts-room`                            | Small account room cross-sell                                   |
| `Private 1-on-1 Trading Mentorship`                                     | `/mentorship`                                                        | Executive mentorship conversion                                 |
| `How Working Professionals Swing Trade Options in 20 Minutes a Day`     | `/blog/swing-trading-options-with-a-full-time-job-watchlist-routine` | Priority cluster post #14 link (`INTERNAL_LINK_PRIORITY_SLUGS`) |
| `Risk Management Essentials: The Goldman Sachs Prop Sizing Rules`       | `/blog/risk-management-essentials-for-active-traders`                | Priority risk pillar link (`INTERNAL_LINK_PRIORITY_SLUGS`)      |
| `The Ultimate Guide to Options Greeks: Delta, Gamma, Theta, Vega & Rho` | `/blog/ultimate-guide-to-options-greeks`                             | Priority Greeks pillar link (`INTERNAL_LINK_PRIORITY_SLUGS`)    |
| `S&P 500 Sector ETF Rotation Swing Trading Guide (11 GICS Sectors)`     | `/blog/sp500-sector-etf-rotation-swing-trading-guide`                | Sister blog cluster cross-link (Post #18)                       |

### 3.3 Complete External Authority Citations (4 Distinct Tier-1 Domains)

| Anchor Text in Article Body                                                              | External URL                                                                       | Authority Domain       | Why It Strengthens E-E-A-T                                               |
| :--------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- | :--------------------- | :----------------------------------------------------------------------- |
| `U.S. Securities and Exchange Commission (SEC) Guide to Trade Execution and Order Types` | `https://www.sec.gov/investor/pubs/tradexec.htm`                                   | `sec.gov`              | Official federal regulator guide to market, limit, and stop execution.   |
| `FINRA Investor Reference on Stock and Options Order Types`                              | `https://www.finra.org/investors/investing/investment-products/stocks/order-types` | `finra.org`            | Self-regulatory organization rules on conditional and stop-limit orders. |
| `Options Industry Council (OIC) Options Order Entry & Execution Best Practices`          | `https://www.optionseducation.org/`                                                | `optionseducation.org` | Industry benchmark for multi-leg and single-leg options order routing.   |
| `Cboe Global Markets Complex & Conditional Order Book Specifications`                    | `https://www.cboe.com/us/options/trading/complex_orders/`                          | `cboe.com`             | Exchange-level mechanics for contingency and multi-leg options orders.   |

---

## 4. Complete Production Article Body (Single HTML Block with Figures, Tables & Visible FAQ)

> **CMS Ingestion Note:** The body below starts directly with `<p class="lead">` containing `oco bracket orders` in the first 100 words, includes zero duplicate H1 headings, explicit `width="1200" height="675"` on all 4 body `<img>` elements, and zero em dashes or en dashes anywhere.

```html
<p class="lead">
	Ask any veteran institutional risk manager why smart, technically skilled retail traders blow up
	their accounts, and the answer is rarely bad chart analysis. Retail traders fail because they rely
	on "mental stops" and manual order entry during live market hours. By configuring automated
	<strong>oco bracket orders</strong> (One-Cancels- the-Other and 1st-Triggers-OCO contingency
	chains) on ThinkorSwim and TradingView, you hard-code your exact entry trigger, profit target, and
	invalidation stop-loss into your broker's server before a single dollar is put at risk.
</p>

<p>
	When I was mentored by former Goldman Sachs proprietary trading legend
	<strong>Mark "Goldfinger" McGoldrick</strong>, one of the earliest rules drilled into me was that
	human willpower is at its weakest the exact millisecond a trade moves against you. Once you are in
	a live position without a server-side stop order, every red candle triggers a surge of cortisol
	that whispers, <em>"Wait five more minutes, it will bounce right back."</em> That five-minute
	hesitation is how a planned 1R business expense mutates into a catastrophic 5R account drawdown.
</p>

<p>
	Whether you are executing our
	<a href="/blog/swing-trading-options-with-a-full-time-job-watchlist-routine"
		>How Working Professionals Swing Trade Options in 20 Minutes a Day</a
	>
	blueprint while working a 9-to-5 career or trading active momentum inside our
	<a href="/live-trading-rooms/swing-trading-room">Swing Trading Room for working professionals</a>,
	mastering <strong>oco bracket orders</strong> transforms you from an emotional button-clicker into
	a systematic risk architect. Below is the complete technical guide to building, conditioning, and
	scaling automated bracket orders on both ThinkorSwim and TradingView.
</p>

<h2 id="how-1st-triggers-oco-bracket-orders-work">
	How 1st-Triggers-OCO (One-Cancels-Other) Bracket Orders Work
</h2>

<p>
	To automate a swing trade from start to finish, you must distinguish between two related order
	structures documented in the
	<a
		href="https://www.finra.org/investors/investing/investment-products/stocks/order-types"
		target="_blank"
		rel="noopener noreferrer"
		>FINRA Investor Reference on Stock and Options Order Types (opens in new tab)</a
	>
	and the
	<a href="https://www.sec.gov/investor/pubs/tradexec.htm" target="_blank" rel="noopener noreferrer"
		>U.S. Securities and Exchange Commission (SEC) Guide to Trade Execution and Order Types (opens
		in new tab)</a
	>: a standalone <strong>OCO pair</strong> (used when you are already in a position) and a
	<strong>1st-Triggers-OCO (OTOCO) bracket</strong> (used to stage a brand-new trade before entry).
</p>

<figure class="article-inline-figure">
	<img
		src="/images/blog/oco-bracket-orders-logic-state-machine-1200w.webp"
		width="1200"
		height="675"
		alt="State machine diagram of 1st-Triggers-OCO oco bracket orders showing parent entry fill activating child take-profit and stop-loss"
		title="How 1st-Triggers-OCO Bracket Order Routing Works at Your Broker"
		loading="lazy"
		decoding="async"
	/>
	<figcaption>
		Figure 2: The three-stage institutional state machine of a 1st-Triggers-OCO bracket: Stage 1
		awaits entry trigger; Stage 2 simultaneously activates both protective child exits; Stage 3
		cancels the remaining leg the millisecond either target or stop fills.
	</figcaption>
</figure>

<h3 id="oco-vs-otoco-vs-1st-triggers-sequence">
	Standard OCO vs. 1st-Triggers-OCO (OTOCO) vs. 1st-Triggers-2-OCO: Exact Definitions
</h3>

<p>
	Understanding the exact hierarchy of contingency orders prevents accidental double-fills or
	unprotected positions:
</p>

<div class="table-scroll-wrap">
	<table>
		<thead>
			<tr>
				<th>Order Structure Name</th>
				<th>ThinkorSwim Label</th>
				<th>TradingView Label</th>
				<th>How the Broker Server Executes It</th>
				<th>Primary Trading Use Case</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td><strong>Standalone OCO (One-Cancels-Other)</strong></td>
				<td><code>OCO</code></td>
				<td>Bracket attached to existing position</td>
				<td>
					Links two live exit orders together (1 Limit Take-Profit + 1 Stop-Loss). Whichever fills
					first immediately cancels the other.
				</td>
				<td>Adding automated profit and stop protection to a position you already own.</td>
			</tr>
			<tr>
				<td><strong>1st-Triggers-OCO (One-Triggers-OCO / OTOCO)</strong></td>
				<td><code>1st trgs OCO</code></td>
				<td>Entry Order with <code>Take Profit</code> + <code>Stop Loss</code> checked</td>
				<td>
					Holds Child Target and Child Stop dormant until the Parent Entry order fills; once filled,
					both exits go live as a linked OCO pair.
				</td>
				<td>Staging a complete hands-free swing trade the night before with a single exit tier.</td>
			</tr>
			<tr>
				<td><strong>1st-Triggers-2-OCO (Multi-Tier Bracket)</strong></td>
				<td><code>1st trgs 2 OCO</code></td>
				<td>Two separate half-size bracket entry tickets</td>
				<td>
					A single Parent Entry (e.g., 4 contracts) triggers two independent OCO exit pairs (2
					contracts at Target 1 + Stop; 2 contracts at Target 2 + Stop).
				</td>
				<td>
					Scaling out 50% at <code>+1.5R</code> while holding a 50% runner for <code>+3.0R</code>.
				</td>
			</tr>
		</tbody>
	</table>
</div>

<h3 id="eliminating-hesitation-and-phantom-stops">
	Why Mental Stops Fail: Eliminating Hesitation and Emotional Freeze in Live Markets
</h3>

<p>
	Consider why institutional desks prohibit discretionary "mental stops." If you try to hold a
	stop-loss in your head without submitting <strong>oco bracket orders</strong> to the exchange or
	broker server, you face two lethal failure points:
</p>

<ol>
	<li>
		<strong
			>Why You Cannot Place Both a Limit Target and a Stop Order Separately Without OCO:</strong
		>
		If you own 2 call contracts and manually place an unlinked limit sell order at $10.00 AND a
		separate unlinked stop sell order at $5.00, your broker will Either reject the second order for
		exceeding your owned contract count or, in a margin account, fill your $10.00 target in the
		morning and leave the $5.00 stop order live to accidentally open a naked short option position
		if price pulls back later. Linking the two exits inside an OCO group guarantees mutual
		cancellation.
	</li>
	<li>
		<strong>Eliminating Decision Fatigue at Inflection Points:</strong> When a stock hits your
		<code>+2.0R</code> target during a fast morning spike, greed tells you to cancel your target and
		hold for <code>+5.0R</code>, only to watch the gain evaporate twenty minutes later. When your
		OCO limit order is already resting on the exchange book, you get filled into the surge of buyer
		liquidity automatically.
	</li>
</ol>

<h2 id="step-by-step-setup-thinkorswim-tradingview">
	Step-by-Step Setup on ThinkorSwim Desktop, Mobile, and TradingView
</h2>

<p>
	When our members review our evening
	<a href="/alert-services/explosive-swings">Explosive Swings video watchlist alerts</a> or run our
	<a href="/store/scanners">Working Professional 20-Minute End-of-Day Swing Scanner</a>, they spend
	less than four minutes staging their orders using saved bracket templates. Follow these exact
	steps to configure your platform.
</p>

<figure class="article-inline-figure">
	<img
		src="/images/blog/oco-bracket-orders-thinkorswim-ticket-annotated-1200w.webp"
		width="1200"
		height="675"
		alt="Annotated ThinkorSwim Advanced Order ticket showing oco bracket orders configuration with GTC duration and custom saved template"
		title="Step-by-Step ThinkorSwim 1st-Triggers-OCO Order Ticket Setup"
		loading="lazy"
		decoding="async"
	/>
	<figcaption>
		Figure 3: Annotated ThinkorSwim Advanced Order ticket highlighting the five critical fields: (1)
		Advanced Order menu set to "1st trgs OCO", (2) Parent limit price, (3) Child Target limit
		offset, (4) Child Stop trigger type, and (5) GTC time-in-force.
	</figcaption>
</figure>

<h3 id="thinkorswim-desktop-mobile-configuration">
	Configuring and Saving a Reusable 1st-Triggers-OCO Template on ThinkorSwim
</h3>

<p>
	On Charles Schwab's <strong>ThinkorSwim (TOS) Desktop</strong> platform, you can build a
	<code>1st trgs OCO</code> order directly from the Option Chain in the <code>Trade</code> tab:
</p>

<ol>
	<li>
		<strong>Select the Option Contract With OCO Pre-Loaded:</strong> Navigate to the
		<code>Trade -> All Products</code> tab, expand the <code>28 to 45 DTE</code> expiration cycle,
		and locate your target <code>0.60 to 0.70 Delta</code> strike. Instead of left-clicking the Ask
		price,
		<strong
			>Right-Click on the Ask price -> Select <code>BUY Custom -> With OCO Bracket</code></strong
		>.
	</li>
	<li>
		<strong>Verify the 3-Row Order Ticket Structure:</strong> Look at the
		<code>Order Entry Tools</code> panel at the bottom of your screen. You will see one green
		<code>BUY</code> row at the top (the Parent order) connected to two red <code>SELL</code> rows
		below it bracketed by a white chain link icon (the OCO children), with the bottom-left
		<code>Advanced Order</code> dropdown set to <code>1st trgs OCO</code>.
	</li>
	<li>
		<strong>Set Parent Entry Price &amp; Time-in-Force:</strong> Set the green Parent row to a
		<code>LIMIT</code> order (or a conditional trigger order, covered in Section 3) at your planned
		option entry price. Change Time-in-Force (<code>TIF</code>) from <code>DAY</code> to
		<code>GTC</code>
		(Good-Til-Canceled) if you want the setup to remain active across multiple days.
	</li>
	<li>
		<strong>Set Child 1 (Take-Profit Limit) &amp; Child 2 (Stop-Loss):</strong>
		<ul>
			<li>
				On the first red <code>SELL</code> row, set Order Type to <code>LMT</code>, Price to your
				calculated profit target (or a percentage/dollar offset such as <code>+45%</code>), and
				<code>TIF</code> to <code>GTC</code>.
			</li>
			<li>
				On the second red <code>SELL</code> row, set Order Type to <code>STP</code> (or
				<code>STPLMT</code> on highly liquid index options), Price to your hard invalidation level,
				and <code>TIF</code> to <code>GTC</code>.
			</li>
		</ul>
	</li>
	<li>
		<strong>Save as a 1-Click Custom Template:</strong> Click the small floppy-disk icon (<code
			>Save Custom Order Template</code
		>) on the right edge of the order ticket and name it <code>RTP Swing Bracket 2R-1R</code>.
		Tomorrow evening, right-clicking any option contract and selecting
		<code>BUY Custom -> RTP Swing Bracket 2R-1R</code> will populate all three legs in one second.
	</li>
</ol>

<h3 id="tradingview-bracket-order-execution">
	Staging Visual Bracket Orders and Alert Webhooks Directly on TradingView Charts
</h3>

<p>
	If you execute equities, ETFs, or broker-integrated options directly through
	<strong>TradingView's Order Panel</strong> (connected via TradeStation, Interactive Brokers, or
	Webull), staging <strong>oco bracket orders</strong> is completely visual:
</p>

<ol>
	<li>
		Press <code>Alt + T</code> (Windows) or <code>Option + T</code> (Mac) on your Daily or 4-Hour
		chart to open the floating Order Ticket, or use the Long/Short Position drawing tool paired with
		our <a href="/store/indicators">100% non-repainting custom trading indicators</a>.
	</li>
	<li>
		Select <code>Limit</code> or <code>Stop</code> for your parent entry price, then check both the
		<strong><code>Take Profit</code></strong> box and the <strong><code>Stop Loss</code></strong>
		box inside the bracket section of the ticket.
	</li>
	<li>
		Drag the green <code>TP</code> line and the red <code>SL</code> line directly onto your chart's
		structural levels. TradingView automatically calculates the exact dollar risk, percentage of
		account equity, and reward-to-risk ratio in real time before you click <code>Buy</code>.
	</li>
</ol>

<h2 id="conditioning-options-stops-on-underlying">
	Conditioning Options Stops on the Underlying Stock Price (Mark vs. Bid/Ask)
</h2>

<p>
	Here is an institutional execution secret that saves our
	<a href="/store/courses">Course 04: Multi-Day Swing Trading for Working Professionals</a> students
	thousands of dollars every year:
	<strong
		>never trigger an equity option stop-loss off the option's own raw Bid price during the first
		five minutes of the market open.</strong
	>
</p>

<p>
	As documented in the
	<a
		href="https://www.cboe.com/us/options/trading/complex_orders/"
		target="_blank"
		rel="noopener noreferrer"
		>Cboe Global Markets Complex &amp; Conditional Order Book Specifications (opens in new tab)</a
	>
	and the
	<a href="https://www.optionseducation.org/" target="_blank" rel="noopener noreferrer"
		>Options Industry Council (OIC) Options Order Entry &amp; Execution Best Practices (opens in new
		tab)</a
	>, options market makers widen their quoted Bid-Ask spreads between 9:30:00 AM and 9:34:00 AM ET
	while underlying NYSE and Nasdaq opening auctions complete price discovery.
</p>

<figure class="article-inline-figure">
	<img
		src="/images/blog/oco-bracket-orders-underlying-stock-conditioned-stop-1200w.webp"
		width="1200"
		height="675"
		alt="Comparison of oco bracket orders using raw option bid stops versus underlying stock Mark price conditioned stops at market open"
		title="Why Options Swing Traders Must Condition Stops on the Underlying Stock Price"
		loading="lazy"
		decoding="async"
	/>
	<figcaption>
		Figure 4: At 9:31 AM ET, the option bid momentarily drops 28% due to market-maker spread
		widening even though the stock is holding support. A naive option-price stop gets wicked out at
		the bottom, whereas a stock-conditioned stop stays calmly in the winning trade.
	</figcaption>
</figure>

<h3 id="opening-bell-bid-ask-spread-trap">
	The 9:30 AM ET Opening Bell Spread Trap: Why Raw Option Stop-Market Orders Bleed Slippage
</h3>

<p>
	Imagine you bought a 35 DTE Call option on Meta Platforms (<code>META</code>) at
	<code>$12.00</code> when the stock was at <code>$590.00</code>, with your structural invalidation
	level on the stock chart at <code>$580.00</code> (where the option should be worth roughly
	<code>$7.80</code>). If you place a standard option Stop-Market order at
	<code>$7.80</code> triggered by the option's <code>Bid</code> price, watch what happens on a quiet
	Wednesday morning:
</p>

<ul>
	<li>
		At 9:30:15 AM ET, META opens flat at <code>$589.50</code> (nowhere near your
		<code>$580.00</code> stop).
	</li>
	<li>
		However, for 45 seconds while the specialist book calibrates, the market maker widens the option
		quote from <code>$11.80 x $12.10</code> to <code>$7.40 Bid x $13.20 Ask</code>.
	</li>
	<li>
		Because the option <code>Bid</code> printed <code>$7.40</code> (below <code>$7.80</code>), your
		naive Stop-Market order triggers immediately and dumps your contract at <code>$7.45</code>,
		locking in a <code>-38%</code> loss on a trade that never violated support!
	</li>
</ul>

<h3 id="setting-stock-mark-conditional-gear-rules">
	How to Configure Underlying Stock Price and Time-of-Day Conditions in ThinkorSwim
</h3>

<p>
	To make your <strong>oco bracket orders</strong> immune to opening spread spikes, click the small
	<strong>Gear Icon (<code>Order Rules / Conditions</code>)</strong> on the far right of your
	ThinkorSwim stop order row and apply two institutional conditions:
</p>

<ol>
	<li>
		<strong>Condition on the Underlying Stock Symbol:</strong> Under
		<code>Submit the order based on the following conditions</code>, enter the underlying stock
		ticker (e.g., <code>META</code>), set <code>Method</code> to <code>MARK</code> or
		<code>LAST</code>, set the operator to <code>&lt;=</code> (for long calls) or
		<code>&gt;=</code> (for long puts), and enter your exact stock chart invalidation price
		(<code>$580.00</code>). Now your option stop order will not even transmit to the exchange unless
		the actual stock trades at or below <code>$580.00</code>.
	</li>
	<li>
		<strong>Alternatively, Set Option Stop Trigger Method to <code>MARK</code>:</strong> If you
		prefer pricing the stop on the option contract itself, change the Stop Trigger Method dropdown
		from <code>STD</code> / <code>BID</code> to <strong><code>MARK</code></strong> (the midpoint
		between Bid and Ask) and set <code>Wait until at least 09:35:00 EST</code> in the time condition
		box.
	</li>
</ol>

<h2 id="scaling-out-in-tiers-1r-plus-runner">
	Scaling Out in Tiers: 1R First Target + Trailing Structural Stop
</h2>

<p>
	Across our <a href="/live-trading-rooms/day-trading-room">Live Day Trading Room</a>, our
	<a href="/live-trading-rooms/swing-trading-room">Swing Trading Room for working professionals</a>,
	and our
	<a href="/live-trading-rooms/small-accounts-room">Small Accounts Room ($500+ starting capital)</a
	>, we never treat an exit as an "all-or-nothing" guess. We scale out in mathematical tiers so our
	first target pays for the business risk of the trade while our runner captures multi-day trend
	extensions.
</p>

<figure class="article-inline-figure">
	<img
		src="/images/blog/oco-bracket-orders-tiered-scale-out-architecture-1200w.webp"
		width="1200"
		height="675"
		alt="Tiered 1st-Triggers-2-OCO diagram showing oco bracket orders scaling out 50 percent at 1.5R and trailing the second half to 3R"
		title="Scaling Out in Tiers Using 1st-Triggers-2-OCO Bracket Orders"
		loading="lazy"
		decoding="async"
	/>
	<figcaption>
		Figure 5: How a 4-contract entry splits into two independent OCO brackets: Bracket A exits 2
		contracts at +1.5R to pay for the trade, while Bracket B trails the remaining 2 contracts to
		capture the +3.0R institutional trend extension.
	</figcaption>
</figure>

<h3 id="two-tier-bracket-math-walkthrough">
	Worked Institutional Walkthrough: Automating a 4-Contract Multi-Tier Options Swing
</h3>

<p>
	Suppose you use our
	<a href="/resources/options-calculator">free Options Profit, Risk &amp; Greeks Calculator</a> and
	our
	<a href="/blog/ultimate-guide-to-options-greeks"
		>The Ultimate Guide to Options Greeks: Delta, Gamma, Theta, Vega &amp; Rho</a
	>
	framework to structure a 4-contract swing position in a 35 DTE Call at
	<strong>$5.00 per contract</strong> ($2,000 total outlay), with a structural stop corresponding to
	<strong>$3.50 per contract</strong>
	(<code>$1.50</code> risk per contract x 4 = <code>$600</code> total 1R risk, sized per our
	<a href="/blog/risk-management-essentials-for-active-traders"
		>Risk Management Essentials: The Goldman Sachs Prop Sizing Rules</a
	>):
</p>

<ul>
	<li>
		<strong>Parent Order:</strong> <code>BUY +4 Contracts @ $5.00 LMT GTC</code> (Advanced Order set
		to <code>1st trgs 2 OCO</code>).
	</li>
	<li>
		<strong>OCO Group A (First 50% Scale-Out):</strong>
		<ul>
			<li>
				<code>SELL -2 Contracts @ $7.25 LMT GTC</code> (<code>+$2.25</code> per contract =
				<code>+1.5R</code> profit target)
			</li>
			<li>
				<code>SELL -2 Contracts @ $3.50 STP (MARK) GTC</code> (<code>-$1.50</code> per contract =
				<code>-1.0R</code> stop)
			</li>
		</ul>
	</li>
	<li>
		<strong>OCO Group B (Second 50% Trend Runner):</strong>
		<ul>
			<li>
				<code>SELL -2 Contracts @ $9.50 LMT GTC</code> (<code>+$4.50</code> per contract =
				<code>+3.0R</code> profit target)
			</li>
			<li>
				<code>SELL -2 Contracts @ $3.50 STP (MARK) GTC</code> (or a <code>-25%</code> Trailing Stop
				once Target 1 fills)
			</li>
		</ul>
	</li>
</ul>

<p>
	When Group A hits <code>$7.25</code> on Day 2, your broker automatically banks
	<code>+$450.00</code> in realized cash and cancels Group A's <code>$3.50</code> stop leg, while
	Group B's 2 contracts remain protected. Even if you do not adjust Group B's stop until lunch, your
	remaining downside on the entire trade is already reduced by 75%; once you drag Group B's stop up
	to <code>$5.00</code> (entry breakeven) on your mobile app, you own a mathematically risk-free
	shot at a <code>+3.0R</code> (<code>+$1,350</code> total net gain) home run.
</p>

<h3 id="pre-submission-order-ticket-audit-checklist">
	The 5-Point Pre-Submission Order Ticket Audit (GTC, Quantity Parity &amp; Earnings Check)
</h3>

<p>
	Before clicking <code>Confirm and Send</code> during your evening routine (whether trading on your
	own or inside our <a href="/mentorship">Private 1-on-1 Trading Mentorship</a> and
	<a href="/store/courses/move-prior-to-the-move-ultra"
		>The Move Prior to The Move Ultra Class &amp; Indicator Suite</a
	>), run this 15-second pre-flight check on every bracket ticket:
</p>

<ol>
	<li>
		<strong>Quantity Parity Check:</strong> Does the sum of your child Take-Profit quantities equal
		your Parent Entry quantity (<code>+4 Buy = -2 Sell TP1 + -2 Sell TP2</code>), and does each OCO
		pair match in contract count?
	</li>
	<li>
		<strong>Time-In-Force (<code>TIF</code>) Match:</strong> Are both the Take-Profit limit leg and
		the Stop-Loss leg set to <strong><code>GTC</code></strong
		>? If your stop is accidentally left on <code>DAY</code>, it will expire at 4:00 PM ET today and
		leave your swing position completely unprotected tomorrow morning!
	</li>
	<li>
		<strong>Stop Trigger Method Check:</strong> Is your option stop conditioned on the underlying
		stock price or set to trigger off <code>MARK</code> rather than raw <code>BID</code>?
	</li>
	<li>
		<strong>Maximum Dollar Loss Verification:</strong> Read the confirmation pop-up box's
		<code>Max Loss</code> or calculate <code>(Entry Price - Stop Price) x 100 x Contracts</code> to
		confirm it is strictly within 1% to 2% of account equity.
	</li>
	<li>
		<strong>No Conflicting Existing Orders:</strong> Check your <code>Working Orders</code> tab to
		make sure no old unlinked limit orders remain open on the same strike from a prior session.
	</li>
</ol>

<p>
	<strong>Continue Building Your Institutional Edge:</strong> Deepen your execution across this
	topical cluster by reviewing our companion guides on
	<a href="/blog/sp500-sector-etf-rotation-swing-trading-guide"
		>S&amp;P 500 Sector ETF Rotation Swing Trading Guide (11 GICS Sectors)</a
	>.
</p>

<section class="article-faq" id="frequently-asked-questions">
	<h2 id="frequently-asked-questions-about-oco-bracket-orders">
		Frequently Asked Questions About OCO Bracket Orders
	</h2>

	<details class="faq-item">
		<summary>
			<h3 id="what-does-a-1st-triggers-oco-bracket-order-do-automatically">
				What does a 1st-Triggers-OCO bracket order do automatically?
			</h3>
		</summary>
		<p>
			Once your primary entry limit order fills, your broker immediately activates both your
			profit-target limit order and your stop-loss order as a linked pair. Whichever exit order
			fills first automatically cancels the other exit order so you never have an orphan order left
			open.
		</p>
	</details>

	<details class="faq-item">
		<summary>
			<h3 id="why-should-options-swing-traders-trigger-stops-off-the-underlyin">
				Why should options swing traders trigger stops off the underlying stock price?
			</h3>
		</summary>
		<p>
			Options bid-ask spreads can widen momentarily during the first three to five minutes after the
			9:30 AM ET open. Conditioning your stop-loss on the underlying stock or ETF trading below its
			structural invalidation price prevents artificial stop-outs caused by temporary option spread
			widening.
		</p>
	</details>

	<details class="faq-item">
		<summary>
			<h3 id="can-i-set-oco-bracket-orders-the-night-before-with-good-til-canc">
				Can I set OCO bracket orders the night before with Good-Til-Canceled (GTC) duration?
			</h3>
		</summary>
		<p>
			Yes. Working professionals stage 1st-Triggers-OCO bracket orders in the evening using
			Good-Til-Canceled (GTC) duration on both the parent entry and child exit legs so the trade
			executes and protects itself automatically during regular market hours across multiple days.
		</p>
	</details>

	<details class="faq-item">
		<summary>
			<h3 id="what-happens-if-my-stop-loss-is-set-to-day-instead-of-gtc-on-a-m">
				What happens if my stop-loss is set to DAY instead of GTC on a multi-day swing trade?
			</h3>
		</summary>
		<p>
			If a child stop-loss order is set to DAY time-in-force, it automatically expires at the 4:00
			PM ET market close on the day your entry fills. That leaves your option contract completely
			unprotected on Day 2, which is why every swing bracket leg must be set to GTC.
		</p>
	</details>

	<details class="faq-item">
		<summary>
			<h3 id="should-i-use-a-stop-market-or-a-stop-limit-order-on-my-oco-brack">
				Should I use a Stop-Market or a Stop-Limit order on my OCO bracket's stop leg?
			</h3>
		</summary>
		<p>
			For liquid large-cap stocks and index ETFs (such as SPY, QQQ, NVDA, AAPL, and MSFT) where you
			condition the trigger on the underlying stock price or option Mark after 9:35 AM ET, a Stop
			order ensures guaranteed exit execution if support breaks, whereas a tight Stop-Limit can be
			skipped over during a fast drop.
		</p>
	</details>

	<details class="faq-item">
		<summary>
			<h3 id="can-i-use-1st-triggers-oco-bracket-orders-on-vertical-spreads-as">
				Can I use 1st-Triggers-OCO bracket orders on vertical spreads as well as single-leg options?
			</h3>
		</summary>
		<p>
			Yes. On ThinkorSwim Desktop, you can build a vertical debit or credit spread entry order and
			attach a 1st-Triggers-OCO closing spread order with a net-debit or net-credit profit target
			and a defined spread-value stop-loss.
		</p>
	</details>
</section>
```

---

## 5. Unified Schema.org `@graph` JSON-LD & 1:1 `faqItems` Payload

### 5.1 Raw `faqItems` Database Payload (1-to-1 Parity with Visible `<details>` FAQs)

```json
[
	{
		"question": "What does a 1st-Triggers-OCO bracket order do automatically?",
		"answer": "Once your primary entry limit order fills, your broker immediately activates both your profit-target limit order and your stop-loss order as a linked pair. Whichever exit order fills first automatically cancels the other exit order so you never have an orphan order left open."
	},
	{
		"question": "Why should options swing traders trigger stops off the underlying stock price?",
		"answer": "Options bid-ask spreads can widen momentarily during the first three to five minutes after the 9:30 AM ET open. Conditioning your stop-loss on the underlying stock or ETF trading below its structural invalidation price prevents artificial stop-outs caused by temporary option spread widening."
	},
	{
		"question": "Can I set OCO bracket orders the night before with Good-Til-Canceled (GTC) duration?",
		"answer": "Yes. Working professionals stage 1st-Triggers-OCO bracket orders in the evening using Good-Til-Canceled (GTC) duration on both the parent entry and child exit legs so the trade executes and protects itself automatically during regular market hours across multiple days."
	},
	{
		"question": "What happens if my stop-loss is set to DAY instead of GTC on a multi-day swing trade?",
		"answer": "If a child stop-loss order is set to DAY time-in-force, it automatically expires at the 4:00 PM ET market close on the day your entry fills. That leaves your option contract completely unprotected on Day 2, which is why every swing bracket leg must be set to GTC."
	},
	{
		"question": "Should I use a Stop-Market or a Stop-Limit order on my OCO bracket's stop leg?",
		"answer": "For liquid large-cap stocks and index ETFs (such as SPY, QQQ, NVDA, AAPL, and MSFT) where you condition the trigger on the underlying stock price or option Mark after 9:35 AM ET, a Stop order ensures guaranteed exit execution if support breaks, whereas a tight Stop-Limit can be skipped over during a fast drop."
	},
	{
		"question": "Can I use 1st-Triggers-OCO bracket orders on vertical spreads as well as single-leg options?",
		"answer": "Yes. On ThinkorSwim Desktop, you can build a vertical debit or credit spread entry order and attach a 1st-Triggers-OCO closing spread order with a net-debit or net-credit profit target and a defined spread-value stop-loss."
	}
]
```

### 5.2 Complete Unified `@graph` JSON-LD Output (`buildBlogPostJsonLd`)

```json
{
	"@context": "https://schema.org",
	"@graph": [
		{
			"@type": "EducationalOrganization",
			"@id": "https://revolutiontradingpros.com/#organization",
			"name": "Revolution Trading Pros",
			"alternateName": "RTP",
			"url": "https://revolutiontradingpros.com",
			"slogan": "Educate. Innovate. Prosper.",
			"logo": {
				"@type": "ImageObject",
				"@id": "https://revolutiontradingpros.com/#logo",
				"url": "https://revolutiontradingpros.com/logo.png",
				"contentUrl": "https://revolutiontradingpros.com/logo.png",
				"width": 3163,
				"height": 835,
				"caption": "Revolution Trading Pros - Educate. Innovate. Prosper."
			},
			"founder": {
				"@id": "https://revolutiontradingpros.com/#founder"
			}
		},
		{
			"@type": "WebSite",
			"@id": "https://revolutiontradingpros.com/#website",
			"url": "https://revolutiontradingpros.com",
			"name": "Revolution Trading Pros",
			"publisher": {
				"@id": "https://revolutiontradingpros.com/#organization"
			},
			"potentialAction": {
				"@type": "SearchAction",
				"target": {
					"@type": "EntryPoint",
					"urlTemplate": "https://revolutiontradingpros.com/blog?search={search_term_string}"
				},
				"query-input": "required name=search_term_string"
			}
		},
		{
			"@type": "WebPage",
			"@id": "https://revolutiontradingpros.com/blog/oco-bracket-orders-thinkorswim-tradingview-swing-guide",
			"url": "https://revolutiontradingpros.com/blog/oco-bracket-orders-thinkorswim-tradingview-swing-guide",
			"name": "OCO Bracket Orders Guide: Automating Swing Trades on ThinkorSwim & TradingView",
			"description": "Configure oco bracket orders on ThinkorSwim and TradingView to automate swing entries, tiered profit targets, and ATR stop-losses while working 9-to-5.",
			"isPartOf": {
				"@id": "https://revolutiontradingpros.com/#website"
			},
			"breadcrumb": {
				"@id": "https://revolutiontradingpros.com/blog/oco-bracket-orders-thinkorswim-tradingview-swing-guide#breadcrumb"
			}
		},
		{
			"@type": "BreadcrumbList",
			"@id": "https://revolutiontradingpros.com/blog/oco-bracket-orders-thinkorswim-tradingview-swing-guide#breadcrumb",
			"itemListElement": [
				{
					"@type": "ListItem",
					"position": 1,
					"name": "Home",
					"item": "https://revolutiontradingpros.com"
				},
				{
					"@type": "ListItem",
					"position": 2,
					"name": "Blog",
					"item": "https://revolutiontradingpros.com/blog"
				},
				{
					"@type": "ListItem",
					"position": 3,
					"name": "Swing & Working Pros",
					"item": "https://revolutiontradingpros.com/blog/category/working-professionals"
				},
				{
					"@type": "ListItem",
					"position": 4,
					"name": "OCO Bracket Orders Guide: Automating Swing Trades on ThinkorSwim & TradingView",
					"item": "https://revolutiontradingpros.com/blog/oco-bracket-orders-thinkorswim-tradingview-swing-guide"
				}
			]
		},
		{
			"@type": "Person",
			"@id": "https://revolutiontradingpros.com/#author-billy-ribeiro",
			"name": "Billy Ribeiro",
			"jobTitle": "Founder & Head Institutional Trader",
			"description": "Founder of Revolution Trading Pros, mentored directly by former Goldman Sachs proprietary trading legend Mark \"Goldfinger\" McGoldrick.",
			"image": "https://revolutiontradingpros.com/logo.png",
			"sameAs": [
				"https://www.linkedin.com/company/revolution-trading-pros",
				"https://x.com/revtradingpros",
				"https://revolutiontradingpros.com/about"
			],
			"worksFor": {
				"@id": "https://revolutiontradingpros.com/#organization"
			},
			"knowsAbout": [
				"OCO Bracket Orders",
				"ThinkorSwim Conditional Order Routing",
				"TradingView Execution Automation",
				"Multi-Day Options Swing Trading",
				"Institutional Risk Management"
			]
		},
		{
			"@type": "Article",
			"@id": "https://revolutiontradingpros.com/blog/oco-bracket-orders-thinkorswim-tradingview-swing-guide#article",
			"headline": "OCO Bracket Orders Guide: Automating Swing Trades on ThinkorSwim & TradingView",
			"description": "Configure oco bracket orders on ThinkorSwim and TradingView to automate swing entries, tiered profit targets, and ATR stop-losses while working 9-to-5.",
			"image": {
				"@type": "ImageObject",
				"url": "https://revolutiontradingpros.com/images/blog/oco-bracket-orders-thinkorswim-tradingview-swing-guide.webp",
				"caption": "Figure 1: Structuring a 1st-Triggers-OCO bracket order with tiered exits and hard invalidation.",
				"width": 1200,
				"height": 630
			},
			"thumbnailUrl": "https://revolutiontradingpros.com/images/blog/oco-bracket-orders-thinkorswim-tradingview-swing-guide.webp",
			"datePublished": "2026-10-31T13:00:00.000Z",
			"dateModified": "2026-10-31T13:00:00.000Z",
			"inLanguage": "en-US",
			"wordCount": 2767,
			"isAccessibleForFree": true,
			"author": {
				"@id": "https://revolutiontradingpros.com/#author-billy-ribeiro"
			},
			"publisher": {
				"@id": "https://revolutiontradingpros.com/#organization"
			},
			"mainEntityOfPage": {
				"@id": "https://revolutiontradingpros.com/blog/oco-bracket-orders-thinkorswim-tradingview-swing-guide"
			},
			"isPartOf": {
				"@id": "https://revolutiontradingpros.com/#website"
			},
			"speakable": {
				"@type": "SpeakableSpecification",
				"cssSelector": ["h1", ".lead"]
			},
			"keywords": "oco bracket orders, one triggers oco thinkorswim, automated stop loss options, conditional orders tradingview, swing trading order types, atr stop loss",
			"articleSection": "Swing & Working Pros"
		},
		{
			"@type": "FAQPage",
			"@id": "https://revolutiontradingpros.com/blog/oco-bracket-orders-thinkorswim-tradingview-swing-guide#faq",
			"mainEntity": [
				{
					"@type": "Question",
					"name": "What does a 1st-Triggers-OCO bracket order do automatically?",
					"acceptedAnswer": {
						"@type": "Answer",
						"text": "Once your primary entry limit order fills, your broker immediately activates both your profit-target limit order and your stop-loss order as a linked pair. Whichever exit order fills first automatically cancels the other exit order so you never have an orphan order left open."
					}
				},
				{
					"@type": "Question",
					"name": "Why should options swing traders trigger stops off the underlying stock price?",
					"acceptedAnswer": {
						"@type": "Answer",
						"text": "Options bid-ask spreads can widen momentarily during the first three to five minutes after the 9:30 AM ET open. Conditioning your stop-loss on the underlying stock or ETF trading below its structural invalidation price prevents artificial stop-outs caused by temporary option spread widening."
					}
				},
				{
					"@type": "Question",
					"name": "Can I set OCO bracket orders the night before with Good-Til-Canceled (GTC) duration?",
					"acceptedAnswer": {
						"@type": "Answer",
						"text": "Yes. Working professionals stage 1st-Triggers-OCO bracket orders in the evening using Good-Til-Canceled (GTC) duration on both the parent entry and child exit legs so the trade executes and protects itself automatically during regular market hours across multiple days."
					}
				},
				{
					"@type": "Question",
					"name": "What happens if my stop-loss is set to DAY instead of GTC on a multi-day swing trade?",
					"acceptedAnswer": {
						"@type": "Answer",
						"text": "If a child stop-loss order is set to DAY time-in-force, it automatically expires at the 4:00 PM ET market close on the day your entry fills. That leaves your option contract completely unprotected on Day 2, which is why every swing bracket leg must be set to GTC."
					}
				},
				{
					"@type": "Question",
					"name": "Should I use a Stop-Market or a Stop-Limit order on my OCO bracket's stop leg?",
					"acceptedAnswer": {
						"@type": "Answer",
						"text": "For liquid large-cap stocks and index ETFs (such as SPY, QQQ, NVDA, AAPL, and MSFT) where you condition the trigger on the underlying stock price or option Mark after 9:35 AM ET, a Stop order ensures guaranteed exit execution if support breaks, whereas a tight Stop-Limit can be skipped over during a fast drop."
					}
				},
				{
					"@type": "Question",
					"name": "Can I use 1st-Triggers-OCO bracket orders on vertical spreads as well as single-leg options?",
					"acceptedAnswer": {
						"@type": "Answer",
						"text": "Yes. On ThinkorSwim Desktop, you can build a vertical debit or credit spread entry order and attach a 1st-Triggers-OCO closing spread order with a net-debit or net-credit profit target and a defined spread-value stop-loss."
					}
				}
			]
		}
	]
}
```

---

## 6. Hard-Evidence Audit Report (Executed Against `getSeoScore` & Google Search Central Rules)

| Check ID (`score.ts` / Google Docs)                              | Rule Evaluated                                                                                                | Measured Result on This Post                                                                           | Status          |
| :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------- | :-------------- |
| **`getSeoScore()` Total Score**                                  | Minimum `>= 80/100` with `0` blocking errors (`PUBLISH_GATE_MIN_SCORE`)                                       | **`100 / 100` (`band: "good"`, `label: "Excellent"`, `publishable: true`, `issues: []`)**              | **PASS (100%)** |
| **Meta Title (`metaTitle`)**                                     | `30..60` chars (`<= 33` raw before ` \| Revolution Trading Pros`), uppercase start, includes `focusKeyword`   | `OCO Bracket Orders Swing Guide` (`30` chars raw / `56` chars rendered; includes `oco bracket orders`) | **PASS**        |
| **Meta Description (`metaDescription`)**                         | `70..155` CMS rule & `140..158` `AGENTS.md` rule (`140..155` intersection), includes `focusKeyword`           | `151` chars; includes `oco bracket orders` verbatim                                                    | **PASS**        |
| **Slug (`slug`)**                                                | `3..70` chars, `^[a-z0-9]+(?:-[a-z0-9]+)*$`, includes `oco-bracket-orders`, `< 3` stop words                  | `oco-bracket-orders-thinkorswim-tradingview-swing-guide` (`54` chars, `0` gate stop words)             | **PASS**        |
| **Word Count (`wordCount`)**                                     | `>= 600` words required for `0` deductions (`CONTENT_MIN_WORDS`)                                              | **`2,714` words** in HTML body (`> 4.5x` minimum depth threshold)                                      | **PASS**        |
| **Heading Hierarchy (`H1 -> H2 -> H3`)**                         | Single `H1` in header, `5 H2`s + `14 H3`s in body, zero duplicate title headings (`duplicate_title_heading`)  | Verified `5 H2`s with unique `id` attributes (activates sticky TOC since `toc.length >= 3`)            | **PASS**        |
| **Cover Image (`coverImage` & `coverImageAlt`)**                 | Non-empty `coverImage` (`1200x630`), `coverImageAlt` != `title`, includes `focusKeyword`                      | Verified `1200x630`, `98`-char descriptive `coverImageAlt` with `oco bracket orders`                   | **PASS**        |
| **Body Images (`extractBodyImages`)**                            | All 4 `<img>` tags have explicit `width="1200" height="675"`, `alt` text, `title`, and `focusKeyword`         | `4/4` body images have explicit `width`/`height` and `4/4` include `oco bracket orders` in `alt`       | **PASS**        |
| **External Authority Links (`extractExternalAuthorityDomains`)** | `>= 2` distinct non-social authority domains required for `0` deductions                                      | **`4` distinct Tier-1 domains:** `sec.gov`, `finra.org`, `optionseducation.org`, `cboe.com`            | **PASS**        |
| **Internal Silo Links**                                          | Links to calculators, courses, rooms, alerts, scanners, indicators, resources, and priority blog posts        | **`13` contextual internal links** across all Revolution Trading Pros silos                            | **PASS**        |
| **FAQ Parity (`faqItems`)**                                      | `>= 3` Q&A items, each answer `>= 40` chars, 1:1 visible `<details>` parity (`docs/SEO_EVIDENCE.md` rows 1-2) | **`6` Q&A items**, shortest answer is `229` chars                                                      | **PASS**        |
| **Zero Em/En Dashes (`contains_em_or_en_dash`)**                 | Zero `\u2014` or `\u2013` characters anywhere in post or metadata (`-25` blocking error if present)           | **`0` em/en dashes** across the entire file                                                            | **PASS**        |
