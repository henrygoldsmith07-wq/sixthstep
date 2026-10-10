import type { Experience, RichOpportunity } from "./domain";
export const careerLinks=[
 {area:"Medicine",terms:["medicine","medical","healthcare","clinical","patient","nhs","biomedical","public health","medical ethics"],next:["Clinical research","Public health","Biomedical engineering"]},
 {area:"Engineering",terms:["engineering","engineer","aerospace","mechanical","electrical","civil","design","robotics"],next:["Biomedical engineering","Mechanical engineering","Sustainable design"]},
 {area:"Technology",terms:["technology","computing","computer science","software","coding","cyber","data science","artificial intelligence"],next:["Cybersecurity","Human-centred design","Data science"]},
 {area:"Science & research",terms:["science","research","biology","chemistry","physics","laboratory","biomedical"],next:["Clinical research","Environmental science","Materials science"]},
 {area:"Business & finance",terms:["business","finance","economics","accounting","entrepreneurship"],next:["Social enterprise","Economic research","Sustainable finance"]},
 {area:"Law",terms:["law","legal","justice","ethics"],next:["Medical ethics","Public policy","Human rights"]},
 {area:"Creative & media",terms:["creative","media","art","music","journalism","film"],next:["Science communication","Digital design","Journalism"]},
 {area:"Humanities & social sciences",terms:["humanities","social","history","psychology","politics","geography"],next:["Public health","Public policy","Behavioural science"]}
] as const;
// Normalising the text is the expensive part, and relatedAreas asks the same string about
// every term in every area (about 70 lookups per opportunity). Doing that work per term made
// recommendations and the Home dashboard take over a second at a few thousand entries, so the
// string is normalised once here and each term is tested against the result.
function normalised(text:string){return " "+text.toLowerCase().replace(/[^a-z0-9]+/g," ")+" ";}
// The same opportunity content is classified two or three times in one render (scoring, then
// coverage, then discovery sections). A bounded memo skips the repeats, but it returns a shallow
// copy of the cached array: callers must not share a single mutable reference, which earlier let
// one caller's mutation leak into the next.
const areaCache=new Map<string,ReturnType<typeof classifyAreas>>();
const areaCacheLimit=4000;
function classifyAreas(text:string){const haystack=normalised(text);return careerLinks.filter(link=>link.terms.some(term=>haystack.includes(" "+term+" ")));}
export function relatedAreas(text:string){
 const cached=areaCache.get(text);
 if(cached)return cached.slice();
 const result=classifyAreas(text);
 if(areaCache.size>=areaCacheLimit)areaCache.clear();
 areaCache.set(text,result);
 return result.slice();
}
export function opportunityContent(item:RichOpportunity){return [item.title,item.sector,item.subSector,item.description,...item.tags,...item.subjects].join(" ");}
export function explorationMap(experiences:Experience[]){
 return careerLinks.map(link=>{
  const entries=experiences.filter(e=>relatedAreas([...e.careerAreas,e.name].join(" ")).some(a=>a.area===link.area));
  const own=(field:"enjoyed"|"disliked"|"careerImpact"|"nextStep")=>entries.filter(e=>e[field].trim()).map(e=>({id:e.id,name:e.name,text:e[field],date:e.date}));
  const repeated=["enjoyed","disliked"].flatMap(field=>{
   const values=own(field as "enjoyed"|"disliked"),seen=new Set<string>();
   return values.flatMap(value=>{const normal=value.text.toLowerCase().replace(/\s+/g," ").trim();if(normal.length<10||seen.has(normal))return [];seen.add(normal);const sources=values.filter(v=>v.text.toLowerCase().replace(/\s+/g," ").trim()===normal);return sources.length>=2?[{field,text:value.text,sources:sources.map(s=>s.id)}]:[];});
  });
  return {area:link.area,entries,enjoyed:own("enjoyed"),disliked:own("disliked"),impact:own("careerImpact"),next:own("nextStep"),repeated,suggestions:[...link.next]};
 }).filter(group=>group.entries.length);
}
