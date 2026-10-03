# SixthStep

An opportunity and experience workspace for UK sixth-form students, built with Next.js, TypeScript and React. Ready to import into Vercel.

## Dependable application workspaces

Home prioritises up to four explained actions, choosing across applications before adding further urgent tasks. Application overview, requirements, tasks, questions, evidence, milestones and notes have distinct sections. Live answer limits, explicit evidence-review confirmation and changed/removed source warnings protect drafts; SixthStep never submits or silently rewrites an answer.

Applications, individual questions, experiences, evidence and opportunities have durable hash addresses, for example `/#saved/<id>/questions/<questionId>` and `/#reflect/<id>`. Refresh and browser back/forward preserve the selected workspace. These links identify browser-local records; another device needs the corresponding backup restored.

Calendar exports individual dates, selected date groups or every exact date as `.ics`. Approximate periods remain undated. Descriptions preserve provider links, checked dates and student-entered/suggested date labels. Stable event identifiers make repeated exports predictable; importing/updating duplicates remains the calendar application's responsibility. Export follows [RFC 5545](https://www.rfc-editor.org/info/rfc5545/) and does not establish calendar sync.

`WorkspaceStorage` in `lib/workspace-storage.ts` provides asynchronous load/save/replace/recovery/subscription operations. The local adapter retains the v2 schema and original v1 data, blocks automatic replacement of corrupt data, detects changes from another tab, and backs up the previous version before an explicit replacement. Web Locks coordinate writes where available. A future authenticated adapter can implement this interface; there is no unused database or cloud account requirement.

The catalogue lives in `data/catalogue/` with strict runtime and CI validation. Its review helpers identify stale, incomplete/conflicting and approaching dated records; proposed source changes remain pending confirmation. Run `npm run validate:catalogue` after editing records. All 53 existing records and their provenance are preserved.

Recommendations retain explicit profile/activity/feedback reasons and diversify exploration across providers and opportunity types. Evidence retrieval uses recorded skills, shared topics, career labels and experience type; every result explains its connection. Local aggregate funnel metrics are available under Profile without transmitting student data or assigning achievement scores.

Authenticated cloud sync, direct Google Calendar integration, external reminder delivery, automated provider monitoring and semantic embeddings are deliberately deferred. The storage, calendar and catalogue boundaries support those additions without making them dependencies of the current student workflow.

## What works

SixthStep supports the full student journey: **discover → evaluate → choose → apply → complete → reflect → build evidence → reuse evidence → explore next**.

- A source-linked collection of 53 entries: 33 named programmes/events and 20 clearly labelled directories. It spans employer insights, medical experiences, university outreach, summer schools, STEM, research, mentoring, apprenticeship insight, competitions and academic events.
- A quick editable profile: school year, optional age, subjects, interests and career direction, with optional format, time, travel and opportunity preferences.
- Explained recommendations using actual profile connections. Known age/year conflicts prevent recommendations; unknown criteria remain checks, with no invented match percentages.
- A home dashboard with next actions, overdue tasks, upcoming deadlines, applications awaiting a response, recent saves and experiences ready to reflect on.
- Decision filters, removable filter chips, deadline sorting and side-by-side comparison of 2–4 opportunities.
- Nine application stages, next actions and due dates, manual deadline corrections, priority, notes, outcomes, application links, checklists, and custom reminders.
- Link/text extraction into an editable review screen. Reviewed imports and manually entered opportunities become ordinary tracked records. Manual entry needs no keys.
- Classified live search that prioritises official sources and opportunity platforms, removes duplicates/unsafe links and detected articles or irrelevant pages, and labels all web results as unverified.
- Individual experience journals linked to completed opportunities, plus independent entries for volunteering, work, events and projects.
- An evidence bank containing the student's own actions, learning, supporting quotes and optional STAR structure, linked back to each experience.
- Editable AI reflections: summary, evidenced skills, STAR example, CV bullet, application example, interview talking point and follow-up actions.
- CSV/text exports, full JSON workspace backup and reviewed restoration, responsive navigation and keyboard-friendly dialogs.

Source checking confirms the facts reviewed at that date, not a student's eligibility or a guaranteed place. Directories are not placements. Web/imported details are not marked verified. Missing facts remain “Not stated”. Programme activities and skills are never automatically turned into personal achievements.

