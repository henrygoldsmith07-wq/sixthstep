import { isDate, type RichOpportunity } from "./domain";
import { plusDays, type WorkspaceItem } from "./operating-system";
import { routeHash } from "./navigation";
import { safePublicHref } from "./public-link";

const escape=(value:string)=>value.replace(/\\/g,"\\\\").replace(/\r\n|\r|\n/g,"\\n").replace(/;/g,"\\;").replace(/,/g,"\\,");
function fold(line:string) {
  const encoder=new TextEncoder();let part="",bytes=0;const lines:string[]=[];
  for(const char of line){const size=encoder.encode(char).length;if(bytes+size>75){lines.push(part);part=" ";bytes=1;}part+=char;bytes+=size;}
  lines.push(part);return lines.join("\r\n");
}
export function eventIdentity(item:WorkspaceItem){return item.id.replace(/:\d{4}-\d{2}-\d{2}$/,"");}
export function exactCalendarItems(items:WorkspaceItem[]){return items.filter(i=>isDate(i.date)&&i.kind!=="Explore"&&i.basis!=="Approximate period"&&i.basis!=="Unknown date");}
export function calendarExport(items:WorkspaceItem[],sources:RichOpportunity[]=[],baseUrl="",now=new Date()):string {
  const events=new Map(exactCalendarItems(items).map(i=>[eventIdentity(i),i]));
  const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//SixthStep//Student workspace//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:SixthStep"];
  const stamp=now.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
  for(const [identity,item] of events){
    const source=sources.find(o=>o.id===(item.recordId||item.opportunityId));
    const sourceUrl=source?safePublicHref(source.url):"";
    const route=item.experienceId?{view:"reflect" as const,experience:item.experienceId}:item.recordId?{view:"saved" as const,record:item.recordId}:{view:"finder" as const,opportunity:item.opportunityId};
    const description=[source?.title||item.title,item.detail,"Date provenance: "+item.basis,item.originalDate&&item.originalDate!==item.date?"Original date: "+item.originalDate:"",source?.checkedAt?"Source checked: "+source.checkedAt:"",sourceUrl?"Provider source: "+sourceUrl:"",baseUrl?"SixthStep workspace: "+baseUrl.replace(/\/$/,"")+"/"+routeHash(route):"","Provider remains the final authority. Recheck dates and eligibility."].filter(Boolean).join("\n");
    lines.push("BEGIN:VEVENT","UID:"+encodeURIComponent(identity)+"@sixthstep.local","DTSTAMP:"+stamp,"DTSTART;VALUE=DATE:"+item.date.replace(/-/g,""),"DTEND;VALUE=DATE:"+plusDays(item.date,1).replace(/-/g,""),"SUMMARY:"+escape(item.title),"DESCRIPTION:"+escape(description),"CATEGORIES:"+escape(item.kind),...(sourceUrl?["URL:"+sourceUrl]:[]),"END:VEVENT");
  }
  lines.push("END:VCALENDAR");return lines.map(fold).join("\r\n")+"\r\n";
}
