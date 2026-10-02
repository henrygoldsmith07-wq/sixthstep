import { z } from "zod";
import { createHash } from "node:crypto";
import { tavily } from "@/lib/providers";
import { apiFailure,rateLimit,readBody,ApiError,safePublicUrl } from "@/lib/security";
import type { Opportunity } from "@/lib/types";
export const runtime="nodejs"; export const maxDuration=30;
const cache=new Map<string,{results:Opportunity[];until:number}>();
export async function POST(req:Request) {
 try{
 await rateLimit(req,"search",5);
 const body=z.object({query:z.string().max(160),location:z.string().max(100),sector:z.string().max(80),format:z.string().max(80),age:z.string().max(2)}).safeParse(await readBody(req));
 if(!body.success) throw new ApiError(400,"Please shorten the search terms.");
 const terms=body.data;
 const key=JSON.stringify(terms), entry=cache.get(key);
 if(entry && entry.until>Date.now()) return Response.json({results:entry.results,cached:true});
 const query=[terms.query,terms.sector==="All sectors"?"":terms.sector,"sixth form work experience",terms.location||"UK",terms.age?"age "+terms.age:"16 17 18",terms.format==="All formats"?"":terms.format,"official application"].filter(Boolean).join(" ");
 const data=await tavily("search",{query,search_depth:"basic",max_results:8,include_answer:false,include_raw_content:false});
 const seen=new Set<string>(); const results:Opportunity[]=[];
 for(const raw of data.results||[]) {
  if(typeof raw.url!=="string" || typeof raw.title!=="string") continue;
  let url:string;try{url=safePublicUrl(raw.url);}catch{continue;}
  if(seen.has(url)) continue;seen.add(url);
  results.push({
   id:"web-"+createHash("sha256").update(url).digest("hex").slice(0,16),
   title:raw.title.slice(0,180),provider:new URL(url).hostname.replace(/^www\./,""),
   sector:terms.sector==="All sectors"?"Explore careers":terms.sector,type:"Search result",
   location:"Check source",duration:"Not stated",eligibility:"Check source · age suitability not verified",
   cost:"Not stated",deadline:"Not stated",url,description:typeof raw.content==="string"?raw.content.slice(0,700):"Open the source for opportunity details.",
   tags:["Web result","Check eligibility"],checkedAt:new Date().toISOString().slice(0,10),source:"web"
  });
 }
 if(cache.size>=100) cache.delete(cache.keys().next().value!);
 cache.set(key,{results,until:Date.now()+3600000});
 return Response.json({results,cached:false},{headers:{"Cache-Control":"no-store"}});
 }catch(error){return apiFailure(error);}
}
