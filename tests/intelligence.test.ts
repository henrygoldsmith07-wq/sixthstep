import { test } from "node:test";
import assert from "node:assert/strict";
import { appSchema, enrich, defaultProfile, createRecord, experienceSchema, evidenceBank, questionSchema, nextSteps } from "../lib/domain";
import { matchOpportunity, recommendations, discoverySections } from "../lib/recommendations";
import { explorationMap } from "../lib/careers";
import { deadlineIntelligence, suggestEvidence, evidenceText, evidenceKey, starComplete, evidenceStrength, questionCount, workspaceAlerts } from "../lib/intelligence";
import { restoreWorkspace, backupJSON } from "../lib/persistence";
const programme=enrich({id:"biomedical",title:"Biomedical research insight",provider:"A university",sector:"Science & research",subjects:["Biology","Chemistry"],years:["Year 12"],minAge:16,maxAge:18,format:"Virtual",category:"Research placement",source:"catalogue",checkedAt:"2026-10-03",applicationState:"Open",deadlineDate:"2026-10-09",deadline:"9 October 2026",addedAt:"2026-10-03"});
const profile={...defaultProfile,configured:true,subjects:["Biology","Chemistry"],age:"17",careerInterests:"Medicine",year:"Year 12"};
const experience=experienceSchema.parse({id:"e",name:"Engineering design",careerAreas:["Engineering"],enjoyed:"Comparing different design options",whatDid:"I compared two designs and explained the trade-offs.",interestChange:"Increased",updatedAt:"2026-10-03",skills:[{id:"s",skill:"Problem solving",whatHappened:"Two design options",action:"I compared their costs.",learning:"Explain trade-offs"}]});
test("medicine connects transparently to biomedical opportunities without invented certainty",()=>{
 const m=matchOpportunity(programme,profile);assert.ok(m.reasons.some(r=>r.includes("medicine")));assert.ok(m.reasons.some(r=>r.includes("Biology")));assert.ok(m.checks.length===0||m.checks.every(r=>typeof r==="string"));assert.ok(m.reasons.every(r=>!r.includes("%")));
 assert.equal(recommendations([enrich({...programme,minAge:18})],profile).length,0);
});
test("exploration mode gives adjacent areas more weight while targeting rewards direct career connections",()=>{
 const adjacent=enrich({...programme,title:"Biology research",description:"",sector:"Science & research",subjects:["Biology"]});
 const exploring=matchOpportunity(adjacent,{...profile,direction:"Exploring"}),targeting=matchOpportunity(adjacent,{...profile,direction:"Targeting a field"});
 assert.ok(exploring.rank>targeting.rank);
 const direct=enrich({...programme,title:"Medicine insight",sector:"Healthcare"});
 assert.ok(matchOpportunity(direct,{...profile,direction:"Targeting a field"}).rank>matchOpportunity(direct,{...profile,direction:"Exploring"}).rank);
});
test("saved history and explicit increased reflection interest add labelled connections; decreased interest does not",()=>{
 const item=enrich({...programme,id:"eng",title:"Engineering design insight",sector:"Engineering",subjects:["Physics"]}),r=createRecord({...item,id:"saved"});r.intent="Shortlisted";
 const m=matchOpportunity(item,defaultProfile,{records:[r],experiences:[experience]});assert.ok(m.reasons.some(s=>s.includes("which you saved")));assert.ok(m.reasons.some(s=>s.includes("recorded increased")));
 assert.ok(!matchOpportunity(item,defaultProfile,{experiences:[{...experience,interestChange:"Decreased"}]}).reasons.some(s=>s.includes("increased")));
});
test("existing version 2 workspaces gain additive defaults without losing records or drafts",()=>{
 const old={version:2,profile:defaultProfile,records:[{opportunity:programme,savedAt:"2026-10-03",status:"Applied"}],experiences:[{id:"old",name:"Old notes",whatDid:"My original notes",updatedAt:""}]};
 const parsed=restoreWorkspace(JSON.stringify(old));assert.equal(parsed.records[0].intent,"Applying");assert.deepEqual(parsed.records[0].questions,[]);assert.deepEqual(parsed.dismissedAlerts,[]);assert.equal(parsed.experiences[0].whatDid,"My original notes");
 assert.equal(createRecord(programme).intent,"Interested");
});
test("evidence suggestions use real recorded actions and explain relevance",()=>{
 const bank=evidenceBank([experience]);const result=suggestEvidence("Tell us about a difficult problem you solved.",bank);assert.equal(result.length,1);assert.equal(result[0].evidence.action,"I compared their costs.");assert.ok(result[0].reasons.some(r=>r.includes("problem solving")));assert.equal(suggestEvidence("Something unrelated",[]).length,0);
 assert.equal(evidenceBank([{...experience,skills:[{...experience.skills[0],action:""}]}]).length,0);
});
test("STAR scaffolds copy recorded text and prompt for missing task/result instead of inventing outcomes",()=>{
 const e=evidenceBank([experience])[0],text=evidenceText(e,true);assert.match(text,/Action: I compared their costs/);assert.match(text,/Task: \[Add your own detail\]/);assert.match(text,/Result: \[Add your own detail\]/);assert.equal(starComplete(e),false);assert.equal(evidenceStrength(e),"Context, action & learning");assert.equal(evidenceKey(e),"e::s");
});
test("word and character limits count drafts without estimating completion",()=>{
 const q=questionSchema.parse({id:"q",question:"Why?",draft:"  I solved\nthis problem. ",limitKind:"Words",limit:4});assert.equal(questionCount(q),4);q.limitKind="Characters";q.draft="A😀";assert.equal(questionCount(q),2);
});
test("backup round trips requirements, question provenance, shortlist intentions and dismissed alerts",()=>{
 const r=createRecord(programme);r.intent="Shortlisted";r.requirements=[{id:"ref",label:"Teacher reference required",note:"Ask my teacher",done:false}];r.questions=[questionSchema.parse({id:"q",question:"Describe a problem",draft:"My own answer",evidenceIds:["e::s"]})];
 const data=appSchema.parse({version:2,profile,records:[r],experiences:[experience],dismissedAlerts:["one"]});assert.deepEqual(restoreWorkspace(backupJSON(data)),data);
 assert.throws(()=>restoreWorkspace(backupJSON({...data,records:[{...r,questions:[r.questions[0],r.questions[0]]}]})),/duplicate/);
});
test("deadline intelligence distinguishes confirmed, rolling, expected, unknown, closed and stale",()=>{
 assert.equal(deadlineIntelligence(programme,"2026-10-03").kind,"Confirmed date");assert.equal(deadlineIntelligence({...programme,deadlineDate:"",deadline:"Rolling"},"2026-10-03").kind,"Rolling deadline");
 assert.equal(deadlineIntelligence({...programme,deadlineDate:"",deadline:"Expected autumn opening"},"2026-10-03").kind,"Expected opening period · check source");
 const unknown=deadlineIntelligence({...programme,deadlineDate:"",deadline:"Not stated"},"2026-10-03");assert.equal(unknown.kind,"Deadline not announced");assert.equal(unknown.days,null);
 assert.equal(deadlineIntelligence(programme,"2026-10-10").kind,"Application closed");assert.equal(deadlineIntelligence({...programme,checkedAt:"2026-01-01"},"2026-10-03").stale,true);
});
test("alerts are derived, dismissible and reappear only when their underlying date changes",()=>{
 const r=createRecord(programme);r.intent="Applying";r.nextAction="Finish answer";r.nextActionDate="2026-10-02";r.requirements=[{id:"ref",label:"Teacher reference required",note:"",done:false}];
 const data=appSchema.parse({version:2,profile:defaultProfile,records:[r],experiences:[]});
 const alerts=workspaceAlerts(data,[],"2026-10-03");assert.ok(alerts.some(a=>a.title==="Closing this week"));assert.ok(alerts.some(a=>a.title==="Next action is overdue"));assert.ok(alerts.some(a=>a.title==="Reference requirement still incomplete"));
 data.dismissedAlerts=alerts.map(a=>a.id);assert.equal(workspaceAlerts(data,[],"2026-10-03").length,0);
 r.deadlineOverride=true;r.deadlineDate="2026-10-04";data.records=[r];assert.ok(workspaceAlerts(data,[],"2026-10-03").some(a=>a.title==="Closing tomorrow"));
});
test("no countdown alert is created for vague periods and no stale result is declared open",()=>{
 const r=createRecord({...programme,deadlineDate:"",deadline:"Autumn",checkedAt:"2026-01-01"});r.intent="Shortlisted";const data=appSchema.parse({version:2,profile:defaultProfile,records:[r],experiences:[]});
 const alerts=workspaceAlerts(data,[],"2026-10-03");assert.ok(alerts.some(a=>a.title.includes("not been checked")));assert.ok(!alerts.some(a=>a.title.startsWith("Closing")));
});
test("Exploration Map preserves explicit student quotes and labels only actual repeated wording",()=>{
 const second={...experience,id:"two",name:"Design activity",reflection:undefined};
 const groups=explorationMap([experience,second]);const engineering=groups.find(g=>g.area==="Engineering")!;assert.equal(engineering.entries.length,2);assert.equal(engineering.enjoyed[0].text,experience.enjoyed);assert.equal(engineering.repeated.length,1);assert.deepEqual(engineering.repeated[0].sources,["e","two"]);assert.ok(engineering.suggestions.includes("Biomedical engineering"));assert.equal(explorationMap([]).length,0);
});
test("application next steps reflect unfinished drafts and requirements, never a fake progress percentage",()=>{
 const r=createRecord(programme);r.intent="Applying";r.status="Preparing application";r.questions=[questionSchema.parse({id:"q",question:"Why medicine?"})];r.requirements=[{id:"ref",label:"Teacher reference required",note:"",done:false}];
 const steps=nextSteps([r],[],"2026-10-03");assert.ok(steps.some(s=>s.title.includes("Why medicine")));assert.ok(steps.some(s=>s.title.startsWith("Arrange reference")));
 r.questions[0].status="Ready";r.questions[0].draft="My answer";r.requirements[0].done=true;assert.ok(!nextSteps([r],[],"2026-10-03").some(s=>s.id.includes("question-")||s.id.includes("reference-")));
});
test("expanded discovery collections use real category data and require meaningful entries",()=>{
 const a=enrich({...programme,id:"a",category:"Summer school"}),b=enrich({...a,id:"b"});const sections=discoverySections([a,b],profile,[],"2026-10-03");assert.ok(sections.some(s=>s.title==="Summer schools"));assert.ok(sections.some(s=>s.title==="Medicine and healthcare"));assert.equal(discoverySections([a],profile,[],"2026-10-03").length,0);
});

test("opening and closing periods remain separate, and only a confirmed opening date can appear in opening-soon discovery",()=>{
 assert.equal(deadlineIntelligence({...programme,deadlineDate:"",deadline:"Not stated",openingPeriod:"Autumn"},"2026-10-03").kind,"Expected opening period · check source");
 assert.equal(deadlineIntelligence({...programme,deadlineDate:"",deadline:"Not stated",closingPeriod:"Winter"},"2026-10-03").kind,"Expected closing period · check source");
 const a=enrich({...programme,id:"open-a",deadlineDate:"",openingDate:"2026-10-12",applicationState:"Not yet open"}),b=enrich({...a,id:"open-b"});
 assert.ok(discoverySections([a,b],profile,[],"2026-10-03").some(s=>s.title==="Applications opening soon"));
 assert.ok(!discoverySections([{...a,openingDate:""},{...b,openingDate:""}],profile,[],"2026-10-03").some(s=>s.title==="Applications opening soon"));
});