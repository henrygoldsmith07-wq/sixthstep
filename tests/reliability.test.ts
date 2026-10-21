import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { appSchema, emptyData, createRecord, enrich, experienceSchema, evidenceBank, questionSchema } from "../lib/domain";
import { readRoute, routeHash } from "../lib/navigation";
import { LocalWorkspaceStorage, conflictBackupKey, originalKeys, eraseTombstoneKey, anotherTabErasedMessage } from "../lib/workspace-storage";
import { storageKey, restoreWorkspace, backupJSON } from "../lib/persistence";
import { calendarItems, priorityActions } from "../lib/operating-system";
import { calendarExport, eventIdentity } from "../lib/calendar-export";
import { catalogue } from "../lib/catalogue";
import { catalogueReview, validateCatalogue, proposeSourceReview } from "../lib/catalogue-validation";
import { evidenceIssues, linkEvidence, questionValidity, applicationPreparation } from "../lib/application-preparation";
import { measure, productMetrics } from "../lib/product-metrics";
import { diversifyRecommendations } from "../lib/recommendations";
const today="2026-10-03",at="2026-10-03T12:00:00Z";
const opportunity=enrich({id:"reliability",title:"Programme",provider:"University",sector:"Engineering",source:"catalogue",checkedAt:today,addedAt:today,deadlineDate:"2026-10-09",deadline:"9 October 2026",url:"https://example.ac.uk/programme",applicationState:"Open"});
const workspace=()=>appSchema.parse({...emptyData,records:[createRecord(opportunity,at)]});
function memory(initial:Record<string,string>={}){const values=new Map(Object.entries(initial));return {getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);},removeItem:(key:string)=>{values.delete(key);}};}
test("durable links round trip reserved characters and preserve old workspace addresses",()=>{
 for(const route of [{view:"saved" as const,record:"manual/a #é",question:"question::1"},{view:"reflect" as const,experience:"source:experience"},{view:"evidence" as const,evidence:"exp::skill"},{view:"finder" as const,opportunity:"provider/programme"}])assert.deepEqual(readRoute(routeHash(route)),route);
 for(const view of ["dashboard","saved","reflect","calendar","finder"] as const)assert.deepEqual(readRoute("#"+view),{view});
 assert.deepEqual(readRoute("#saved/%E0%A4%A"),{view:"dashboard"});assert.deepEqual(readRoute("#unknown"),{view:"dashboard"});
});
test("ICS contains exact all-day dates, exclusive end dates, provenance and source links; vague dates stay out",()=>{
 const data=workspace(),r=data.records[0];r.nextAction="Ask teacher";r.nextActionDate="2026-10-04";r.reminders=[{id:"reference",label:"Reference",date:"2026-10-05",kind:"Reference",done:false}];
 const vague=createRecord(enrich({...opportunity,id:"vague",deadlineDate:"",deadline:"Autumn 2026",openingPeriod:"Spring 2027"}));data.records.push(vague);
 const text=calendarExport(calendarItems(data,[],today),data.records.map(r=>r.opportunity),"https://sixthstep.example",new Date(at)).replace(/\r\n /g,"");
 assert.ok(text.includes("DTSTART;VALUE=DATE:20261009\r\nDTEND;VALUE=DATE:20261010"));assert.ok(text.includes("Student-entered date"));assert.ok(text.includes("Confirmed source date"));assert.ok(text.includes("Provider source: https://example.ac.uk/programme"));assert.ok(!text.includes("Autumn 2026"));assert.ok(!text.includes("Spring 2027"));assert.equal((text.match(/BEGIN:VEVENT/g)||[]).length,3);
});
test("ICS identities remain stable when a deadline changes, while a snoozed reminder stays distinct",()=>{
 const data=workspace(),initial=calendarItems(data,[],today).find(i=>i.kind==="Deadline")!;
 data.records[0].deadlineOverride=true;data.records[0].deadlineDate="2026-10-12";const changed=calendarItems(data,[],today).find(i=>i.kind==="Deadline")!;
 assert.equal(eventIdentity(initial),eventIdentity(changed));data.actionStates=[{id:changed.id,state:"Snoozed",date:"2026-10-11",at}];
 const dates=calendarItems(data,[],today),original=dates.find(i=>i.kind==="Deadline"&&!i.actionId)!,scheduled=dates.find(i=>i.actionId)!;
 assert.notEqual(eventIdentity(original),eventIdentity(scheduled));assert.equal(original.date,"2026-10-12");assert.equal(scheduled.originalDate,"2026-10-09");
});
test("ICS safely escapes injected properties and folds Unicode at 75 UTF-8 bytes without breaking characters",()=>{
 const data=workspace(),item=calendarItems(data,[],today).find(i=>i.kind==="Deadline")!;
 item.title="雪😀".repeat(45)+",;\\\nBEGIN:VEVENT";const text=calendarExport([item],[],"",new Date(at));
 for(const line of text.split("\r\n"))assert.ok(Buffer.byteLength(line,"utf8")<=75);
 const unfolded=text.replace(/\r\n /g,"");assert.equal((unfolded.match(/\r\nBEGIN:VEVENT/g)||[]).length,1);assert.ok(unfolded.includes("\\,\\;\\\\\\nBEGIN:VEVENT"));assert.ok(!text.includes("�"));assert.ok(text.endsWith("END:VCALENDAR\r\n"));
});
test("local storage migrates v1, retains originals and restores additive v2 fields",async()=>{
 const old=JSON.stringify([{...opportunity,savedAt:at}]),backend=memory({"sixthstep-saved-v1":old}),adapter=new LocalWorkspaceStorage(backend);
 const loaded=await adapter.load();assert.equal(loaded.migrated,true);assert.equal(loaded.data.records[0].opportunity.id,opportunity.id);assert.deepEqual(loaded.data.discoveries,[]);assert.equal(loaded.data.metrics.views,0);
 await adapter.save(loaded.data);assert.equal(backend.getItem("sixthstep-saved-v1"),old);assert.deepEqual(restoreWorkspace(backupJSON(loaded.data)),loaded.data);
});
test("two-tab conflicts never overwrite edits and an explicit choice preserves the replaced version",async()=>{
 const data=workspace(),backend=memory({[storageKey]:JSON.stringify(data)}),a=new LocalWorkspaceStorage(backend),b=new LocalWorkspaceStorage(backend);
 await a.load();await b.load();const left=structuredClone(data),right=structuredClone(data);left.records[0].notes="From tab A";right.records[0].notes="From tab B";
 assert.equal((await a.save(left)).status,"saved");assert.equal((await b.save(right)).status,"conflict");assert.equal(JSON.parse(backend.getItem(storageKey)!).records[0].notes,"From tab A");
 await b.replace(right);assert.equal(JSON.parse(backend.getItem(conflictBackupKey)!).records[0].notes,"From tab A");assert.equal(JSON.parse(backend.getItem(storageKey)!).records[0].notes,"From tab B");
});
test("an erase on one tab cannot be undone by another tab's in-memory copy",async()=>{
 // The hole this closes: tab A erased, tab B still held the deleted workspace and
 // still rendered "Keep this tab's version", so the delete was undone by a button
 // this product offered. replace() must refuse, not silently restore.
 const data=workspace(),backend=memory({[storageKey]:JSON.stringify(data)}),a=new LocalWorkspaceStorage(backend),b=new LocalWorkspaceStorage(backend);
 await a.load();await b.load();
 await a.clear();
 assert.equal(backend.getItem(storageKey),null,"the erase removed the data");
 assert.notEqual(backend.getItem(eraseTombstoneKey),null,"an erase leaves a marker so a sibling tab can tell a delete from a write");
 // Tab B tries to restore what it holds. This must throw, not write.
 await assert.rejects(()=>b.replace(data),/erased in another tab/,"a stale tab must not restore erased data");
 assert.equal(backend.getItem(storageKey),null,"the erased data must not come back");
});

