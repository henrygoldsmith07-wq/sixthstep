import { z } from "zod";
import { createHash } from "node:crypto";
import { summarySchema, type Summary } from "@/lib/types";
import { groq,extractOpportunity } from "@/lib/providers";
import { readBody,rateLimit,apiFailure,ApiError } from "@/lib/security";
export const runtime="nodejs"; export const maxDuration=60;
const inputSchema=z.object({text:z.string().max(12000).optional(),url:z.string().max(2000).optional()});
const cache=new Map<string,{value:Summary;until:number}>();
export async function POST(req:Request) {
 try{
  await rateLimit(req,"summary");
  const body=inputSchema.safeParse(await readBody(req));
  if(!body.success) throw new ApiError(400,"Enter a description of up to 12,000 characters or an opportunity link.");
  let text=body.data.text?.trim()||"";
  if(!text && body.data.url) text=await extractOpportunity(body.data.url);
  if(text.length<60) throw new ApiError(400,"Paste at least 60 characters of opportunity details.");
  // Cache public URL summaries only; never cache arbitrary personal text.
  const key=body.data.url&&!body.data.text?createHash("sha256").update(text).digest("hex"):null;
  if(key){ const entry=cache.get(key); if(entry && entry.until>Date.now()) return Response.json({summary:entry.value,sourceUrl:body.data.url,cached:true});}
  const summary=await groq(summarySchema,`Summarise a work experience listing for a UK sixth-form student. Use only supplied facts. Missing fields must say "Not stated". Never assume that the opportunity is suitable for ages 16-18. Distinguish a simulation from employment. Do not infer dates from today's date. JSON keys: title (string), overview (string), activities (string array), skills (string array), eligibility (string), duration (string), deadline (string), cost (string), steps (string array). Keep it concise and practical.`,text);
  if(key){if(cache.size>=100) cache.delete(cache.keys().next().value!);cache.set(key,{value:summary,until:Date.now()+3600000});}
  return Response.json({summary,sourceUrl:body.data.url||null},{headers:{"Cache-Control":"no-store"}});
 }catch(error){return apiFailure(error);}
}
