import { opportunitySchema, isDate, daysUntil, type RichOpportunity } from "./domain";
import { sourceFreshness } from "./opportunity-repository";
import { safePublicHref } from "./public-link";

export function catalogueDuplicates(records:RichOpportunity[]){
  const groups=new Map<string,RichOpportunity[]>();
  for(const item of records){const key=[item.provider,item.title,item.sourceKind].map(v=>v.toLowerCase().replace(/[^a-z0-9]+/g," ").trim()).join("|");groups.set(key,[...(groups.get(key)||[]),item]);}
  // Shared directory URLs can describe distinct programmes; never dedupe by URL.
  return [...groups.values()].filter(group=>group.length>1).map(group=>group.map(item=>item.id));
}

export function validateCatalogue(input:unknown,order?:string[]):RichOpportunity[]{
  if(!Array.isArray(input))throw new Error("Catalogue must be an array.");
  const records=input.map((value,index)=>{
    const parsed=opportunitySchema.strict().safeParse(value);
    if(!parsed.success)throw new Error("Catalogue record "+index+" is invalid: "+parsed.error.issues.map(i=>i.path.join(".")+": "+i.message).join("; "));
    const item=parsed.data;
    if(!item.id.trim()||item.source!=="catalogue"||!isDate(item.checkedAt)||!isDate(item.addedAt)||!item.sourceUrls.length)throw new Error("Catalogue provenance is incomplete: "+item.id);
    for(const value of [item.url,item.applicationUrl,...item.sourceUrls].filter(Boolean))if(!safePublicHref(value))throw new Error("Unsafe catalogue source URL: "+item.id);
    if(!item.title.trim()||!item.provider.trim()||!["Programme","Directory"].includes(item.sourceKind))throw new Error("Catalogue identity or record type is incomplete: "+item.id);
    if(item.minAge!==undefined&&item.maxAge!==undefined&&item.minAge>item.maxAge)throw new Error("Invalid age band: "+item.id);
    return item;
  });
  const ids=new Set(records.map(i=>i.id));if(ids.size!==records.length)throw new Error("Duplicate catalogue IDs.");
  const duplicates=catalogueDuplicates(records);if(duplicates.length)throw new Error("Duplicate catalogue programme/provider records: "+duplicates.map(ids=>ids.join(", ")).join("; "));
  if(!order)return records;
  if(order.length!==records.length||new Set(order).size!==order.length||order.some(id=>!ids.has(id)))throw new Error("Catalogue index must contain every stable ID exactly once.");
  const byId=new Map(records.map(i=>[i.id,i]));return order.map(id=>byId.get(id)!);
}
// A record can be incomplete without being wrong. These grades separate the two so the
// review queue is a worklist rather than a wall: a stated caveat is already shown to the
// student on the card, but a contradiction, an impossible window or a source we have not
// re-checked still needs a human to look.
export type ReviewGrade="Conflict"|"Check"|"Note";
export function reviewGrade(item:RichOpportunity,today?:string):ReviewGrade {
  if(sourceFreshness(item,today).stale)return "Conflict";
  if(item.openingDate&&item.deadlineDate&&item.openingDate>item.deadlineDate)return "Conflict";
  if(/conflict|contradict|mixed|previous cohort/i.test(item.unconfirmed.join(" ")))return "Conflict";
  if(item.applicationState==="Unknown")return "Check";
  if(item.wideningParticipation!=="Not stated"&&item.eligibility==="Not stated")return "Check";
  if(item.unconfirmed.length)return "Note";
  return "Note";
}
export function catalogueReview(items:RichOpportunity[],today?:string){
  const within=(date:string)=>{const d=daysUntil(date,today);return d!==null&&d>=0&&d<=30;};
  const grade=(level:ReviewGrade)=>items.filter(i=>reviewGrade(i,today)===level);
  return {
    duplicates:catalogueDuplicates(items),
    stale:items.filter(i=>sourceFreshness(i,today).stale),
    approachingOpenings:items.filter(i=>within(i.openingDate)),
    approachingDeadlines:items.filter(i=>within(i.deadlineDate)),
    conflicts:grade("Conflict"),
    needsReview:grade("Conflict").concat(grade("Check")),
    incomplete:grade("Note"),
    counts:{total:items.length,conflict:grade("Conflict").length,check:grade("Check").length,note:grade("Note").length},
  };
}
const reviewFields=["eligibility","years","minAge","maxAge","subjectRequirements","geography","wideningParticipation","openingDate","openingPeriod","deadlineDate","deadline","startDate","cost","applicationRequirements","applicationState"] as const;
export function proposeSourceReview(current:RichOpportunity,candidate:Partial<RichOpportunity>,observedAt:string){
  return {opportunityId:current.id,observedAt,status:"Pending review" as const,changes:reviewFields.filter(field=>candidate[field]!==undefined&&JSON.stringify(candidate[field])!==JSON.stringify(current[field])).map(field=>({field,previous:current[field],proposed:candidate[field]}))};
}