test("an empty workspace is always allowed to replace after an erase",async()=>{
 // Writing nothing must never be blocked: a student who erases and then starts
 // again in another tab has to be able to save the fresh, empty workspace.
 const backend=memory(),a=new LocalWorkspaceStorage(backend);
 await a.load();await a.clear();
 await a.replace(emptyData);
 assert.equal(backend.getItem(storageKey),null,"an empty workspace still creates nothing");
});

test("after an erase, a load reports the empty workspace rather than falling back to v1 data",async()=>{
 // Without this, loadWorkspace() would happy-path back into the legacy v1 keys,
 // which clear() also removed — and resurrecting them would defeat the erase.
 const backend=memory({"sixthstep-saved-v1":JSON.stringify([{...opportunity,savedAt:at}])}),a=new LocalWorkspaceStorage(backend);
 await a.load();await a.clear();
 const loaded=await a.load();
 assert.equal(loaded.error,"","an erased workspace is a known-empty state, not an unread one");
 assert.equal(loaded.data.records.length,0);
 assert.equal(backend.getItem("sixthstep-saved-v1"),null,"the v1 migration source was erased too");
});

test("an autosave of pre-erase edits is refused with the erased explanation",async()=>{
 // Autosave is the silent path that would otherwise rewrite erased data.
 const data=workspace(),backend=memory({[storageKey]:JSON.stringify(data)}),a=new LocalWorkspaceStorage(backend),b=new LocalWorkspaceStorage(backend);
 await a.load();await b.load();await a.clear();
 const outcome=await b.save(data);
 assert.equal(outcome.status,"conflict");
 assert.equal(outcome.error,anotherTabErasedMessage);
 assert.equal(backend.getItem(storageKey),null);
});

