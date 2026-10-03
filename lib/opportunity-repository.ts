import { daysUntil, type RichOpportunity, type TrackedRecord } from "./domain";
export const pageSize=18;
export function opportunityCollection(curated:RichOpportunity[],records:TrackedRecord[],live:RichOpportunity[]=[]):RichOpportunity[] {
 const entries=new Map<string,RichOpportunity>();
 for(const item of [...curated,...records.map(r=>r.opportunity),...live])entries.set(item.id,item);
 return [...entries.values()];
}
export function opportunityPage(items:RichOpportunity[],page=1,size=pageSize){
 const totalPages=Math.max(1,Math.ceil(items.length/size)),current=Math.min(totalPages,Math.max(1,page));
 return {items:items.slice((current-1)*size,current*size),page:current,totalPages,total:items.length};
}
export function sourceFreshness(item:RichOpportunity,today?:string){
 const age=daysUntil(item.checkedAt.slice(0,10),today);
 if(item.source!=="catalogue")return {state:"Needs review",label:"Not checked by SixthStep",stale:false};
 if(age===null||age>0)return {state:"Unknown",label:"Check date is missing or invalid",stale:true};
 return {state:age< -45?"Stale":"Checked",label:age< -45?"Source information may be outdated":"Source reviewed; provider remains final authority",stale:age< -45};
}
export function sourceFacts(item:RichOpportunity){
 const fields:[string,string][]=[["School years",item.years.join(", ")],["Age",item.minAge!==undefined||item.maxAge!==undefined?(item.minAge??"?")+"–"+(item.maxAge??"?"):""],["Subjects",item.subjectRequirements],["Geography",item.geography],["Widening participation",item.wideningParticipation],["Opening",item.openingDate||item.openingPeriod],["Closing",item.deadlineDate||item.deadline],["Event",item.startDate],["Cost",item.cost],["Application requirements",item.applicationRequirements.join("; ")]];
 return fields.map(([field,value])=>({field,value:value||"Not stated",state:!value||/^(Not stated|Unknown|Varies)/i.test(value)?"Needs checking":item.source==="catalogue"?"Source recorded":"Student review required",url:item.url,checkedAt:item.checkedAt}));
}
