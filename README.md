# SixthStep

A work experience finder and AI summariser for UK sixth-form students, built with Next.js, TypeScript and React. Ready to import into Vercel.

## What works

- Curated, source-linked provider collection with sector, keyword, format, cost and eligibility filters.
- Personalised ordering based on selected career interests.
- Live web search with Tavily, when configured.
- Opportunity summaries from pasted text with Groq; HTTPS links are extracted through Tavily.
- Saved opportunities with Interested / Applied / Completed status and CSV export.
- Experience journal, truthful AI reflections and text exports.
- Responsive navigation, keyboard-friendly dialogs and accessible input labels.

Provider directories are explicitly labelled. Search results are not claimed to be active placements or verified suitable for a student's age. Missing facts are shown as “Not stated”. There are no fabricated deadlines or placements.

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
2. Keep the root directory as the repository root and choose Next.js. Defaults are `npm run build` and Next.js output.
3. Add the following variables under **Settings → Environment Variables**:
   - `GROQ_API_KEY` — [create a Groq key](https://console.groq.com/keys).
   - `TAVILY_API_KEY` — [create a Tavily key](https://app.tavily.com).
   - Optional `GROQ_MODEL`, default `openai/gpt-oss-20b`.
4. Deploy. When keys are added later, redeploy so the server functions receive them.

The site builds and runs without API keys: the collection, filters, bookmarks and notes work; AI and web search show setup information. A URL summary needs both keys. Pasted-text summaries and reflections need only Groq.

Do not use `NEXT_PUBLIC_` for API keys. Never commit secrets, Vercel credentials, `.env.local`, `.vercel` or student data. No database is required.

## Free tiers and age requirements

Groq offers a rate-limited free API tier. Tavily offers 1,000 free API credits/month without a credit card; operations have different credit costs. Allowances and models can change: check [Groq limits](https://console.groq.com/docs/rate-limits) and [Tavily pricing](https://www.tavily.com/pricing).

The developer account must be managed by an adult. Review Groq's [services agreement](https://console.groq.com/docs/legal/services-agreement), selected model terms, and Tavily's terms before launching to students. Gemini is not used because its API terms exclude apps directed at or likely to be used by under-18s.

Choose free plans and keep paid billing disabled to avoid paid fallback. Hosting is separate; check the Vercel plan that fits your use.

## Data and request handling

Bookmarks, interests and reflection notes are saved in this browser's localStorage. They do not sync between devices. Students can export CSV/text copies. AI outputs remain in the current page until exported. Private details should not be submitted.

AI requests send the submitted text to Groq. URL extraction sends the public URL to Tavily. Web search sends selected query, town/region, age and sector to Tavily. The site does not send the student's saved profile or bookmarks automatically.

Provider keys are server-side. JSON input is validated with Zod, request sizes and processing time are bounded, origins are checked, and model output is validated before rendering. The server never fetches arbitrary user URLs directly: Tavily handles extraction. HTML and instructions in supplied text are not trusted.

Search results and public URL summaries are cached for one hour in the running server instance; pasted text and reflection notes are not cached. This cache is best-effort and resets when an instance restarts.

The default limiter is **per running server instance**, not a global monthly cap. For shared rate limits across Vercel instances, configure optional `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from an Upstash Redis database. Atomic counters limit each hashed IP to 8 summaries or 5 searches/reflections per minute. Hashes expire after a minute. Limits fail closed when the configured Redis service is unavailable. Provider free quotas still apply.

## Verification

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

API tests use mocked upstream responses; no paid calls or keys are required. Browser tests cover saving/reloading opportunities, statuses, modals, mocked AI responses, exports, mobile navigation and missing-key errors. GitHub Actions runs these checks.

## Source collection

Public provider pages checked on 2 October 2026:
- [Springpod virtual work experience](https://www.springpod.com/virtual-work-experience)
- [Springpod programme search](https://www.springpod.com/virtual-work-experience/search)
- [Leonardo's Springpod experience](https://www.leonardo.springpod.com/experiences/virtual-work-experience-with-leonardo)
- [Forage job simulations](https://www.theforage.com/simulations)

Directories link to the provider for current programme-specific requirements. Forage job simulations are learning activities, not employment.

## Project structure

`app/api` contains server endpoints. `components/sixthstep.tsx` contains the student interface. `lib/catalogue.ts` contains provider entries; update the source-check date only after reviewing the source. `lib/security.ts` handles validation and rate limiting. `tests` and `e2e` contain automated verification.
