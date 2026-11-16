---
title: "FINRA's 2026 Intraday Margin Rule (Notice 26-10): Complete Trader Playbook"
slug: 'finra-intraday-margin-rule-2026'
metaTitle: 'FINRA Rule 4210 Margin Guide'
metaDescription: 'FINRA Notice 26-10 replaces the $25,000 PDT rule with Rule 4210(d)(2) Intraday Margin Levels ($2,000 floor, de minimis buffer, Oct 20, 2027 rollout).'
focusKeyword: 'finra intraday margin rule 2026'
secondaryKeywords:
  - 'finra regulatory notice 26-10'
  - 'finra rule 4210 intraday margin level'
  - 'pdt rule replacement 2026'
  - 'de minimis intraday margin deficit'
  - 't+1 cash account options trading'
category: 'market-structure'
schemaType: 'Article'
isPillar: true
publishedAt: '2026-11-16T14:00:00.000Z'
---

On June 4, 2026, FINRA Regulatory Notice 26-10 (published April 20, 2026, alongside Notice 26-11) amended FINRA Rule 4210(d)(2) to retire the 2001-era $25,000 4-trade Pattern Day Trader (PDT) counter and replace it with continuous Intraday Margin Level (IML) risk monitoring above the $2,000 margin equity floor across an 18-month broker implementation window ending October 20, 2027.

## 1. Executive Breakdown: Why FINRA Retired the 2001 $25,000 PDT Counter

For twenty-five years, retail U.S. margin traders with less than $25,000 in account equity were artificially capped at three round-trip day trades per rolling five-business-day window. Paradoxically, that mechanical trade counter forced small-account traders to hold losing intraday positions overnight simply to avoid a 90-day Pattern Day Trader freeze — turning manageable 1R intraday stop-outs into catastrophic overnight gap losses.

Under **FINRA Regulatory Notice 26-10**, SEC-approved amendments to **FINRA Rule 4210(d)(2)** abolish the arbitrary four-trade rolling counter. Instead of counting how many times a trader clicks buy and sell, the modern rule measures **actual peak intraday leverage and maintenance exposure** in real time.

Key statutory dates every U.S. equity and options trader must know:

- **Notice Publication Date:** April 20, 2026 (FINRA Regulatory Notices 26-10 and 26-11).
- **Rule Effective Date:** June 4, 2026 — broker-dealers whose risk engines are certified may transition customer margin accounts onto Rule 4210(d)(2) intraday margin immediately.
- **Mandatory Broker Cutover Deadline:** October 20, 2027 (end of the 18-month implementation window). Until a specific carrying broker migrates its platform, legacy $25,000 PDT rules continue to apply on that broker's accounts.

## 2. Side-by-Side Comparison: Legacy Pre-June 2026 PDT Rule vs. Amended FINRA Rule 4210(d)(2)

| Regulatory Dimension           | Legacy Pre-June 2026 PDT Rule                                                 | Amended FINRA Rule 4210(d)(2) (Notice 26-10)                                                                                   |
| :----------------------------- | :---------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| **Minimum Margin Equity**      | **$25,000** required once executing 4+ day trades in 5 business days          | **$2,000** statutory FINRA margin minimum equity baseline (`$0` FINRA minimum in T+1 Cash Accounts)                            |
| **Trade Frequency Cap**        | Hard cap of **3 round-trip day trades** per 5 business days under $25,000     | **Unlimited intraday round trips** so long as exposure stays within positive Intraday Margin Level (`IML >= $0`)               |
| **Risk Measurement Metric**    | Start-of-day Day-Trading Buying Power (`4x` maintenance excess) + trade count | Real-time **Intraday Margin Level (`IML`)** = `Margin Equity - Intraday Maintenance Requirement`                               |
| **Minor Deficit Tolerance**    | Zero statutory de minimis exception on PDT equity calls                       | **De Minimis Exception:** deficits under `min(5% of Account Equity, $1,000)` excused from FINRA's practice freeze trigger      |
| **Deficit Cure & Restriction** | 5 business days to meet $25,000 call or 90-day cash-only freeze               | Unsatisfied non-de-minimis deficits tracked up to **15 business days**; repeated violations trigger a **90-day margin freeze** |