## Proactive planning and discovery

- **First use:** Home offers three short setup steps (year/subjects, broad interests/career areas, approximate location/format). Optional details can be skipped. Completing setup opens explained discovery immediately.
- **Scalable collection:** `opportunityCollection` combines curated sources, saved imports/manual records and live discoveries by stable ID. Distinct programmes sharing a provider URL remain distinct. Browse results render 18 entries per page; filter/search before paging. The checked collection currently has 53 entries, not thousands of invented placements. Provider directories expose many further routes without being counted as individual placements.
- **Feedback:** Interested, Maybe, Not for me, Already done something similar, Show me more like this and Show fewer like this are explicit persisted signals. More/fewer changes ordering for a shared sector/provider with an explanation. The two hide signals hide only that programme from the personalised feed. Recovery controls reset signals or show hidden collection results. Feedback never changes eligibility, submitted status or saved records.
- **Home:** “Do these next” shows up to four actions using shared rules: overdue tasks, near dates, interviews, incomplete confirmed preparation, openings and reflections. One action per application is chosen first, then remaining capacity is filled. The rest stays expandable. Newly saved possibilities get a suggested eligibility/programme-selection step without assuming an application has started.
- **Calendar:** Upcoming, Month and Timeline combine openings, deadlines, programme/interview dates, next actions, typed personal reminders and explicitly dated milestones. Approximate periods and undated items stay separate. Follow-up after 21 days and reflection after recorded completion are labelled suggestions, not provider commitments.
- **Reminders:** Snooze/change reminder date, dismiss, complete and recovery are stored by stable action identity. Original provider dates remain on Calendar; a snoozed reminder appears separately on its scheduled date. Completing a requirement or personal task updates that task explicitly; completing a deadline reminder never submits an application. The typed model is independent of delivery and can later feed calendar/email/browser adapters. This release uses in-app delivery only.
- **Development:** Experiences includes a Development timeline, filtered by theme/event. Actual saves, stage transitions, submissions, interview recording, completion, new action-backed skill examples, explicit interest changes and finished reflections are recorded at the mutation. Ordinary edits do not generate pretend achievements. Existing evidence keeps an unknown addition date; removed sources retain recorded history.
- **Pathways:** The Exploration Map links broad engineering, medicine/health, technology and science areas to possible directions, subject exploration and real related programmes. These are possibilities rather than career choices or admission advice.
- **Storage:** Version 2 is retained with additive Zod defaults for feedback, action states, activity, milestone dates and reflection completion. Old workspaces do not reset. JSON backups include these fields and reject duplicate identities. No account/cloud sync is required; data stays in this browser.

The 3 October 2026 catalogue extension uses primary pages from Bristol, Manchester, Cambridge/Isaac Science, Oxford, Imperial, Smallpeice, the Royal Institution, the British Science Association, NHS England, St John Ambulance, Royal Voluntary Service, Southampton, Airbus and the Raspberry Pi Foundation. Each entry embeds its provider URL. Mixed old/new cohort information and conflicting open/closed statements remain explicit; vague periods never become full dates.

Verification adds unit coverage for feedback, action ranking, opening dates, snoozing/dismissal/recovery, calendar provenance, development mutations, pathways, evidence ordering and migration. A 1,000-entry synthetic fixture checks collection identity and pagination, not the existence of those programmes. Browser journeys cover minimal setup through planning, Calendar navigation, persistent feedback/reminders, manual reflection to evidence, development/pathway exploration and narrow-screen recovery.

## Connected student workflows

Navigation follows student goals: **Home → Explore → Applications → Calendar → Experiences → Evidence → Profile**. Existing URL hashes remain compatible. Explore contains browsing, web search, reviewed link/text importing, manual entry and a shortlist.

