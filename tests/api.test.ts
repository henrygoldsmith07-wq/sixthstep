import { test } from "node:test";
import assert from "node:assert/strict";
import { POST as summarise } from "../app/api/summarise/route";
import { POST as search } from "../app/api/search/route";
import { POST as reflect } from "../app/api/reflect/route";
let counter=0;
function req(path:string,body:unknown){return new Request("http://localhost:3000/api/"+path,{method:"POST",headers:{"Content-Type":"application/json","x-forwarded-for":"test-"+counter++},body:JSON.stringify(body)});}
const summary={title:"Engineering experience",overview:"A virtual programme.",activities:["Complete a task"],skills:["Problem solving"],eligibility:"Not stated",duration:"Not stated",deadline:"Not stated",cost:"Not stated",steps:["Check provider details"]};
test("AI APIs reject invalid input and clearly report missing setup",async t=>{
 const key=process.env.GROQ_API_KEY;delete process.env.GROQ_API_KEY;t.after(()=>{if(key)process.env.GROQ_API_KEY=key;else delete process.env.GROQ_API_KEY;});
 assert.equal((await summarise(req("summarise",{text:"short"}))).status,400);
 assert.equal((await reflect(req("reflect",{notes:"short"}))).status,400);
 const response=await summarise(req("summarise",{text:"An engineering work experience programme with tasks and activities for students."}));
 assert.equal(response.status,503);assert.match((await response.json()).error,/Groq API key/);
});
test("summary success validates model output and keeps secrets off the response",async t=>{
 const originalFetch=global.fetch,key=process.env.GROQ_API_KEY;process.env.GROQ_API_KEY="test-only-secret";
 t.after(()=>{global.fetch=originalFetch;if(key)process.env.GROQ_API_KEY=key;else delete process.env.GROQ_API_KEY;});
 let calls=0;
 global.fetch=async (input,init)=>{
  assert.equal(input,"https://api.groq.com/openai/v1/chat/completions");
  const body=JSON.parse(init?.body as string);assert.match(body.messages[0].content,/Missing fields/);calls++;
  return Response.json({choices:[{message:{content:JSON.stringify(summary)}}]});
 };
 const response=await summarise(req("summarise",{text:"An engineering virtual programme with practical tasks and workplace activities for students."}));
 assert.equal(response.status,200);assert.deepEqual((await response.json()).summary,summary);assert.equal(calls,1);
});
test("malformed model output and upstream quotas have useful errors",async t=>{
 const originalFetch=global.fetch,key=process.env.GROQ_API_KEY;process.env.GROQ_API_KEY="test-only-secret";
 t.after(()=>{global.fetch=originalFetch;if(key)process.env.GROQ_API_KEY=key;else delete process.env.GROQ_API_KEY;});
 global.fetch=async()=>Response.json({choices:[{message:{content:'{"overview":"incomplete"}'}}]});
 assert.equal((await summarise(req("summarise",{text:"An engineering virtual programme with practical tasks and workplace activities for students."}))).status,502);
 global.fetch=async()=>Response.json({error:"quota"},{status:429});
 const response=await summarise(req("summarise",{text:"An engineering virtual programme with practical tasks and workplace activities for students."}));
 assert.equal(response.status,429);assert.match((await response.json()).error,/free allowance/);
});
test("web search removes unsafe and duplicate links and caches results",async t=>{
 const originalFetch=global.fetch,key=process.env.TAVILY_API_KEY;process.env.TAVILY_API_KEY="test-only-secret";let calls=0;
 t.after(()=>{global.fetch=originalFetch;if(key)process.env.TAVILY_API_KEY=key;else delete process.env.TAVILY_API_KEY;});
 global.fetch=async()=>{calls++;return Response.json({results:[{title:"Opportunity",url:"https://example.org/programme",content:"A public listing"},{title:"Duplicate",url:"https://example.org/programme"},{title:"Unsafe",url:"https://127.0.0.1"}]});};
 const query={query:"unit-test-unique",location:"London",sector:"Technology",format:"All formats",age:"16"};
 const response=await search(req("search",query));assert.equal(response.status,200);
 const data=await response.json();assert.equal(data.results.length,1);assert.match(data.results[0].eligibility,/not verified/);assert.equal(data.results[0].deadline,"Not stated");
 const cached=await search(req("search",query));assert.equal((await cached.json()).cached,true);assert.equal(calls,1);
});
test("URL summaries extract through Tavily before summarising",async t=>{
 const originalFetch=global.fetch,groqKey=process.env.GROQ_API_KEY,tavilyKey=process.env.TAVILY_API_KEY;
 process.env.GROQ_API_KEY="test";process.env.TAVILY_API_KEY="test";
 t.after(()=>{global.fetch=originalFetch;if(groqKey)process.env.GROQ_API_KEY=groqKey;else delete process.env.GROQ_API_KEY;if(tavilyKey)process.env.TAVILY_API_KEY=tavilyKey;else delete process.env.TAVILY_API_KEY;});
 const calls:string[]=[];
 global.fetch=async(input)=>{calls.push(String(input));return String(input).endsWith("/extract")?Response.json({results:[{raw_content:"A public virtual engineering programme that helps students explore workplace activities and practical tasks."}]}):Response.json({choices:[{message:{content:JSON.stringify(summary)}}]});};
 assert.equal((await summarise(req("summarise",{url:"https://example.org/public-programme"}))).status,200);
 assert.deepEqual(calls,["https://api.tavily.com/extract","https://api.groq.com/openai/v1/chat/completions"]);
});
