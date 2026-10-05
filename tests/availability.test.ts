import { test } from "node:test";
import assert from "node:assert/strict";
import { availability, enrich } from "../lib/domain";
import { reviewGrade } from "../lib/catalogue-validation";
import { catalogue } from "../lib/catalogue";

const today = "2026-10-05";
const op = (over: Record<string, unknown>) => enrich({ id: "x", title: "x", provider: "P", sector: "Engineering", source: "catalogue", sourceKind: "Programme", location: "Bristol", format: "In person", checkedAt: "2026-10-04", ...over }) as never;

test("verified dates settle availability when the provider never says whether it is open", () => {
  // Opens in the future: it cannot be open yet, whatever the stored state claims.
  assert.equal(availability(op({ applicationState: "Unknown", openingDate: "2026-12-01" }), today), "Not yet open");
  // The window spans today, so it is open.
  assert.equal(availability(op({ applicationState: "Unknown", openingDate: "2026-09-01", deadlineDate: "2027-06-02" }), today), "Open");
  // A deadline in the past still wins over anything stored.
  assert.equal(availability(op({ applicationState: "Open", deadlineDate: "2026-01-12" }), today), "Closed");
});

test("availability never invents an open application from an undated record", () => {
  assert.equal(availability(op({ applicationState: "Unknown", deadlineDate: "2027-06-02" }), today), "Unknown");
  assert.equal(availability(op({ applicationState: "Unknown" }), today), "Unknown");
  assert.equal(availability(op({ applicationState: "Rolling" }), today), "Rolling");
  // An opening date in the past and a deadline we cannot see is still not proof of being open.
  assert.equal(availability(op({ applicationState: "Unknown", openingDate: "2026-01-01" }), today), "Unknown");
});

test("a source we have not re-checked is not turned into a known state by dates", () => {
  assert.equal(availability(op({ source: "web", applicationState: "Open", openingDate: "2026-09-01", deadlineDate: "2027-06-02" }), today), "Unknown");
  assert.equal(availability(op({ checkedAt: "2025-01-01", applicationState: "Open", openingDate: "2026-09-01", deadlineDate: "2027-06-02" }), today), "Unknown");
});

test("the review queue grades a stated caveat apart from something that needs fixing", () => {
  // A caveat already shown to the student is a note, not a defect.
  assert.equal(reviewGrade(op({ applicationState: "Open", unconfirmed: ["The provider does not state a cost"] }), today), "Note");
  assert.equal(reviewGrade(op({ applicationState: "Open" }), today), "Note");
  // A contradiction, an impossible window and a stale source need a human.
  assert.equal(reviewGrade(op({ applicationState: "Open", unconfirmed: ["The page contradicts itself"] }), today), "Conflict");
  assert.equal(reviewGrade(op({ applicationState: "Open", openingDate: "2027-06-02", deadlineDate: "2026-12-01" }), today), "Conflict");
  assert.equal(reviewGrade(op({ applicationState: "Open", checkedAt: "2025-01-01" }), today), "Conflict");
  // An unknown application state needs checking but is not a contradiction.
  assert.equal(reviewGrade(op({ applicationState: "Unknown" }), today), "Check");
});

test("the graded queue ranks the whole catalogue, so a big catalogue stays readable", () => {
  const graded = catalogue.map(item => reviewGrade(item, today));
  assert.equal(graded.length, catalogue.length);
  assert.ok(!graded.includes(undefined as never));
  // Contradictions must stay a short list a maintainer can actually work through.
  const conflicts = graded.filter(g => g === "Conflict").length;
  assert.ok(conflicts <= 2, `${conflicts} conflicts is too many to review`);
  // Records that only carry a caveat already shown to the student must fall out of the worklist.
  const caveated = catalogue.filter(i => i.unconfirmed.length);
  assert.ok(caveated.some(i => reviewGrade(i, today) === "Note"), "a stated caveat should not force a record into the worklist");
  // "Check" is dominated by providers that never publish whether they are open, which is honest.
  assert.ok(graded.every(g => g === "Conflict" || g === "Check" || g === "Note"));
});