- **Opportunity intelligence:** discovery collections for medicine, engineering/technology, science, outreach, summer schools, competitions, work experience, employer insight, subjects, local matches, virtual opportunities and recently added entries. Collections appear only with enough real data. Opening-soon countdowns require a distinct confirmed application opening date. New means added to the collection, not launched recently.
- **Explainable personalisation:** explicit career relationships connect medicine with clinical/biomedical areas and engineering with relevant science/design subjects. Exploring gives adjacent areas more weight; Targeting gives direct career connections more weight. Saved interests and experiences with a student-recorded increase in interest can contribute labelled reasons. Decreased interest and previous AI drafts do not supply positive reflection signals. These are connections, not eligibility guarantees or match percentages.
- **Shortlist:** Maybe, Interested, Shortlisted and Applying are separate from application outcome. New saves start Interested. Existing version 2 records default to Applying to preserve their established workspaces. When applications exist, Applications starts with the Applying filter; all saved interests remain accessible. Compare 2–4, inspect highlighted differences, save a shortlist and choose to apply.
- **Application Workspace:** add confirmed provider requirements, personal tasks and recorded milestones. Create individual application/interview questions, word or character limits, drafts, notes and completion states. Empty or over-limit drafts cannot be marked Ready/Submitted through the editor. Counts reflect actual recorded tasks, not an estimated percentage.
- **Evidence reuse:** application questions suggest only recorded personal actions using skills and shared topics. Inspect an example, append it to a draft or build a STAR scaffold. Missing STAR details stay explicit prompts. Evidence can also be sent to a selected application or interview question from the bank. Nothing auto-submits or replaces an existing answer.
- **Evidence provenance:** drafts retain source references. Copied text is a snapshot, so later source edits do not silently alter an answer. Deleted source evidence produces a review warning. Bank filters cover skill, experience, date, career area and recorded detail/STAR completeness; detail labels describe fields present, not achievement quality.
- **Reflection and exploration:** a five-prompt reflection guide captures actual actions, enjoyment, dislikes, challenges, learning, a specific skill example, career interest change and next steps. The Exploration Map groups areas using chosen labels or experience titles. It separately displays exact student notes, repeated wording across different entries, and suggestions from an explicit adjacent-area map. It does not choose a career or infer personal achievement from programme publicity.
- **Actionable Home:** four first-use steps, unfinished responses, outstanding references, deadline buckets (overdue/today/next 7/next 30 days), response waiting, reflection prompts and actual evidence/STAR counts. Alerts cover upcoming deadlines/interviews, overdue actions, confirmed outstanding references, long response waits, source staleness and manual date changes. Alerts update when the workspace is opened and are dismissible locally.

The version 2 storage contract gains additive Zod defaults; existing backups remain readable. Requirements, drafts, source references, intent, reflection interest and dismissed alerts are included in new backups. Duplicate question, requirement and evidence IDs are rejected on restore. The original v1 migration and invalid-storage preservation remain intact.

Application drafting, evidence matching, career relationships, the Exploration Map and alerts run locally and do not spend provider credits. AI reflection remains optional, editable and grounded through the existing validated API. No external email infrastructure or account sync is added.

## Using the workspace

1. Start with your year, subjects and interests; further preferences are optional.
2. Browse the collection and read the fit explanations and eligibility checks. Compare alternatives if helpful.
3. Save a programme, paste an external link/text, or use **Add myself**. Review extracted details before adding.
4. Choose an application stage, your next action, a date and any required documents. The dashboard brings these back when you return.
5. Mark an opportunity completed and open its journal entry. Metadata is carried across; your personal notes and skill evidence start blank.
6. Write what you actually did and learned. Add an evidence example yourself, or review AI wording before explicitly using a suggested example.
7. Save an edited reflection and export examples for future applications.

Reminders appear in the workspace when it is opened; they do not send email or background notifications. Nothing submits applications on the student's behalf.

Only confirmed full dates produce countdowns. Rolling, vague, missing-year and unknown deadlines do not. A personal deadline override can be corrected, cleared, or reset to the source date. Curated application-open information becomes unknown 45 days after its source check unless refreshed.

## Data migration and backup

Profiles, tracked applications, experiences, edited reflections and evidence live in versioned browser storage (`sixthstep-workspace-v2`). They do not sync between devices or require a database. The evidence bank derives from experience entries, so editing an example updates its source-linked bank item.

Existing v1 bookmarks and their Applied/Completed stages migrate automatically; Interested becomes Saved. Existing subjects/interests and journal notes are retained. Original v1 keys are kept for recovery. Invalid stored data is not overwritten: the app displays a recovery warning and changes remain temporary until a valid backup is restored.

Use **Profile → Export workspace backup** for a complete JSON copy. Restoration validates the schema and duplicate IDs, shows the record counts, and requires an explicit restore action before replacing this browser's workspace. CSV and text exports remain available for individual workflows. Original stored data can also be exported for recovery.

