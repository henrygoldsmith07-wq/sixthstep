"use client";
import { useState, useId } from "react";
import { catalogue } from "@/lib/catalogue";
import { dateLabel, todayISO, daysUntil } from "@/lib/domain";
import { plusDays, type WorkspaceItem } from "@/lib/operating-system";
import { useWorkspace } from "./workspace-context";
import { calendarExport, exactCalendarItems } from "@/lib/calendar-export";
import { download } from "./shared";
export function ActionItem({item,onOpportunity}:{item:WorkspaceItem;onOpportunity?:(id:string)=>void}){
 const {data,navigate,setActiveRecord,setActiveQuestion,setActiveExperience,startExperience,setActionState,updateRecord}=useWorkspace();
 const [controls,setControls]=useState(false),[date,setDate]=useState(plusDays(todayISO(),3));
 const controlsId=useId();
 const actionId=item.actionId||item.id,originalTitle=item.actionId?item.title.replace(/^Reminder: /,""):item.title;
 const state=data.actionStates.find(s=>s.id===actionId),record=data.records.find(r=>r.opportunity.id===item.recordId);
 function open(){
  if(item.experienceId){setActiveExperience(item.experienceId);navigate("reflect");}
  else if(record&&item.kind==="Reflection")startExperience(record);
  else if(record){
  setActiveRecord(record.opportunity.id);
  // A question item carries its id in sourceId. Without this the workspace opened on the first
  // question, so "Draft response: Why medicine?" landed the student somewhere else entirely.
  if(item.kind==="Question"&&item.sourceId)setActiveQuestion(item.sourceId);
  navigate("saved");
 }
  else if(item.opportunityId&&onOpportunity)onOpportunity(item.opportunityId);
  else navigate("finder");
 }
 function complete(){
  setActionState({id:actionId,state:"Completed",date:"",at:new Date().toISOString()});
  if(!record)return;
  // Only the record's own next action clears the stored text. A reminder reuses the "Next action"
// kind, so completing one used to delete the real next action and its date. The item is hidden
// either way, so clearing the text only destroyed the student own wording.
if(item.kind==="Next action"&&!item.sourceId&&record.nextAction===originalTitle)updateRecord(record.opportunity.id,{nextAction:"",nextActionDate:""});
  else if(item.sourceId&&record.reminders.some(r=>r.id===item.sourceId))updateRecord(record.opportunity.id,{reminders:record.reminders.map(r=>r.id===item.sourceId?{...r,done:true}:r)});
  else if(item.sourceId&&["Requirement","Reference"].includes(item.kind))updateRecord(record.opportunity.id,{requirements:record.requirements.map(r=>r.id===item.sourceId?{...r,done:true}:r),checklist:record.checklist.map(r=>r.id===item.sourceId?{...r,done:true}:r)});
 }
 const source=record?.opportunity||catalogue.find(o=>o.id===item.opportunityId)||data.discoveries.find(o=>o.id===item.opportunityId);
 const days=daysUntil(item.date);
 return <article className="operating-action" aria-label={item.title}><div className="action-summary"><span className={"status-chip "+(days!==null&&days<0?"past":"")}>{item.kind}</span><button className="plain-title" onClick={open}>{item.title}</button>{!item.title.includes(item.detail)&&<p>{item.detail}</p>}<p className="fine-print">{item.date?dateLabel(item.date)+(days!==null&&days<0?" · Overdue":days===0?" · Today":days!==null&&days<=7?" · In "+days+" days":""):item.period||"No exact date recorded"} · {item.basis}{item.originalDate&&item.originalDate!==item.date?" · Original: "+dateLabel(item.originalDate):""}</p>{state?.state==="Snoozed"&&<p className="fine-print">Reminder scheduled for {dateLabel(state.date)}; original provider dates stay unchanged.</p>}</div><div className="detail-actions"><button className="button secondary" onClick={open}>Open {item.kind==="Reflection"?"experience":record?"application":"opportunity"}</button>{!controls&&["Next action","Requirement","Reference","Personal"].includes(item.kind)&&<button className="inline-link" onClick={complete}>Mark complete</button>}<button className="inline-link" title="Set a personal reminder three days from today; original dates stay unchanged." onClick={()=>setActionState({id:actionId,state:"Snoozed",date:plusDays(todayISO(),3),at:new Date().toISOString()})}>Remind me later</button><button className="inline-link" aria-expanded={controls} aria-controls={controlsId} onClick={()=>setControls(!controls)}>Reminder options</button></div>{controls&&<div className="reminder-controls" id={controlsId}>{exactCalendarItems([item]).length>0&&<button className="inline-link" onClick={()=>download("sixthstep-date.ics",calendarExport([item],source?[source]:[],window.location.origin),"text/calendar;charset=utf-8")}>Export date</button>}<label>Reminder date<input className="text-input" type="date" aria-label={"Reminder date for "+item.title} value={date} onChange={e=>setDate(e.target.value)}/></label><button className="button secondary" disabled={!date} onClick={()=>{setActionState({id:actionId,state:"Snoozed",date,at:new Date().toISOString()});setControls(false);}}>Snooze / change reminder date</button><button className="button text-button" onClick={()=>setActionState({id:actionId,state:"Dismissed",date:"",at:new Date().toISOString()})}>Dismiss reminder</button><button className="button secondary" onClick={complete}>{["Next action","Requirement","Reference","Personal"].includes(item.kind)?"Mark complete":"Complete reminder"}</button><p className="fine-print">Completing a deadline or opening reminder does not submit an application or change your stage.</p></div>}</article>;
}