test("the first genuine edit after an erase retires the marker so it cannot linger",async()=>{
 // The marker is an explanation, not a state. If it survived into the next
 // session it would keep refusing saves forever, long after the erase was done.
 const backend=memory(),a=new LocalWorkspaceStorage(backend);
 await a.load();await a.clear();
 await a.save(workspace());
 assert.equal(backend.getItem(eraseTombstoneKey),null,"a real edit retires the marker");
 assert.notEqual(backend.getItem(storageKey),null,"the real edit is stored");
});

test("the tab that erased can restore a backup straight away, even after a reload",async()=>{
 // Erase-then-restore is a deliberate sequence. The marker is meant to stop a stale tab, but it
 // used to refuse this one too ("erased in another tab") until some unrelated edit retired it.
 const data=workspace(),backend=memory({[storageKey]:JSON.stringify(data)}),a=new LocalWorkspaceStorage(backend);
 await a.load();await a.clear();
 await a.replace(data);
 assert.deepEqual(JSON.parse(backend.getItem(storageKey)!),appSchema.parse(data),"the backup is restored");
 assert.equal(backend.getItem(eraseTombstoneKey),null,"a restore is a genuine edit, so it retires the marker");
 await a.clear();
 const reopened=new LocalWorkspaceStorage(backend);await reopened.load();
 await reopened.replace(data);
 assert.notEqual(backend.getItem(storageKey),null,"a tab opened after the erase is not stale either");
});

