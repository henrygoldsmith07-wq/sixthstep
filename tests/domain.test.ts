import { test } from "node:test";
import assert from "node:assert/strict";
import { catalogue } from "../lib/catalogue";
import { appSchema, opportunitySchema, enrich, defaultProfile, createRecord, recordDeadline, daysUntil, deadlineLabel, todayISO, availability, nextSteps, experienceFromRecord, experienceSchema, evidenceBank, richReflectionSchema } from "../lib/domain";
import { discover, defaultFilters, matchOpportunity, recommendations, discoverySections } from "../lib/recommendations";
import { loadWorkspace, storageKey, backupJSON, restoreWorkspace } from "../lib/persistence";
import { explicitDate, confirmedDate, confirmedAge } from "../lib/extraction";
import { processSearchResults, classifySearch } from "../lib/search-quality";
import { hasGroundedQuotes } from "../lib/grounding";
const programme=enrich({id:"test",title:"Engineering design insight",provider:"University",sector:"Engineering",source:"catalogue",sourceKind:"Programme",category:"Employer insight",format:"Virtual",location:"Virtual",subjects:["Mathematics","Physics"],years:["Year 12"],minAge:16,maxAge:18,cost:"Free",duration:"2 days",durationBand:"1–3 days",description:"Design and explain a sustainable engineering solution.",tags:["design"],checkedAt:todayISO(),applicationState:"Open"});
const profile={...defaultProfile,configured:true,age:"17",subjects:["Maths","Physics"],interests:["Engineering"],careerInterests:"design engineer",outsideInterests:"sustainable design",preferredTypes:["Employer insight"] as typeof defaultProfile.preferredTypes,format:"Virtual" as const,duration:"1–3 days"};
test("catalogue contains validated specific programmes across multiple categories with safe source provenance",()=>{
 assert.ok(catalogue.length>=30);
 assert.ok(catalogue.filter(i=>i.sourceKind==="Programme").length>=20);
 assert.ok(new Set(catalogue.map(i=>i.category)).size>=10);
 assert.equal(new Set(catalogue.map(i=>i.id)).size,catalogue.length);
 for(const item of catalogue){assert.ok(opportunitySchema.safeParse(item).success,item.id);assert.equal(item.source,"catalogue");assert.ok(item.sourceUrls.length);assert.match(item.checkedAt,/^\d{4}-\d{2}-\d{2}$/);for(const url of item.sourceUrls)assert.ok(url.startsWith("https://"));if(item.sourceKind==="Directory")assert.equal(item.category,"Provider directory");}
});
test("matching explains subject, sector, age, year and actual preferences without a made-up percentage",()=>{
 const match=matchOpportunity(programme,profile);
 assert.ok(match.eligible);assert.ok(match.reasons.some(r=>r.includes("Maths")));assert.ok(match.reasons.some(r=>r.includes("published band")));assert.ok(match.reasons.some(r=>r.includes("outside school")));
 assert.ok(match.reasons.some(r=>r.includes("time commitment")));assert.ok(match.reasons.some(r=>r.includes("virtual")));assert.ok(match.reasons.every(r=>!r.includes("%")));
 assert.equal(recommendations([programme],profile).length,1);assert.equal(recommendations([programme],profile,["test"]).length,0);
});
test("unknown eligibility produces checks, and known age or year conflicts prevent recommendation",()=>{
 const unknown=enrich({...programme,minAge:undefined,maxAge:undefined,years:[]});
 assert.ok(matchOpportunity(unknown,profile).checks.some(r=>r.includes("Age")));
 assert.ok(matchOpportunity(unknown,profile).checks.some(r=>r.includes("School year")));
 assert.equal(recommendations([enrich({...programme,minAge:18})],profile).length,0);
 assert.equal(recommendations([enrich({...programme,years:["Year 13"]})],profile).length,0);
 assert.equal(recommendations([enrich({...programme,sourceKind:"Directory",category:"Provider directory"})],profile).length,0);
});
test("filters compose real decisions and exclude unknown published eligibility",()=>{
 const unknown=enrich({...programme,id:"unknown",minAge:undefined,maxAge:undefined,years:[]});
 const f={...defaultFilters,sector:"Engineering",age:"17",year:"Year 12",subject:"Physics",free:true,open:true,verified:true,format:"Virtual",duration:"1–3 days",location:"Bristol"};
 assert.deepEqual(discover([programme,unknown],f).map(i=>i.id),["test"]);
 assert.equal(discover([programme],{...f,provider:"Another"}).length,0);
 assert.equal(discover([programme],{...f,category:"Competition"}).length,0);
 const deadline=enrich({...programme,deadlineDate:"2026-10-08",checkedAt:"2026-10-02"});
 assert.equal(discover([deadline],{...defaultFilters,deadline:"Next 7 days"},"2026-10-03").length,1);
 assert.equal(discover([deadline],{...defaultFilters,deadline:"Deadline passed"},"2026-10-09").length,1);
 assert.equal(discover([programme],{...defaultFilters,deadline:"Next 30 days"},"2026-10-03").length,0);
  // "Next 30 days" must also keep the records it is meant to keep, not only drop the undated one.
  assert.equal(discover([deadline],{...defaultFilters,deadline:"Next 30 days"},"2026-10-03").length,1);
  // "Deadline passed" had only ever been exercised in the keeping direction.
  assert.equal(discover([deadline],{...defaultFilters,deadline:"Deadline passed"},"2026-10-03").length,0);
  assert.equal(discover([deadline],{...defaultFilters,deadline:"Deadline passed"},"2026-10-09").length,1);
  // "No fixed deadline" had no test at all.
  assert.equal(discover([deadline],{...defaultFilters,deadline:"No fixed deadline"},"2026-10-03").length,0);
  assert.equal(discover([programme],{...defaultFilters,deadline:"No fixed deadline"},"2026-10-03").length,1);
});
test("countdowns require real full dates and respect the student's UK calendar day",()=>{
 assert.equal(daysUntil("rolling","2026-10-03"),null);assert.equal(daysUntil("2026-02-30","2026-10-03"),null);
 assert.equal(deadlineLabel("","Varies","2026-10-03"),"Varies");assert.equal(deadlineLabel("2026-10-03","","2026-10-03"),"Closes today");
 assert.equal(deadlineLabel("2026-10-04","","2026-10-03"),"1 day remaining");assert.match(deadlineLabel("2026-10-02","","2026-10-03"),/Deadline passed/);
 assert.equal(todayISO(new Date("2026-07-01T23:30:00Z")),"2026-07-02");assert.equal(todayISO(new Date("2026-12-01T23:30:00Z")),"2026-12-01");
 assert.equal(daysUntil("2028-02-29","2028-02-28"),1);
});
test("application availability expires and passed deadlines cannot look open",()=>{
 const item=enrich({...programme,checkedAt:"2026-10-02",deadlineDate:"2026-10-31"});
 assert.equal(availability(item,"2026-10-03"),"Open");assert.equal(availability(item,"2026-11-01"),"Closed");
 assert.equal(availability(enrich({...item,deadlineDate:""}),"2026-12-01"),"Unknown");
 assert.equal(availability(enrich({...item,source:"web"}),"2026-10-03"),"Unknown");
});
test("manual deadlines, actions, reminders and completion produce useful ordered next steps",()=>{
 const a=createRecord(enrich({...programme,deadlineDate:"2026-10-08"}));a.nextAction="Ask for a reference";a.nextActionDate="2026-10-02";a.priority="High";
 a.reminders=[{id:"r",label:"Prepare questions",date:"2026-10-06",done:false,kind:"Personal"},{id:"done",label:"Already done",date:"2026-10-01",done:true,kind:"Personal"}];
 assert.equal(recordDeadline(a),"2026-10-08");a.deadlineOverride=true;a.deadlineDate="";assert.equal(recordDeadline(a),"");
 a.deadlineDate="2026-10-09";
 const steps=nextSteps([a],[],"2026-10-03");assert.equal(steps[0].title,"Ask for a reference");assert.equal(steps[0].overdue,true);assert.equal(steps.length,3);
 a.status="Applied";assert.ok(nextSteps([a],[],"2026-10-03").every(s=>s.kind!=="deadline"));
 a.status="Completed";const complete=nextSteps([a],[],"2026-10-03");assert.equal(complete.length,1);assert.equal(complete[0].kind,"reflection");
 const entry=experienceFromRecord(a);assert.equal(entry.whatDid,"");assert.equal(entry.skills.length,0);assert.equal(entry.name,a.opportunity.title);
 entry.whatDid="I compared the two designs.";assert.equal(nextSteps([a],[entry],"2026-10-03").length,0);
 a.status="Not pursuing";assert.equal(nextSteps([a],[],"2026-10-03").length,0);
});
test("evidence bank requires personal action, retains source and optional STAR, and follows edits",()=>{
 const entry=experienceSchema.parse({id:"one",name:"Design challenge",updatedAt:"2026-10-03",skills:[{id:"s",skill:"Problem solving",whatHappened:"Two options",action:"I compared costs.",learning:"Trade-offs matter.",star:{situation:"Two designs",task:"Choose",action:"Compared",result:"Chose one"}},{id:"empty",skill:"Leadership",whatHappened:"",action:"",learning:""}]});
 const bank=evidenceBank([entry]);assert.equal(bank.length,1);assert.equal(bank[0].experienceId,"one");assert.equal(bank[0].star?.action,"Compared");
 entry.skills[0].action="I tested a third option.";assert.equal(evidenceBank([entry])[0].action,entry.skills[0].action);assert.equal(evidenceBank([]).length,0);
});
test("v1 bookmarks, stages, subjects and original notes migrate without deleting old storage",()=>{
 const values=new Map<string,string>([["sixthstep-saved-v1",JSON.stringify([{...catalogue[0],status:"Interested",savedAt:"2026-10-01"},{...catalogue[1],status:"Applied"},{...catalogue[2],status:"Completed"}])],["sixthstep-profile-v1",JSON.stringify({year:"Year 13",subjects:"Maths, Physics",interests:["Engineering"]})],["sixthstep-journal-v1",JSON.stringify("I compared two engineering designs and learned how to explain my decision.")]]);
 const result=loadWorkspace({getItem:key=>values.get(key)||null});assert.equal(result.error,"");assert.equal(result.migrated,true);assert.deepEqual(result.data.records.map(r=>r.status),["Saved","Applied","Completed"]);
 assert.deepEqual(result.data.profile.subjects,["Maths","Physics"]);assert.match(result.data.experiences[0].whatDid,/compared two/);assert.equal(values.size,3);assert.equal(values.has(storageKey),false);
});
test("invalid saved data is preserved and backups reject duplicate IDs and malformed values",()=>{
 const original="{broken";const result=loadWorkspace({getItem:key=>key===storageKey?original:null});assert.match(result.error,/could not be loaded/);assert.equal(result.data.records.length,0);
 const valid=appSchema.parse({version:2,profile:defaultProfile,records:[createRecord(programme)],experiences:[]});assert.deepEqual(restoreWorkspace(backupJSON(valid)),valid);
 assert.throws(()=>restoreWorkspace(JSON.stringify({...valid,records:[valid.records[0],valid.records[0]]})),/duplicate/);
 assert.throws(()=>restoreWorkspace(JSON.stringify({...valid,version:3})),/not a valid/);
});
test("date and age extraction accept quoted facts and reject inferred years or unsupported numbers",()=>{
 assert.equal(explicitDate("Apply by 31st October 2026"),"2026-10-31");assert.equal(explicitDate("Apply by 31 October"),"");
 assert.equal(explicitDate("Apply by 31 February 2026"),"");assert.equal(explicitDate("Apply by 10/11/26"),"");
 const source="Applications close 31 October 2026. For students aged 16–18 in Year 12.";
 assert.equal(confirmedDate("2026-10-31","Applications close 31 October 2026",source),"2026-10-31");
 assert.equal(confirmedDate("2027-10-31","Applications close 31 October 2026",source),"");
 assert.equal(confirmedAge("students aged 16–18",source,16,18),true);assert.equal(confirmedAge("students aged 16–18",source,15,18),false);
 assert.equal(confirmedAge("Year 12",source,12,null),false);
});
test("live search ranks programme sources, removes articles/unsafe/duplicate results, and flags uncertainty",()=>{
 const raw=[{title:"Generic shopping",url:"https://shop.example/shoes",content:"Buy shoes"},{title:"Top 10 work experience tips",url:"https://blog.example/blog/tips",content:"Advice"},{title:"Physics summer school",url:"https://example.ac.uk/summer-school",content:"Year 12 students. Applications close 31 October 2026. Entirely virtual."},{title:"Provider programmes",url:"https://www.springpod.com/programmes",content:"Browse opportunities"},{title:"Physics summer school duplicate",url:"https://example.ac.uk/summer-school"},{title:"Careers",url:"https://employer.example/careers",content:"Student jobs"},{title:"Unsafe programme",url:"https://127.0.0.1"}];
 const result=processSearchResults(raw,"Science & research");assert.equal(result.results.length,2);assert.equal(result.discarded,5);
 assert.equal(result.results[0].authority,"Official provider");assert.equal(result.results[0].resultKind,"Specific opportunity");assert.equal(result.results[0].deadlineDate,"2026-10-31");assert.equal(result.results[0].source,"web");assert.equal(result.results[0].applicationState,"Unknown");assert.equal(result.results[0].checkedAt,"");
 assert.equal(classifySearch("Student work experience","https://evil.ac.uk.example/programme","student").authority,"Other source");
});
test("AI skill quotes must come from student evidence, not programme metadata",()=>{
 const e=experienceSchema.parse({id:"e",name:"I led a team of ten",whatDid:"I compared two design options and explained my choice.",updatedAt:""});
 const reflection=richReflectionSchema.parse({summary:"I compared designs.",skills:[{skill:"Problem solving",evidenceQuote:"I compared two design options",whatHappened:"Two options",action:"Compared",learning:"Trade-offs"}],star:{situation:"",task:"",action:"",result:""},cvBullet:"Compared designs.",applicationExample:"Compared designs.",interviewTalkingPoint:"Compared designs.",nextSteps:[]});
 assert.equal(hasGroundedQuotes(reflection,e),true);reflection.skills[0].evidenceQuote="I led a team of ten";assert.equal(hasGroundedQuotes(reflection,e),false);
});
test("discovery sections need enough real entries and new labels use added date, not check date",()=>{
 assert.equal(discoverySections([programme],profile,[]).length,0);
 const second=enrich({...programme,id:"two"});const sections=discoverySections([programme,second],profile,[]);
 assert.ok(sections.some(s=>s.title==="Recommended for you"));assert.ok(!sections.some(s=>s.title==="New opportunities"));
});

