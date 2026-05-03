# SteadyUs Claude Handover Package

This package is designed to let you move the **SteadyUs** project into GitHub and then hand it to Claude with enough context to rebuild or continue both the website and the presentation materials. The website source is available in packaged form. The presentation source projects are **not** present in the current sandbox after reset, so this package includes reconstruction briefs for those decks rather than the original slide-project folders.

| Item | What it contains | How to use it |
| --- | --- | --- |
| `CLAUDE_PASTE_READY_HANDOVER.md` | Paste-ready briefing for Claude | Paste this first into Claude alongside the repo/files |
| `WEBSITE_REBUILD_NOTES.md` | Technical and product explanation of the live site | Use when Claude needs architecture and business context |
| `PRESENTATIONS_REBUILD.md` | Reconstruction brief for the missing slide decks | Use to recreate the PowerPoint decks in Claude; this is documentation, not original slide source |
| `steadyus-website-source.zip` | Filtered website source export | Put this into GitHub or unpack locally |
| `steadyus-website-source/` | Unzipped copy of the same source | Read directly if you do not want to unzip |

The current website is a **React + Vite + Express + tRPC + Drizzle** project with a public coaching funnel, a legacy planner, and an owner admin area.[1] [2] [3] The live public coaching offer is the **Couples Budget Reset**, positioned as a two-session financial coaching package for couples at a **£99 pilot price**, with follow-up offers at **£35** and **£89**.[4] The current public routes are the homepage, booking page, checkout/process page, and owner admin leads page.[5]

The package also notes an important limitation. The slide project folders previously referenced in the working history are **missing after sandbox reset**, so there is no original slide project state or HTML slide source to include in this export. If you see slide names in the package, those are references inside the handover documentation rather than the original slide files themselves. What is included instead is a careful reconstruction brief based on the preserved task context and the known slide/project names from earlier work.

## Recommended migration path

The easiest path is to put `steadyus-website-source/` into a new GitHub repository, commit the Markdown handover files alongside it, and then give Claude the repository plus `CLAUDE_PASTE_READY_HANDOVER.md`. That gives Claude both the real codebase and the high-context narrative needed to continue work without reverse-engineering the business from scratch.

## References

[1]: ./steadyus-website-source/package.json "Website package manifest and stack"
[2]: ./steadyus-website-source/server/routers.ts "Main backend router and live feature contracts"
[3]: ./steadyus-website-source/drizzle/schema.ts "Database schema"
[4]: ./steadyus-website-source/client/src/lib/coachingOfferContent.ts "Current live offer, pricing, disclaimer, and FAQ copy"
[5]: ./steadyus-website-source/client/src/App.tsx "Current route map"
