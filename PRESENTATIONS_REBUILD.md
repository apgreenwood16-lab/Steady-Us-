# SteadyUs Presentation Reconstruction Brief

## Important note about the presentation source

The original slide project folders referenced during the working history are **not present** in the current sandbox export. Specifically, the previously referenced directories `couples_budget_slide`, `financial_coaching_package_slides`, and `financial_coaching_prospect_deck` are missing after the sandbox reset that occurred before this handover package was assembled. That means this export cannot include the original HTML slide projects or their slide-state files.

Because of that, this document is written as a **reconstruction brief** for Claude. Its purpose is to preserve what those decks were for, what they were supposed to say, and how they related to the SteadyUs coaching offer. If you can see deck names or slide filenames in this package, they are documentary references captured from project history, not recovered slide source files.

## Known presentation projects from project history

| Project / deck name | Known purpose | Known file evidence from project history |
| --- | --- | --- |
| `couples_budget_slide` | Offer summary slide for the Couples Budget Reset | `offer_summary.html` previously existed |
| `financial_coaching_package_slides` | Main package / positioning deck for the coaching offer | `experience.html`, `why_you.html` previously existed |
| `financial_coaching_prospect_deck` | Shorter downloadable prospect deck | `session_two.html` previously existed |

The file names above come from preserved task history rather than currently available source files. In other words, this package documents those filenames, but does not contain the original corresponding slide HTML or slide-project directories.

## Deck 1: Couples Budget Reset offer summary

This appears to have been the tightest and most immediately usable sales-support deck. One known file description says that `offer_summary.html` summarized the offer, pricing, what clients get, session breakdown, optional follow-ups, and best-fit description, and that it was optimized to fit within a 720px slide height.

### Rebuild objective

Recreate a concise, highly readable summary deck or one-page slide that a prospect could scan quickly.

### Required content

| Section | Content to include |
| --- | --- |
| Offer name | Couples Budget Reset |
| Main price | £99 pilot price |
| Standard future price | £129–£149 |
| Core structure | Two sessions |
| Session 1 | 60-minute kick-off / money clarity / pressure points |
| Between sessions | Simple preparation prompts |
| Session 2 | 60–75 minute review / shared action plan |
| Follow-up | Written summary after the sessions |
| Optional extras | £35 monthly check-in, £89 three-month pack |
| Best fit | Couples who are doing okay on paper but feel disorganised, stretched, or stuck |
| Not for | Regulated financial advice, debt counselling, therapy, legal disputes |

### Tone guidance

The deck should sound practical, calm, and human. It should not sound like a fintech startup pitch deck. It should sound like a thoughtful service explanation from an individual coach.

## Deck 2: Financial coaching package slides

This appears to have been the fuller, polished package deck used to explain the offer and Andy’s positioning in more depth. The presence of files called `experience.html` and `why_you.html` suggests the deck likely covered both the client experience and why this offer matters.

### Rebuild objective

Recreate a small deck that explains the coaching offer clearly enough for a prospect, referral partner, or early conversation.

### Suggested slide structure

## Cover
SteadyUs  
Couples Budget Reset  
Practical money clarity for couples

## Slide 1
**A calmer way to sort money together**  
- For couples who want clarity without shame or jargon  
- Built for real-life pressure, not perfect spreadsheets  
- Focused on practical next steps

## Slide 2
**What the package includes**  
- Two live coaching sessions  
- Between-session preparation  
- Written reset summary  
- Optional follow-up support

## Slide 3
**Session 1: Money clarity**  
- Map the current money picture  
- Surface pressure points  
- Identify where friction is coming from

## Slide 4
**Session 2: Shared action plan**  
- Turn discussion into practical priorities  
- Agree realistic habits and next steps  
- Leave with a plan you can actually follow

## Slide 5
**Why this is different**  
- Personal and first-person, not corporate  
- Coaching and organisation, not regulated advice  
- Built for couples who are sensible but still feel stuck

## Slide 6
**Who it is for**  
- Busy professionals  
- Couples juggling savings, debt, or home goals  
- Partners who keep meaning to sort money out together

## Slide 7
**Price and next steps**  
- £99 pilot price  
- Standard price expected to rise to £129–£149  
- Start with a short enquiry form and suggested times

## Deck 3: Short prospect deck

This appears to have been a compressed, downloadable version used with prospects. The project history mentions that it was intentionally shorter and that page 2 and page 4 had visual repair work done earlier. A known file called `session_two.html` suggests one slide focused specifically on the second session.

### Rebuild objective

Create a short 4-slide deck that a prospect could receive before or after an enquiry.

### Suggested structure

## Cover
SteadyUs  
Couples Budget Reset  
A calm, practical financial coaching package for couples

## Slide 1
**Money can feel clearer quickly**  
- Two focused sessions  
- Personal support  
- Practical next steps

## Slide 2
**What happens in session one**  
- Map the money picture  
- Surface tension and confusion  
- Clarify what matters most now

## Slide 3
**What happens in session two**  
- Agree priorities together  
- Build a realistic shared action plan  
- Leave with concrete next steps

## Slide 4
**Pilot price and fit**  
- £99 pilot price  
- Best for couples who feel capable but disorganised  
- Not regulated financial advice

## Visual and tone guidance for all decks

| Attribute | Recommendation |
| --- | --- |
| Tone | Warm, practical, calm, first-person where appropriate |
| Audience | Couples considering financial coaching |
| Geography | UK-first wording and pricing |
| Avoid | Corporate pitch language, app-product language, regulated-advice language |
| Palette direction | Deep teal, sage, warm off-white, muted terracotta accents |
| Typography feel | Clear, readable, personal rather than flashy |
| Density | Light enough to present, not to read as a report |

## Relationship to the website

All deck language should remain consistent with the website source-of-truth content in `client/src/lib/coachingOfferContent.ts`, especially on pricing, scope boundaries, session structure, and tone.[1]

## Reference

[1]: ./steadyus-website-source/client/src/lib/coachingOfferContent.ts "Current live offer, pricing, disclaimer, and FAQ copy"
