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

Explore shows one paginated result list by default. Collections render only while expanded. Explicit negative feedback persists, and diversification changes feed order without changing eligibility. Concise reasons show the student's subject/interest connections; full reasoning and eligibility checks remain in the detail dialog.

The API body limit is enforced during streaming. Tavily errors and malformed successes have actionable messages. Duplicate searches share bounded in-flight work; both the TTL cache and local rate buckets are bounded. Changed client searches abort outstanding work and cannot be overwritten by obsolete results. No API keys enter local data or backups.

Automated axe WCAG A/AA checks cover all seven pages at 360px and the opportunity dialog, alongside targeted keyboard, focus, conflict, restore, evidence and mobile scenarios. These checks are useful regression gates; they do not replace testing with students or assistive-technology users. The core flows are also visually reviewed at narrow widths.

Cloud sync, notification delivery, Google Calendar sync and embeddings remain deferred. Local backups are still necessary across devices. Search caches and request coalescing are per server process; distributed rate limits require the existing Upstash configuration. Catalogue review tooling reports records for human confirmation and never automatically trusts a changed page.
