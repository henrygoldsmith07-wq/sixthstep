import { test } from "node:test";
import assert from "node:assert/strict";
import { createRecord, emptyData, enrich, defaultProfile } from "../lib/domain";
import { weeklyOverview } from "../lib/weekly-overview";
import { lifecycleLabel, lifecycleNext, stageChange, shortlistPatch } from "../lib/lifecycle";
import { catalogueDuplicates, validateCatalogue } from "../lib/catalogue-validation";
import { catalogue } from "../lib/catalogue";
import { ApiError, readBody, rateLimit } from "../lib/security";
import { tavily } from "../lib/providers";
import { POST as search } from "../app/api/search/route";
import { matchOpportunity, conciseReason } from "../lib/recommendations";
import { feedbackSchema } from "../lib/workspace-events";

const today="2026-10-03";
const opportunity=enrich({id:"weekly",title:"Engineering insight",provider:"Test university",source:"imported",deadlineDate:"2026-10-08",openingDate:"2026-10-09",unconfirmed:["Age eligibility"],url:"https://example.org/programme"});
test("concise reasons retain meaningful connections and direct negative feedback lowers repetition",()=>{
 const item=enrich({...opportunity,sector:"Engineering",subjects:["Physics"],description:"Engineering design",deadlineDate:""}),profile={...defaultProfile,configured:true,subjects:["Physics"],interests:["Engineering"]};
 const base=matchOpportunity(item,profile),feedback=feedbackSchema.parse({opportunityId:item.id,title:item.title,sector:item.sector,category:item.category,provider:item.provider,subjects:item.subjects,signal:"Show fewer like this",at:today});
 assert.match(conciseReason(base),/Related to Physics and your engineering interest/);assert.ok(matchOpportunity(item,profile,{feedback:[feedback]}).rank<base.rank);assert.equal(matchOpportunity(item,profile,{feedback:[feedback]}).eligible,base.eligible);
 const checked=enrich({...item,source:"catalogue",checkedAt:today});assert.ok(matchOpportunity({...checked,checkedAt:"2020-01-01"},profile).rank<matchOpportunity(checked,profile).rank);
});
test("weekly overview separates upcoming dates from actual checks without invented periods",()=>{
 const data=structuredClone(emptyData),record=createRecord(opportunity,today);record.intent="Applying";record.nextAction="Ask my teacher";record.nextActionDate="2026-10-02";record.requirements=[{id:"req",label:"Confirm eligibility",note:"",done:false}];data.records=[record];
 const view=weeklyOverview(data,today);assert.equal(view.attention.length,1);assert.ok(view.attention[0].reasons.some(r=>/overdue/.test(r)));assert.ok(view.attention[0].reasons.some(r=>/Opening falls after/.test(r)));assert.ok(view.attention[0].reasons.some(r=>/Imported/.test(r)));assert.ok(view.attention[0].reasons.some(r=>/requirement/.test(r)));assert.ok(view.upcoming.some(i=>i.kind==="Deadline"));assert.ok(view.upcoming.every(i=>i.date>=today&&i.date<="2026-10-17"));
 data.records[0].opportunity.deadlineDate="";data.records[0].opportunity.openingDate="";data.records[0].opportunity.openingPeriod="Autumn";assert.equal(weeklyOverview(data,today).upcoming.length,0);
});
test("completed and declined opportunities do not create attention noise, expired application deadlines do",()=>{
 const data=structuredClone(emptyData),r=createRecord({...opportunity,deadlineDate:"2026-10-01"},today);data.records=[r];assert.ok(weeklyOverview(data,today).attention[0].reasons.some(s=>s.includes("has passed")));r.status="Completed";assert.equal(weeklyOverview(data,today).attention.length,0);r.status="Not pursuing";assert.equal(weeklyOverview(data,today).attention.length,0);
});
test("lifecycle labels derive from existing data and transitions preserve genuine submission dates",()=>{
 const r=createRecord(opportunity,today);r.intent="Interested";assert.equal(lifecycleLabel(r),"Interested");const snapshot=JSON.stringify(r);const patch=stageChange(r,"Preparing application",today);assert.equal(patch.intent,"Applying");assert.equal(patch.appliedAt,undefined);assert.equal(JSON.stringify(r),snapshot);
 Object.assign(r,patch);assert.equal(lifecycleLabel(r),"Applying");assert.match(lifecycleNext(r),/provider website/);Object.assign(r,stageChange(r,"Applied",today));assert.equal(lifecycleLabel(r),"Submitted");assert.deepEqual(shortlistPatch(r),{});assert.equal(shortlistPatch().intent,"Shortlisted");assert.equal(r.appliedAt,today);assert.equal(stageChange(r,"Applied","2026-10-04").appliedAt,undefined);r.status="Completed";assert.match(lifecycleNext(r),/reflect/);
});
test("catalogue duplicate detection respects different programmes sharing a source and rejects identity duplicates",()=>{
 const a=catalogue.find(i=>i.id==="deloitte-women")!,b=catalogue.find(i=>i.id==="deloitte-black")!;assert.equal(a.url,b.url);assert.deepEqual(catalogueDuplicates([a,b]),[]);const duplicate={...a,id:"duplicate",title:a.title.toUpperCase()};assert.deepEqual(catalogueDuplicates([a,duplicate]),[[a.id,"duplicate"]]);assert.throws(()=>validateCatalogue([a,duplicate]),/Duplicate catalogue programme/);assert.throws(()=>validateCatalogue([{...a,url:"https://127.0.0.1"}]),/Unsafe/);
});
test("chunked JSON bodies enforce byte limits before reading the whole request and preserve split Unicode",async()=>{
 let cancelled=false,pulls=0;const body=new ReadableStream<Uint8Array>({pull(c){pulls++;c.enqueue(new Uint8Array(12001));},cancel(){cancelled=true;}});
 await assert.rejects(()=>readBody(new Request("https://example.org",{method:"POST",headers:{"content-type":"application/json"},body,duplex:"half"} as RequestInit)),(e:unknown)=>e instanceof ApiError&&e.status===413);assert.equal(cancelled,true);assert.ok(pulls<5);
 const bytes=new TextEncoder().encode(JSON.stringify({text:"résumé"}));const valid=new ReadableStream<Uint8Array>({start(c){for(const byte of bytes)c.enqueue(Uint8Array.of(byte));c.close();}});assert.deepEqual(await readBody(new Request("https://example.org",{method:"POST",headers:{"content-type":"application/json"},body:valid,duplex:"half"} as RequestInit)),{text:"résumé"});
});
test("source services explain timeouts and reject malformed success responses",async t=>{
 const original=global.fetch,key=process.env.TAVILY_API_KEY;process.env.TAVILY_API_KEY="test-only";t.after(()=>{global.fetch=original;if(key===undefined)delete process.env.TAVILY_API_KEY;else process.env.TAVILY_API_KEY=key;});
 global.fetch=async()=>{throw new DOMException("slow","TimeoutError");};await assert.rejects(()=>tavily("search",{}),(e:unknown)=>e instanceof ApiError&&e.status===504&&/took too long/.test(e.message));
 for(const value of [null,{results:{}},{results:[null]}]){global.fetch=async()=>Response.json(value);await assert.rejects(()=>tavily("search",{}),(e:unknown)=>e instanceof ApiError&&e.status===502);}
 global.fetch=async()=>new Response("broken");await assert.rejects(()=>tavily("extract",{}),(e:unknown)=>e instanceof ApiError&&e.status===502);
});
test("simultaneous identical web searches share one provider request and failures remain retryable",async t=>{
 const original=global.fetch,key=process.env.TAVILY_API_KEY;process.env.TAVILY_API_KEY="test-only";t.after(()=>{global.fetch=original;if(key===undefined)delete process.env.TAVILY_API_KEY;else process.env.TAVILY_API_KEY=key;});
 const terms={query:"weekly-concurrent",location:"UK",sector:"Engineering",format:"Any",age:""};let count=0,release!:()=>void;
 global.fetch=async()=>{count++;await new Promise<void>(r=>{release=r;});return Response.json({results:[]});};
 const request=()=>new Request("http://localhost:3000/api/search",{method:"POST",headers:{"content-type":"application/json","x-forwarded-for":"weekly-"+Math.random()},body:JSON.stringify(terms)});
 const a=search(request()),b=search(request());while(!release)await new Promise(r=>setTimeout(r,1));release();assert.equal((await a).status,200);assert.equal((await b).status,200);assert.equal(count,1);
 terms.query="weekly-retry";global.fetch=async()=>Response.json({results:null});assert.equal((await search(request())).status,502);global.fetch=async()=>Response.json({results:[]});assert.equal((await search(request())).status,200);
});
test("in-memory rate limiting remains bounded without resetting live allowances",async()=>{
 const make=(id:string)=>new Request("https://example.org/api/search",{headers:{"x-forwarded-for":id}});
 let accepted=0;for(let i=0;i<5001;i++){try{await rateLimit(make("capacity-"+i),"capacity",1);accepted++;}catch(e){assert.ok(e instanceof ApiError&&e.status===503);break;}}assert.ok(accepted>4900&&accepted<=5000);
 await assert.rejects(()=>rateLimit(make("one-more"),"capacity",1),(e:unknown)=>e instanceof ApiError&&e.status===503);
 await assert.rejects(()=>rateLimit(make("capacity-0"),"capacity",1),(e:unknown)=>e instanceof ApiError&&e.status===429);
});
test("empty weekly workspace remains honest and actionable",()=>{assert.deepEqual(weeklyOverview({...structuredClone(emptyData),profile:defaultProfile},today),{attention:[],upcoming:[]});});
