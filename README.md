# SixthStep

An opportunity and experience workspace for UK sixth-form students, built with Next.js, TypeScript and React. Ready to import into Vercel.

## What works

SixthStep supports the full student journey: **discover → understand → match → save → apply → complete → reflect → reuse evidence**.

- A source-linked collection of 33 entries: 24 named programmes/events and 9 clearly labelled directories. It spans employer insights, medical experiences, university outreach, summer schools, STEM, research, mentoring, apprenticeship insight, competitions and academic events.
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

Use **My profile & settings → Export workspace backup** for a complete JSON copy. Restoration validates the schema and duplicate IDs, shows the record counts, and requires an explicit restore action before replacing this browser's workspace. CSV and text exports remain available for individual workflows. Original stored data can also be exported for recovery.

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

API tests use mocked upstream responses; no paid calls or keys are required. Browser tests cover the profile-to-evidence journey, review/import/manual entry, actions and stages, comparisons, migrations and recovery, mocked AI responses, exports, mobile navigation and missing-key errors. GitHub Actions runs these checks.

## Source collection

Public provider pages checked on 2 October 2026:
- [Springpod virtual work experience](https://www.springpod.com/virtual-work-experience)
- [Springpod programme search](https://www.springpod.com/virtual-work-experience/search)
- [Leonardo's Springpod experience](https://www.leonardo.springpod.com/experiences/virtual-work-experience-with-leonardo)
- [Forage job simulations](https://www.theforage.com/simulations)

Directories link to the provider for current programme-specific requirements. Forage job simulations are learning activities, not employment.

## Project structure

- `components/sixthstep.tsx`: navigation shell; `workspace-context.tsx`: shared workspace state.
- `components/dashboard.tsx`, `finder.tsx`, `opportunity.tsx`, `importer.tsx`, `tracker.tsx`, `journal.tsx`, `evidence.tsx`, `profile.tsx`: focused product features.
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
