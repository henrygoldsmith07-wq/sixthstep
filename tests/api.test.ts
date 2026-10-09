import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { POST as search } from "../app/api/search/route";

const genericEnv=["OPENAI_API_KEY","OPENAI_BASE_URL","OPENAI_MODEL","OPENAI_PROVIDER_NAME","OPENAI_JSON_MODE","OPENAI_TOKEN_PARAMETER"];
let previousEnv:Record<string,string|undefined>={};
beforeEach(()=>{previousEnv=Object.fromEntries(genericEnv.map(name=>[name,process.env[name]]));for(const name of genericEnv)delete process.env[name];});
afterEach(()=>{for(const name of genericEnv){const value=previousEnv[name];if(value===undefined)delete process.env[name];else process.env[name]=value;}});
let counter=0;
function req(path:string,body:unknown){return new Request("http://localhost:3000/api/"+path,{method:"POST",headers:{"Content-Type":"application/json","x-forwarded-for":"test-"+counter++},body:JSON.stringify(body)});}
test("web search removes unsafe and duplicate links and caches results",async t=>{
 const originalFetch=global.fetch,key=process.env.TAVILY_API_KEY;process.env.TAVILY_API_KEY="test-only-secret";let calls=0;
 t.after(()=>{global.fetch=originalFetch;if(key)process.env.TAVILY_API_KEY=key;else delete process.env.TAVILY_API_KEY;});
 global.fetch=async()=>{calls++;return Response.json({results:[{title:"Opportunity",url:"https://example.org/programme",content:"A public listing"},{title:"Duplicate",url:"https://example.org/programme"},{title:"Unsafe",url:"https://127.0.0.1"}]});};
 const query={query:"unit-test-unique",location:"London",sector:"Technology",format:"All formats",age:"16"};
 const response=await search(req("search",query));assert.equal(response.status,200);
 const data=await response.json();assert.equal(data.results.length,1);assert.match(data.results[0].eligibility,/not verified/);assert.equal(data.results[0].deadline,"Not stated");
 const cached=await search(req("search",query));assert.equal((await cached.json()).cached,true);assert.equal(calls,1);
});
