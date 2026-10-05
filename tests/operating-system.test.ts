import { test } from "node:test";
import assert from "node:assert/strict";
import { appSchema, emptyData, enrich, createRecord, experienceSchema, evidenceBank } from "../lib/domain";
import { feedbackSchema } from "../lib/workspace-events";
import { matchOpportunity, recommendations, discoverySections } from "../lib/recommendations";
import { priorityActions, actionableItems, calendarItems, workspaceItems, recordEvents, experienceEvents, developmentTimeline } from "../lib/operating-system";
import { opportunityCollection, opportunityPage, sourceFreshness, sourceFacts } from "../lib/opportunity-repository";
import { restoreWorkspace, backupJSON, loadWorkspace } from "../lib/persistence";
import { pathwayOpportunities } from "../lib/pathways";
import { suggestEvidence } from "../lib/intelligence";
const day="2026-10-03";
const programme=enrich({id:"engineering",title:"Engineering design insight",provider:"Example University",sector:"Engineering",subjects:["Physics","Maths"],category:"Employer insight",format:"Virtual",source:"catalogue",checkedAt:day,years:["Year 12"],applicationState:"Open",deadlineDate:"2026-10-09",deadline:"9 October 2026",url:"https://example.ac.uk/engineering",addedAt:day});
const profile={...emptyData.profile,configured:true,subjects:["Physics","Maths"],careerInterests:"Engineering",interests:["Engineering"]};
const workspace=(records:ReturnType<typeof createRecord>[]=[])=>(appSchema.parse({...emptyData,profile,records}));
function feedback(signal:Parameters<typeof feedbackSchema.parse>[0] extends never?never:string,item=programme){return feedbackSchema.parse({opportunityId:item.id,title:item.title,sector:item.sector,category:item.category,provider:item.provider,subjects:item.subjects,signal,at:"2026-10-03T12:00:00Z"});}
test("explicit feedback changes explainable ordering without changing eligibility",()=>{
 const other=enrich({...programme,id:"other",title:"Other engineering opportunity"});
 const base=matchOpportunity(other,profile),more=matchOpportunity(other,profile,{feedback:[feedback("Show me more like this")]}),fewer=matchOpportunity(other,profile,{feedback:[feedback("Show fewer like this")]});
 assert.equal(more.rank,base.rank+2);assert.equal(fewer.rank,base.rank-2);assert.equal(more.eligible,base.eligible);assert.ok(more.reasons.some(r=>r.includes("asked for more")&&r.includes("provider")));assert.ok(fewer.checks.some(r=>r.includes("asked for fewer")));
 const ageConflict=enrich({...other,minAge:19});assert.equal(matchOpportunity(ageConflict,{...profile,age:"16"},{feedback:[feedback("Show me more like this")]}).eligible,false);
});
test("not-for-me and similar-done hide only the explicit programme and feedback can be reset",()=>{
 const other=enrich({...programme,id:"other"});
 for(const signal of ["Not for me","Already done something similar"]){const result=recommendations([programme,other],profile,[],{feedback:[feedback(signal)]});assert.deepEqual(result.map(r=>r.item.id),["other"]);assert.ok(discoverySections([programme,other],profile,[],day,[],[feedback(signal)]).every(s=>s.items.every(i=>i.id!=="engineering")));}
 assert.equal(recommendations([programme],profile,[],{feedback:[]}).length,1);
});
test("priority actions put overdue work first and keep the default to four spread across applications",()=>{
 const records=Array.from({length:6},(_,i)=>{const r=createRecord(enrich({...programme,id:"p"+i,title:"Programme "+i}));r.intent="Applying";r.nextAction="Task "+i;r.nextActionDate=i===2?"2026-10-02":"2026-10-07";return r;});
 const ranked=priorityActions(workspace(records),[],day);assert.equal(ranked.priority.length,4);assert.equal(ranked.priority[0].title,"Task 2");assert.equal(new Set(ranked.priority.map(i=>i.recordId)).size,4);assert.ok(ranked.remaining.length>0);
});
test("opening alerts use published full dates, include newly matched unsaved programmes and never schedule vague periods",()=>{
 const opening=enrich({...programme,id:"new",openingDate:day,deadlineDate:"",applicationState:"Not yet open"});
 const vague=enrich({...opening,id:"vague",openingDate:"",openingPeriod:"Autumn 2026"});
 const items=workspaceItems(workspace([createRecord(vague)]),[opening],day);
 assert.ok(items.some(i=>i.opportunityId==="new"&&i.kind==="Opening"&&i.date===day));assert.ok(items.some(i=>i.recordId==="vague"&&i.kind==="Opening"&&i.date===""&&i.basis==="Approximate period"));assert.ok(items.every(i=>i.recordId!=="vague"||!i.date));
});
test("source, student and suggested dates remain distinguishable and original dates survive snoozing",()=>{
 const r=createRecord(programme);r.status="Applied";r.appliedAt="2026-09-12";r.eventDate="2026-10-08";r.reminders=[{id:"task",label:"Personal preparation",date:"2026-10-04",done:false,kind:"Personal"}];
 const data=workspace([r]),items=calendarItems(data,[],day);
 assert.ok(items.some(i=>i.kind==="Follow up"&&i.date===day&&i.basis==="Suggested date"));assert.ok(items.some(i=>i.kind==="Programme"&&i.basis==="Student-entered date"));
 const prep=items.find(i=>i.sourceId==="task")!;data.actionStates=[{id:prep.id,state:"Snoozed",date:"2026-10-10",at:"2026-10-03T12:00:00Z"}];
 assert.equal(calendarItems(data,[],day).find(i=>i.id===prep.id)?.date,"2026-10-04");assert.ok(!actionableItems(data,[],day).some(i=>i.id===prep.id));assert.ok(actionableItems(data,[],"2026-10-10").some(i=>i.id===prep.id&&i.snoozed));
});
test("dismissed reminders persist, complete does not infer application submission, changed deadline resurfaces",()=>{
 const r=createRecord(programme),data=workspace([r]),deadline=workspaceItems(data,[],day).find(i=>i.kind==="Deadline")!;
 data.actionStates=[{id:deadline.id,state:"Completed",date:"",at:"2026-10-03T12:00:00Z"}];
 assert.ok(!actionableItems(data,[],day).some(i=>i.id===deadline.id));assert.equal(data.records[0].status,"Saved");
 data.records[0].deadlineOverride=true;data.records[0].deadlineDate="2026-10-10";assert.ok(actionableItems(data,[],day).some(i=>i.kind==="Deadline"&&i.date==="2026-10-10"));
 assert.equal(restoreWorkspace(backupJSON(data)).actionStates[0].state,"Completed");
});
test("completed experience prompts use a labelled suggested date only when completion was actually logged",()=>{
 const r=createRecord(programme);r.status="Completed";r.eventDate="2025-03-01";const data=workspace([r]);
 assert.equal(workspaceItems(data,[],day)[0].date,"");assert.equal(workspaceItems(data,[],day)[0].basis,"Unknown date");
 data.activity=[{id:"done",kind:"Completed programme",at:"2026-10-03T12:00:00Z",recordId:r.opportunity.id,experienceId:"",title:r.opportunity.title,themes:["Engineering"]}];
 assert.equal(workspaceItems(data,[],day)[0].date,"2026-10-04");assert.equal(workspaceItems(data,[],day)[0].basis,"Suggested date");
});
test("calendar includes all reminder types, interviews, programme dates, milestones and undated requirements",()=>{
 const r=createRecord(enrich({...programme,openingDate:"2026-10-04",startDate:"2026-11-01"}));r.intent="Applying";r.requirements=[{id:"ref",label:"Teacher reference required",note:"",done:false}];r.questions=[];r.applicationSteps=["Eligibility checked"];r.milestoneDates=[{stage:"Eligibility checked",date:day}];r.reminders=[{id:"follow",label:"Ask teacher",date:"2026-10-05",kind:"Reference",done:false}];r.nextAction="Review eligibility";r.nextActionDate=day;
 const items=calendarItems(workspace([r]),[],day);for(const kind of ["Opening","Deadline","Programme","Reference","Next action","Milestone"])assert.ok(items.some(i=>i.kind===kind));assert.ok(items.some(i=>i.sourceId==="ref"&&!i.date));
 r.status="Interview / next stage";r.eventDate="2026-10-06";assert.ok(calendarItems(workspace([r]),[],day).some(i=>i.kind==="Interview"&&i.date==="2026-10-06"));
});
test("development records actual transitions and evidence additions, not each edit or programme advertised skills",()=>{
 const previous=createRecord(programme),next={...previous,status:"Applied" as const};
 assert.deepEqual(recordEvents(previous,next,"2026-10-03T12:00:00Z").map(e=>e.kind),["Application submitted"]);assert.deepEqual(recordEvents(next,{...next,notes:"Edited"},"2026-10-03T12:00:00Z"),[]);
 const e=experienceSchema.parse({id:"e",name:"My experience",updatedAt:day,skills:[{id:"s",skill:"Teamwork",whatHappened:"An exercise",action:"",learning:""}]});assert.deepEqual(experienceEvents(e,e,day),[]);
 const action={...e,skills:[{...e.skills[0],action:"I compared two suggestions."}]};assert.deepEqual(experienceEvents(e,action,day).map(e=>e.kind),["Evidence added"]);
 assert.deepEqual(experienceEvents(action,{...action,whatDid:"Edited personal notes"},day),[]);
 assert.deepEqual(experienceEvents(action,{...action,reflectionCompletedAt:day},day).map(e=>e.kind),["Reflection completed"]);
});
test("existing development evidence keeps unknown addition dates and removed sources retain real event history",()=>{
 const r=createRecord(programme,"2026-10-01T12:00:00Z"),e=experienceSchema.parse({id:"e",name:"Design",date:"2026-09-20",careerAreas:["Engineering"],updatedAt:day,skills:[{id:"s",skill:"Teamwork",whatHappened:"Group design",action:"I shared two options.",learning:"Compare ideas."}]});
 const data=workspace([r]);data.experiences=[e];const entries=developmentTimeline(data);
 assert.ok(entries.some(i=>i.kind==="Saved"&&i.date==="2026-10-01"));assert.ok(entries.some(i=>i.kind==="Evidence added"&&i.date===""&&i.basis.includes("not recorded")));
 data.activity=[{id:"history",kind:"Application started",at:"2026-10-02T12:00:00Z",recordId:r.opportunity.id,experienceId:"",title:r.opportunity.title,themes:["Engineering"]}];data.records=[];assert.ok(developmentTimeline(data).some(e=>e.id==="history"));
});
test("opportunity repository handles a thousand real-shaped entries with stable pages and distinct programmes sharing URLs",()=>{
 const entries=Array.from({length:1000},(_,i)=>enrich({...programme,id:"p"+i,title:"Programme "+i}));
 const imported=enrich({...programme,id:"personal",source:"imported"}),r=createRecord(imported);
 const collection=opportunityCollection(entries,[r],[enrich({...entries[0],description:"Live update"})]);
 assert.equal(collection.length,1001);assert.equal(collection[0].description,"Live update");
 const first=opportunityPage(collection),last=opportunityPage(collection,999);assert.equal(first.items.length,18);assert.equal(last.page,56);assert.equal(last.items.length,11);assert.equal(new Set([...first.items,...opportunityPage(collection,2).items].map(i=>i.id)).size,36);
});
test("freshness and field provenance never treat live discoveries or directories as checked programme eligibility",()=>{
 assert.equal(sourceFreshness(enrich({...programme,checkedAt:"2026-01-01"}),day).state,"Stale");assert.equal(sourceFreshness(enrich({...programme,source:"web"}),day).state,"Needs review");
 const facts=sourceFacts(programme);assert.equal(facts.find(f=>f.field==="Age")?.state,"Needs checking");assert.equal(facts.find(f=>f.field==="Widening participation")?.state,"Needs checking");
 const imported=sourceFacts(enrich({...programme,source:"imported"}));assert.equal(imported.find(f=>f.field==="School years")?.state,"Student review required");
});
test("related pathways retrieve broad-area opportunities without deciding the student's career",()=>{
 const health=enrich({...programme,id:"health",sector:"Healthcare",title:"NHS volunteering",careerAreas:["Medicine"]});
 assert.ok(pathwayOpportunities("Medicine",[programme,health]).some(i=>i.id==="health"));assert.ok(pathwayOpportunities("Engineering",[programme,health]).some(i=>i.id==="engineering"));
 assert.equal(pathwayOpportunities("Engineering",[enrich({...programme,deadlineDate:"2020-01-01"})]).length,0);
});
test("evidence retrieval ranks complete actual STAR details first at equal relevance and retains missing fields",()=>{
 const e=experienceSchema.parse({id:"e",name:"Design exercise",updatedAt:day,skills:[{id:"incomplete",skill:"Problem solving",whatHappened:"Two options",action:"I compared costs.",learning:"Explain tradeoffs"},{id:"complete",skill:"Problem solving",whatHappened:"Two options",action:"I compared costs.",learning:"Explain tradeoffs",star:{situation:"Two options",task:"Compare them",action:"I compared costs",result:"I explained my choice"}}]});
 const results=suggestEvidence("Describe a problem you solved",evidenceBank([e]));assert.equal(results[0].evidence.id,"complete");assert.equal(results[1].evidence.star,undefined);assert.ok(results.every(v=>v.reasons.length>0));
});
test("old v2 defaults preserve student data; full backup includes new feedback, dates, states and actual history",()=>{
 const r=createRecord(programme);const old=JSON.parse(JSON.stringify(workspace([r])));delete old.feedback;delete old.actionStates;delete old.activity;delete old.records[0].milestoneDates;
 const loaded=loadWorkspace({getItem:key=>key==="sixthstep-workspace-v2"?JSON.stringify(old):null});
 assert.equal(loaded.error,"");assert.equal(loaded.data.records[0].opportunity.id,programme.id);assert.deepEqual(loaded.data.feedback,[]);assert.deepEqual(loaded.data.activity,[]);
 loaded.data.feedback=[feedback("Interested")];loaded.data.actionStates=[{id:"action",state:"Dismissed",date:"",at:"2026-10-03T12:00:00Z"}];
 assert.deepEqual(restoreWorkspace(backupJSON(loaded.data)),loaded.data);loaded.data.feedback.push(feedback("Maybe"));assert.throws(()=>restoreWorkspace(backupJSON(loaded.data)),/duplicate feedback/);
});
test("undated v1 saves migrate without assigning a fictitious original saved date",()=>{
 const loaded=loadWorkspace({getItem:key=>key==="sixthstep-saved-v1"?JSON.stringify([programme]):null});
 assert.equal(loaded.data.records[0].savedAt,"");assert.equal(developmentTimeline(loaded.data)[0].date,"");
});

