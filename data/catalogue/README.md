# Catalogue ownership
Programme and directory records are structured JSON, validated by Zod on import in development, build and tests. index.json keeps stable ordering and must list each ID exactly once.
Keep stable IDs when editing a record. Retain source URLs, original check/added dates, unconfirmed fields and every useful eligibility detail. A directory is not a programme.
Only record an exact date when the provider actually states one. Review contradictory or older-cycle information; keep approximate periods and unknown fields explicit. A page change is a proposal for human review, never automatic verification.
Run npm run validate:catalogue for review counts. catalogueReview identifies stale/incomplete records and approaching dates. proposeSourceReview records differences without mutating the accepted catalogue.
