import { availability, daysUntil, type RichOpportunity, type StudentProfile, type TrackedRecord } from "./domain";
export type Match={reasons:string[];checks:string[];conflicts:string[];rank:number;eligible:boolean};
function words(value:string) {return value.toLowerCase().replace(/mathematics/g,"maths").replace(/computer science/g,"computing").split(/[^a-z0-9]+/).filter(v=>v.length>2);}
function overlap(a:string,b:string) {const tokens=words(a);return tokens.some(w=>words(b).includes(w));}
export function matchOpportunity(item:RichOpportunity,profile:StudentProfile):Match {
 const reasons:string[]=[],checks:string[]=[],conflicts:string[]=[];let rank=0;
 const content=[item.title,item.description,item.sector,item.subSector,...item.tags,...item.skills].join(" ");
 if(profile.interests.includes(item.sector)){reasons.push("Matches your "+item.sector.toLowerCase()+" interest");rank+=4;}
 if(profile.careerInterests&&overlap(profile.careerInterests,content)){reasons.push("Relates to the career you want to explore");rank+=profile.direction==="Targeting a field"?5:4;}
 if(profile.outsideInterests&&overlap(profile.outsideInterests,content)){reasons.push("Connects with your interests outside school");rank++;}
 const subjects=profile.subjects.filter(subject=>item.subjects.some(s=>overlap(subject,s)));
 if(subjects.length){reasons.push("Related to "+subjects.join(" and "));rank+=3;}
 if(profile.preferredTypes.includes(item.category)){reasons.push("One of your preferred opportunity types");rank+=2;}
 if(profile.format!=="Any"&&profile.format!=="Not stated"){
  if(item.format===profile.format || item.format==="Hybrid"){reasons.push("Fits your "+profile.format.toLowerCase()+" preference");rank+=2;}
  else if(item.format!=="Not stated")conflicts.push("Format differs from your preference");
  else checks.push("Delivery format is not stated");
 }
 if(profile.duration!=="Any"){if(profile.duration===item.durationBand){reasons.push("Fits your preferred time commitment");rank++;}else if(item.durationBand==="Not stated")checks.push("Time commitment needs checking");}
 const age=Number(profile.age);
 if(profile.age){
  if(item.minAge===undefined&&item.maxAge===undefined)checks.push("Age requirement is not clearly stated");
  else if((item.minAge!==undefined&&age<item.minAge)||(item.maxAge!==undefined&&age>item.maxAge))conflicts.push("Outside the published age band");
  else {reasons.push("Your age is within the published band; check the age-at-start rule");rank++;}
 }
 if(item.years.length&&profile.year.startsWith("Year")){
  if(item.years.includes(profile.year)){reasons.push("Your school year is listed; check regional equivalents");rank++;}
  else conflicts.push("Your school year is not listed");
 }else if(profile.configured&&!item.years.length)checks.push("School year eligibility is not stated");
 if(item.format!=="Virtual"&&profile.location){
  if(overlap(profile.location,item.location)){reasons.push("In your preferred area");rank+=2;}
  else if(profile.travel==="Local only"&&item.location!=="Not stated")conflicts.push("Travel area needs checking");
  else checks.push("Check the journey and geographic restrictions");
 }
 if(item.geography!=="Not stated"||item.subjectRequirements!=="Not stated")checks.push("Check all subject, location and additional eligibility criteria");
 if(item.sourceKind==="Directory")checks.push("Choose a specific programme from this directory");
 if(item.source!=="catalogue")checks.push("Details have not been checked by SixthStep");
 if(availability(item)==="Closed")conflicts.push("Applications are closed / the published deadline has passed");
 return {reasons:[...new Set(reasons)],checks:[...new Set(checks)],conflicts,rank,eligible:!conflicts.some(c=>/age band|school year|closed/.test(c))};
}
export function recommendations(items:RichOpportunity[],profile:StudentProfile,exclude:string[]=[]) {
 return items.map(item=>({item,match:matchOpportunity(item,profile)})).filter(v=>v.match.eligible&&v.match.rank>=3&&v.item.sourceKind==="Programme"&&!exclude.includes(v.item.id))
 .sort((a,b)=>b.match.rank-a.match.rank||a.item.title.localeCompare(b.item.title));
}
export type FinderFilters={query:string;sector:string;category:string;format:string;age:string;year:string;subject:string;free:boolean;open:boolean;deadline:string;duration:string;location:string;provider:string;verified:boolean};
export const defaultFilters:FinderFilters={query:"",sector:"All sectors",category:"Any",format:"Any",age:"",year:"Any",subject:"",free:false,open:false,deadline:"Any",duration:"Any",location:"",provider:"Any",verified:false};
export function discover(items:RichOpportunity[],filters:FinderFilters,today?:string) {
 return items.filter(item=>{
  const searchable=[item.title,item.provider,item.description,item.sector,...item.tags,...item.subjects].join(" ").toLowerCase();
  if(filters.query&&!filters.query.toLowerCase().split(/\s+/).filter(Boolean).every(t=>searchable.includes(t)))return false;
  if(filters.sector!=="All sectors"&&item.sector!==filters.sector)return false;
  if(filters.category!=="Any"&&item.category!==filters.category)return false;
  if(filters.format!=="Any"&&item.format!==filters.format)return false;
  if(filters.year!=="Any"&&!item.years.includes(filters.year))return false;
  if(filters.subject&&!item.subjects.some(s=>overlap(filters.subject,s)))return false;
  if(filters.provider!=="Any"&&item.provider!==filters.provider)return false;
  if(filters.free&&item.cost!=="Free")return false;
  if(filters.open&&!["Open","Rolling"].includes(availability(item,today)))return false;
  if(filters.duration!=="Any"&&item.durationBand!==filters.duration)return false;
  if(filters.location&&!item.location.toLowerCase().includes(filters.location.toLowerCase())&&item.format!=="Virtual")return false;
  if(filters.verified&&(item.source!=="catalogue"||item.sourceKind!=="Programme"))return false;
  if(filters.age){
   const age=Number(filters.age);
   // A verified eligibility filter excludes unknown age bands.
   if(item.minAge===undefined&&item.maxAge===undefined)return false;
   if(item.minAge!==undefined&&age<item.minAge||item.maxAge!==undefined&&age>item.maxAge)return false;
  }
  const days=daysUntil(item.deadlineDate,today);
  if(filters.deadline==="Next 7 days"&&(days===null||days<0||days>7))return false;
  if(filters.deadline==="Next 30 days"&&(days===null||days<0||days>30))return false;
  if(filters.deadline==="No fixed deadline"&&item.deadlineDate)return false;
  if(filters.deadline==="Deadline passed"&&(days===null||days>=0))return false;
  return true;
 });
}
export function deadlineOrder(a:RichOpportunity,b:RichOpportunity) {
 return (a.deadlineDate||"9999").localeCompare(b.deadlineDate||"9999");
}
export function discoverySections(items:RichOpportunity[],profile:StudentProfile,records:TrackedRecord[],today?:string) {
 const sections:{title:string;description:string;items:RichOpportunity[]}[]=[];
 const recommended=recommendations(items,profile,records.map(r=>r.opportunity.id)).slice(0,3).map(v=>v.item);
 if(recommended.length>=2)sections.push({title:"Recommended for you",description:"Based on your interests, subjects and preferences. Always check the full criteria.",items:recommended});
 const add=(title:string,description:string,list:RichOpportunity[])=>{if(list.length>=2)sections.push({title,description,items:list.slice(0,3)});};
 add("Closing soon","Published deadlines within the next 30 days.",items.filter(i=>{const d=daysUntil(i.deadlineDate,today);return i.sourceKind==="Programme"&&d!==null&&d>=0&&d<=30&&availability(i,today)!=="Closed";}).sort(deadlineOrder));
 add("Virtual opportunities","Explore from wherever you are.",items.filter(i=>i.format==="Virtual"&&i.sourceKind==="Programme"&&availability(i,today)!=="Closed"));
 add("Related to your subjects","A starting point for going beyond the syllabus.",items.filter(i=>profile.subjects.some(s=>i.subjects.some(v=>overlap(s,v)))&&i.sourceKind==="Programme"&&availability(i,today)!=="Closed"));
 if(profile.interests.length)add("Explore something different","Try an interest outside your usual sectors.",items.filter(i=>!profile.interests.includes(i.sector)&&i.sourceKind==="Programme"&&availability(i,today)!=="Closed"));
 // Source-check dates are not publication dates: never label rechecked records as new.
 add("New opportunities","Recently added to the collection, not necessarily recently launched.",items.filter(i=>{const d=daysUntil(i.addedAt,today);return !!i.addedAt&&d!==null&&d<=0&&d>=-30&&i.sourceKind==="Programme";}));
 return sections;
}