test("corrupt data and backup write failures remain recoverable instead of being overwritten",async()=>{
 const backend=memory({[storageKey]:"{broken"}),adapter=new LocalWorkspaceStorage(backend);assert.ok((await adapter.load()).error);await assert.rejects(()=>adapter.save(workspace()));assert.equal((await adapter.recovery())[storageKey],"{broken");
 const throwing={getItem:backend.getItem,setItem:()=>{throw new Error("Quota exceeded");},removeItem:()=>{throw new Error("Quota exceeded");}},failed=new LocalWorkspaceStorage(throwing);await failed.load();await assert.rejects(()=>failed.replace(workspace()));assert.equal(backend.getItem(storageKey),"{broken");
});
test("the structured catalogue preserves every existing record, order and provenance exactly",()=>{
 const added=["engineering-college-steam","parliament-education","national-archives-education","british-library-schools","nhs-health-careers","apprenticeships-gov-uk","uk-supreme-court-debate-days","bath-step-into-bath","bath-discover-bath","kcl-pre-university-summer","ucl-summer-school","wadham-summer-schools","sheffield-access-summer","royal-holloway-summer-university","winchester-discover-summer","southampton-sutton-trust-summer","cardiff-step-up","swansea-summer-school","imperial-accelerate","imperial-work-experience","tdi-challenge","paribus-essay-prize","orwell-youth-prize","lse-thrive","techniquest-destination-stem","dorset-healthcare-work-experience","future-leaders-uk","sutton-trust-pathways","courtauld-summer-university","courtauld-young-people","npg-lab","npg-link","mediatrust-miq-work-experience","bfi-film-academy","redcross-young-volunteering","bhf-young-volunteering","newcastle-bitesize-uni"],revised=["bristol-insight"],preserved=catalogue.filter(i=>!added.includes(i.id)&&!revised.includes(i.id));
 assert.equal(preserved.length,52);assert.equal(createHash("sha256").update(JSON.stringify(preserved)).digest("hex"),"fdb37084067ed5ea27b38e9b1409c08d237d0938a029cda38c1503d1279a0ec6");
 assert.equal(catalogue.length,90);assert.equal(createHash("sha256").update(JSON.stringify(catalogue)).digest("hex"),"847ae3871c44641d09cc0189e434909b1e3b357a5c9ca5f6934d404c8002c3fc");
 const bristol=catalogue.find(i=>i.id==="bristol-insight")!;assert.equal(bristol.addedAt,"2026-10-03");assert.ok(bristol.unconfirmed.some(u=>u.includes("2025-26")));assert.equal(bristol.startDate,"");
 assert.throws(()=>validateCatalogue([{...catalogue[0],typo:"unreviewed"}]));assert.throws(()=>validateCatalogue([{...catalogue[0],checkedAt:"yesterday"}]));assert.throws(()=>validateCatalogue([catalogue[0],catalogue[0]]));assert.throws(()=>validateCatalogue(catalogue,[catalogue[0].id]));
});
test("review queues expose stale, conflicting and approaching dates without trusting proposed changes",()=>{
 const stale=enrich({...opportunity,checkedAt:"2026-01-01",openingDate:"2026-10-11",deadlineDate:"2026-10-09",unconfirmed:["Conflicting cycle"]}),queue=catalogueReview([stale],today);
 assert.equal(queue.stale.length,1);assert.equal(queue.conflicts.length,1);assert.equal(queue.approachingOpenings.length,1);assert.equal(queue.approachingDeadlines.length,1);
 const proposal=proposeSourceReview(stale,{deadlineDate:"2026-10-20"},at);assert.equal(proposal.status,"Pending review");assert.equal(proposal.changes[0].proposed,"2026-10-20");assert.equal(stale.deadlineDate,"2026-10-09");
});
const experience=experienceSchema.parse({id:"exp",name:"Design exercise",type:"Work experience",careerAreas:["Engineering"],whatDid:"I compared designs",updatedAt:at,skills:[{id:"skill",skill:"Problem solving",action:"I compared two designs against constraints",whatHappened:"A design exercise",learning:"Test the assumptions",star:{situation:"Design exercise",task:"Choose a design",action:"I compared constraints",result:"I explained my choice"}}]});
test("linked evidence versions warn on changes/removal without rewriting the student's draft",()=>{
 const bank=evidenceBank([experience]),q=questionSchema.parse({id:"q",question:"Explain a challenge",draft:"My own answer"});Object.assign(q,linkEvidence(q,bank[0]));assert.equal(evidenceIssues(q,bank).length,0);
 const edited=structuredClone(experience);edited.skills[0].action="I changed my recorded action";assert.equal(evidenceIssues(q,evidenceBank([edited]))[0].kind,"changed");assert.equal(evidenceIssues(q,[])[0].kind,"removed");assert.equal(q.draft,"My own answer");
 assert.equal(evidenceIssues({...q,evidenceSnapshots:[]},bank)[0].kind,"unknown");
});
test("readiness rejects empty, over-limit, incomplete or unreviewed copied answers",()=>{
 let q=questionSchema.parse({id:"q",question:"Question",limitKind:"Words",limit:3});assert.ok(questionValidity(q).length);q={...q,draft:"four words are here"};assert.ok(questionValidity(q).length);q={...q,limit:200,draft:"Result: [Add your own detail]"};assert.ok(questionValidity(q).length);
 q={...q,draft:"I compared the constraints and explained the tradeoff.",...linkEvidence(q,evidenceBank([experience])[0])};assert.ok(questionValidity(q).length);q.evidenceReviewed=true;assert.equal(questionValidity(q).length,0);
 const r=createRecord(opportunity);assert.equal(applicationPreparation(r,[]).label,"Confirm the provider requirements");r.questions=[{...q,status:"Ready"}];assert.equal(applicationPreparation(r,evidenceBank([experience])).answers,0);
});
test("diversification keeps the best connection first and offers alternatives without changing eligibility",()=>{
 const values=Array.from({length:6},(_,i)=>({item:enrich({...opportunity,id:"o"+i,provider:i<4?"Same provider":"Other "+i,category:i<4?"Work experience":"Competition"}),match:{reasons:["Related to Physics"],checks:[],conflicts:[],rank:i<4?9:8,eligible:true}}));
 const feed=diversifyRecommendations(values);assert.equal(feed[0].item.id,"o0");assert.notEqual(feed[1].item.provider,feed[0].item.provider);assert.ok(feed.every(v=>v.match.eligible));assert.equal(values[4].match.rank,8);
});
test("Home does not fill its first screen with low-level tasks from a single application",()=>{
 const data=workspace();data.records[0].intent="Applying";data.records[0].opportunity.deadlineDate="";data.records[0].requirements=Array.from({length:10},(_,i)=>({id:"r"+i,label:"Confirm requirement "+i,note:"",done:false}));
 const actions=priorityActions(data,[],today);assert.equal(actions.priority.length,1);assert.ok(actions.remaining.length>=9);
 const applying=workspace();applying.records[0].intent="Applying";applying.records[0].opportunity.deadlineDate="2026-10-09";
 applying.records[0].nextAction="Contact my teacher";applying.records[0].nextActionDate="2026-10-04";
 applying.profile.interests=["Engineering"];applying.profile.careerInterests="Engineering";
 const alternative=enrich({...applying.records[0].opportunity,id:"alternative",title:"Another engineering insight",sector:"Engineering",addedAt:today,deadlineDate:"",openingDate:"",startDate:""});
 const mixed=priorityActions(applying,[alternative],today).priority;
 assert.ok(mixed.some(i=>i.kind==="Explore"));assert.equal(mixed.filter(i=>i.recordId===applying.records[0].opportunity.id).length,2);
 assert.ok(mixed.every((item,index)=>index===0||mixed[index-1].score>=item.score),"Selected urgent application work stays before less urgent discovery");
});
test("local funnel counts use actual recorded actions, preserve unknown timings and never infer submission",()=>{
 const data=workspace();let metrics=measure(data.metrics,"view",at);metrics=measure(metrics,"save","2026-10-03T12:03:00Z");data.metrics=metrics;data.records[0].intent="Applying";data.records[0].nextAction="Check criteria";
 const result=productMetrics(data);assert.equal(result.viewed,1);assert.equal(result.submitted,0);assert.equal(result.firstSaveMinutes,3);assert.equal(result.nextActionPercent,100);assert.equal(productMetrics(appSchema.parse(emptyData)).firstSaveMinutes,null);
 assert.ok(!("opportunityId" in metrics));
});

