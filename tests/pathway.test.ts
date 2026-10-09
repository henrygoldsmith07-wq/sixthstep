import { test } from "node:test";
import assert from "node:assert/strict";
import { appSchema, enrich, defaultProfile, createRecord, emptyData, experienceSchema, questionSchema, requirementSchema, skillNames, type Experience } from "../lib/domain";
import { recordedCoverage, unrecordedAreas, missingSkills } from "../lib/coverage";
import { applicationPlan, planTarget, plannedSchedule, outstandingItems } from "../lib/deadline-plan";
import { matchOpportunity } from "../lib/recommendations";
import { relatedAreas } from "../lib/careers";
import { diversifyEvidence, evidenceGaps, impliedSkills, suggestEvidence } from "../lib/intelligence";
import { workspaceItems } from "../lib/operating-system";
const today="2026-10-03";
const programme=enrich({id:"clinical",title:"Clinical medicine insight",provider:"A university",sector:"Healthcare",subjects:["Biology"],years:["Year 12"],format:"Virtual",category:"Work experience",source:"catalogue",checkedAt:"2026-10-03",applicationState:"Open",deadline:"Not stated",deadlineDate:"",addedAt:"2026-10-03"});
const engineering=enrich({id:"robotics",title:"Robotics engineering insight",provider:"A college",sector:"Engineering",subjects:["Physics"],years:["Year 12"],format:"Virtual",category:"Work experience",source:"catalogue",checkedAt:"2026-10-03",applicationState:"Open",deadline:"Not stated",deadlineDate:"",addedAt:"2026-10-03"});
const profile={...defaultProfile,configured:true,subjects:["Biology"],careerInterests:"Medicine and engineering",year:"Year 12"};
const build=(fields:Partial<Experience>={})=>experienceSchema.parse({id:"e",name:"Engineering design",careerAreas:["Engineering"],whatDid:"I compared two designs and explained the trade-offs.",updatedAt:today,skills:[{id:"s",skill:"Problem solving",whatHappened:"Two design options",action:"I compared their costs.",learning:"Explain trade-offs"}],...fields});
const withWork=(record:ReturnType<typeof createRecord>)=>appSchema.parse({...emptyData,profile,records:[record]});

test("area classification is stable across repeated and interleaved calls",()=>{
 // relatedAreas memoises its results, so a later caller must receive exactly the same
 // classification as the first one, and a different string must not inherit a cached answer.
 const first=relatedAreas("Engineering design challenge");
 assert.deepEqual(first.map(a=>a.area),["Engineering"]);
 assert.deepEqual(relatedAreas("Engineering design challenge").map(a=>a.area),["Engineering"]);
 // Interleave a different input to prove the key really separates the two.
 assert.deepEqual(relatedAreas("Clinical medicine insight").map(a=>a.area),["Medicine"]);
 assert.deepEqual(relatedAreas("Engineering design challenge").map(a=>a.area),["Engineering"]);
 // Word-boundary matching must survive: a substring inside a longer word is not a match.
 assert.deepEqual(relatedAreas("Reengineered marketing").map(a=>a.area),[]);
 assert.deepEqual(relatedAreas("A history of art").map(a=>a.area),["Creative & media","Humanities & social sciences"]);
});

test("coverage counts only experiences the student has actually written into",()=>{
 const empty=recordedCoverage([]);assert.equal(empty.experiences,0);assert.equal(empty.examples,0);assert.equal(empty.areas.size,0);
 const blank=recordedCoverage([build({whatDid:"",skills:[],name:"Empty shell"})]);assert.equal(blank.experiences,0);assert.equal(blank.areas.size,0);
 const full=recordedCoverage([build()]);assert.equal(full.experiences,1);assert.equal(full.examples,1);assert.equal(full.areas.get("Engineering"),1);assert.equal(full.skills.get("Problem solving"),1);
 assert.equal(recordedCoverage([build(),build({id:"two",name:"Another design task"})]).experiences,2);
 assert.ok(recordedCoverage([build()]).examples===1);
});

test("unrecorded areas are reported only for interests the student actually declared",()=>{
 const coverage=recordedCoverage([build()]);
 assert.deepEqual(unrecordedAreas(profile,coverage),["Medicine"]);
 assert.deepEqual(unrecordedAreas({...defaultProfile},coverage),[]);
 assert.deepEqual(missingSkills(coverage,["Problem solving","Leadership"]),["Leadership"]);
 assert.deepEqual(missingSkills(coverage,["Problem solving"]),[]);
 // Against the workspace's own skill list, an empty bank reports every skill as unrecorded.
 assert.deepEqual(missingSkills(recordedCoverage([]),skillNames).length,skillNames.length);
 assert.ok(!missingSkills(recordedCoverage([build()]),skillNames).includes("Problem solving"));
});

