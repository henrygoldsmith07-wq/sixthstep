import { opportunitySchema, isDate, daysUntil, type RichOpportunity } from "./domain";
import { sourceFreshness } from "./opportunity-repository";

export function validateCatalogue(input:unknown,order?:string[]):RichOpportunity[]{
  if(!Array.isArray(input))throw new Error("Catalogue must be an array.");
  const records=input.map((value,index)=>{
    const parsed=opportunitySchema.strict().safeParse(value);
    if(!parsed.success)throw new Error("Catalogue record "+index+" is invalid: "+parsed.error.issues.map(i=>i.path.join(".")+": "+i.message).join("; "));
    const item=parsed.data;
    if(!item.id.trim()||item.source!=="catalogue"||!isDate(item.checkedAt)||!isDate(item.addedAt)||!item.sourceUrls.length)throw new Error("Catalogue provenance is incomplete: "+item.id);
    for(const value of [item.url,item.applicationUrl,...item.sourceUrls].filter(Boolean)){let u:URL;try{u=new URL(value);}catch{throw new Error("Invalid catalogue source URL: "+item.id);}if(u.protocol!=="https:"||u.username||u.password)throw new Error("Unsafe catalogue source URL: "+item.id);}
    if(item.minAge!==undefined&&item.maxAge!==undefined&&item.minAge>item.maxAge)throw new Error("Invalid age band: "+item.id);
    return item;
  });
  const ids=new Set(records.map(i=>i.id));if(ids.size!==records.length)throw new Error("Duplicate catalogue IDs.");
  if(!order)return records;
  if(order.length!==records.length||new Set(order).size!==order.length||order.some(id=>!ids.has(id)))throw new Error("Catalogue index must contain every stable ID exactly once.");
  const byId=new Map(records.map(i=>[i.id,i]));return order.map(id=>byId.get(id)!);
}
export function catalogueReview(items:RichOpportunity[],today?:string){
  const within=(date:string)=>{const d=daysUntil(date,today);return d!==null&&d>=0&&d<=30;};
  return {
    stale:items.filter(i=>sourceFreshness(i,today).stale),
    approachingOpenings:items.filter(i=>within(i.openingDate)),
    approachingDeadlines:items.filter(i=>within(i.deadlineDate)),
    needsReview:items.filter(i=>sourceFreshness(i,today).stale||i.unconfirmed.length||i.applicationState==="Unknown"||i.wideningParticipation!=="Not stated"&&i.eligibility==="Not stated"||i.openingDate&&i.deadlineDate&&i.openingDate>i.deadlineDate),
    conflicts:items.filter(i=>i.openingDate&&i.deadlineDate&&i.openingDate>i.deadlineDate||/conflict|contradict|mixed|previous cohort/i.test(i.unconfirmed.join(" ")))
  };
}
const reviewFields=["eligibility","years","minAge","maxAge","subjectRequirements","geography","wideningParticipation","openingDate","openingPeriod","deadlineDate","deadline","startDate","cost","applicationRequirements","applicationState"] as const;
export function proposeSourceReview(current:RichOpportunity,candidate:Partial<RichOpportunity>,observedAt:string){
  return {opportunityId:current.id,observedAt,status:"Pending review" as const,changes:reviewFields.filter(field=>candidate[field]!==undefined&&JSON.stringify(candidate[field])!==JSON.stringify(current[field])).map(field=>({field,previous:current[field],proposed:candidate[field]}))};
}
