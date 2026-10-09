import { test } from "node:test";
import assert from "node:assert/strict";
import { LocalWorkspaceStorage } from "../lib/workspace-storage";
import { loadWorkspace, storageKey } from "../lib/persistence";
import { emptyData, createRecord, enrich, type AppData } from "../lib/domain";

function memory(entries: Record<string, string> = {}) {
  const map = new Map(Object.entries(entries));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
  };
}

const withRecord = (): AppData => {
  const data = structuredClone(emptyData);
  data.records = [createRecord(enrich({ id: "one", title: "Example", provider: "Provider", description: "An example opportunity." }))];
  data.records[0].notes = "my real work";
  return data;
};

test("two tabs writing only local metrics do not manufacture a conflict", async () => {
  // Both tabs stamp metrics.startedAt on a fresh workspace. Because the byte comparison
  // included metrics, tab B was blocked from saving for good and everything it held stayed in
  // memory only, with no way out except dismissing the banner.
  const backend = memory();
  const tabA = new LocalWorkspaceStorage(backend), tabB = new LocalWorkspaceStorage(backend);
  await tabA.load();await tabB.load();

  const a = structuredClone(emptyData);
  a.metrics.startedAt = "2026-10-05T09:00:00.000Z";
  a.metrics.views = 3;
  assert.equal((await tabA.save(a)).status, "saved");

  // Tab B's only difference is its own metric stamp. No student work differs.
  const b = structuredClone(emptyData);
  b.metrics.startedAt = "2026-10-05T09:00:03.000Z";
  b.metrics.views = 9;
  assert.equal((await tabB.save(b)).status, "saved");
  assert.equal(JSON.parse(backend.getItem(storageKey)!).metrics.views, 9);

  // Real disagreement must still conflict, or the fix would have weakened the protection.
  // A fresh pair, because tab A has now been legitimately overtaken by tab B.
  const other = memory();
  const left = new LocalWorkspaceStorage(other), right = new LocalWorkspaceStorage(other);
  await left.load();await right.load();
  assert.equal((await left.save(withRecord())).status, "saved");
  const theirs = structuredClone(emptyData);
  theirs.profile.year = "S6";
  assert.equal((await right.save(theirs)).status, "conflict");
});

test("a long v1 journal keeps every character and says it was split", () => {
  // The old migration sliced at fixed character offsets and discarded everything past 7000,
  // so a returning student silently lost a third of their own writing.
  const text = "abcdefghij".repeat(2000); // 20,000 characters
  const result = loadWorkspace(memory({ "sixthstep-journal-v1": JSON.stringify(text) }));

  assert.ok(result.data.experiences.length > 1, "the journal was not split into further entries");
  const restored = result.data.experiences.map(e => e.whatDid + e.learned).join("");
  assert.equal(restored.length, text.length, "characters were lost in migration");
  assert.equal(restored, text, "the characters that survived were not the original ones");
  assert.match(result.error, /split into \d+ entries/);
  assert.doesNotMatch(result.error, /could not be loaded/);
});

test("a v1 journal that fits one entry reports no warning at all", () => {
  const result = loadWorkspace(memory({ "sixthstep-journal-v1": JSON.stringify("I shadowed a nurse for a morning.") }));
  assert.equal(result.error, "");
  assert.equal(result.data.experiences.length, 1);
  assert.equal(result.data.experiences[0].whatDid, "I shadowed a nurse for a morning.");
  assert.equal(result.migrated, true);
});

test("both a bookmarks failure and a profile failure are reported, not just the first", () => {
  const result = loadWorkspace(memory({ "sixthstep-saved-v1": "{not json", "sixthstep-profile-v1": "{not json" }));
  assert.match(result.error, /saved opportunities/);
  assert.match(result.error, /profile/);
});

test("a quota-blocked save fails loudly and stays blocked rather than pretending to persist", async () => {
 const base = memory();
 const backend = { ...base, setItem: () => { throw new DOMException("quota", "QuotaExceededError"); } };
 const adapter = new LocalWorkspaceStorage(backend);
 await adapter.load();
 await assert.rejects(() => adapter.save(withRecord()), /quota/);
 assert.equal(backend.getItem(storageKey), null, "the failed write must not half-persist");
});

test("corrupt stored bytes block saving, surface a recovery error, and are never overwritten", async () => {
 const backend = memory({ [storageKey]: "{corrupt bytes" });
 const adapter = new LocalWorkspaceStorage(backend);
 const loaded = await adapter.load();
 assert.ok(loaded.error, "corruption must be reported");
 await assert.rejects(() => adapter.save(withRecord()), /Restore/);
 assert.equal(backend.getItem(storageKey), "{corrupt bytes", "the unreadable original must be retained, not clobbered");
});

test("duplicate IDs in stored v2 data make the normal load path fail, as restore already does", () => {
 const valid = JSON.stringify(withRecord());
 const duplicate = JSON.parse(valid);
 duplicate.records.push(duplicate.records[0]);
 const loaded = loadWorkspace(memory({ [storageKey]: JSON.stringify(duplicate) }));
 assert.ok(loaded.error, "stored duplicates must block the workspace instead of loading mangled data");
});

test("loading never writes to storage", () => {
  const backend = memory();
  const result = loadWorkspace(backend);
  assert.equal(result.migrated, false);
  assert.equal(backend.getItem(storageKey), null);
});