## Run locally

Use Node.js 22 or newer.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local`. Add keys only to `.env.local`; it is ignored by Git.

## Deploy to Vercel

1. Import this GitHub repository at [Vercel New Project](https://vercel.com/new).
2. Keep the repository root as the root directory and choose Next.js.
3. Add your chosen AI credentials under **Settings → Environment Variables**:
   - **Groq:** `GROQ_API_KEY` — [create a Groq key](https://console.groq.com/keys). Optional `GROQ_MODEL` defaults to `openai/gpt-oss-20b`.
   - **OpenAI-compatible provider:** `OPENAI_API_KEY`, `OPENAI_MODEL`, and `OPENAI_BASE_URL` (details below).
   - **Web search and link extraction:** `TAVILY_API_KEY` — [create a Tavily key](https://app.tavily.com).
4. Deploy. Redeploy after changing environment variables.

The site builds and runs without keys: discovery, matching, comparison, manual entry, applications, journals and manual evidence work. AI extraction/reflections need an AI provider; URL extraction and web search also need Tavily.

Do not use `NEXT_PUBLIC_` for API keys. Never commit secrets, Vercel credentials, `.env.local`, `.vercel` or student data. No database is required.

## Add any OpenAI-compatible API key

All AI features support providers implementing the OpenAI **Chat Completions** request/response format with Bearer authentication. Configure these server-side variables in Vercel, or in `.env.local` for local development:

| Variable | Value |
| --- | --- |
| `OPENAI_API_KEY` | Your chosen provider's API key |
| `OPENAI_BASE_URL` | Provider API base URL, including its version path; defaults to `https://api.openai.com/v1` if blank |
| `OPENAI_MODEL` | Exact model ID from your provider; required |
| `OPENAI_PROVIDER_NAME` | Optional public label shown to students |
| `OPENAI_JSON_MODE` | `true` by default; set `false` if the provider rejects `response_format` |
| `OPENAI_TOKEN_PARAMETER` | `max_completion_tokens` by default; set `max_tokens` for providers requiring that field |

The app appends `/chat/completions` to the base URL; a full URL ending in `/chat/completions` is also accepted. URLs must use public HTTPS without embedded credentials, query parameters or fragments. Redirects are rejected to protect the key. Azure-style endpoints requiring a different authentication header or query parameters, and Responses-only providers, need a separate adapter.

If any of `OPENAI_API_KEY`, `OPENAI_BASE_URL` or `OPENAI_MODEL` is supplied, generic configuration takes priority over Groq. Incomplete configuration produces a setup error; it never silently sends text to another provider. Clear these three variables to return to Groq.

No generic temperature is sent, for compatibility with reasoning models. JSON mode can be disabled, but every response is still parsed and validated against the app's schema. Plain or fenced JSON is accepted. See the official [Chat Completions reference](https://developers.openai.com/api/reference/resources/chat) and [JSON mode guide](https://developers.openai.com/api/docs/guides/structured-outputs).

Settings show the public provider label and configuration state only. Keys, models and endpoints are never returned by the status API. “Configured” means settings are complete, not that a live request has succeeded.

Free usage depends on the chosen provider and model. An OpenAI-compatible key does not imply a free plan. Existing Groq free-tier configuration remains supported. There is no automatic paid fallback.

## Free tiers and age requirements