test("recommendations explain what the student has already recorded without claiming eligibility",()=>{
 const experiences=[build()],context={experiences};
 const medicine=matchOpportunity(programme,profile,context),robotics=matchOpportunity(engineering,profile,context);
 // Robotics connects to the area the student has actually recorded; medicine does not.
 assert.ok(robotics.reasons.some(r=>r.includes("Builds on 1 experience you have recorded in engineering")));
 assert.ok(!medicine.reasons.some(r=>r.includes("you have recorded in")));
 assert.ok(medicine.checks.some(r=>r.includes("not recorded an example in medicine")));
 assert.equal(medicine.eligible,true);
 assert.ok(medicine.reasons.every(r=>!r.includes("%")));
 const without=matchOpportunity(programme,profile);
 assert.ok(!without.reasons.some(r=>r.includes("you have recorded in")));
});

test("a recommendation gap check never appears for an area the student did not ask for",()=>{
 const narrow={...defaultProfile,configured:true,careerInterests:"Law"};
 assert.ok(!matchOpportunity(programme,narrow,{experiences:[build()]}).checks.some(r=>r.includes("not recorded an example")));
});

test("plan target prefers the student's own date, then their override, then the provider's",()=>{
 const record=createRecord(programme,today);
 assert.equal(planTarget(record).basis,"No date recorded");
 record.opportunity.deadlineDate="2026-11-01";
 assert.equal(planTarget(record).basis,"Provider deadline");
 record.deadlineDate="2026-10-20";record.deadlineOverride=true;
 assert.equal(planTarget(record).basis,"Your recorded deadline");
 record.planDate="2026-10-10";
 assert.equal(planTarget(record).basis,"Your plan date");assert.equal(planTarget(record).date,"2026-10-10");
});

test("a plan works without any provider date because the student sets their own",()=>{
 const record=createRecord(programme,today);record.intent="Applying";record.planDate="2026-10-12";
 const plan=applicationPlan(record,today);
 assert.equal(plan.basis,"Your plan date");assert.equal(plan.daysLeft,9);assert.equal(plan.total,0);
 assert.match(plan.note,/Nothing outstanding is recorded/);
 assert.deepEqual(plan.steps,[]);
});

test("outstanding work is ordered by lead time so a reference is chased first",()=>{
 const record=createRecord(programme,today);
 record.requirements=[requirementSchema.parse({id:"r1",label:"CV required"}),requirementSchema.parse({id:"r2",label:"Teacher reference required"})];
 record.questions=[questionSchema.parse({id:"q1",question:"Why medicine?"})];
 record.checklist=[{id:"c1",label:"Book a train ticket",done:false}];
 const items=outstandingItems(record);
 assert.deepEqual(items,["Teacher reference required","Draft response: Why medicine?","CV required","Book a train ticket"]);
});

test("the schedule works backwards from the target and clamps anything already late to today",()=>{
 const record=createRecord(programme,today);record.intent="Applying";record.planDate="2026-10-06";
 record.requirements=[requirementSchema.parse({id:"r1",label:"CV required"}),requirementSchema.parse({id:"r2",label:"Teacher reference required"})];
 record.questions=[questionSchema.parse({id:"q1",question:"Why medicine?"}),questionSchema.parse({id:"q2",question:"Tell us about teamwork"})];
 record.checklist=[{id:"c1",label:"Book a train ticket",done:false}];
 const plan=applicationPlan(record,today);
 assert.equal(plan.daysLeft,3);assert.equal(plan.total,5);
 // Five items against three days: the earliest pair is already due today rather than in the past.
 assert.deepEqual(plan.steps.map(s=>s.date),["2026-10-03","2026-10-03","2026-10-04","2026-10-05","2026-10-06"]);
 assert.deepEqual(plan.steps.map(s=>s.label),["Teacher reference required","Draft response: Why medicine?","Draft response: Tell us about teamwork","CV required","Book a train ticket"]);
 assert.match(plan.note,/5 recorded item\(s\) and 3 day\(s\) left/);
 assert.ok(plan.steps.every(s=>s.basis==="Suggested date"));
});

test("a generous window is described factually rather than predicted as an outcome",()=>{
 const record=createRecord(programme,today);record.intent="Applying";record.planDate="2026-11-30";record.questions=[questionSchema.parse({id:"q1",question:"Why medicine?"})];
 const plan=applicationPlan(record,today);
 assert.equal(plan.daysLeft,58);assert.equal(plan.total,1);
 assert.match(plan.note,/58 day\(s\) for 1 recorded item\(s\)/);
 assert.doesNotMatch(plan.note,/will succeed|likely|guarantee|enough time to/i);
});

