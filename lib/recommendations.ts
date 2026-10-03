import { availability, daysUntil, type RichOpportunity, type StudentProfile, type TrackedRecord, type Experience } from "./domain";
import type { DiscoveryFeedback } from "./workspace-events";
import { relatedAreas, opportunityContent } from "./careers";
export type RecommendationContext={records?:TrackedRecord[];experiences?:Experience[];feedback?:DiscoveryFeedback[]};
export type Match={reasons:string[];checks:string[];conflicts:string[];rank:number;eligible:boolean};
function words(value:string) {return value.toLowerCase().replace(/mathematics/g,"maths").replace(/computer science/g,"computing").split(/[^a-z0-9]+/).filter(v=>v.length>2);}
function overlap(a:string,b:string) {const tokens=words(a);return tokens.some(w=>words(b).includes(w));}
export function matchOpportunity(item:RichOpportunity,profile:StudentProfile,context:RecommendationContext={}):Match {
 const reasons:string[]=[],checks:string[]=[],conflicts:string[]=[];let rank=0;
 const content=opportunityContent(item);
 const signals=context.feedback||[];
 const direct=signals.find(f=>f.opportunityId===item.id);
 if(direct?.signal==="Interested"){rank+=3;reasons.push("You marked this opportunity Interested");}
 if(direct?.signal==="Maybe"){rank-=1;checks.push("You marked this as Maybe");}
 const more=signals.filter(f=>f.signal==="Show me more like this"&&f.opportunityId!==item.id&&(f.sector===item.sector||f.provider===item.provider)).slice(-2);
 for(const f of more){rank+=2;reasons.push("You asked for more like "+f.title+" · shared "+(f.provider===item.provider?"provider":"sector"));}
 const fewer=signals.filter(f=>f.signal==="Show fewer like this"&&f.opportunityId!==item.id&&(f.sector===item.sector||f.provider===item.provider)).slice(-2);
 for(const f of fewer){rank-=2;checks.push("Lower in your feed because you asked for fewer like "+f.title);}
 if(["Not for me","Already done something similar"].includes(direct?.signal||""))checks.push("Hidden from your personalised feed by your explicit feedback");
 if(item.wideningParticipation!=="Not stated"||item.category==="Widening participation")checks.push("Widening-participation criteria apply; check the provider");
 if(item.geography==="Not stated"&&item.format!=="Virtual")checks.push("Geographic eligibility unclear");
 if(!item.deadlineDate&&item.applicationState!=="Rolling")checks.push("Application window not yet confirmed");
 const careerAreas=relatedAreas([profile.careerInterests,...profile.interests].join(" "));
 const related=careerAreas.filter(a=>relatedAreas(content).some(b=>b.area===a.area)||a.area==="Medicine"&&item.subjects.some(s=>/biology|chemistry/i.test(s))||a.area==="Engineering"&&item.subjects.some(s=>/physics|maths|mathematics|computing|design/i.test(s)));
 for(const area of related){reasons.push("Connected to your interest in "+area.area.toLowerCase()+" through "+(item.subSector!=="Not stated"?item.subSector:item.sector).toLowerCase());rank+=profile.direction==="Exploring"?3:2;}
 const saved=(context.records||[]).find(r=>r.opportunity.id!==item.id&&r.intent!=="Maybe"&&!["Not pursuing","Unsuccessful"].includes(r.status)&&r.opportunity.sector===item.sector);
 if(saved){reasons.push("In the same sector as "+saved.opportunity.title+", which you saved");rank+=2;}
 const completed=(context.experiences||[]).find(e=>e.interestChange!=="Decreased"&&e.careerAreas.some(a=>relatedAreas(a).some(area=>relatedAreas(content).some(b=>b.area===area.area)))&&(e.interestChange==="Increased"&&!!(e.enjoyed.trim()||e.careerImpact.trim())));
 if(completed){reasons.push("Builds on "+completed.name+", where you recorded increased interest");rank+=2;}
 const decreased=(context.experiences||[]).find(e=>e.interestChange==="Decreased"&&!!(e.disliked.trim()||e.careerImpact.trim())&&e.careerAreas.some(area=>area===item.sector));
 if(decreased){rank-=2;checks.push("Lower after you recorded decreased interest in "+decreased.name);}
 const similarDone=signals.find(f=>f.signal==="Already done something similar"&&f.opportunityId!==item.id&&f.provider===item.provider&&f.category===item.category);
 if(similarDone){rank--;checks.push("Same provider and type as "+similarDone.title+", which you marked already done something similar");}
 if(profile.interests.some(s=>s===item.sector||overlap(s,item.sector))){reasons.push("Matches your "+item.sector.toLowerCase()+" interest");rank+=4;}
 if(profile.careerInterests&&overlap(profile.careerInterests,content)){reasons.push("Relates to the career you want to explore");rank+=profile.direction==="Targeting a field"?7:4;}
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
 if(item.years.length&&/^(Year [0-9]+|S[56])/.test(profile.year)){
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
 const checked=daysUntil(item.checkedAt.slice(0,10));if(item.source==="catalogue"&&(checked===null||checked< -45))checks.push("Source may be stale; verify current criteria and dates");
 const deadline=daysUntil(item.deadlineDate);if(deadline!==null&&deadline>=0&&deadline<=30)reasons.push("Published applications close in "+deadline+" day"+(deadline===1?"":"s"));
 if(availability(item)==="Closed")conflicts.push("Applications are closed / the published deadline has passed");
 return {reasons:[...new Set(reasons)],checks:[...new Set(checks)],conflicts,rank,eligible:!conflicts.some(c=>/age band|school year|closed/.test(c))};
}
export function recommendations(items:RichOpportunity[],profile:StudentProfile,exclude:string[]=[],context:RecommendationContext={}) {
 const ranked=items.map(item=>({item,match:matchOpportunity(item,profile,context)})).filter(v=>v.match.eligible&&v.match.rank>=3&&v.item.sourceKind==="Programme"&&!exclude.includes(v.item.id)&&!(context.feedback||[]).some(f=>f.opportunityId===v.item.id&&["Not for me","Already done something similar"].includes(f.signal)))
 .sort((a,b)=>b.match.rank-a.match.rank||a.item.title.localeCompare(b.item.title));
 return diversifyRecommendations(ranked,profile.direction);
}
export function diversifyRecommendations(ranked:{item:RichOpportunity;match:Match}[],direction:StudentProfile["direction"]="Exploring"){
 const pool=[...ranked],result:typeof ranked=[],providers=new Map<string,number>(),types=new Map<string,number>();
 // Diversify the visible feed, not eligibility or the underlying connection score.
 while(pool.length&&result.length<12){
  const value=(v:typeof ranked[number])=>v.match.rank-(providers.get(v.item.provider)||0)*(direction==="Exploring"?3:1)-(types.get(v.item.category)||0)*(direction==="Exploring"?1:0);
  let index=0;for(let i=1;i<pool.length;i++)if(value(pool[i])>value(pool[index]))index=i;
  const [chosen]=pool.splice(index,1),next={...chosen,match:index>0&&direction==="Exploring"?{...chosen.match,reasons:[...chosen.match.reasons,"A different provider or opportunity type adds variety to your exploration"]}:chosen.match};
  providers.set(next.item.provider,(providers.get(next.item.provider)||0)+1);types.set(next.item.category,(types.get(next.item.category)||0)+1);result.push(next);
 }
 return [...result,...pool];
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
export function discoverySections(items:RichOpportunity[],profile:StudentProfile,records:TrackedRecord[],today?:string,experiences:Experience[]=[],feedback:DiscoveryFeedback[]=[]) {
 const sections:{title:string;description:string;items:RichOpportunity[]}[]=[];
 items=items.filter(i=>!feedback.some(f=>f.opportunityId===i.id&&["Not for me","Already done something similar"].includes(f.signal)));
 const matches=recommendations(items,profile,records.map(r=>r.opportunity.id),{records,experiences,feedback});
 const recommended=matches.slice(0,3).map(v=>v.item);
 if(recommended.length>=2)sections.push({title:"Recommended for you",description:"Based on your interests, subjects and preferences. Always check the full criteria.",items:recommended});
 const add=(title:string,description:string,list:RichOpportunity[])=>{if(list.length>=2)sections.push({title,description,items:list.slice(0,3)});};
 add("Closing soon","Published deadlines within the next 30 days.",items.filter(i=>{const d=daysUntil(i.deadlineDate,today);return i.sourceKind==="Programme"&&d!==null&&d>=0&&d<=30&&availability(i,today)!=="Closed";}).sort(deadlineOrder));
 add("Virtual opportunities","Explore from wherever you are.",items.filter(i=>i.format==="Virtual"&&i.sourceKind==="Programme"&&availability(i,today)!=="Closed"));
 add("Related to your subjects","A starting point for going beyond the syllabus.",items.filter(i=>profile.subjects.some(s=>i.subjects.some(v=>overlap(s,v)))&&i.sourceKind==="Programme"&&availability(i,today)!=="Closed"));
 if(profile.interests.length)add("Explore something different","Try an interest outside your usual sectors.",items.filter(i=>!profile.interests.includes(i.sector)&&i.sourceKind==="Programme"&&availability(i,today)!=="Closed"));
 // Source-check dates are not publication dates: never label rechecked records as new.
 add("New opportunities","Recently added to the collection, not necessarily recently launched.",items.filter(i=>{const d=daysUntil(i.addedAt,today);return !!i.addedAt&&d!==null&&d<=0&&d>=-30&&i.sourceKind==="Programme";}));
 const available=items.filter(i=>i.sourceKind==="Programme"&&availability(i,today)!=="Closed");
 if(profile.location)add("Local opportunities","Matches your stated town or region; check the actual journey.",available.filter(i=>i.format!=="Virtual"&&i.location!=="Not stated"&&overlap(profile.location,i.location)));
 add("Medicine and healthcare","Explore healthcare, clinical and biomedical connections.",available.filter(i=>relatedAreas(opportunityContent(i)).some(a=>a.area==="Medicine")));
 add("Engineering and technology","Design, engineering and computing possibilities.",available.filter(i=>["Engineering","Technology"].includes(i.sector)));
 add("Science and research","Try research and scientific challenges.",available.filter(i=>i.sector==="Science & research"));
 for(const [title,types] of [["University outreach",["University outreach","Widening participation"]],["Summer schools",["Summer school"]],["Competitions and academic challenges",["Competition"]],["Work experience",["Work experience","Virtual work experience","Job simulation","Research placement"]],["Employer insight programmes",["Employer insight","Apprenticeship insight"]]] as [string,string[]][])add(title,"Source-linked possibilities; full criteria still apply.",available.filter(i=>types.includes(i.category)));
 add("Applications opening soon","A stated full opening date falls within the next 30 days. Check the provider before applying.",available.filter(i=>{const d=daysUntil(i.openingDate,today);return d!==null&&d>=0&&d<=30;}));
 add("Applications not yet open","No opening countdown is shown when the exact date is not stated.",available.filter(i=>availability(i,today)==="Not yet open"));
 add("Worth applying for soon","Explained matches with a published deadline in the next 30 days; check all criteria first.",matches.filter(v=>{const d=daysUntil(v.item.deadlineDate,today);return d!==null&&d>=0&&d<=30;}).map(v=>v.item));
 add("Based on experiences you enjoyed","Uses only your recorded increased interest and personal notes.",matches.filter(v=>v.match.reasons.some(r=>r.includes("recorded increased interest"))).map(v=>v.item));
 add("Explore something adjacent","Related fields are possibilities to explore, not a career decision.",matches.filter(v=>v.match.reasons.some(r=>r.startsWith("Connected to"))&&!profile.interests.includes(v.item.sector)).map(v=>v.item));
 add("Short opportunities","Published commitments of a few hours or up to three days.",available.filter(i=>["A few hours","1–3 days"].includes(i.durationBand)));
 add("Longer programmes","Published multi-week or sustained commitments.",available.filter(i=>["Several weeks","Longer programme"].includes(i.durationBand)));
 add("Competitive opportunities","Published competition or selection process; no acceptance prediction.",available.filter(i=>i.category==="Competition"||i.selection!=="Not stated"));
 add("Opportunities you may have overlooked","Not saved or given feedback, with at least one explained connection.",matches.filter(v=>!feedback.some(f=>f.opportunityId===v.item.id)).slice(3).map(v=>v.item));
 add("Provider directories","Search individual programmes on these sources; directory-level details are not programme eligibility.",items.filter(i=>i.sourceKind==="Directory"));
 return sections;
}
