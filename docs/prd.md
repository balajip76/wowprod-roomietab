# RoomieTab — Product Requirements Document

**Version:** 1.0
**Status:** Draft
**Date:** February 2025

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Market Analysis](#2-market-analysis)
3. [Competitive Landscape](#3-competitive-landscape)
4. [User Personas](#4-user-personas)
5. [Requirements](#5-requirements)
6. [Risk Assessment](#6-risk-assessment)
7. [Key Insights & Recommendations](#7-key-insights--recommendations)
8. [Technical Constraints](#8-technical-constraints)

---

## 1. Executive Summary

### Product Name
**RoomieTab**

### Product Description
RoomieTab is a web-based roommate expense management application designed for groups of up to 5 people sharing a living space. It enables frictionless expense logging with flexible split rules, tracks who paid for what, and at month-end automatically calculates the minimum number of transactions needed to fully settle all balances. The product's north star is radical simplicity: capturing an expense, assigning payers and participants, and splitting it should take **under 10 seconds**.

### Target Audience
College students, young professionals, and co-living residents aged **18–35** who share a home with 2–5 roommates and need a lightweight, always-in-sync tool to track monthly shared expenses — rent, utilities, groceries, and subscriptions — and settle debts fairly with minimal friction.

### High-Level Value Proposition

| Pillar | Value Delivered |
|---|---|
| **Radical Simplicity** | Expense entry in under 10 seconds via a persistent floating action button accessible from every screen |
| **Zero Friction Onboarding** | Roommates join via shareable link with no mandatory account creation (guest mode) |
| **Smart Settlement** | First-class minimum-transaction debt simplification algorithm surfaced as a monthly hero workflow |
| **Permanently Free Core** | Unlimited expense logging on the free tier — no artificial daily caps, no ads |
| **Real-Time Collaboration** | Live balance and expense updates via Supabase Realtime — no manual refresh required |
| **Payment Closing Loop** | One-tap Venmo / PayPal / Zelle deep links pre-filled with recipient and amount |

RoomieTab occupies a deliberate niche: a **roommate-first, monthly-cadence** expense management tool that outperforms travel-focused splitter apps and overcomes the artificial paywalls and onboarding friction of the market leader (Splitwise).

---

## 2. Market Analysis

### Market Sizing

| Metric | Value | Notes |
|---|---|---|
| **TAM** | $612M | 2025 global bill-splitting and shared expense app market (Research & Markets / 360iResearch) |
| **SAM** | $245M | English-speaking markets (US, UK, Canada, Australia) — ~40% of global market, focused on co-living and roommate household segment |
| **SOM** | $2.5M | Realistic 3-year target capturing ~1% of SAM via freemium web-first app; ~100K active monthly users at $2.50 ARPU |
| **Growth Rate** | ~7–11% CAGR | Consensus across Market.us, Research & Markets, Cognitive Market Research; through 2030 |
| **North America (2024)** | $205M | Stand-alone North America market valuation |

### Key Market Trends

- **Expanding Addressable Market:** Rising co-living and rental culture among Millennials and Gen Z is accelerating the roommate-household segment — over **85M US adults** used a bill-splitting app at least once in 2024.
- **Web-First / PWA Shift:** Users increasingly avoid app store friction; no-download onboarding via shareable link is becoming a competitive differentiator and a prerequisite for viral, household-level adoption.
- **AI & OCR as Table Stakes:** AI-assisted expense categorization and receipt OCR are rapidly transitioning from premium to expected features — even on free tiers — setting a rising baseline for product quality.
- **Freemium Fatigue:** Splitwise's daily expense cap backlash is creating a significant market opening for fully-free or one-time-purchase alternatives with no artificial restrictions.
- **P2P Payment Integration:** Integration with Venmo, PayPal, Zelle, and Wise is increasingly expected to close the loop from expense tracking to actual fund settlement, reducing the final-mile friction.
- **Real-Time Collaboration:** Instant sync and live balance updates are emerging as a primary differentiator over static, manual-refresh experiences; users expect collaborative apps to behave like live documents, not batch-updated spreadsheets.

---

## 3. Competitive Landscape

### Per-Competitor Analysis

#### 3.1 Splitwise
**URL:** [https://www.splitwise.com](https://www.splitwise.com)
**Pricing:** Freemium — Free tier (~3 expenses/day, ad-supported); Splitwise Pro at $3/month or $30/year
**Market Share:** Estimated market leader with **50M+ registered users** globally

| | Detail |
|---|---|
| **Strengths** | Market leader with largest user base and brand recognition; supports complex split types (equal, exact, percentages, shares); cross-platform (iOS, Android, Web) with reliable sync; expense categories, labels, and notes; debt simplification to reduce transaction count |
| **Weaknesses** | Free tier capped at ~3 expenses/day — highly frustrating for active households; UI feels dated and cluttered with ads; Pro subscription required for receipt scanning and currency conversion; no real-time collaborative editing (requires manual refresh); onboarding friction requiring all roommates to create accounts |

---

#### 3.2 Tricount
**URL:** [https://tricount.com](https://tricount.com)
**Pricing:** 100% Free — no paid tier
**Market Share:** Strong in Europe; estimated **10M+ users** globally

| | Detail |
|---|---|
| **Strengths** | Completely free with no premium tier or ads; no account creation required for basic use (join via link); clean, minimalist UI; free receipt scanning with OCR; multi-currency support and Excel/PDF export |
| **Weaknesses** | No recurring expense support — every expense entered manually; limited to single-group use per session; no push notifications or settlement reminders; lacks month-end summary or settlement scheduling workflow; no native integration with payment apps |

---

#### 3.3 Settle Up
**URL:** [https://settleup.io](https://settleup.io)
**Pricing:** Free (with ads); Premium ~$2–4/month (varies by region)
**Market Share:** Niche but loyal; estimated **2–5M users**

| | Detail |
|---|---|
| **Strengths** | Excellent UI for visualizing individual balances (bubble/graph design); strong recurring expense support; offline mode with automatic sync on reconnect; supports custom split percentages; timeline view of all settlements |
| **Weaknesses** | Premium subscription required for recurring payments, reminders, and Excel export; smaller user base vs. Splitwise; no minimum-transaction settlement algorithm surfaced clearly; web app experience less polished than mobile; limited payment platform integrations |

---

#### 3.4 Splid
**URL:** [https://splid.app](https://splid.app)
**Pricing:** Free (single group); one-time in-app purchase (~$4–6) for unlimited groups and export
**Market Share:** Niche; popular in German-speaking markets, estimated **1–3M users**

| | Detail |
|---|---|
| **Strengths** | Best-in-class offline functionality; one-time payment model (no recurring subscription); fast, minimal expense entry UI; printable and Excel-exportable summaries; available on iOS and Android |
| **Weaknesses** | No real-time sync — relies on manual data sharing; no web app (mobile only); one-time unlock fee may deter casual users; no push notifications or automated reminders; no receipt scanning |

---

#### 3.5 Spliit
**URL:** [https://spliit.app](https://spliit.app)
**Pricing:** 100% Free (open source); self-hosted or hosted at spliit.app
**Market Share:** Growing indie following; estimated **<1M users** but rapidly gaining traction

| | Detail |
|---|---|
| **Strengths** | Fully open-source and self-hostable (privacy-first); no account required (share via link); zero ads, completely free; clean modern UI (Next.js); active open-source community |
| **Weaknesses** | No native mobile app (PWA only, limiting push notification reliability); no real-time sync (requires page refresh); minimal features vs. Splitwise (no receipt scan, no recurring expenses); no payment app integrations; self-hosting requires technical knowledge |

---

### Competitive Summary Comparison Table

| Feature / Product | RoomieTab | Splitwise | Tricount | Settle Up | Splid | Spliit |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Free & Unlimited Core** | ✅ | ❌ (3/day cap) | ✅ | ❌ (ads) | ✅ (1 group) | ✅ |
| **No Mandatory Sign-Up** | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Real-Time Sync** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Min-Transaction Settlement** | ✅ (hero feature) | ✅ (buried) | ✅ | ❌ | ❌ | ✅ |
| **Recurring Expenses (Free)** | ✅ | ❌ (Pro) | ❌ | ❌ (Premium) | ❌ | ❌ |
| **Payment App Deep Links** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Web / PWA** | ✅ | ✅ | ✅ | ⚠️ (limited) | ❌ | ✅ |
| **Push Notifications (Free)** | ✅ | ❌ | ❌ | ❌ (Premium) | ❌ | ❌ |
| **Receipt Photo Attachment** | ✅ (Plus) | ✅ (Pro) | ✅ | ❌ | ❌ | ❌ |
| **CSV / PDF Export** | ✅ (Plus) | ✅ (Pro) | ✅ | ✅ (Premium) | ✅ | ❌ |
| **Estimated Users** | — | 50M+ | 10M+ | 2–5M | 1–3M | <1M |
| **Pricing** | Free + $1.99/mo Plus | Free + $3/mo Pro | Free | Free + ~$2–4/mo | Free + ~$4–6 one-time | Free |

> ✅ = Included | ❌ = Not available or paywalled | ⚠️ = Partial/limited

---

## 4. User Personas

### Persona 1 — Maya Chen

| Attribute | Detail |
|---|---|
| **Name** | Maya Chen |
| **Age** | 21 |
| **Occupation** | Undergraduate Student (Computer Science) |
| **Tech Savviness** | High |

**Goals:**
- Keep track of shared apartment costs (rent, groceries, utilities) without awkward money conversations
- Settle up with 3 roommates at the end of each month using the fewest possible Venmo transactions
- Spend fewer than 30 seconds logging an expense on her phone immediately after a grocery run

**Pain Points:**
- Splitwise's 3-expense/day free limit is constantly hit during busy weeks; she refuses to pay $3/month for what she considers a basic tool
- Roommates forget to log their purchases, leading to disputes and incomplete records at month-end
- Group chats used for expense tracking become chaotic and messages get buried under other conversation

**Design Implications:** Maya needs a sub-10-second expense entry flow accessible from any screen, and a reliable way to nudge forgetful roommates without confrontation. The settlement summary's Venmo deep link directly solves her primary end-of-month pain point.

---

### Persona 2 — Jordan Patel

| Attribute | Detail |
|---|---|
| **Name** | Jordan Patel |
| **Age** | 27 |
| **Occupation** | Junior Software Engineer |
| **Tech Savviness** | High |

**Goals:**
- Maintain a clear, fair record of who owes what across 4 roommates in a shared house
- Automate recurring monthly expenses (Netflix, internet, rent) so they don't need to be re-entered each month
- Export a monthly summary to review personal spending and support personal budgeting

**Pain Points:**
- Current spreadsheet-based system is manual, error-prone, and not visible to all roommates in real time
- Calculating the minimum number of payments to settle complex multi-person balances is confusing and time-consuming to do manually
- Roommates with varying financial situations need different split percentages for certain bills, which most apps handle poorly

**Design Implications:** Jordan is the most likely household "treasurer" and power user. He needs recurring expense automation, flexible split percentages, and export functionality. The minimum-transaction algorithm directly resolves his most labor-intensive monthly task. Real-time sync eliminates his reliance on an outdated shared spreadsheet.

---

### Persona 3 — Priya Nair

| Attribute | Detail |
|---|---|
| **Name** | Priya Nair |
| **Age** | 24 |
| **Occupation** | Marketing Coordinator |
| **Tech Savviness** | Medium |

**Goals:**
- Avoid being the unofficial "house treasurer" who manually tracks and reminds everyone about shared expenses
- Have a simple, at-a-glance visual view of her net balance without parsing a long transaction list
- Ensure all 5 housemates are aligned on what is owed before month-end, without having to bring it up face-to-face

**Pain Points:**
- Low confidence with technology — wants an app that is as intuitive as sending a text, not a spreadsheet
- Uncomfortable raising money topics with roommates directly; prefers passive, app-driven nudges and reminders
- Previous apps required everyone to create accounts, and half her roommates never completed registration

**Design Implications:** Priya's experience defines the accessibility ceiling. The zero-friction guest link is critical to ensure all 5 of her housemates participate. The dashboard's balance summary must be a prominent, visual element — not a number buried in a list. Push notification reminders must handle the social awkwardness of debt collection passively on her behalf.

---

## 5. Requirements

### 5.1 Functional Requirements

| ID | Title | Description | Priority |
|---|---|---|---|
| REQ-001 | Household Group Creation & Invite | A user can create a household group (max 5 members) and invite roommates via a shareable link or email. Invitees can join without mandatory account creation for the first session (guest mode via magic link), reducing onboarding friction. | 🔴 Must-Have |
| REQ-002 | Quick Expense Entry | Adding an expense must take under 10 seconds: enter amount, description, select who paid, and select who it's split among. Default split is equal among all members. The form must be accessible from a persistent floating action button on all screens. | 🔴 Must-Have |
| REQ-003 | Flexible Split Rules | Each expense can be split by: (a) equal shares, (b) exact fixed amounts per person, (c) percentage-based allocation, or (d) custom shares/weights. The selected rule is remembered as the default for that expense category. | 🔴 Must-Have |
| REQ-004 | Month-End Settlement Summary with Minimum Transactions | At any point (and auto-generated at month-end), the app computes and displays the minimum number of transactions required to fully settle all balances across the group, using a debt-simplification algorithm (e.g., greedy net-balance matching). Each suggested transaction shows payer, receiver, and exact amount. | 🔴 Must-Have |
| REQ-006 | Expense Categories & Tags | Users can assign a category to each expense from a predefined list (Rent, Utilities, Groceries, Dining, Subscriptions, Transport, Household, Other) with optional free-text tags. Categories are used for monthly breakdown charts. | 🟡 Should-Have |
| REQ-007 | Recurring Expense Support | Users can mark an expense as recurring (monthly) with a set day of month. The app auto-creates the expense entry each month via a Supabase Edge Function cron job, with a push notification to all members for confirmation. | 🟡 Should-Have |
| REQ-008 | Push Notifications & Settlement Reminders | Members receive push notifications (via Web Push API / service worker) when: a new expense is added, they are tagged in an expense, a settlement is requested, and 3 days before month-end if unsettled balances exist. Notification preferences are user-configurable. | 🟡 Should-Have |
| REQ-009 | Payment App Deep Links | On the settlement summary screen, each suggested transaction includes one-tap deep links to Venmo, PayPal, and Zelle pre-populated with the recipient and amount, reducing friction to zero for the actual payment step. | 🟡 Should-Have |
| REQ-010 | Monthly Expense History & Audit Log | All expenses are stored with full history. Users can browse by month, filter by category or member, and see a timeline of all additions and edits. Deleted expenses are soft-deleted and visible to admins for dispute resolution. | 🔴 Must-Have |
| REQ-011 | Receipt Photo Capture & Storage | Users can attach a photo of a receipt to any expense using device camera or file upload. Images are stored in Supabase Storage. Thumbnail shown inline in expense list; full image viewable on tap. | 🔵 Nice-to-Have |
| REQ-015 | CSV / PDF Monthly Export | Any member can export the current month's expenses as a CSV (for spreadsheet import) or a formatted PDF summary (for record-keeping or landlord documentation), generated server-side via a Supabase Edge Function. | 🔵 Nice-to-Have |

---

### 5.2 Non-Functional Requirements

| ID | Title | Description | Priority |
|---|---|---|---|
| REQ-012 | Performance — Sub-2s Page Load | All primary screens (dashboard, expense list, add expense form, settlement summary) must achieve a Time to Interactive (TTI) under 2 seconds on a standard 4G connection. Achieved via Next.js 15 Server Components, edge caching on Vercel, and optimistic UI updates. | 🔴 Must-Have |
| REQ-013 | Mobile-First Responsive UI | The app must be fully usable on mobile browsers (375px viewport and up) without a native app install, following a mobile-first design approach with Tailwind CSS. Touch targets must be ≥44px. The app should be installable as a PWA. | 🔴 Must-Have |

---

### 5.3 Technical Requirements

| ID | Title | Description | Priority |
|---|---|---|---|
| REQ-005 | Real-Time Sync via Supabase Realtime | All expense additions, edits, and deletions are broadcast to all connected group members instantly via Supabase Realtime subscriptions (PostgreSQL change notifications). No manual refresh required — balances and expense lists update live. | 🔴 Must-Have |
| REQ-014 | Secure Auth with Row-Level Security | Authentication via Supabase Auth (email magic link + Google OAuth). All database tables enforce Row-Level Security (RLS) policies ensuring users can only read/write data belonging to their household group. No cross-group data leakage is permissible. | 🔴 Must-Have |

---

### 5.4 Requirements Summary

| Priority | Count | Requirement IDs |
|---|---|---|
| 🔴 **Must-Have** | **9** | REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-010, REQ-012, REQ-013, REQ-014 |
| 🟡 **Should-Have** | **4** | REQ-006, REQ-007, REQ-008, REQ-009 |
| 🔵 **Nice-to-Have** | **2** | REQ-011, REQ-015 |
| **Total** | **15** | |

---

## 6. Risk Assessment

### Risk Matrix

| Risk | Likelihood | Impact | Mitigation Strategy |
|---|:---:|:---:|---|
| **Low roommate adoption** — app value collapses if even one of 5 roommates refuses to participate | 🔴 High | 🔴 High | Implement zero-friction guest participation: roommates can view balances and confirm expenses via a shared link without creating an account. Only the "treasurer" role requires a full account. Reduce signup barrier to a single magic-link email. |
| **Debt simplification rounding errors** — floating-point arithmetic across multiple split types produces incorrect or disputed settlement amounts | 🟡 Medium | 🔴 High | Store all monetary values as **integers (cents)** in PostgreSQL to eliminate floating-point arithmetic entirely. Implement the minimum-transaction algorithm (net-balance greedy matching) in a Supabase Edge Function with a comprehensive test suite covering edge cases: uneven splits, 5-person groups, partial settlements. |
| **Supabase Realtime reliability** — connection limits or instability cause stale balance displays, eroding user trust | 🟡 Medium | 🟡 Medium | Implement optimistic UI updates on the client side so the interface feels instant regardless of server round-trip. Add a visible "last synced" indicator and a manual refresh fallback. Design the data model so any screen can be fully reconstructed from a single REST query as a graceful fallback to Realtime. |
| **Monetization difficulty vs. free incumbents** — competing against Tricount and Spliit makes it extremely difficult to convert users to a paid tier without genuinely valuable paid features | 🔴 High | 🟡 Medium | Position the free tier as permanently unlimited for core features (no expense caps, no ads). Monetize via an optional **RoomieTab Plus** tier ($1.99/month) offering receipt scanning with AI categorization, recurring expenses, CSV/PDF export, and payment reminders — features that create genuine time savings rather than artificial paywalls. |
| **Data privacy concerns** — users are deterred from storing sensitive financial data in a third-party app | 🟢 Low | 🔴 High | Publish a clear, plain-English privacy policy committing to no data selling and no third-party advertising SDKs. Enforce Supabase RLS at the database level. Target SOC 2 Type I compliance as a mid-term milestone. Offer a complete data export and account deletion flow on day one to signal trustworthiness. |

### Risk Priority Summary

| Severity (Likelihood × Impact) | Risks |
|---|---|
| 🔴 **Critical** (High × High) | Low roommate adoption |
| 🟠 **High** (Medium × High, High × Medium) | Rounding errors in debt algorithm; Monetization difficulty |
| 🟡 **Medium** (Medium × Medium) | Supabase Realtime reliability |
| 🟢 **Monitor** (Low × High) | Data privacy concerns |

---

## 7. Key Insights & Recommendations

### Market & Positioning

- **The Splitwise free-tier cap is the single biggest market opening.** Splitwise's artificial 3-expense/day limit on the free tier is the most cited pain point in the competitive landscape. A permanently free, unlimited core tier is the strongest possible acquisition differentiator for RoomieTab and must be treated as a non-negotiable product commitment — not a growth-phase feature.

- **Own the roommate niche explicitly.** The roommate-specific use case — fixed group, monthly cadence, recurring household expenses — is chronically underserved by travel-focused competitors like Tricount. Positioning RoomieTab explicitly around monthly household management creates a clear, ownable niche with messaging that resonates directly with the 18–35 co-living segment.

- **The bill-splitting app market is large and growing, with no dominant PWA player.** At ~$612M TAM growing at 7–11% CAGR and no strong web-first competitor, there is a well-timed opportunity to establish RoomieTab as the default PWA for roommate expense management before a larger player moves in.

### Product Strategy

- **The minimum-transaction settlement algorithm is the hero feature.** It is the most technically novel and user-valued capability in the space. No competitor surfaces this calculation as a first-class, prominent monthly workflow. It must be RoomieTab's signature screen — not a buried settings option — and its promotion must be central to all marketing messaging.

- **Zero-friction guest access is a critical product requirement, not a nice-to-have.** Low adoption by all roommates is the #1 killer of group expense apps. A shareable link that allows balance viewing and expense confirmation without account creation is the primary mechanism to overcome the "half my roommates won't sign up" failure mode. Every design decision should minimize the number of steps between receiving a link and seeing the group's balances.

- **Recurring expense automation should be free.** Rent, Netflix, internet, and utilities recur every month — they are the defining expense type for the roommate segment. Offering recurring expense automation for free (while competitors lock it behind paywalls) is a strong retention differentiator and a reason for power users like Jordan to choose and stay with RoomieTab.

- **Payment app deep links close the last mile.** The workflow gap between "knowing what you owe" and "actually paying it" is entirely unaddressed by current competitors. One-tap Venmo/PayPal/Zelle deep links pre-filled with recipient and amount convert the settlement summary from a reference screen into an action screen — dramatically increasing the likelihood of actual month-end settlement.

### Monetization

- **RoomieTab Plus at $1.99/month must feel like genuine value, not an artificial paywall.** The Plus tier should bundle receipt scanning with AI categorization, recurring expenses, CSV/PDF export, and payment reminders — features that demonstrably save time and reduce friction for power users — not features arbitrarily removed from the free tier to drive conversion. The free tier must always remain fully functional for the core use case.

### Technical

- **Store all monetary values as integers (cents).** Floating-point rounding errors in multi-person split calculations can produce incorrect settlement amounts that undermine user trust. Storing values as integer cents in PostgreSQL and performing all arithmetic in integer space eliminates this class of bug entirely before it reaches production.

- **Next.js 15 + Supabase Realtime is the right stack for the product's differentiation strategy.** Server Components deliver fast initial dashboard loads (supporting the sub-2s TTI requirement), while Realtime subscriptions deliver the live collaborative experience that separates RoomieTab from static alternatives. Optimistic UI updates ensure perceived performance remains high even when network conditions are poor.

---

## 8. Technical Constraints

### Tech Stack Summary

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 15 (App Router + Server Components) | SSR for fast initial page loads; Server Components reduce client-side JavaScript bundle; App Router supports nested layouts for persistent FAB and navigation |
| **Styling** | Tailwind CSS | Mobile-first utility classes; enforces consistent spacing and touch-target sizing (≥44px); rapid iteration without context-switching to CSS files |
| **Database** | Supabase (PostgreSQL) | Managed Postgres with built-in Row-Level Security (RLS) for per-group data isolation; integer storage for monetary values eliminates floating-point risk |
| **Real-Time** | Supabase Realtime | PostgreSQL change notifications broadcast over WebSocket to all connected group members; enables live balance and expense updates without polling |
| **Authentication** | Supabase Auth | Email magic link (no password friction) + Google OAuth; guest mode via shareable token for zero-account onboarding |
| **File Storage** | Supabase Storage | Receipt photo upload and storage; access controlled by RLS-compatible storage policies |
| **Edge Functions** | Supabase Edge Functions (Deno) | Server-side: minimum-transaction settlement algorithm, recurring expense cron jobs, CSV/PDF generation — keeping sensitive logic off the client |
| **Hosting / CDN** | Vercel | Edge network for global sub-2s TTI; automatic preview deployments per PR; integrated Next.js optimization (image, font, bundle) |
| **Push Notifications** | Web Push API + Service Worker | Browser-native push without a native app; enables settlement reminders and expense alerts on mobile and desktop |
| **CI / CD** | GitHub Actions + Vercel | Automated lint, type-check, and unit test runs on every pull request; automatic production deployment on merge to `main` |
| **Monetary Precision** | Integer cents (PostgreSQL `INTEGER`) | All amounts stored as cents (e.g., $12.50 → 1250) to eliminate floating-point arithmetic errors in split calculations and settlement sums |

### Key Technical Constraints & Decisions

- **Max group size of 5** is enforced at the application layer and reflected in the minimum-transaction algorithm's complexity bounds — keeping settlement calculation time well under 100ms even for worst-case balance graphs.
- **PWA-first (no native app):** The initial release targets mobile browsers exclusively. Service Worker + Web App Manifest enables installability on iOS (Safari) and Android (Chrome) without App Store distribution, eliminating review delays and reducing onboarding friction.
- **RLS as the security perimeter:** All data isolation between household groups is enforced at the PostgreSQL row level — not solely in application code. This ensures that even a misconfigured API route cannot return cross-group data.
- **Offline support scope (v1):** Full offline-first capability is deferred to a future release. v1 provides optimistic UI updates and a graceful degradation message when connectivity is lost, with automatic sync on reconnect via Supabase Realtime.
- **Monetary arithmetic:** All split calculations, balance aggregations, and settlement amounts are computed in integer cents throughout the stack. The minimum-transaction algorithm in the Edge Function accepts and returns integer cent values. Display formatting (division by 100, locale-specific currency symbols) occurs exclusively at the UI rendering layer.

---

*This document represents the v1.0 PRD for RoomieTab. It should be reviewed and updated at each major milestone: end of discovery, end of design, and post-launch retrospective.*

*Document Owner: Product Management*
*Last Updated: February 2025*