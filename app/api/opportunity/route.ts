import { z } from "zod";
import { createHash } from "node:crypto";
import { extractOpportunity } from "@/lib/providers";
import { generateJson, ensureAiConfigured } from "@/lib/ai";
import { enrich, categories } from "@/lib/domain";
import { extractedSchema, confirmedDate, quoteInSource, confirmedAge } from "@/lib/extraction";
import { readBody,rateLimit,apiFailure,ApiError,safePublicUrl } from "@/lib/security";
export const runtime="nodejs";export const maxDuration=60;
export async function POST(req:Request) {
 try{
  await rateLimit(req,"summary");
  const parsed=z.object({url:z.string().max(2000).optional(),text:z.string().max(12000).optional()}).safeParse(await readBody(req));
  if(!parsed.success)throw new ApiError(400,"Enter a public HTTPS URL or at most 12,000 characters of opportunity text.");
  const url=parsed.data.url?safePublicUrl(parsed.data.url):"";
  ensureAiConfigured();
  const text=parsed.data.text?.trim()||(url?await extractOpportunity(url):"");
  if(text.length<60)throw new ApiError(400,"Add at least 60 characters of opportunity information.");
  const value=await generateJson(extractedSchema,
   'Extract a sixth-form opportunity using only supplied facts. Return all fields as JSON: title, provider, description, category, sector, subSector, activities, skills, eligibility, minAge, maxAge, ageQuote, years, yearQuote, subjects, subjectRequirements, geography, location, format, duration, cost, deadline, deadlineDate, deadlineQuote, startDate, startQuote, applicationUrl, certificate, selection, nextSteps, unconfirmed. category must be one of '+JSON.stringify(categories)+'. format must be Virtual, In person, Hybrid or Not stated. Missing string facts: "Not stated"; missing dates/links/quotes: ""; missing arrays: []; missing age bounds: null. Never infer age from school year, school year from age, or a date year from today. Include exact verbatim source quotes for age, school years and dates. Date fields use YYYY-MM-DD only if full day, month and year are explicit. Do not treat a directory or article as a specific programme. Include only an application URL explicitly present in the source. Distinguish simulations from employment. Label missing facts in unconfirmed.',text);
  const unconfirmed=[...value.unconfirmed,"Current application availability"];
  const deadlineDate=confirmedDate(value.deadlineDate,value.deadlineQuote,text),startDate=confirmedDate(value.startDate,value.startQuote,text);
  if(value.deadlineDate&&!deadlineDate)unconfirmed.push("Deadline date not supported by an exact dated quote");
  if(value.startDate&&!startDate)unconfirmed.push("Start date not supported by an exact dated quote");
  let applicationUrl="";
  if(value.applicationUrl&&value.applicationUrl!=="Not stated"){
   try{const safe=safePublicUrl(value.applicationUrl);if(text.includes(value.applicationUrl))applicationUrl=safe;else unconfirmed.push("Application link not confirmed in source");}catch{unconfirmed.push("Application link was not a safe public HTTPS URL");}
  }
  const ageConfirmed=confirmedAge(value.ageQuote,text,value.minAge,value.maxAge);
  if((value.minAge!==null||value.maxAge!==null)&&!ageConfirmed)unconfirmed.push("Numeric age restriction not confirmed");
  const years=quoteInSource(value.yearQuote,text)?value.years.filter(year=>value.yearQuote.toLowerCase().includes(year.toLowerCase())):[];
  const opportunity=enrich({
   ...value,id:"import-"+createHash("sha256").update(url||text).digest("hex").slice(0,16),
   type:value.category,minAge:ageConfirmed&&value.minAge!==null?value.minAge:undefined,maxAge:ageConfirmed&&value.maxAge!==null?value.maxAge:undefined,
   years,deadlineDate,startDate,applicationUrl,url,source:"imported",sourceKind:value.category==="Provider directory"?"Directory":"Imported",
   checkedAt:"",sourceUrls:url?[url]:[],unconfirmed:[...new Set(unconfirmed)],tags:[value.sector],applicationState:"Unknown"
  });
  return Response.json({opportunity,nextSteps:value.nextSteps,sourceUrl:url||null},{headers:{"Cache-Control":"no-store"}});
 }catch(error){return apiFailure(error);}
}
