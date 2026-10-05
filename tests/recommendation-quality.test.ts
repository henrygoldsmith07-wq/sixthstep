import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultProfile, enrich, experienceSchema, todayISO, type RichOpportunity } from "../lib/domain";
import { shiftDate } from "../lib/domain-dates";
import { matchOpportunity, recommendations } from "../lib/recommendations";
import { hasGroundedQuotes } from "../lib/grounding";

const at = (over: Record<string, unknown> = {}) => enrich({
  id: "item", title: "An engineering insight programme", provider: "Example University", sector: "Engineering",
  source: "catalogue", sourceKind: "Programme", location: "Bristol", format: "In person", category: "Summer school",
  description: "Engineering subject taster for sixth-form students.", checkedAt: todayISO().slice(0, 10),
  ...over,
}) as RichOpportunity;

const profile = { ...defaultProfile, configured: true, age: "17", year: "Year 12", subjects: ["Maths"], interests: ["Engineering"], careerInterests: "Medicine", location: "Bristol" };

test("function words are not a connection", () => {
  // "and" used to match almost anything, so this career sentence claimed a match with
  // programmes that have nothing to do with law.
  const wish = { ...profile, careerInterests: "I would like to study law and become a lawyer", interests: [] };
  const unrelated = at({ sector: "Creative & media", description: "A poetry and photography workshop for sixth-formers." });
  const match = matchOpportunity(unrelated, wish);
  assert.ok(!match.reasons.includes("Relates to the career you want to explore"), match.reasons.join("; "));
  const related = at({ sector: "Law", description: "An introduction to law, advocacy and the courts." });
  assert.ok(matchOpportunity(related, wish).reasons.includes("Relates to the career you want to explore"));
});

test("a single meaningful word is still a connection", () => {
  const medicine = at({ sector: "Healthcare", description: "A medicine placement in a hospital ward." });
  assert.ok(matchOpportunity(medicine, profile).reasons.includes("Relates to the career you want to explore"));
});

test("urgency is a check, not a reason to rank higher", () => {
  // Dates are derived from today so the assertion never depends on a frozen wall clock.
  const imminent = at({ deadlineDate: shiftDate(todayISO(), 2) }), later = at({ deadlineDate: shiftDate(todayISO(), 20) }), undated = at({});
  const rush = matchOpportunity(imminent, profile);
  assert.ok(rush.checks.some(c => /very little time to apply/.test(c)), rush.checks.join("; "));
  assert.ok(!rush.reasons.some(r => /close in/.test(r)), rush.reasons.join("; "));
  // A deadline with room to act earns a mild boost above an undated opportunity.
  assert.ok(matchOpportunity(later, profile).rank > matchOpportunity(undated, profile).rank);
});

test("an opportunity that has not opened yet is never recommended silently", () => {
  const soon = at({ openingDate: shiftDate(todayISO(), 30) });
  const match = matchOpportunity(soon, profile);
  assert.ok(match.checks.some(c => /have not opened yet/.test(c)), match.checks.join("; "));
  // Still eligible: it is a real opportunity, just not an open one today.
  assert.equal(match.eligible, true);
});

test("a place claim is never made from a token shared with unrelated towns", () => {
  // "Bath and Bristol" shares the token "and" with a record listing many other cities.
  // The record must not claim a place the student named, because it names none of them.
  const elsewhere = at({ location: "London, Birmingham, Sheffield, Kent and Medway; also online UK-wide", format: "Hybrid" });
  const match = matchOpportunity(elsewhere, { ...profile, location: "Bath and Bristol", travel: "Not sure" });
  assert.ok(!match.reasons.includes("In the place you named"), match.reasons.join("; "));
  assert.ok(!match.reasons.includes("In your preferred area"), match.reasons.join("; "));
  // A record that does name one of the student's places may still say so honestly.
  const local = at({ location: "London, Birmingham, Bristol; also online UK-wide", format: "Hybrid" });
  assert.ok(matchOpportunity(local, { ...profile, location: "Bath and Bristol", travel: "Not sure" }).reasons.includes("In the place you named"));
});

test("a Scottish or Northern Irish year is checked, never silently excluded", () => {
  const programme = at({ years: ["Year 12", "Year 13"] });
  const scottish = matchOpportunity(programme, { ...profile, year: "S5" });
  assert.equal(scottish.eligible, true);
  assert.ok(scottish.checks.some(c => /regional naming differs/.test(c)), scottish.checks.join("; "));
  // The same convention genuinely missing is still a conflict, because that one is real.
  assert.equal(matchOpportunity(at({ years: ["Year 12"] }), { ...profile, year: "Year 13" }).eligible, false);
});

test("recommendations do not present unclassified records as deliberate curation", () => {
  const unclassified = at({ id: "unclassified", sector: "Explore careers", title: "University outreach taster", category: "University outreach", description: "A general university outreach session." });
  const listed = recommendations([unclassified], profile);
  assert.ok(!listed.some(v => v.item.id === "unclassified"), "an unclassified record was recommended as a considered match");
});

test("grounding rejects a reflection that claims evidence and contains none", () => {
  const experience = experienceSchema.parse({ id: "e", name: "Design work", date: "2026-09-01", whatDid: "I built and tested a small prototype.", updatedAt: "2026-10-04" });
  assert.equal(hasGroundedQuotes({ skills: [] } as never, experience), false);
  const invented = { skills: [{ id: "s", skill: "Problem solving", whatHappened: "", action: "", learning: "", evidenceQuote: "a quote the student never wrote" }] } as never;
  assert.equal(hasGroundedQuotes(invented, experience), false);
  const real = { skills: [{ id: "s", skill: "Problem solving", whatHappened: "", action: "", learning: "", evidenceQuote: "built and tested a small prototype" }] } as never;
  assert.equal(hasGroundedQuotes(real, experience), true);
});