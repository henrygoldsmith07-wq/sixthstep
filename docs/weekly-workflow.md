# Weekly product pass

| Page | Primary job | Primary action | Secondary controls |
| --- | --- | --- | --- |
| Home | Decide what matters now | Open the next application task | Two-week date preview, bounded checks, existing summaries folded below |
| Explore | Find a worthwhile possibility | Search and view details | Filters, collections, feedback and external discovery disclosed on demand |
| Applications | Move one application forward | Open a workspace / prepare the next action | Interest and priority, notes, milestones and exports remain available |
| Calendar | Check the actual plan | Choose the relevant date/view | Exact-date exports and approximate/undated items stay separate |
| Experiences | Capture personal learning | Record four core prompts and save reflection | Guided reflection, deeper prompts, evidence editor and optional AI |
| Evidence | Reuse a real personal example | Use for application | Interview preparation, individual export and links; source stays directly accessible |
| Profile | Improve discovery preferences | Save interests and subjects | More preferences, provider setup and local metrics; backup/restore remains easy to find |

Persisted intentions and application stages are unchanged. UI labels translate `Preparing application` to Applying and `Applied` to Submitted; the stored values and dates remain intact. An interest is a decision about pursuing an opportunity, while stage describes a recorded action. Stage changes never submit an application or complete requirements. A personal reminder's completion remains separate from application/experience completion.

Home's upcoming preview uses recorded exact dates from saved work. Attention groups actual recorded issues by opportunity and links directly to the workspace; it does not declare an opportunity invalid or predict an outcome. Source-check dates and student overrides retain their labels.

Explore shows one paginated result list by default. Collections render only while expanded. Explicit negative feedback persists, and diversification changes feed order without changing eligibility. Concise reasons show the student's subject/interest connections; full reasoning and eligibility checks remain in the detail dialog. A comparison shows one scanned fit summary above each column, the time left against each deadline, and how much recorded evidence already sits behind each option — or that nothing is recorded there yet.

## Recorded pathway

Evidence readiness additionally reports where the student has actually recorded work, and names the career areas they declared an interest in that hold nothing recorded yet. Both derive from experiences and evidence only. An empty area is reported as empty; it is never filled from a programme's advertised activities.

Recommendations may add two further explanations: that an opportunity builds on experiences already recorded in a related area, and that an area of declared interest holds no recorded example yet. Neither changes eligibility, and neither appears for an area the student did not ask about.

## Planning from the student's own date

Most providers state no exact closing date, so a countdown alone leaves a student with nothing to plan against. Each application therefore carries an optional **plan date**: the student's own intention, distinct from the provider's deadline and from a manual deadline correction. The plan resolves in a fixed order — plan date, then manual deadline correction, then provider deadline, then none.

From that target SixthStep counts backwards across recorded outstanding work: outstanding references first (longest lead time), then draft responses, remaining requirements and checklist tasks. Each step's date is the student's own working date and is labelled as such; a step whose date would already have passed is shown against today rather than left in the past. The plan states remaining items beside remaining days and stops there. It does not predict success, and where a plan date falls after the provider's recorded deadline it says so, because the provider's date is the one that decides.

A plan only becomes a Home action when more preparation is recorded than the days remaining, and never when the student has already written their own next action.

The API body limit is enforced during streaming. Tavily errors and malformed successes have actionable messages. Duplicate searches share bounded in-flight work; both the TTL cache and local rate buckets are bounded. Changed client searches abort outstanding work and cannot be overwritten by obsolete results. No API keys enter local data or backups.

Automated axe WCAG A/AA checks cover all seven pages at 360px and the opportunity dialog, alongside targeted keyboard, focus, conflict, restore, evidence and mobile scenarios. These checks are useful regression gates; they do not replace testing with students or assistive-technology users. The core flows are also visually reviewed at narrow widths.

Cloud sync, notification delivery, Google Calendar sync and embeddings remain deferred. Local backups are still necessary across devices. Search caches and request coalescing are per server process; distributed rate limits require the existing Upstash configuration. Catalogue review tooling reports records for human confirmation and never automatically trusts a changed page.
