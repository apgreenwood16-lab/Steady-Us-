# SteadyUs Website Rebuild Notes

## Overview

The current SteadyUs repository is not just a marketing site. It contains three layers that matter during a rebuild: the **public coaching funnel**, a **legacy financial planner flow**, and an **owner-facing admin leads area**.[1] [2] [3] If your goal is to preserve what exists with minimum risk, the public coaching funnel should be treated as the primary user-facing product, while the planner and admin sections should be treated as secondary but still real parts of the codebase.

## Product and business position

SteadyUs is positioned as a UK-facing financial coaching service for couples. The public offer is the **Couples Budget Reset**, which is currently defined as a two-session coaching package at a **£99 pilot price**, with a planned standard range of **£129–£149** once testimonials are in place.[4] The website copy is intentionally first-person and personal. The live headline and summary framing are built around making money feel **calmer, clearer, and easier to talk about**, while staying explicit that the service is **budgeting support and financial organisation only**, not regulated financial advice.[4] [5]

| Business attribute | Current state |
| --- | --- |
| Business name | SteadyUs |
| Owner | Andy |
| Audience | Couples who want to sort out shared finances |
| Tone | First-person, warm, accessible, non-corporate |
| Main offer | Couples Budget Reset |
| Pilot price | £99 |
| Standard target price | £129–£149 |
| Follow-up offers | £35 monthly check-in, £89 three-month pack |
| Public contact email | `andy.steadyus@gmail.com` |
| Advice boundary | Coaching only; no regulated advice |

## Route map

The route map is small and should be preserved exactly at first during any rebuild.[5]

| Route | Component | Purpose |
| --- | --- | --- |
| `/` | `Home.tsx` | Public landing page |
| `/couples-budget-reset` | `BookingPage.tsx` | Intake and booking enquiry form |
| `/checkout` | `CheckoutPage.tsx` | Explanation of booking and payment process |
| `/admin/leads` | `AdminLeads.tsx` | Owner-only admin dashboard |

## Public funnel behavior

The homepage is a coaching-led landing page. It uses the shared content module in `client/src/lib/coachingOfferContent.ts` as the source of truth for offer copy, disclaimers, FAQs, testimonial placeholders, and the current corrected hero-supporting summary copy.[4] The homepage links users into the booking form and checkout/process page, and reinforces the offer, audience fit, disclaimer, testimonials placeholder, FAQ, and direct contact path.[6]

The booking page is the heart of the public conversion flow. It asks for the visitor’s first name, partner first name, email, location/timezone, main focus, suggested times, and optional notes. On submit, it calls `trpc.coaching.submitEnquiry.useMutation()`, shows success or error feedback, and reassures the user that Andy will manually review availability before taking payment.[7]

The checkout page is not a true payment checkout. It is better understood as a **process and reassurance page** that explains what the user is buying, how booking works, what the pilot pricing includes, and where the disclaimer boundaries sit. It supports the intentionally manual, low-pressure flow.[8]

## Backend behavior

The app uses a tRPC router as the main contract surface.[2] That router contains four important domains:

| Router area | Purpose | Persistence |
| --- | --- | --- |
| `auth` | Session lookup and logout | Session/cookie-based |
| `beta` | Legacy beta-signup flow from the planner era | Persisted to DB |
| `coaching` | Current coaching enquiry form | **Not persisted**, owner notification only |
| `planner` | Legacy planner calculations and plan save flow | Run + persisted saved plans |
| `admin` | Owner admin lead operations | Reads/writes DB |

A particularly important handover detail is that the current **coaching enquiry submission does not save the enquiry to the database**. Instead, it generates an enquiry ID, formats the enquiry content, and sends an owner notification using the built-in notification helper.[2] This means the public booking flow currently depends on owner alerts rather than durable enquiry storage.

> The current coaching flow is operationally viable for a lean side-hustle launch, but if a rebuild aims for robustness, the first structural improvement would be to persist coaching enquiries to a database table.

## Data model

The Drizzle schema defines three persisted tables: `users`, `betaLeads`, and `sharedPlans`.[3]

| Table | Purpose | Still relevant? |
| --- | --- | --- |
| `users` | Auth and role management | Yes |
| `betaLeads` | Legacy beta/planner lead capture and owner workflow | Yes, but more legacy/internal |
| `sharedPlans` | Saved outputs from the planner feature | Yes, legacy product logic still exists |

This means the repository still contains meaningful infrastructure from the earlier planner-led product version, even though the customer-facing site has pivoted toward coaching.

## Frontend content source of truth

The most important business-content file is `client/src/lib/coachingOfferContent.ts`.[4] It centralizes the offer name, pricing, summary copy, session descriptions, fit/not-for table, next steps, follow-up offers, placeholder testimonial language, FAQ content, and the regulated-advice disclaimer. Claude should edit this file first when changing public coaching copy, because the homepage, booking page, and checkout page all draw from it.[4] [6] [7] [8]

## Design and UX cues

The site uses a soft off-white, teal, sage, and warm-neutral palette expressed mostly through page-level Tailwind utility classes rather than a deep component token system.[6] [7] The visual style should remain calm and non-fintech-corporate. Rounded cards, subtle borders, muted greens, and dark-teal blocks are part of the current look and feel.

## Domains and deployment context

At the time of export, the active Manus domains reported for the project were:

| Domain | Status |
| --- | --- |
| `steadyus.manus.space` | Active |
| `pairwise-htrkkk4l.manus.space` | Active legacy Manus domain |

These are deployment facts from the working session context, not from the source files themselves.

## Practical rebuild order

If Claude is rebuilding or porting this repo elsewhere, the safest order is to restore the public website first, then the coaching enquiry behavior, then the admin/planner legacy features, and only after that consider structural cleanup.

| Priority | Rebuild item |
| --- | --- |
| 1 | Homepage, booking page, checkout page |
| 2 | Shared coaching content module |
| 3 | Coaching enquiry mutation and owner notifications |
| 4 | Auth/session basics |
| 5 | Admin leads dashboard |
| 6 | Legacy planner feature and saved-plan flow |

## References

[1]: ./steadyus-website-source/package.json "Website package manifest and stack"
[2]: ./steadyus-website-source/server/routers.ts "Main backend router and live feature contracts"
[3]: ./steadyus-website-source/drizzle/schema.ts "Database schema"
[4]: ./steadyus-website-source/client/src/lib/coachingOfferContent.ts "Current live offer, pricing, disclaimer, and FAQ copy"
[5]: ./steadyus-website-source/client/src/App.tsx "Current route map"
[6]: ./steadyus-website-source/client/src/pages/Home.tsx "Homepage layout and public coaching messaging"
[7]: ./steadyus-website-source/client/src/pages/BookingPage.tsx "Booking form and enquiry flow"
[8]: ./steadyus-website-source/client/src/pages/CheckoutPage.tsx "Checkout/process explanation page"