Groq offers a rate-limited free API tier. Tavily offers 1,000 free API credits/month without a credit card; operations have different credit costs. Allowances and models can change: check [Groq limits](https://console.groq.com/docs/rate-limits) and [Tavily pricing](https://www.tavily.com/pricing).

The developer account must be managed by an adult. Review Groq's [services agreement](https://console.groq.com/docs/legal/services-agreement), selected model terms, and Tavily's terms before launching to students.

Choose free plans and keep paid billing disabled to avoid paid fallback. Hosting is separate; check the Vercel plan that fits your use.

## Data and request handling

Profile matching runs locally. Saving opportunities, editing applications and adding manual evidence make no AI requests.

AI extraction sends only the submitted public opportunity text to the configured provider. URL extraction sends the public URL to Tavily. Web search sends the submitted query, selected town/region, age, format and sector to Tavily; it does not send the whole profile, saved applications or journal.

AI reflection sends the selected experience's notes and metadata, not other experiences or the student's profile. Previous AI reflection text is excluded. Metadata such as a programme title does not count as evidence. Every generated skill must contain a supporting quote found in the student's own evidence fields; unsupported quotes cause a validation error. These checks do not prove every AI interpretation is correct: students must review and edit all reusable wording.

Review that provider's data handling and age requirements before enabling it for students. Avoid private or identifying details in AI submissions. Edited reflections are saved locally only when the student chooses **Save edited reflection**; suggested skill examples enter the evidence bank only through **Use this evidence**.

Provider keys stay server-side. Zod validates inputs and structured outputs. Request sizes, processing times and origins are bounded/checked. URLs must be public HTTPS; unsafe addresses are rejected. The app never fetches arbitrary opportunity URLs directly: Tavily handles extraction. Supplied content is treated as untrusted data, and provider responses are rendered as text rather than HTML.

Search results are cached for one hour in the running instance. The legacy URL-summary endpoint retains its one-hour public-content cache. New reviewed imports and experience reflections return `no-store`; personal notes are not server-cached. Instance caches reset on restart.

The default limiter is **per running server instance**, not a global monthly cap. Optional `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` provide shared atomic limits across Vercel instances. Summary/import routes share 8 requests per hashed IP per minute; searches and reflection routes have 5. Hashes expire after a minute. Configured Redis failures fail closed. Provider quotas still apply.

## Verification

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

API tests use mocked upstream responses; no paid calls or keys are required. The suite includes 55 unit/API tests and 20 browser scenarios. Browser tests cover onboarding and recommendations, shortlist decisions, application requirements/questions, real evidence suggestions and reuse, guided reflection and exploration, deadline alerts, review/import/manual entry, stages, migrations and recovery, mocked AI responses, exports, narrow-width navigation and missing-key errors. GitHub Actions runs these checks.

## Source collection

Public provider pages checked on 2 October 2026:
- [Springpod virtual work experience](https://www.springpod.com/virtual-work-experience)
- [Springpod programme search](https://www.springpod.com/virtual-work-experience/search)
- [Leonardo's Springpod experience](https://www.leonardo.springpod.com/experiences/virtual-work-experience-with-leonardo)
- [Forage job simulations](https://www.theforage.com/simulations)

Directories link to the provider for current programme-specific requirements. Forage job simulations are learning activities, not employment.

## Project structure

- `components/sixthstep.tsx`: navigation shell; `workspace-context.tsx`: shared workspace state.
- `components/dashboard.tsx`, `explore.tsx`, `finder.tsx`, `opportunity.tsx`, `importer.tsx`, `shortlist.tsx`, `tracker.tsx`: discovery and application views.
- `components/application-workspace.tsx`, `reuse-evidence.tsx`: question preparation and source-linked evidence reuse.
- `components/journal.tsx`, `reflection-guide.tsx`, `exploration-map.tsx`, `evidence.tsx`, `profile.tsx`: reflection, exploration, evidence and preferences.
- `lib/careers.ts`, `intelligence.ts`: transparent career relationships, evidence relevance, deadline context and alert rules.
- `lib/domain.ts`: validated opportunity/profile/application/experience models and deadline/action/evidence helpers.
- `lib/recommendations.ts`: transparent matching, decision filters and discovery sections.
- `lib/persistence.ts`: v1 migration and JSON backup validation.
- `lib/extraction.ts`, `search-quality.ts`, `grounding.ts`: source-date checks, search classification and student-evidence checks.
- `lib/catalogue.ts`: source-backed catalogue. Update the check date only after reviewing its sources.
- `app/api/opportunity`, `experience-reflection`: integrated review/reflection APIs. Existing summary/reflection endpoints remain compatible.
- `lib/ai.ts`, `providers.ts`, `security.ts`: provider compatibility, extraction, safe URLs and rate limiting.
- `tests` and `e2e`: unit/API and full student-journey browser checks.

## Full source index

Each record also retains its source URLs and check date in the catalogue. A programme may be closed or awaiting its next application cycle.

- [Find your place in engineering](https://www.springpod.com/virtual-work-experience/search) — Springpod
- [Inside the world of Leonardo](https://www.leonardo.springpod.com/experiences/virtual-work-experience-with-leonardo) — Leonardo · Springpod
- [Try a career in technology](https://www.theforage.com/simulations) — Forage
- [Explore a future in healthcare](https://www.springpod.com/virtual-work-experience/search) — Springpod
- [Step into business & finance](https://www.theforage.com/simulations) — Forage
- [See what a legal career looks like](https://www.theforage.com/simulations) — Forage
- [Discover the creative industries](https://www.springpod.com/virtual-work-experience/search) — Springpod
- [Discover technology work experience](https://www.springpod.com/virtual-work-experience/search) — Springpod
- [STEM SMART](https://www.undergraduate.study.cam.ac.uk/find-out-more/widening-participation/stem-smart) — University of Cambridge
- [UNIQ residential and application support](https://www.uniq.ox.ac.uk/) — University of Oxford
- [Apply: Cambridge](https://www.undergraduate.study.cam.ac.uk/find-out-more/widening-participation/apply-cambridge) — University of Cambridge
- [In2STEM summer placements](https://in2scienceuk.org/our-programmes/in2stem/apply/) — In2scienceUK
- [Observe GP](https://www.rcgp.org.uk/observegp) — Royal College of General Practitioners
- [BSMS Virtual Work Experience](https://www.bsms.ac.uk/about/info-for-schools-teachers-parents/outreach-activity-and-resources-for-all.aspx) — Brighton and Sussex Medical School
- [Year 12 Sutton Trust Summer School](https://www.imperial.ac.uk/be-inspired/schools-outreach/secondary-schools/summer-schools/sutton-trust/) — Imperial College London
- [Nuffield Research Placements](https://www.stem.org.uk/sites/default/files/pages/downloads/Guide-for-Student-Applicants_Nuffield-Research-Placements.pdf) — STEM Learning
- [Diamond school work experience week](https://www.diamond.ac.uk/Careers/Students/Schools-Work-Experience.html) — Diamond Light Source
- [STFC laboratory work experience](https://www.ukri.org/who-we-are/stfc/work-for-stfc/work-experience/) — Science and Technology Facilities Council
- [Pathways to Law Online](https://applicationsupport.suttontrust.com/support/solutions/articles/203000055882-what-does-the-pathways-online-programme-consist-of-) — Sutton Trust
- [Pathways to Banking & Finance Online](https://applicationsupport.suttontrust.com/support/solutions/articles/203000055882-what-does-the-pathways-online-programme-consist-of-) — Sutton Trust
- [Pathways to Engineering Online](https://applicationsupport.suttontrust.com/support/solutions/articles/203000060277-is-there-an-online-option-for-pathways-to-engineering-) — Sutton Trust
- [Pathways to Banking & Finance at LSE](https://pathwaysprogrammes.suttontrust.com/career-pathways/banking-finance/pathways-to-banking-finance-at-london-school-of-economics) — Sutton Trust · London School of Economics
- [Access Apprenticeships](https://applicationsupport.suttontrust.com/support/solutions/articles/203000057376-what-does-the-access-apprenticeships-programme-consist-of-) — Sutton Trust
- [UK Chemistry Olympiad 2027](https://edu.rsc.org/enrichment/uk-chemistry-olympiad) — Royal Society of Chemistry
- [British Biology Olympiad 2027](https://ukbiologycompetitions.org/british-biology-olympiad/) — UK Biology Competitions
- [Senior Mathematical Challenge](https://ukmt.org.uk/senior-challenges) — UK Mathematics Trust
- [Senior Team Mathematical Challenge](https://ukmt.org.uk/team-challenges/senior-team-mathematical-challenge) — UK Mathematics Trust
- [Beamline for Schools](https://beamlineforschools.cern/) — CERN · DESY · University of Bonn
- [Gresham free public lectures](https://www.gresham.ac.uk/) — Gresham College
- [What History is NOT — public lecture](https://www.gresham.ac.uk/watch-now/series/royal-historical-society-lecture) — Gresham College · Royal Historical Society
- [Career Shapers: Inspiring Women](https://www.deloitte.com/uk/en/careers/early-careers/early-careers-programmes.html) — Deloitte
- [Career Shapers: Inspiring Black Talent](https://www.deloitte.com/uk/en/careers/early-careers/early-careers-programmes.html) — Deloitte
- [AI Futures Challenge 2027](https://www.nulondon.ac.uk/study/ai-futures/ai-futures-faq/) — Northeastern University London
