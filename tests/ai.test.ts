import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { generateJson, aiStatus } from "../lib/ai";
import { GET as status } from "../app/api/status/route";
import { ApiError } from "../lib/security";

const envNames=["OPENAI_API_KEY","OPENAI_BASE_URL","OPENAI_MODEL","OPENAI_PROVIDER_NAME","OPENAI_JSON_MODE","OPENAI_TOKEN_PARAMETER","GROQ_API_KEY","GROQ_MODEL","TAVILY_API_KEY","UPSTASH_REDIS_REST_URL","UPSTASH_REDIS_REST_TOKEN"];
function setup(t:TestContext,values:Record<string,string>={}) {
 const saved=Object.fromEntries(envNames.map(name=>[name,process.env[name]]));
 const fetch=global.fetch;
 for(const name of envNames) delete process.env[name];
 Object.assign(process.env,values);
 t.after(()=>{
  global.fetch=fetch;
  for(const name of envNames) {const value=saved[name];if(value===undefined)delete process.env[name];else process.env[name]=value;}
 });
}
const generic={OPENAI_API_KEY:"test-compatible-secret",OPENAI_BASE_URL:"https://provider.example/v1/",OPENAI_MODEL:"provider-test-model"};
function completion(value:unknown) {return Response.json({choices:[{finish_reason:"stop",message:{content:JSON.stringify(value)}}]});}

test("default OpenAI base and a complete Chat Completions URL are accepted",async t=>{
 setup(t,{OPENAI_API_KEY:"test",OPENAI_MODEL:"test-model"});
 const endpoints:string[]=[];
 global.fetch=async input=>{endpoints.push(String(input));return completion({ok:true});};
 await generateJson(z.object({ok:z.boolean()}),"Return JSON.","test");
 process.env.OPENAI_BASE_URL="https://provider.example/compatible/chat/completions/";
 await generateJson(z.object({ok:z.boolean()}),"Return JSON.","test");
 assert.deepEqual(endpoints,["https://api.openai.com/v1/chat/completions","https://provider.example/compatible/chat/completions"]);
});

test("legacy providers can disable JSON mode and use max_tokens with fenced JSON",async t=>{
 setup(t,{...generic,OPENAI_JSON_MODE:"false",OPENAI_TOKEN_PARAMETER:"max_tokens"});
 global.fetch=async (_input,init)=>{
  const body=JSON.parse(init?.body as string);
  assert.equal(body.max_tokens,3000);assert.equal(body.max_completion_tokens,undefined);assert.equal(body.response_format,undefined);
  return Response.json({choices:[{message:{content:"\x60\x60\x60json\n{\"ok\":true}\n\x60\x60\x60"}}]});
 };
 assert.deepEqual(await generateJson(z.object({ok:z.boolean()}),"Return JSON.","test"),{ok:true});
});

test("partial or invalid configuration fails before fetch and never falls back to Groq",async t=>{
 setup(t,{...generic,GROQ_API_KEY:"legacy-key"});
 let calls=0;global.fetch=async()=>{calls++;throw new Error("Must not fetch");};
 delete process.env.OPENAI_MODEL;
 await assert.rejects(generateJson(z.object({}),"JSON","test"),(e:unknown)=>e instanceof ApiError && e.status===503 && /not switched on/i.test(e.message));
  // Students see this text verbatim, so it must not leak deployment instructions.
  await assert.rejects(generateJson(z.object({}),"JSON","test"),(e:unknown)=>e instanceof ApiError && !/OPENAI_MODEL|site owner|Vercel/.test(e.message));
 assert.equal(aiStatus().aiSetup,"invalid");
 process.env.OPENAI_MODEL="test";
 for(const base of ["http://provider.example/v1","https://user:password@provider.example/v1","https://provider.example/v1?api-key=test","https://provider.example/v1#secret","https://127.0.0.1/v1","https://localhost/v1"]) {
  process.env.OPENAI_BASE_URL=base;
  await assert.rejects(generateJson(z.object({}),"JSON","test"),(e:unknown)=>e instanceof ApiError && e.status===503);
 }
 process.env.OPENAI_BASE_URL=generic.OPENAI_BASE_URL;
 process.env.OPENAI_TOKEN_PARAMETER="unexpected";
 await assert.rejects(generateJson(z.object({}),"JSON","test"),/OPENAI_TOKEN_PARAMETER/);
 delete process.env.OPENAI_TOKEN_PARAMETER;process.env.OPENAI_JSON_MODE="maybe";
 await assert.rejects(generateJson(z.object({}),"JSON","test"),/OPENAI_JSON_MODE/);
 assert.equal(calls,0);
});

test("status exposes no key, endpoint or model, including invalid configuration",async t=>{
 setup(t,generic);
 let state=await status();
 let data=await state.json();
 assert.deepEqual(data,{ai:true,aiProvider:"OpenAI-compatible AI",aiSetup:"ready",search:false});
 assert.doesNotMatch(JSON.stringify(data),/test-compatible-secret|provider\.example|provider-test-model/);
 process.env.OPENAI_BASE_URL="https://provider.example/v1?secret=hidden";
 state=await status();data=await state.json();
 assert.equal(data.ai,false);assert.equal(data.aiSetup,"invalid");
 assert.doesNotMatch(JSON.stringify(data),/hidden|test-compatible-secret|provider\.example/);
});

test("JSON-mode-off output is still schema checked and truncated output is rejected",async t=>{
 setup(t,{...generic,OPENAI_JSON_MODE:"false"});
 const schema=z.object({ok:z.boolean()});
 for(const content of ["not JSON",'{"ok":"wrong type"}']) {
  global.fetch=async()=>Response.json({choices:[{message:{content}}]});
  await assert.rejects(generateJson(schema,"JSON","test"),(e:unknown)=>e instanceof ApiError && e.status===502);
 }
 global.fetch=async()=>Response.json({choices:[{finish_reason:"length",message:{content:'{"ok":true}'}}]});
 await assert.rejects(generateJson(schema,"JSON","test"),(e:unknown)=>e instanceof ApiError && e.status===502);
});