test("a new save receives a useful first step without inferring an application or a planning date",()=>{
 const data=workspace([createRecord(enrich({...programme,deadlineDate:"",deadline:"Not stated"}))]);
 const items=workspaceItems(data,[],day);assert.ok(items.some(i=>i.kind==="Next action"&&i.title.includes("Check eligibility")&&!i.date));assert.equal(data.records[0].intent,"Interested");assert.equal(data.records[0].status,"Saved");
});
test("snoozed reminders appear separately in Calendar and retain the original provider date",()=>{
 const data=workspace([createRecord(programme)]),original=calendarItems(data,[],day).find(i=>i.kind==="Deadline")!;
 data.actionStates=[{id:original.id,state:"Snoozed",date:"2026-10-06",at:"2026-10-03T12:00:00Z"}];const dates=calendarItems(data,[],day);
 assert.equal(dates.find(i=>i.id===original.id)?.date,"2026-10-09");assert.ok(dates.some(i=>i.actionId===original.id&&i.date==="2026-10-06"&&i.basis==="Student-entered date"&&i.originalDate==="2026-10-09"));
 assert.throws(()=>appSchema.parse({...data,actionStates:[{...data.actionStates[0],date:""}]}));
});
test("freshly recorded matches can become explained Home actions without creating dates or saved records",()=>{
 const data=workspace();const matches=workspaceItems(data,[programme],day);assert.ok(matches.some(i=>i.kind==="Explore"&&!i.date&&i.detail.includes("interest")));assert.equal(data.records.length,0);assert.ok(calendarItems(data,[programme],day).every(item=>item.kind!=="Explore"));
 assert.ok(!workspaceItems({...data,feedback:[feedback("Not for me")]},[programme],day).some(i=>i.kind==="Explore"));
});