## 3. Exact Statutory Formulas: IML, IML-Reducing Transactions & Intraday Margin Deficits

Amended Rule 4210(d)(2) introduces three statutory definitions that govern every intraday stock, ETF, and options order in a margin account:

### Intraday Margin Level (IML)

Your **Intraday Margin Level (`IML`)** equals your real-time net liquidating margin equity minus the aggregate intraday maintenance margin requirement across all open positions:

`IML = Real-Time Account Equity - Intraday Maintenance Requirement`

So long as your account remains above the **$2,000** margin equity baseline and your `IML` stays at or above **$0**, you maintain withdrawable intraday margin excess and can enter and exit intraday setups cleanly — including cutting an invalidated trade 90 seconds after entry without worrying about a five-day trade counter.

### IML-Reducing Transactions

An **IML-reducing transaction** is any opening or increasing equity, ETF, or options order (including `0DTE` index contracts or credit/debit spreads) that consumes withdrawable intraday margin excess and lowers your real-time `IML`. Risk-reducing orders that flatten or trim open exposure increase `IML` and are never blocked for closing risk.

### Intraday Margin Deficit & Broker Phase-In Mechanics

Whenever peak intraday maintenance exceeds your real-time account equity (`IML < $0`), your account records an **intraday margin deficit** (`IMD = |IML|`).

Crucially, during and after the 18-month broker rollout ending **October 20, 2027**, FINRA permits two operational broker models:

1. **Real-Time Pre-Trade Order Blocking (Optional Broker Overlay):** Many active-trader brokerages prevent `IML-reducing transactions` before order routing if the order would push `IML` below `$0` — or automatically liquidate positions intraday if sharp volatility creates a house-margin breach.
2. **End-of-Day Intraday Deficit Computation:** Brokers that do not block pre-trade orders in real time compute the account's peak intraday margin deficit at the end of the session and issue an intraday margin call if the deficit exceeds the De Minimis threshold.

Test your exact account equity, option debit, vertical spread width, or equity maintenance percentage inside our free [FINRA Rule 4210 Intraday Margin & Position Sizing Calculator](/resources/intraday-margin-calculator).

## 4. The De Minimis Exception, 15-Business-Day Window & 90-Day Margin Freeze

To prevent minor bid-ask ticks or brief volatility spikes from freezing disciplined small margin accounts, FINRA Notice 26-10 codifies a **De Minimis Exception**:

- **Formula:** `De Minimis Cap = min(0.05 × Account Equity, $1,000)`
- **Example ($3,500 Margin Account):** `5% × $3,500 = $175` De Minimis buffer.
- **Example ($25,000+ Margin Account):** Capped at `$1,000` (`5% × $25,000 = $1,250`, so the `$1,000` ceiling governs).

If an account incurs a **non-de-minimis intraday margin deficit**, the deficit must be satisfied promptly via deposit or margin-releasing liquidation. Unsatisfied non-de-minimis deficits are tracked across up to **15 business days**, and repeated patterns of unsatisfied intraday deficits trigger a mandatory **90-day margin restriction**, restricting the account from opening `IML-reducing transactions` on margin.

Remember: FINRA's statutory thresholds are **regulatory floors, not ceilings**. Every carrying broker retains full contractual authority under house margin rules to require higher intraday maintenance percentages (for example, `35%–100%` on volatile equities or `0DTE` expiration afternoon contracts) and liquidate positions immediately without waiting 15 business days.

## 5. How 0DTE SPX/XSP Options & Defined-Risk Spreads Behave Under Rule 4210(d)(2)

How your options trades impact `IML` depends directly on contract structure and underlying settlement style:

