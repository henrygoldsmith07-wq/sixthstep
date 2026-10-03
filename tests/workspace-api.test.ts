import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { POST as importOpportunity } from "../app/api/opportunity/route";
import { POST as reflect } from "../app/api/experience-reflection/route";
import { experienceSchema } from "../lib/domain";
const names=["OPENAI_API_KEY","OPENAI_BASE_URL","OPENAI_MODEL","OPENAI_PROVIDER_NAME","OPENAI_JSON_MODE","OPENAI_TOKEN_PARAMETER","GROQ_API_KEY","TAVILY_API_KEY","UPSTASH_REDIS_REST_URL","UPSTASH_REDIS_REST_TOKEN"];
function setup(t:TestContext,ready=true){const previous=Object.fromEntries(names.map(k=>[k,process.env[k]])),fetch=global.fetch;for(const k of names)delete process.env[k];if(ready)Object.assign(process.env,{OPENAI_API_KEY:"test-secret",OPENAI_BASE_URL:"https://provider.example/v1",OPENAI_MODEL:"test-model",TAVILY_API_KEY:"test-extraction-key"});t.after(()=>{global.fetch=fetch;for(const k of names){if(previous[k]===undefined)delete process.env[k];else process.env[k]=previous[k];}});}
let count=0;
function request(body:unknown,origin?:string){return new Request("http://localhost:3000/api/test",{method:"POST",headers:{"Content-Type":"application/json","x-forwarded-for":"upgrade-api-"+count++,...(origin?{origin}:{})},body:JSON.stringify(body)});}
function completion(value:unknown){return Response.json({choices:[{finish_reason:"stop",message:{content:JSON.stringify(value)}}]});}
const text="A virtual engineering insight programme for students aged 16–18 in Year 12. Applications close 31 October 2026. Starts 10 November 2026. Apply at https://example.org/apply. Complete a design task and hear from engineers.";
const extracted={title:"Engineering insight",provider:"Example university",description:"A virtual design task and insight event.",category:"Employer insight",sector:"Engineering",subSector:"Design",activities:["Complete a design task"],skills:["Problem solving"],eligibility:"Students aged 16–18 in Year 12.",minAge:16,maxAge:18,ageQuote:"students aged 16–18",years:["Year 12"],yearQuote:"Year 12",subjects:[],subjectRequirements:"Not stated",geography:"Not stated",location:"Virtual",format:"Virtual",duration:"Not stated",cost:"Not stated",deadline:"31 October 2026",deadlineDate:"2026-10-31",deadlineQuote:"Applications close 31 October 2026",startDate:"2026-11-10",startQuote:"Starts 10 November 2026",applicationUrl:"https://example.org/apply",certificate:"Not stated",selection:"Not stated",nextSteps:["Check full requirements"],unconfirmed:["Cost","Certificate"]};
test("URL extraction produces a normal reviewable record with supported dates, age and source links",async t=>{
 setup(t);const calls:string[]=[];
 global.fetch=async (input,init)=>{calls.push(String(input));if(String(input).endsWith("/extract"))return Response.json({results:[{raw_content:text}]});assert.equal(new Headers(init?.headers).get("Authorization"),"Bearer test-secret");return completion(extracted);};
 const response=await importOpportunity(request({url:"https://example.org/engineering"}));assert.equal(response.status,200);assert.equal(response.headers.get("Cache-Control"),"no-store");
 const result=await response.json(),o=result.opportunity;assert.equal(o.title,"Engineering insight");assert.equal(o.source,"imported");assert.equal(o.sourceKind,"Imported");assert.equal(o.checkedAt,"");assert.equal(o.applicationState,"Unknown");assert.equal(o.deadlineDate,"2026-10-31");assert.equal(o.startDate,"2026-11-10");assert.equal(o.minAge,16);assert.deepEqual(o.years,["Year 12"]);assert.equal(o.applicationUrl,"https://example.org/apply");assert.deepEqual(o.sourceUrls,["https://example.org/engineering"]);assert.doesNotMatch(JSON.stringify(result),/test-secret|test-extraction-key/);assert.equal(calls.length,2);
});
test("unsupported dates, ages and invented application links stay unconfirmed",async t=>{
 setup(t);
 global.fetch=async()=>completion({...extracted,deadlineDate:"2027-10-31",minAge:15,applicationUrl:"https://invented.example/apply",years:["Year 13"],yearQuote:"Year 13"});
 const response=await importOpportunity(request({text}));assert.equal(response.status,200);const o=(await response.json()).opportunity;
 assert.equal(o.deadlineDate,"");assert.equal(o.minAge,undefined);assert.deepEqual(o.years,[]);assert.equal(o.applicationUrl,"");assert.ok(o.unconfirmed.some((v:string)=>v.includes("Deadline")));assert.ok(o.unconfirmed.some((v:string)=>v.includes("age")));assert.ok(o.unconfirmed.some((v:string)=>v.includes("Application")));
});
test("missing AI configuration prevents spending an extraction request and unsafe origins/URLs fail",async t=>{
 setup(t,false);process.env.TAVILY_API_KEY="test";let calls=0;global.fetch=async()=>{calls++;throw new Error("No fetch");};
 assert.equal((await importOpportunity(request({url:"https://example.org/programme"}))).status,503);
 assert.equal(calls,0);assert.equal((await importOpportunity(request({url:"https://127.0.0.1"}))).status,400);
 assert.equal((await importOpportunity(request({text},"https://other.example"))).status,403);
});
test("malformed extracted output is rejected rather than becoming a fabricated opportunity",async t=>{
 setup(t);global.fetch=async()=>completion({title:"Incomplete"});
 assert.equal((await importOpportunity(request({text}))).status,502);
});
const entry=experienceSchema.parse({id:"selected",name:"Engineering simulation",organisation:"Provider",whatDid:"I compared two design options and explained my choice using their costs.",learned:"I learned that a cheaper design can involve a different trade-off.",updatedAt:"2026-10-03"});
const reflection={summary:"I compared two design options in a simulation.",skills:[{skill:"Problem solving",evidenceQuote:"I compared two design options",whatHappened:"I had two design choices.",action:"I compared their costs.",learning:"Cost has trade-offs."}],star:{situation:"Two designs in a simulation",task:"Compare choices",action:"I compared costs",result:"I explained my choice"},cvBullet:"Compared design options in an engineering simulation.",applicationExample:"I compared design options and explained my choice.",interviewTalkingPoint:"I considered cost trade-offs.",nextSteps:["Learn more about engineering design"]};
test("rich reflections send only selected student evidence and return reusable grounded formats",async t=>{
 setup(t);let submitted="";
 global.fetch=async(_input,init)=>{submitted=JSON.parse(init?.body as string).messages[1].content;return completion(reflection);};
 const response=await reflect(request(entry));assert.equal(response.status,200);assert.equal(response.headers.get("Cache-Control"),"no-store");
 const result=await response.json();assert.deepEqual(result.reflection,reflection);assert.match(submitted,/I compared two design options/);assert.doesNotMatch(submitted,/other-student|test-secret/);
});
test("reflection rejects invented or metadata-only evidence quotes and too little student evidence",async t=>{
 setup(t);global.fetch=async()=>completion({...reflection,skills:[{...reflection.skills[0],evidenceQuote:"Engineering simulation"}]});
 assert.equal((await reflect(request(entry))).status,502);
 global.fetch=async()=>completion({...reflection,skills:[{...reflection.skills[0],evidenceQuote:"I led a team of twenty engineers"}]});
 assert.equal((await reflect(request(entry))).status,502);
 assert.equal((await reflect(request({...entry,whatDid:"",learned:""}))).status,400);
});