test("regional year labels use the actual published band and never silently assume equivalence",()=>{
 const regional=enrich({...programme,years:["Year 12","Year 13 (Northern Ireland)","S5"]});
 assert.equal(matchOpportunity(regional,{...profile,year:"S5"}).eligible,true);
 assert.equal(matchOpportunity(regional,{...profile,year:"Year 13 (Northern Ireland)"}).eligible,true);
 assert.equal(matchOpportunity(regional,{...profile,year:"Year 13"}).eligible,false);
 const scottish=matchOpportunity(programme,{...profile,year:"S5"});
 // A difference in regional naming is not evidence of ineligibility, but it is never
 // silent either: the student is told the provider's wording and asked to check it.
 assert.equal(scottish.eligible,true);
 assert.ok(scottish.checks.some(c=>/regional naming differs/.test(c)),"a regional mismatch must be surfaced, not silently assumed");
});

test("student deadline overrides retain the original source date and clearing a countdown does not erase known source facts",()=>{
 const r=createRecord(programme);r.deadlineOverride=true;r.deadlineDate="2026-10-05";const data=workspace([r]);
 const deadline=calendarItems(data,[],day).find(i=>i.kind==="Deadline")!;assert.equal(deadline.date,"2026-10-05");assert.equal(deadline.originalDate,"2026-10-09");assert.equal(deadline.basis,"Student-entered date");
 r.deadlineDate="";const cleared=calendarItems(workspace([r]),[],day).find(i=>i.kind==="Deadline")!;assert.equal(cleared.date,"");assert.ok(cleared.detail.includes("original source still states"));assert.ok(!cleared.detail.includes("No exact closing date"));
});
