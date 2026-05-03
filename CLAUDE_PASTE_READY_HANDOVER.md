# Claude Handover: SteadyUs

You are taking over a project called **SteadyUs**.

Your job is to help me continue, rebuild, or refine both:

1. the **SteadyUs website**, and  
2. the **SteadyUs presentation / PowerPoint materials**.

Please treat the attached repository and files as the source of truth.

## What SteadyUs is

SteadyUs is a warm, personal, UK-facing **financial coaching** business focused on **couples who want to sort out shared finances**. It is **not** a regulated financial advice business. The tone must stay human, first-person, clear, calm, and non-corporate.

The owner is **Andy**. The public contact / notification email is **andy.steadyus@gmail.com**.

## Core offer

The main public offer is **Couples Budget Reset**.

| Field | Current position |
| --- | --- |
| Offer name | Couples Budget Reset |
| Format | 2 x 60-minute video sessions |
| Pilot price | £99 |
| Expected standard price | £129–£149 |
| Optional follow-up 1 | Monthly Check-In at £35 |
| Optional follow-up 2 | 3-Month Pack at £89 |
| Session 1 | Money clarity / current picture / pressure points |
| Session 2 | Shared action plan / realistic priorities / next steps |
| Between sessions | Simple preparation prompts |
| Afterward | Written reset summary |

This is coaching only. Do **not** imply investment advice, tax advice, pension advice, mortgage advice, or other regulated financial advice.

## Tone and copy rules

Keep the voice in **first person**. The website should sound like **Andy directly speaking**, not like a corporate brand. Avoid jargon, hype, and startup language. Avoid wording that sounds clinical or forced. Keep it warm, practical, personal, and accessible.

Examples of the intended tone:

- “I help couples make money feel calmer, clearer, and easier to talk about.”
- “I built these two focused sessions to help you get out of the same stuck money patterns...”

## Current website structure

The current project contains these routes:

| Route | Purpose |
| --- | --- |
| `/` | Public homepage / landing page |
| `/couples-budget-reset` | Booking / intake page |
| `/checkout` | Booking-process explanation / checkout details |
| `/admin/leads` | Owner-only lead admin page |

The public customer journey is:

1. visitor lands on homepage,  
2. clicks through to booking form,  
3. submits a short enquiry form with preferred times,  
4. Andy manually confirms availability,  
5. payment instructions are sent only after time is agreed,  
6. appointment is confirmed after payment.

This is intentionally a **manual, low-pressure booking flow**, not a fully automated checkout.

## Important technical facts

The codebase is a **React + Vite + Express + tRPC + Drizzle** project.[1] [2] [3]

Important behavior to preserve:

| Area | Current behavior |
| --- | --- |
| Coaching enquiry form | Sends owner notification when submitted |
| Visitor feedback | Shows success toast/banner after form submission |
| Public email | Uses `andy.steadyus@gmail.com` |
| Disclaimer | Clearly states this is budgeting support / financial organisation only |
| Planner | Legacy planner feature still exists in repo |
| Admin area | Owner lead tracker still exists in repo |

Important backend nuance:

- **Coaching enquiries are notified to the owner but are not currently persisted in the database**.[2]
- **Beta leads and saved planner plans are persisted**.[2] [3]

## What is included in this handover

You have:

- the website source code,
- technical notes about the website,
- a presentation reconstruction brief.

You do **not** currently have the original slide project folders for the PowerPoint decks, because those source directories were missing after export-time sandbox reset. If you need the decks, rebuild them from the presentation brief and the business context in this package.

## Priority if I ask you to rebuild from scratch

If I ask for a rebuild, do it in this order:

1. restore the public website routes and core copy,
2. restore the booking enquiry form and owner-notification behavior,
3. preserve the first-person tone and disclaimer boundaries,
4. recreate the presentation decks from the included reconstruction brief,
5. improve anything obviously brittle or overly complex only after parity is reached.

## Files to inspect first

| File | Why it matters |
| --- | --- |
| `package.json` | Stack, scripts, dependency assumptions |
| `client/src/App.tsx` | Route map |
| `client/src/lib/coachingOfferContent.ts` | Source of truth for offer copy and pricing |
| `client/src/pages/Home.tsx` | Homepage layout and tone |
| `client/src/pages/BookingPage.tsx` | Intake flow and success/error UX |
| `client/src/pages/CheckoutPage.tsx` | Process explanation page |
| `server/routers.ts` | Backend contracts and live behavior |
| `drizzle/schema.ts` | Persisted data model |

## How to respond

When I ask for changes, please:

1. explain what is already present,  
2. identify what should be preserved,  
3. propose the minimum clean change, and  
4. implement it without drifting into corporate or product-marketing language.

## References

[1]: ./steadyus-website-source/package.json "Website package manifest and stack"
[2]: ./steadyus-website-source/server/routers.ts "Main backend router and live feature contracts"
[3]: ./steadyus-website-source/drizzle/schema.ts "Database schema"
