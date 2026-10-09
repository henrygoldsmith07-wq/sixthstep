import { test } from "node:test";
import assert from "node:assert/strict";
import { safePublicUrl, sameOrigin } from "../lib/security";
import { filterOpportunities } from "../lib/filter";
import { catalogue } from "../lib/catalogue";
const filters={query:"",sector:"All sectors",format:"All formats",freeOnly:false,age:"",verifiedAge:false};
test("private, numeric, credentialled, and non-HTTPS URL inputs are rejected",()=>{
 for(const url of ["http://example.com","https://127.0.0.1","https://2130706433","https://[::1]","https://user:pass@example.com","https://localhost","https://x.local","https://app.internal","https://example.com:8443"])assert.throws(()=>safePublicUrl(url),url);
 assert.equal(safePublicUrl("https://www.springpod.com/virtual-work-experience"),"https://www.springpod.com/virtual-work-experience");
});
test("cross-origin paid API requests are rejected",()=>{
 assert.throws(()=>sameOrigin(new Request("https://sixthstep.example/api/search",{headers:{origin:"https://other.example"}})));
 assert.doesNotThrow(()=>sameOrigin(new Request("https://sixthstep.example/api/search",{headers:{origin:"https://sixthstep.example"}})));
});
test("unknown ages are never silently claimed eligible",()=>{
 // The premise is asserted rather than assumed: the day a catalogue edit gives record 0 an age
 // band, this test would otherwise pass while exercising nothing.
 const unknown={...catalogue[0],id:"unknown-age",minAge:undefined,maxAge:undefined};
 assert.equal(unknown.minAge,undefined);
 const known={...unknown,id:"eligible",minAge:16,maxAge:17};
 assert.equal(filterOpportunities([unknown,known],{...filters,age:"16"}).length,2);
 assert.deepEqual(filterOpportunities([unknown,known],{...filters,age:"16",verifiedAge:true}).map(v=>v.id),["eligible"]);
 assert.equal(filterOpportunities([known],{...filters,age:"18"}).length,0);
});
test("keyword, sector, free and format filters compose",()=>{
 const results=filterOpportunities(catalogue,{...filters,sector:"Technology",freeOnly:true,query:"cybersecurity"});
 assert.equal(results.length,1); assert.equal(results[0].provider,"Forage");
 assert.equal(filterOpportunities(catalogue.slice(0,8),{...filters,format:"In person"}).length,0);
 assert.equal(filterOpportunities(catalogue,{...filters,sector:"Law",format:"Job simulations"}).length,1);
});

import { csvCell } from "../lib/csv";
test("CSV exports neutralise spreadsheet formulas",()=>{ assert.ok(csvCell("=IMPORTDATA(1)").startsWith('"'+String.fromCharCode(39))); assert.equal(csvCell('a "quote"'), '"a ""quote"""'); });
test("CSV exports also neutralise formulas hidden behind leading whitespace",()=>{
 // The production exports used a second escaper that only checked the first character, so a
 // provider name or note beginning " =..." was written straight into the spreadsheet live.
 for(const payload of [" =SUM(A1)","\t=SUM(A1)","\r=SUM(A1)"," +1"," -1"," @SUM(A1)"])
  assert.ok(csvCell(payload).startsWith('"'+String.fromCharCode(39)),"not neutralised: "+JSON.stringify(payload));
 // Ordinary prose and negative-looking notes must not be needlessly prefixed.
 assert.equal(csvCell("Engineering insight"),'"Engineering insight"');
});
