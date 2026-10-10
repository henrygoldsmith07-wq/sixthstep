import { daysUntil, todayISO, recordDeadline, type AppData, type RichOpportunity, type TrackedRecord, type Experience } from "./domain";
import { shiftDate } from "./domain-dates";
import { applicationPlan } from "./deadline-plan";
import { sourceFreshness } from "./opportunity-repository";
import { recommendations } from "./recommendations";
import type { ActivityEvent } from "./workspace-events";
export type DateBasis="Confirmed source date"|"Source date · needs review"|"Student-entered date"|"Suggested date"|"Approximate period"|"Unknown date";
export type WorkspaceItem={id:string;recordId:string;experienceId?:string;opportunityId?:string;title:string;detail:string;kind:"Deadline"|"Opening"|"Next action"|"Interview"|"Reference"|"Follow up"|"Programme"|"Reflection"|"Personal"|"Milestone"|"Requirement"|"Question"|"Plan"|"Explore";date:string;originalDate:string;period:string;basis:DateBasis;score:number;sourceId?:string;priority:string;snoozed:boolean;actionId?:string};
const inactive=new Set(["Unsuccessful","Not pursuing","Completed"]);
export const plusDays=shiftDate;
export function workspaceItems(data:AppData,collection:RichOpportunity[]=[],today=todayISO()):WorkspaceItem[]{
 const items:WorkspaceItem[]=[];
 function add(r:TrackedRecord,kind:WorkspaceItem["kind"],title:string,date="",basis:DateBasis="Unknown date",suffix:string=kind,detail="",period="",sourceId=""){
  const days=daysUntil(date,today);
  const weights:Record<WorkspaceItem["kind"],number>={Deadline:80,Opening:35,"Next action":75,Interview:90,Reference:65,"Follow up":25,Programme:30,Reflection:20,Personal:50,Milestone:40,Requirement:55,Question:60,Plan:78,Explore:10};
  const score=(days!==null&&days<0?1000:days!==null&&days<=7?300-days*5:days!==null&&days<=30?120-days:0)+weights[kind]+(r.priority==="High"?15:r.priority==="Low"?-10:0);
  items.push({id:r.opportunity.id+":"+kind+":"+suffix+":"+date,recordId:r.opportunity.id,title,detail:detail||r.opportunity.title,kind,date,originalDate:kind==="Deadline"&&r.deadlineOverride?r.opportunity.deadlineDate:date,period,basis,score,sourceId,priority:r.priority,snoozed:false});
 }
 for(const r of data.records){
  const o=r.opportunity,source:DateBasis=o.source==="manual"?"Student-entered date":o.source==="catalogue"&&!sourceFreshness(o,today).stale?"Confirmed source date":"Source date · needs review";
  if(r.intent==="Applying"&&!inactive.has(r.status)&&sourceFreshness(o,today).stale){add(r,"Requirement","Recheck provider dates and criteria: "+o.title,"","Unknown date","source-review","An active application uses older source information. This does not mean the programme is invalid.");items[items.length-1].score+=100;}
  if(inactive.has(r.status)){
   if(r.status==="Completed"&&!data.experiences.some(e=>e.opportunityId===o.id&&(e.reflectionCompletedAt||e.reflection))){const completion=data.activity.find(e=>e.recordId===o.id&&e.kind==="Completed programme")?.at.slice(0,10)||"";add(r,"Reflection","Reflect on "+o.title,completion?plusDays(completion,1):"",completion?"Suggested date":"Unknown date","reflect","A prompt after you marked this programme complete; record what you personally did.");}
   continue;
  }
  if(!r.nextAction&&r.intent!=="Applying"&&["Saved","Researching"].includes(r.status))add(r,"Next action",o.sourceKind==="Directory"?"Choose a specific programme from "+o.title:"Check eligibility and choose a next step: "+o.title,"","Unknown date","first-plan","A suggested first step from your saved possibility; no application has been started.");
  if(r.nextAction.trim())add(r,"Next action",r.nextAction,r.nextActionDate,r.nextActionDate?"Student-entered date":"Unknown date",r.nextAction.slice(0,120));
  for(const task of r.reminders)if(!task.done)add(r,task.kind,task.label,task.date,"Student-entered date",task.id,"Personal reminder · "+o.title,"",task.id);
  if(["Saved","Researching","Preparing application"].includes(r.status)){
   const date=recordDeadline(r);
   if(date)add(r,"Deadline",(r.intent==="Applying"?"Finish application: ":"Review before deadline: ")+o.title,date,r.deadlineOverride?"Student-entered date":source);
   else if(o.deadline!=="Not stated"||o.closingPeriod)add(r,"Deadline","Check application window: "+o.title,"",o.closingPeriod||/autumn|spring|summer|winter|usually|expected/i.test(o.deadline)?"Approximate period":"Unknown date","window",r.deadlineOverride?"You removed your countdown; the original source still states: "+o.deadline:"No exact closing date has been confirmed.",o.closingPeriod||o.deadline);
   if(o.openingDate)add(r,"Opening","Applications open: "+o.title,o.openingDate,source);
   else if(o.openingPeriod)add(r,"Opening","Check opening period: "+o.title,"","Approximate period","period","Check the original provider before applying.",o.openingPeriod);
  }
  if(r.eventDate)add(r,r.status==="Interview / next stage"?"Interview":"Programme",(r.status==="Interview / next stage"?"Interview / next stage: ":"Event: ")+o.title,r.eventDate,"Student-entered date","event");
  if(o.startDate&&o.startDate!==r.eventDate)add(r,"Programme","Published programme date: "+o.title,o.startDate,source);
  if(r.intent==="Applying"&&["Saved","Researching","Preparing application","Interview / next stage"].includes(r.status)){
   for(const req of r.requirements.filter(t=>!t.done))add(r,/reference/i.test(req.label)?"Reference":"Requirement",req.label,"","Unknown date",req.id,"Student-confirmed requirement · "+o.title,"",req.id);
   for(const t of r.checklist.filter(t=>!t.done))add(r,"Requirement",t.label,"","Unknown date","checklist-"+t.id,"Your checklist · "+o.title,"",t.id);
   for(const question of r.questions.filter(q=>q.status==="Draft"))add(r,"Question","Draft response: "+question.question.slice(0,100),"","Unknown date",question.id,o.title,"",question.id);
   if(!r.nextAction&&!r.requirements.some(t=>!t.done)&&!r.questions.some(q=>q.status==="Draft")&&!recordDeadline(r))add(r,"Next action","Check requirements and set a next action","","Unknown date","plan",o.title);
  }
  if(r.status==="Applied"&&r.appliedAt){const suggested=plusDays(r.appliedAt,21);add(r,"Follow up","Check response expectations: "+o.title,suggested,"Suggested date","response","Three weeks after your recorded submission; the provider may publish a different response schedule.");}
  // A student's own plan date can be earlier than the provider's, so the pace signal
  // still works when the provider states no closing date at all.
  if(r.intent==="Applying"&&!r.nextAction.trim()){
   const plan=applicationPlan(r,today);
   if(plan.total>0&&plan.daysLeft!==null&&plan.daysLeft<plan.total){
    add(r,"Plan",(plan.daysLeft<0?"Decide whether to continue: ":"Finish or decide: ")+o.title,plan.target,plan.basis==="Provider deadline"?source:"Student-entered date","pace",plan.note);
   }
  }
  for(const stage of r.applicationSteps){const date=r.milestoneDates.find(m=>m.stage===stage)?.date||"";add(r,"Milestone",stage,date,date?"Student-entered date":"Unknown date",stage,date?"Recorded milestone · student-entered completion date":"Recorded complete · completion date was not recorded");}
 }
 for(const e of data.experiences.filter(e=>e.opportunityId===""&&!e.whatDid.trim()))items.push({id:"experience:"+e.id+":Reflection",recordId:"",experienceId:e.id,title:"Record what you did: "+e.name,detail:"Capture one real action while it is fresh.",kind:"Reflection",date:"",originalDate:"",period:"",basis:"Unknown date",score:20,priority:"Normal",snoozed:false});
 const matches=collection.length?recommendations(collection,data.profile,data.records.map(r=>r.opportunity.id),{records:data.records,experiences:data.experiences,feedback:data.feedback},today):[];
 for(const {item,match} of matches.filter(v=>{const d=daysUntil(v.item.openingDate,today);return d!==null&&d>=0&&d<=7;}).slice(0,3)){
  const days=daysUntil(item.openingDate,today)!;
  items.push({id:"discover:"+item.id+":Opening:"+item.openingDate,recordId:"",opportunityId:item.id,title:(days===0?"Applications open today: ":"Applications opening soon: ")+item.title,detail:match.reasons.slice(0,2).join("; "),kind:"Opening",date:item.openingDate,originalDate:item.openingDate,period:"",basis:item.source==="catalogue"&&!sourceFreshness(item,today).stale?"Confirmed source date":"Source date · needs review",score:days===0?340:160-days,priority:"Normal",snoozed:false});
 }
 const freshMatch=matches.find(v=>{const d=daysUntil(v.item.addedAt,today);return v.match.rank>=7&&d!==null&&d>=-7&&d<=0&&!data.feedback.some(f=>f.opportunityId===v.item.id&&f.signal==="Maybe");});
 if(freshMatch&&!items.some(i=>i.opportunityId===freshMatch.item.id)){const {item,match}=freshMatch;items.push({id:"discover:"+item.id+":Explore:"+item.addedAt,recordId:"",opportunityId:item.id,title:"Take a look: "+item.title,detail:"Recently added to the collection · "+match.reasons.slice(0,2).join("; "),kind:"Explore",date:"",originalDate:"",period:"",basis:"Unknown date",score:10,priority:"Normal",snoozed:false});}
 return items.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
}
export function actionableItems(data:AppData,collection:RichOpportunity[]=[],today=todayISO()){
 return workspaceItems(data,collection,today).filter(i=>i.kind!=="Milestone").flatMap(item=>{
  const state=data.actionStates.find(s=>s.id===item.id);
  if(state&&state.state!=="Snoozed")return [];
  if(state?.state==="Snoozed"){if((daysUntil(state.date,today)??0)>0)return [];return [{...item,date:state.date,basis:"Student-entered date" as DateBasis,snoozed:true,score:Math.max(item.score,400)}];}
  if(item.date&&(daysUntil(item.date,today)??0)>30)return [];
  // An opening date in the past is history, not an urgent task forever.
  if(item.kind==="Opening"&&(daysUntil(item.date,today)??0)< -7)return [];
  return [item];
 }).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
}
export function priorityActions(data:AppData,collection:RichOpportunity[]=[],today=todayISO(),limit=4){
 const all=actionableItems(data,collection,today),chosen:WorkspaceItem[]=[],seen=new Set<string>();
 for(const item of all){const group=item.recordId||item.experienceId||item.opportunityId||item.id;if(seen.has(group))continue;seen.add(group);chosen.push(item);if(chosen.length===limit)break;}
 if(chosen.length<limit)for(const item of all){const group=item.recordId||item.experienceId||item.opportunityId||item.id;const same=chosen.filter(c=>(c.recordId||c.experienceId||c.opportunityId||c.id)===group).length;if(!chosen.some(c=>c.id===item.id)&&same<2&&item.score>=300){chosen.push(item);if(chosen.length===limit)break;}}
 return {priority:chosen.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)),remaining:all.filter(i=>!chosen.some(c=>c.id===i.id))};
}
export function calendarItems(data:AppData,collection:RichOpportunity[]=[],today=todayISO()){
 return workspaceItems(data,collection,today).filter(item=>item.kind!=="Explore").flatMap(item=>{
  const state=data.actionStates.find(s=>s.id===item.id);
  return state?.state==="Snoozed"?[{...item,snoozed:true},{...item,id:"scheduled:"+item.id,actionId:item.id,title:"Reminder: "+item.title,date:state.date,basis:"Student-entered date" as DateBasis,detail:"Scheduled reminder · "+item.detail,snoozed:true}]:[item];
 }).sort((a,b)=>(a.date||"9999").localeCompare(b.date||"9999")||a.title.localeCompare(b.title));
}
export function recordEvents(previous:TrackedRecord,next:TrackedRecord,at:string):Omit<ActivityEvent,"id">[]{
 const base={at,recordId:next.opportunity.id,experienceId:"",title:next.opportunity.title,themes:next.opportunity.careerAreas.length?next.opportunity.careerAreas:[next.opportunity.sector]};
 const events:Omit<ActivityEvent,"id">[]=[];
 if(previous.status!==next.status)events.push({...base,kind:next.status==="Applied"?"Application submitted":next.status==="Completed"?"Completed programme":next.status==="Preparing application"?"Application started":"Stage changed",title:base.title+" · "+next.status});
 else if(previous.intent!=="Applying"&&next.intent==="Applying")events.push({...base,kind:"Application started"});
 if(next.eventDate&&next.eventDate!==previous.eventDate&&next.status==="Interview / next stage")events.push({...base,kind:"Interview recorded",title:base.title+" · "+next.eventDate});
 return events;
}
export function experienceEvents(previous:Experience|undefined,next:Experience,at:string):Omit<ActivityEvent,"id">[]{
 const base={at,recordId:next.opportunityId,experienceId:next.id,title:next.name,themes:next.careerAreas};
 const events:Omit<ActivityEvent,"id">[]=[];
 if(!previous)events.push({...base,kind:"Experience recorded"});
 const newSkills=next.skills.filter(s=>s.skill.trim()&&s.action.trim()&&!previous?.skills.some(p=>p.id===s.id&&p.action.trim()));
 for(const skill of newSkills)events.push({...base,kind:"Evidence added",title:next.name+" · "+skill.skill});
 if(next.reflectionCompletedAt&&!previous?.reflectionCompletedAt||next.reflection&&!previous?.reflection)events.push({...base,kind:"Reflection completed"});
 if(next.interestChange!=="Unsure"&&previous?.interestChange!==next.interestChange)events.push({...base,kind:"Interest changed",title:next.name+" · "+next.interestChange});
 return events;
}
export function developmentTimeline(data:AppData){
 const logged=data.activity.map(e=>({...e,date:e.at.slice(0,10),basis:"Recorded action date"}));
 const retained:{id:string;kind:string;title:string;date:string;basis:string;recordId:string;experienceId:string;themes:string[]}[]=[];
 for(const r of data.records){
  const base={recordId:r.opportunity.id,experienceId:"",title:r.opportunity.title,themes:r.opportunity.careerAreas.length?r.opportunity.careerAreas:[r.opportunity.sector]};
  if(!logged.some(e=>e.recordId===base.recordId&&e.kind==="Saved"))retained.push({...base,id:"legacy-saved:"+base.recordId,kind:"Saved",date:r.savedAt.slice(0,10),basis:"Existing saved date"});
  if(r.appliedAt&&!logged.some(e=>e.recordId===base.recordId&&e.kind==="Application submitted"))retained.push({...base,id:"legacy-applied:"+base.recordId,kind:"Application submitted",date:r.appliedAt,basis:"Student-entered submission date"});
 }
 for(const e of data.experiences){
  const base={recordId:e.opportunityId,experienceId:e.id,title:e.name,themes:e.careerAreas};
  if(!logged.some(l=>l.experienceId===e.id&&l.kind==="Experience recorded"))retained.push({...base,id:"legacy-experience:"+e.id,kind:"Experience recorded",date:e.date,basis:e.date?"Student-entered experience date":"Creation date unknown"});
  for(const s of e.skills.filter(s=>s.action.trim()))if(!logged.some(l=>l.experienceId===e.id&&l.kind==="Evidence added"&&l.title===e.name+" · "+s.skill))retained.push({...base,id:"legacy-skill:"+e.id+":"+s.id,kind:"Evidence added",title:e.name+" · "+s.skill,date:"",basis:"Addition date not recorded"});
  if((e.reflection||e.reflectionCompletedAt)&&!logged.some(l=>l.experienceId===e.id&&l.kind==="Reflection completed"))retained.push({...base,id:"legacy-reflection:"+e.id,kind:"Reflection completed",date:e.reflectionCompletedAt,basis:e.reflectionCompletedAt?"Student-recorded reflection date":"Completion date not recorded"});
 }
 return [...logged,...retained].sort((a,b)=>(b.date||"0000").localeCompare(a.date||"0000")||a.title.localeCompare(b.title));
}
