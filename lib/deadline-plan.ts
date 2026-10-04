import { daysUntil, todayISO, type TrackedRecord } from "./domain";
import { shiftDate } from "./domain-dates";

// A plan works from what is recorded, never from a provider commitment. The target is
// the student's own intention when they have set one, otherwise the provider's date.
// Everything else is a count of recorded work beside a count of remaining days.
export type PlanBasis="Your plan date"|"Your recorded deadline"|"Provider deadline"|"No date recorded";
export type PlanStep={label:string;date:string;basis:"Suggested date"};
export type ApplicationPlan={
 basis:PlanBasis;
 target:string;
 daysLeft:number|null;
 total:number;
 steps:PlanStep[];
 note:string;
 laterThanProvider:boolean;
};
export function planTarget(record:TrackedRecord):{date:string;basis:PlanBasis} {
 if(record.planDate)return{date:record.planDate,basis:"Your plan date"};
 if(record.deadlineOverride&&record.deadlineDate)return{date:record.deadlineDate,basis:"Your recorded deadline"};
 if(record.opportunity.deadlineDate)return{date:record.opportunity.deadlineDate,basis:"Provider deadline"};
 return{date:"",basis:"No date recorded"};
}
// Longest lead time first, because a reference usually depends on someone else.
export function outstandingItems(record:TrackedRecord):string[] {
 const reference=record.requirements.filter(r=>!r.done&&/reference/i.test(r.label)).map(r=>r.label);
 const questions=record.questions.filter(q=>q.status==="Draft").map(q=>"Draft response: "+q.question.slice(0,80));
 const other=record.requirements.filter(r=>!r.done&&!/reference/i.test(r.label)).map(r=>r.label);
 const tasks=record.checklist.filter(t=>!t.done).map(t=>t.label);
 return [...reference,...questions,...other,...tasks];
}
// Work backwards from the target so each item lands before the date it serves.
export function plannedSchedule(items:string[],target:string,daysLeft:number|null,today:string):PlanStep[] {
 if(!target||daysLeft===null||daysLeft<0)return items.map(label=>({label,date:"",basis:"Suggested date" as const}));
 const last=items.length-1;
 return items.map((label,index)=>{
  const offset=last-index;
  return {label,date:offset<=daysLeft?shiftDate(target,-offset):today,basis:"Suggested date" as const};
 });
}
export function applicationPlan(record:TrackedRecord,today=todayISO()):ApplicationPlan {
 const {date:target,basis}=planTarget(record),daysLeft=daysUntil(target,today),items=outstandingItems(record);
 const provider=record.opportunity.deadlineDate;
 const laterThanProvider=!!(target&&provider&&target>provider);
 const steps=plannedSchedule(items,target,daysLeft,today);
 let note:string;
 if(!target)note="No application date is recorded. Check the provider's closing date, then add your own plan date to build a schedule.";
 else if(!items.length)note="Nothing outstanding is recorded. Check the provider's own requirements before you submit anything.";
 else if(daysLeft!==null&&daysLeft<0)note=items.length+" recorded item(s) are still outstanding and your date has passed. Check whether the provider is still open, or decide whether to step back.";
 else if(daysLeft!==null&&daysLeft<items.length)note=items.length+" recorded item(s) and "+daysLeft+" day(s) left. Finish the smallest items first, ask the provider about dates, or decide whether to step back.";
 else note=daysLeft===null?"Add a real date to count the days you have left.":daysLeft+" day(s) for "+items.length+" recorded item(s). Keep the provider's own deadline as the real limit.";
 if(laterThanProvider)note+=" Your plan date is later than the provider's recorded deadline ("+provider+"), so the provider's date is the one that decides.";
 return {basis,target,daysLeft,total:items.length,steps,note,laterThanProvider};
}