import { z } from "zod";
import type { Opportunity } from "./types";

export const categories=["Work experience","Virtual work experience","Employer insight","University outreach","Summer school","Widening participation","STEM programme","Research placement","Competition","Mentoring","Lecture / academic event","Apprenticeship insight","Career exploration","Job simulation","Provider directory","Not stated"] as const;
export const formats=["Virtual","In person","Hybrid","Not stated"] as const;
export const statuses=["Saved","Researching","Preparing application","Applied","Interview / next stage","Accepted","Completed","Unsuccessful","Not pursuing"] as const;
export const skillNames=["Teamwork","Communication","Leadership","Problem solving","Resilience","Organisation","Analytical thinking","Creativity","Technical skills","Independent learning"] as const;
const text=(length=600)=>z.string().max(length);
const list=(length=120)=>z.array(text(length)).max(30);
export const dateSchema=z.string().refine(v=>v==="" || isDate(v),"Use a real date in YYYY-MM-DD format");
export function isDate(value:string):boolean {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const date=new Date(value+"T12:00:00Z");
 return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value;
}
export const opportunitySchema=z.object({
 id:text(180),title:text(180).min(1),provider:text(180),sector:text(100),
 type:text(100),category:z.enum(categories).default("Not stated"),subSector:text(150).default("Not stated"),
 location:text(300),format:z.enum(formats).default("Not stated"),duration:text(300),
 durationBand:z.enum(["A few hours","1–3 days","4–7 days","1–2 weeks","Several weeks","Longer programme","Self-paced","Not stated"]).default("Not stated"),
 eligibility:text(1200),minAge:z.number().int().min(0).max(100).optional(),maxAge:z.number().int().min(0).max(100).optional(),
 years:list().default([]),subjects:list().default([]),subjectRequirements:text(600).default("Not stated"),
 geography:text(600).default("Not stated"),cost:text(300),deadline:text(300),deadlineDate:dateSchema.default(""),
 startDate:dateSchema.default(""),applicationState:z.enum(["Open","Closed","Not yet open","Rolling","Unknown"]).default("Unknown"),
 applicationUrl:text(2000).default(""),url:text(2000),description:text(1800),activities:list(500).default([]),
 skills:list().default([]),tags:list(),certificate:text(300).default("Not stated"),selection:text(600).default("Not stated"),
 checkedAt:text(40),source:z.enum(["catalogue","web","imported","manual"]),
 sourceKind:z.enum(["Programme","Directory","Web result","Imported","Personal record"]).default("Programme"),
 sourceUrls:list(2000).default([]),unconfirmed:list(160).default([]),
 addedAt:text(40).default(""),resultKind:z.enum(["Specific opportunity","Directory","Careers page","Article","Unclassified"]).optional(),
 authority:z.enum(["Official provider","Opportunity platform","Other source"]).optional(),
});
export type RichOpportunity=z.infer<typeof opportunitySchema>;
export function enrich(item:Opportunity | Partial<RichOpportunity>):RichOpportunity {
 const legacy=item as Partial<RichOpportunity>;
 const category=legacy.category || (legacy.type==="Provider directory"?"Provider directory":legacy.type==="Job simulation"?"Job simulation":legacy.type==="Virtual experience"?"Virtual work experience":"Not stated");
 return opportunitySchema.parse({
  id:"",title:"New opportunity",provider:"Not stated",sector:"Explore careers",type:category,
  location:"Not stated",duration:"Not stated",eligibility:"Not stated",cost:"Not stated",deadline:"Not stated",
  url:"",description:"",tags:[],checkedAt:"",source:"manual",...legacy,category,
  format:legacy.format || (/virtual/i.test(legacy.location||"") || legacy.type==="Job simulation"?"Virtual":"Not stated"),
  sourceKind:legacy.sourceKind || (legacy.type==="Provider directory"?"Directory":legacy.source==="web"?"Web result":legacy.source==="imported"?"Imported":legacy.source==="manual"?"Personal record":"Programme"),
  applicationUrl:legacy.applicationUrl || legacy.url || "",
  sourceUrls:legacy.sourceUrls || (legacy.url?[legacy.url]:[])
 });
}
export const profileSchema=z.object({
 year:text(80).default("Year 12"),age:text(2).regex(/^(?:1[0-9]|2[0-5])?$/).default(""),
 subjects:list().default([]),interests:list().default([]),careerInterests:text(400).default(""),
 preferredTypes:z.array(z.enum(categories)).max(16).default([]),format:z.enum(["Any",...formats]).default("Any"),
 location:text(150).default(""),travel:z.enum(["Local only","Within my region","Anywhere in the UK","International","Not sure"]).default("Not sure"),
 duration:text(80).default("Any"),outsideInterests:text(500).default(""),
 direction:z.enum(["Exploring","Targeting a field"]).default("Exploring"),configured:z.boolean().default(false)
});
export type StudentProfile=z.infer<typeof profileSchema>;
export const defaultProfile:StudentProfile=profileSchema.parse({});
export const checklistSchema=z.object({id:text(180),label:text(250),done:z.boolean()});
export const reminderSchema=z.object({id:text(180),label:text(250),date:dateSchema,done:z.boolean()});
export const recordSchema=z.object({
 opportunity:opportunitySchema,status:z.enum(statuses).default("Saved"),savedAt:text(50),
 deadlineDate:dateSchema.default(""),deadlineOverride:z.boolean().default(false),
 applicationUrl:text(2000).default(""),nextAction:text(300).default(""),nextActionDate:dateSchema.default(""),
 notes:text(6000).default(""),appliedAt:dateSchema.default(""),eventDate:dateSchema.default(""),
 outcome:text(1000).default(""),priority:z.enum(["Normal","High","Low"]).default("Normal"),
 checklist:z.array(checklistSchema).max(40).default([]),reminders:z.array(reminderSchema).max(30).default([])
});
export type TrackedRecord=z.infer<typeof recordSchema>;
export const starSchema=z.object({situation:text(1000),task:text(1000),action:text(1500),result:text(1000)});
export const evidenceSchema=z.object({
 id:text(180),skill:text(100),whatHappened:text(1200),action:text(1500),learning:text(1200),
 quote:text(2000).default(""),star:starSchema.optional()
});
export type SkillEvidence=z.infer<typeof evidenceSchema>;
export const richReflectionSchema=z.object({
 summary:text(2200),skills:z.array(z.object({skill:text(100),evidenceQuote:text(2000).min(8),whatHappened:text(1000),action:text(1200),learning:text(1000)})).max(10),
 star:starSchema,cvBullet:text(700),applicationExample:text(1800),interviewTalkingPoint:text(1200),nextSteps:list(500).max(5)
});
export type RichReflection=z.infer<typeof richReflectionSchema>;
export const experienceSchema=z.object({
 id:text(180),opportunityId:text(180).default(""),name:text(180),organisation:text(180).default(""),
 date:dateSchema.default(""),hours:text(80).default(""),type:text(100).default("Not stated"),
 whatDid:text(4500).default(""),learned:text(2500).default(""),challenges:text(1500).default(""),
 surprised:text(1500).default(""),enjoyed:text(1500).default(""),disliked:text(1500).default(""),
 careerImpact:text(1500).default(""),nextStep:text(1000).default(""),skills:z.array(evidenceSchema).max(30).default([]),
 reflection:richReflectionSchema.optional(),updatedAt:text(50)
});
export type Experience=z.infer<typeof experienceSchema>;
export const appSchema=z.object({version:z.literal(2),profile:profileSchema,records:z.array(recordSchema).max(1000),experiences:z.array(experienceSchema).max(1000)});
export type AppData=z.infer<typeof appSchema>;
export const emptyData:AppData={version:2,profile:defaultProfile,records:[],experiences:[]};
export function createRecord(opportunity:RichOpportunity,now=new Date().toISOString()):TrackedRecord {
 return recordSchema.parse({opportunity,savedAt:now,applicationUrl:opportunity.applicationUrl||opportunity.url});
}
export function recordDeadline(record:TrackedRecord) {return record.deadlineOverride?record.deadlineDate:record.opportunity.deadlineDate;}
export function todayISO(now=new Date()) {
 const parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/London",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);
 return ["year","month","day"].map(key=>parts.find(p=>p.type===key)?.value).join("-");
}
export function daysUntil(date:string,today=todayISO()):number|null {
 if(!isDate(date)||!isDate(today))return null;
 return Math.round((Date.parse(date+"T12:00:00Z")-Date.parse(today+"T12:00:00Z"))/86400000);
}
export function dateLabel(date:string) {return isDate(date)?new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(date+"T12:00:00Z")):"Not stated";}
export function deadlineLabel(date:string,fallback="Not stated",today=todayISO()) {
 const days=daysUntil(date,today);
 return days===null?fallback:days<0?"Deadline passed · "+dateLabel(date):days===0?"Closes today":days===1?"1 day remaining":days<=30?days+" days remaining":dateLabel(date);
}
export function availability(item:RichOpportunity,today=todayISO()) {
 if(item.deadlineDate && (daysUntil(item.deadlineDate,today)??0)<0)return "Closed";
 const age=daysUntil(item.checkedAt.slice(0,10),today);
 if(item.source!=="catalogue" || age===null || age< -45)return "Unknown";
 return item.applicationState;
}
const terminal=new Set<string>(["Completed","Unsuccessful","Not pursuing"]);
export type NextStep={id:string;recordId:string;title:string;date:string;kind:"action"|"deadline"|"event"|"reminder"|"reflection";overdue:boolean;priority:string};
export function nextSteps(records:TrackedRecord[],experiences:Experience[],today=todayISO()):NextStep[] {
 const steps:NextStep[]=[];
 for(const record of records) {
  const id=record.opportunity.id,title=record.opportunity.title,deadline=recordDeadline(record);
  const add=(kind:NextStep["kind"],label:string,date="",suffix:string=kind)=>steps.push({id:id+"-"+suffix,recordId:id,title:label,date,kind,overdue:(daysUntil(date,today)??0)<0,priority:record.priority});
  if(record.status==="Completed") {
   if(!experiences.some(e=>e.opportunityId===id && e.whatDid.trim()))add("reflection","Record your experience: "+title);
   continue;
  }
  if(terminal.has(record.status))continue;
  if(record.nextAction.trim())add("action",record.nextAction,record.nextActionDate);
  if(deadline && ["Saved","Researching","Preparing application"].includes(record.status))add("deadline","Apply: "+title,deadline);
  if(record.eventDate && ["Applied","Interview / next stage","Accepted"].includes(record.status))add("event","Event / next stage: "+title,record.eventDate);
  for(const reminder of record.reminders)if(!reminder.done)add("reminder",reminder.label,reminder.date,reminder.id);
  if(!record.nextAction && !deadline && ["Saved","Researching"].includes(record.status))add("action","Check eligibility: "+title);
 }
 return steps.sort((a,b)=>{
  if(a.date&&b.date){const order=a.date.localeCompare(b.date);if(order)return order;}
  if(a.date&&!b.date)return -1;if(!a.date&&b.date)return 1;
  const order={High:0,Normal:1,Low:2};return order[a.priority as keyof typeof order]-order[b.priority as keyof typeof order];
 });
}
export function experienceFromRecord(record:TrackedRecord,now=new Date().toISOString()):Experience {
 return experienceSchema.parse({id:"experience-"+record.opportunity.id,opportunityId:record.opportunity.id,name:record.opportunity.title,organisation:record.opportunity.provider,type:record.opportunity.category,date:record.eventDate,updatedAt:now});
}
export function evidenceBank(experiences:Experience[]) {
 return experiences.flatMap(experience=>experience.skills.filter(s=>s.skill.trim()&&s.action.trim()).map(skill=>({...skill,experienceId:experience.id,experienceName:experience.name,organisation:experience.organisation,date:experience.date})));
}
export function reflectionInput(experience:Experience) {
 return [
  "Experience: "+experience.name,"Organisation: "+experience.organisation,"Type: "+experience.type,
  "What I did: "+experience.whatDid,"What I learned: "+experience.learned,
  "Challenges: "+experience.challenges,"Surprises: "+experience.surprised,"Enjoyed: "+experience.enjoyed,
  "Disliked: "+experience.disliked,"Career impact: "+experience.careerImpact,"Next step: "+experience.nextStep,
  ...experience.skills.map(s=>"Skill: "+s.skill+"; What happened: "+s.whatHappened+"; My action: "+s.action+"; Learning: "+s.learning)
 ].join("\n");
}
