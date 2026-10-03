import { createHash } from "node:crypto";
import { enrich, type RichOpportunity } from "./domain";
import { explicitDate } from "./extraction";
import { safePublicUrl } from "./security";
const platforms=["springpod.com","theforage.com","speakersforschools.org","ucas.com","unifrog.org","suttontrust.com"];
const official=["rcgp.org.uk","ukri.org","stem.org.uk","in2scienceuk.org","deloitte.com","pwc.co.uk","hsbc.com","rsc.org","ukmt.org.uk","ukbiologycompetitions.org","beamlineforschools.cern","smallpeicetrust.org.uk"];
function hostMatches(host:string,domain:string){return host===domain||host.endsWith("."+domain);}
export function classifySearch(title:string,url:string,content:string):{kind:RichOpportunity["resultKind"];authority:RichOpportunity["authority"];rank:number;irrelevant:boolean}{
 const parsed=new URL(url),host=parsed.hostname,path=parsed.pathname.toLowerCase(),text=(title+" "+content).toLowerCase();
 const authority=host.endsWith(".ac.uk")||host.endsWith(".nhs.uk")||host.endsWith(".gov.uk")||official.some(d=>hostMatches(host,d))?"Official provider":platforms.some(d=>hostMatches(host,d))?"Opportunity platform":"Other source";
 let kind:RichOpportunity["resultKind"]="Unclassified";
 if(/\/news\/|\/blog\/|\.article$|\/press-room\//.test(path)||/^(how to|top \d+|best \d+|why you|ultimate guide)/.test(title.toLowerCase()))kind="Article";
 else if(/directory|browse|search|all programmes|all opportunities/.test(title.toLowerCase())||/\/(search|opportunities|programmes)\/?$/.test(path))kind="Directory";
 else if(/summer school|work experience|research placement|insight (day|week|programme)|competition|olympiad|mentoring|outreach programme|virtual experience|challenge|stem smart|uniq/i.test(title))kind="Specific opportunity";
 else if(/careers|career advice|join our team/.test(title.toLowerCase()))kind="Careers page";
 const irrelevant=/(graduate vacancies|senior manager vacancies|unrelated shopping|casino|betting|adult entertainment)/.test(text)||!/(opportunity|opportunities|school|student|sixth.form|year.?1[0-3]|work experience|outreach|competition|olympiad|mentoring|apprentice|insight|programme|summer|career|lecture|placement|simulation)/.test(text);
 const rank=kind==="Directory"?(authority==="Other source"?80:180):kind==="Specific opportunity"?(authority==="Official provider"?500:authority==="Opportunity platform"?300:100):authority==="Official provider"?400:authority==="Opportunity platform"?250:50;
 return {kind,authority,rank,irrelevant};
}
export function processSearchResults(raws:unknown[],sector:string):{results:RichOpportunity[];discarded:number} {
 const results:{item:RichOpportunity;rank:number}[]=[],seen=new Set<string>();let discarded=0;
 for(const raw of raws){
  if(!raw||typeof raw!=="object"){discarded++;continue;}
  const r=raw as Record<string,unknown>;
  if(typeof r.url!=="string"||typeof r.title!=="string"){discarded++;continue;}
  let url:string;try{url=safePublicUrl(r.url);}catch{discarded++;continue;}
  if(seen.has(url)){discarded++;continue;}seen.add(url);
  const content=typeof r.raw_content==="string"?r.raw_content:typeof r.content==="string"?r.content:"";
  const classification=classifySearch(r.title,url,content);
  if(classification.irrelevant||classification.kind==="Article"||classification.kind==="Careers page"){discarded++;continue;}
  const deadlineQuote=content.match(/(?:application deadline|applications close|closing date|apply by|registration closes)\s*[:\-]?\s*[^\n.]{0,100}/i)?.[0]||"";
  const deadlineDate=explicitDate(deadlineQuote);
  const years=[...new Set([...content.matchAll(/\bYear\s+(10|11|12|13)\b/gi)].map(m=>"Year "+m[1]))];
  const format=/\b(?:online only|entirely virtual|virtual programme|virtual work experience)\b/i.test(content)?"Virtual" as const:"Not stated" as const;
  results.push({rank:classification.rank,item:enrich({
   id:"web-"+createHash("sha256").update(url).digest("hex").slice(0,16),title:r.title.slice(0,180),
   provider:new URL(url).hostname.replace(/^www\./,""),sector:sector==="All sectors"?"Explore careers":sector,
   type:"Search result",category:classification.kind==="Directory"?"Provider directory":"Not stated",sourceKind:classification.kind==="Directory"?"Directory":"Web result",
   resultKind:classification.kind,authority:classification.authority,location:"Not stated",format,
   duration:"Not stated",eligibility:"Check source · age suitability not verified",cost:"Not stated",
   deadline:deadlineQuote||"Not stated",deadlineDate,years,url,description:content.slice(0,700)||"Open the source for details.",
   tags:["Web result","Check eligibility"],checkedAt:"",source:"web",unconfirmed:["Programme availability","Age eligibility","Full requirements"]
  })});
 }
 return {results:results.sort((a,b)=>b.rank-a.rank).map(r=>r.item),discarded};
}