1. **Long Single-Leg Calls & Puts (< 9 Months to Expiration):** Listed options expiring in nine months or less carry zero loan value under Regulation T and FINRA Rule 4210 — 100% of the contract debit reduces your available `IML` dollar-for-dollar, while maximum possible loss stays capped to premium paid.
2. **Cash-Settled Index Vertical Spreads (`SPX` & Mini-`XSP`):** Defined-risk debit spreads require the net debit paid, while credit spreads require the strike-width maximum loss minus net credit received (`(Width × 100) - Credit`). Because `SPX` and `XSP` are **European-style and 100% cash-settled** (see our [Cash-Settled Index Options & Section 1256 Guide](/resources/stock-indexes-list)), they eliminate early share assignment and 4:00 PM ET pin-risk share margin spikes that routinely trigger catastrophic intraday deficits on `SPY` or `QQQ` spreads!
3. **Why Abolishing the PDT Counter Still Demands Binary Stops:** Unlimited day trades do **not** create an edge. Without a pre-committed structural invalidation price (the core rule of [The Move Prior to The Move™](/methodology)), unlimited round trips simply accelerate overtrading commissions and `0DTE` theta bleed.

## 6. Sub-$2,000 Accounts: Why T+1 Settled Cash Remains Essential for $500–$1,999 Starters

FINRA Rule 4210(b) still enforces a **$2,000 minimum equity requirement** (`$2,000` or `100%` of purchase price, whichever is less, before margin privileges activate) for leveraged margin accounts.

For developing traders starting between **$500 and $1,999**, a **T+1 Cash Account** remains the cleanest regulatory structure in 2026:

- **Zero FINRA Margin Floor:** Cash accounts have `$0` FINRA margin minimum because zero borrowed broker credit is used.
- **Overnight T+1 Settlement:** Both U.S. equities and listed options settle the **next business morning (`T+1`)**. If you deploy `$600` of settled cash across two `$300` defined-risk setups on Monday and close them before 4:00 PM ET, 100% of your settled cash refreshes Tuesday morning at 9:30 AM ET with zero Good Faith Violations (GFVs) — provided you never sell shares or contracts bought with _unsettled_ same-day proceeds before settlement.
- **Position Sizing Discipline:** On a `$1,000` cash account, risking `2%` (`$20` stop-loss) to `3%` (`$30` stop-loss) on a `$1.00` (`$100`) liquid ETF or mini-`XSP` contract with a mechanical `20%–30%` structural invalidation stop protects survival across inevitable losing streaks. Model your exact contract risk in our [Options Profit & Greeks Calculator](/resources/options-calculator) and review our [Small Accounts Room ($500+)](/live-trading-rooms/small-accounts-room) workflow.

## 7. Pre-Session FINRA Rule 4210 Execution Checklist

Before routing your first opening bell order:

1. **Confirm Your Broker's Cutover Status:** Verify whether your carrying broker has migrated onto Rule 4210(d)(2) intraday margin or is still operating on its pre-cutover PDT schedule ahead of October 20, 2027.
2. **Select Cash (`$500–$1,999`) vs. Margin (`$2,000+`):** Never trade unsettled proceeds in a cash account, and keep a comfortable equity cushion above `$2,000` in a margin account so a single stop-out never drops you below the margin floor.
3. **Size From Your Structural Stop, Never Max Buying Power:** Just because `IML` allows 10 contracts does not mean your risk budget allows 10 contracts. Size strictly from `(Account Equity × Max Risk %) ÷ Dollar Distance to Binary Invalidation`.
4. **Prefer Cash-Settled `SPX` / `XSP` Over Physical-Delivery ETFs Near Expiration:** Avoid afternoon pin-risk assignment margin shocks completely.

_Educational regulatory overview only — not legal, brokerage, or personalized investment advice. Consult FINRA Regulatory Notice 26-10, your carrying broker-dealer's margin disclosure statement, and our full [U.S. & Canada Risk Disclosure](/risk-disclosure)._
