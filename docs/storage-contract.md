# Workspace storage contract

`useWorkspaceStorage` is the UI boundary. Components mutate validated `AppData` through the workspace context; only `browserWorkspaceStorage` accesses browser storage. Choose an adapter once per mounted workspace, before hydration. Do not change adapters while unsaved edits exist.

`WorkspaceStorage` in `lib/workspace-storage.ts` is asynchronous:

- `load` returns migrated v2 data and any recovery error. Preserve original v1 keys and corrupt v2 bytes. A failed load blocks autosave.
- `save` validates the full snapshot and atomically compares the loaded baseline with the current revision. Return a conflict rather than overwriting another revision. Repeated identical saves are idempotent.
- `replace` is the user's explicit replacement after review. Preserve the previous version first; if preserving it fails, do not replace anything.
- `recovery` exports retained original data, without requiring a successful parse.
- `subscribe` signals external changes to student-authored content, including deletion. Metrics-only writes never signal. Return a cleanup function. A notification blocks saving until the user chooses a version.

The local adapter stores the existing v2 JSON format and retains v1 migration behaviour. Web Locks coordinate compare/write transactions across tabs where supported; the baseline comparison also detects conflicts. Browsers without Web Locks cannot guarantee an atomic simultaneous write across tabs. Export backups regularly.

A future authenticated adapter must associate revisions with a verified user, use server-side compare-and-swap (ETag/revision token), preserve replacement history, enforce schema and request limits, and handle offline/expired-session errors without discarding local edits. It must not automatically merge drafts, evidence references, dates or application states. Show an explicit conflict choice and keep both revisions exportable. Secrets and credentials must stay outside `AppData` and backups.

Domain schema changes need additive defaults or a versioned migration before persistence. The storage adapter owns revision metadata; application logic must not depend on it. Existing migration, quota, corruption and two-tab tests are the compatibility contract for any adapter. Cloud sync is deliberately deferred; this document does not imply cross-device access exists today.
