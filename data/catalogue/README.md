# Catalogue ownership
Programme and directory records are structured JSON, validated by Zod on import in development, build and tests. index.json keeps stable ordering and must list each ID exactly once.
Keep stable IDs when editing a record. Retain source URLs, original check/added dates, unconfirmed fields and every useful eligibility detail. A directory is not a programme.
Only record an exact date when the provider actually states one. Review contradictory or older-cycle information; keep approximate periods and unknown fields explicit. A page change is a proposal for human review, never automatic verification.
Run npm run validate:catalogue for review counts. catalogueReview identifies stale/incomplete records and approaching dates. proposeSourceReview records differences without mutating the accepted catalogue.

## The location field

location feeds search and the map in Explore, so write it the way the provider does. Name the town ("Bristol"), the places the provider actually runs in ("London and Leeds; online workshops and events"), or say plainly that it does not ("Your school or college", "Across the UK", "Not stated"). SixthStep matches the words and plots a pin only where a real town is named, so a record that never names one stays in the list instead of being guessed onto the map. Do not add a town to make a record plottable.