test("a plan date later than the provider's deadline is flagged as the provider deciding",()=>{
 const record=createRecord(programme,today);record.intent="Applying";record.opportunity.deadlineDate="2026-10-09";record.planDate="2026-11-30";record.questions=[questionSchema.parse({id:"q1",question:"Why medicine?"})];
 const plan=applicationPlan(record,today);
 assert.equal(plan.laterThanProvider,true);
 assert.match(plan.note,/later than the provider's recorded deadline \(2026-10-09\)/);
});

test("an overdue plan is reported as a decision, not as a failed application",()=>{
 const record=createRecord(programme,today);record.intent="Applying";record.planDate="2026-09-30";record.questions=[questionSchema.parse({id:"q1",question:"Why medicine?"})];
 const plan=applicationPlan(record,today);
 assert.equal(plan.daysLeft,-3);assert.match(plan.note,/date has passed/);
 assert.deepEqual(plan.steps.map(s=>s.date),[""]);
 assert.equal(plannedSchedule(["a"],"",null,today)[0].date,"");
});

test("a tight plan becomes a personalised next action with an explanation",()=>{
 const record=createRecord(programme,today);record.intent="Applying";record.planDate="2026-10-05";
 record.requirements=[requirementSchema.parse({id:"r1",label:"CV required"})];
 record.questions=[questionSchema.parse({id:"q1",question:"Why medicine?"}),questionSchema.parse({id:"q2",question:"Tell us about teamwork"})];
 const plan=workspaceItems(withWork(record),[],today).filter(i=>i.kind==="Plan");
 assert.equal(plan.length,1);
 assert.match(plan[0].title,/^Finish or decide: /);
 assert.match(plan[0].detail,/recorded item\(s\) and 2 day\(s\) left/);
 assert.equal(plan[0].basis,"Student-entered date");
 assert.equal(plan[0].date,"2026-10-05");
});

test("a plan date in the past asks the student to decide, and a student next action always wins",()=>{
 const record=createRecord(programme,today);record.intent="Applying";record.planDate="2026-09-30";record.questions=[questionSchema.parse({id:"q1",question:"Why medicine?"})];
 assert.match(workspaceItems(withWork(record),[],today).find(i=>i.kind==="Plan")!.title,/^Decide whether to continue: /);
 record.nextAction="Ask my teacher about a reference";
 assert.equal(workspaceItems(withWork(record),[],today).filter(i=>i.kind==="Plan").length,0);
});

test("a plan with room to spare raises no action at all",()=>{
 const record=createRecord(programme,today);record.intent="Applying";record.planDate="2026-12-01";record.questions=[questionSchema.parse({id:"q1",question:"Why medicine?"})];
 assert.equal(workspaceItems(withWork(record),[],today).filter(i=>i.kind==="Plan").length,0);
});

test("a provider deadline drives the plan when the student has not set one",()=>{
 const record=createRecord(programme,today);record.intent="Applying";record.opportunity.deadlineDate="2026-10-04";
 record.questions=[questionSchema.parse({id:"q1",question:"Why medicine?"}),questionSchema.parse({id:"q2",question:"Tell us about teamwork"})];
 const plan=workspaceItems(withWork(record),[],today).find(i=>i.kind==="Plan");
 assert.ok(plan);assert.equal(plan!.date,"2026-10-04");assert.equal(plan!.basis,"Confirmed source date");
});

test("evidence suggestions spread across experiences and name what is missing",()=>{
 const one=build(),two=build({id:"two",name:"Science museum visit",careerAreas:["Science & research"]});
 const bank=[...evidence(one),...evidence(two)];
 const ranked=suggestEvidence("Describe a problem you solved",bank);
 const spread=diversifyEvidence([...ranked,...ranked]);
 assert.deepEqual(spread.slice(0,2).map(v=>v.evidence.experienceId),["e","two"]);
 assert.equal(spread.length,ranked.length*2);
 assert.ok(impliedSkills("Describe a problem you solved").includes("Problem solving"));
 const gaps=evidenceGaps("Describe a team challenge you led",evidence(one));
 assert.ok(gaps.includes("Teamwork"));assert.ok(gaps.includes("Communication"));
 // The skill the student has already recorded is never reported as a gap.
 assert.ok(!gaps.includes("Problem solving"));
 const solved=evidenceGaps("Describe a problem you solved",evidence(one));
 assert.ok(!solved.includes("Problem solving"));
 assert.deepEqual(evidenceGaps("Describe your favourite hobby",evidence(one)),[]);
});
function evidence(experience:ReturnType<typeof build>){
 return experience.skills.map(skill=>({...skill,experienceId:experience.id,experienceName:experience.name,experienceType:experience.type,organisation:experience.organisation,date:experience.date,sectors:experience.careerAreas}));
}