test("future plans alone cannot count as completed skill evidence",()=>{
 const e=experienceSchema.parse({id:"future",name:"Programme",nextStep:"I will lead a team of students and organise an event next month.",updatedAt:""});
 const reflection=richReflectionSchema.parse({summary:"",skills:[{skill:"Leadership",evidenceQuote:"I will lead a team of students",whatHappened:"",action:"",learning:""}],star:{situation:"",task:"",action:"",result:""},cvBullet:"",applicationExample:"",interviewTalkingPoint:"",nextSteps:[]});
 assert.equal(hasGroundedQuotes(reflection,e),false);
});

test("priority breaks action-date ties in High, Normal, Low order",()=>{
 const records=["Low","High","Normal"].map((priority,i)=>({...createRecord(enrich({...programme,id:"priority-"+i})),priority,nextAction:"My action",nextActionDate:"2026-10-05"}));
 const actions=nextSteps(records as Parameters<typeof nextSteps>[0],[],"2026-10-03").filter(s=>s.title==="My action");
 assert.deepEqual(actions.map(s=>s.priority),["High","Normal","Low"]);
});
test("specific platform programmes rank ahead of official directories",()=>{
 const specific=classifySearch("Engineering work experience","https://www.springpod.com/engineering","student");
 const directory=classifySearch("Browse all programmes","https://example.ac.uk/programmes","student programmes");
 assert.ok(specific.rank>directory.rank);
});