test("explicit workspace clear removes only SixthStep keys and leaves unrelated data intact",async()=>{
  const unrelated="third-party-app-kept";const backend=memory({[storageKey]:JSON.stringify(workspace()),"sixthstep-saved-v1":JSON.stringify([{id:"legacy"}]),"sixthstep-profile-v1":JSON.stringify({year:"Year 12"}),"sixthstep-journal-v1":"old notes",[conflictBackupKey]:JSON.stringify({records:[]}),[unrelated]:"persist me"}),adapter=new LocalWorkspaceStorage(backend);
  await adapter.load();await adapter.clear();
  for(const key of originalKeys)assert.equal(backend.getItem(key),null,"clear must remove "+key);
  assert.equal(backend.getItem(unrelated),"persist me","unrelated app data must survive");
  const reloaded=await adapter.load();assert.equal(reloaded.data.records.length,0);assert.equal(reloaded.data.experiences.length,0);
});

test("after an explicit clear the workspace still saves real edits without recreating erased data",async()=>{
 const backend=memory({[storageKey]:JSON.stringify(workspace())}),adapter=new LocalWorkspaceStorage(backend);
 await adapter.load();await adapter.clear();
 assert.equal(backend.getItem(storageKey),null);
 // Clearing resets the interface to the empty workspace, whose autosave runs immediately.
 // That save must succeed, and must not write the erased data back as a fresh stored key.
 assert.deepEqual(await adapter.save(appSchema.parse(emptyData)),{status:"saved"});
 assert.equal(backend.getItem(storageKey),null,"an empty workspace must not recreate erased data");
 // A genuine edit afterwards must still persist, or autosave stays broken until a reload.
 const edited=appSchema.parse({...emptyData,profile:{...emptyData.profile,interests:["Engineering"],configured:true}});
 assert.deepEqual(await adapter.save(edited),{status:"saved"});
 assert.ok(backend.getItem(storageKey),"a real edit after a clear must persist");
});
