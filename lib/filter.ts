import type { Opportunity } from "./types";
export function filterOpportunities(items: Opportunity[], filters: {query:string;sector:string;format:string;freeOnly:boolean;age:string;verifiedAge:boolean}) {
 const query=filters.query.trim().toLowerCase();
 return items.filter(item => {
  const searchable=[item.title,item.description,item.provider,item.sector,...item.tags].join(" ").toLowerCase();
  if(query && !query.split(/\s+/).every(word=>searchable.includes(word))) return false;
  if(filters.sector!=="All sectors" && item.sector!==filters.sector) return false;
  if(filters.format==="Job simulations" && item.provider!=="Forage" && item.type!=="Job simulation") return false;
  if(filters.format==="Virtual experience" && item.provider==="Forage") return false;
  if(filters.format==="In person" && /virtual/i.test(item.location)) return false;
  if(filters.freeOnly && item.cost!=="Free") return false;
  const age=Number(filters.age);
  if(filters.verifiedAge && item.minAge===undefined && item.maxAge===undefined) return false;
  if(filters.age && ((item.minAge!==undefined && age<item.minAge) || (item.maxAge!==undefined && age>item.maxAge))) return false;
  return true;
 });
}
export function matchReason(item:Opportunity,interests:string[]):string|null {
 if(!interests.includes(item.sector)) return null;
 return "Matches your interest in "+item.sector.toLowerCase();
}
