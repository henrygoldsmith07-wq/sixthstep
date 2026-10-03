import { z } from "zod";
import { tavily } from "@/lib/providers";
import { apiFailure,rateLimit,readBody,ApiError } from "@/lib/security";
import { processSearchResults } from "@/lib/search-quality";
import type { RichOpportunity } from "@/lib/domain";
export const runtime="nodejs";export const maxDuration=30;
const cache=new Map<string,{results:RichOpportunity[];discarded:number;until:number}>();
export async function POST(req:Request){
 try{
  await rateLimit(req,"search",5);
  const body=z.object({query:z.string().max(160),location:z.string().max(100),sector:z.string().max(80),format:z.string().max(80),age:z.string().max(2)}).safeParse(await readBody(req));
  if(!body.success)throw new ApiError(400,"Please shorten the search terms.");
  const terms=body.data,key=JSON.stringify(terms),entry=cache.get(key);
  if(entry&&entry.until>Date.now())return Response.json({results:entry.results,discarded:entry.discarded,cached:true},{headers:{"Cache-Control":"no-store"}});
  const query=[terms.query||"work experience university outreach competitions",terms.sector==="All sectors"?"":terms.sector,"sixth form Year 12 Year 13",terms.location||"UK",terms.age?"age "+terms.age:"",["All formats","Any"].includes(terms.format)?"":terms.format,"official programme"].filter(Boolean).join(" ");
  const data=await tavily("search",{query,search_depth:"basic",max_results:12,include_answer:false,include_raw_content:false});
  const processed=processSearchResults(data.results||[],terms.sector);
  if(cache.size>=100)cache.delete(cache.keys().next().value!);
  cache.set(key,{...processed,until:Date.now()+3600000});
  return Response.json({...processed,cached:false},{headers:{"Cache-Control":"no-store"}});
 }catch(error){return apiFailure(error);}
}
