import { test } from "node:test";
import assert from "node:assert/strict";
import { shiftDate } from "../lib/domain-dates";

test("date shifting returns an empty date for invalid input or non-finite offsets",()=>{
 assert.equal(shiftDate("2026-10-03",Number.NaN),"");
 assert.equal(shiftDate("2026-10-03",Number.POSITIVE_INFINITY),"");
 assert.equal(shiftDate("2026-02-30",1),"");
});

test("date shifting preserves calendar-day arithmetic across leap day",()=>{
 assert.equal(shiftDate("2028-02-28",1),"2028-02-29");
 assert.equal(shiftDate("2028-02-29",1),"2028-03-01");
 assert.equal(shiftDate("2028-03-01",-1),"2028-02-29");
});
