"use client";
import { useState } from "react";
import { dateLabel, todayISO, daysUntil } from "@/lib/domain";
import { plusDays, type WorkspaceItem } from "@/lib/operating-system";
import { useWorkspace } from "./workspace-context";
export function ActionItem({item,onOpportunity}:{item:WorkspaceItem;onOpportunity?:(id:string)=>void}){
 const {data,navigate,setActiveRecord,setActiveExperience,startExperience,setActionState,updateRecord}=useWorkspace();
 const [controls,setControls]=useState(false),[date,setDate]=useState(plusDays(todayISO(),3));
 const actionId=item.actionId||item.id,originalTitle=item.actionId?item.title.replace(/^Reminder: /,""):item.title;
 const state=data.actionStates.find(s=>s.id===actionId),record=data.records.find(r=>r.opportunity.id===item.recordId);
 function open(){
  if(item.experienceId){setActiveExperience(item.experienceId);navigate("reflect");}
  else if(record&&item.kind==="Reflection")startExperience(record);
  else if(record){setActiveRecord(record.opportunity.id);navigate("saved");}
  else if(item.opportunityId&&onOpportunity)onOpportunity(item.opportunityId);
  else navigate("finder");
 }
 function complete(){
  setActionState({id:actionId,state:"Completed",date:"",at:new Date().toISOString()});
  if(!record)return;
  if(item.kind==="Next action"&&record.nextAction===originalTitle)updateRecord(record.opportunity.id,{nextAction:"",nextActionDate:""});
  else if(item.sourceId&&record.reminders.some(r=>r.id===item.sourceId))updateRecord(record.opportunity.id,{reminders:record.reminders.map(r=>r.id===item.sourceId?{...r,done:true}:r)});
  else if(item.sourceId&&["Requirement","Reference"].includes(item.kind))updateRecord(record.opportunity.id,{requirements:record.requirements.map(r=>r.id===item.sourceId?{...r,done:true}:r),checklist:record.checklist.map(r=>r.id===item.sourceId?{...r,done:true}:r)});
 }
 const days=daysUntil(item.date);
 return <article className="operating-action" aria-label={item.title}><div className="action-summary"><span className={"status-chip "+(days!==null&&days<0?"past":"")}>{item.kind}</span><button className="plain-title" onClick={open}>{item.title}</button><p>{item.detail}</p><p className="fine-print">{item.date?dateLabel(item.date)+(days!==null&&days<0?" · Overdue":days===0?" · Today":days!==null&&days<=7?" · In "+days+" days":""):item.period||"Choose a reminder date"} · {item.basis}{item.originalDate&&item.originalDate!==item.date?" · Original: "+dateLabel(item.originalDate):""}</p>{state?.state==="Snoozed"&&<p className="fine-print">Reminder scheduled for {dateLabel(state.date)}; original provider dates stay unchanged.</p>}</div><div className="detail-actions"><button className="button secondary" onClick={open}>Open {item.kind==="Reflection"?"experience":record?"application":"opportunity"}</button><button className="inline-link" aria-expanded={controls} onClick={()=>setControls(!controls)}>Reminder options</button></div>{controls&&<div className="reminder-controls"><label>Reminder date<input className="text-input" type="date" aria-label={"Reminder date for "+item.title} value={date} onChange={e=>setDate(e.target.value)}/></label><button className="button secondary" disabled={!date} onClick={()=>{setActionState({id:actionId,state:"Snoozed",date,at:new Date().toISOString()});setControls(false);}}>Snooze / change reminder date</button><button className="button text-button" onClick={()=>setActionState({id:actionId,state:"Dismissed",date:"",at:new Date().toISOString()})}>Dismiss reminder</button><button className="button secondary" onClick={complete}>{["Next action","Requirement","Reference","Personal"].includes(item.kind)?"Mark complete":"Complete reminder"}</button><p className="fine-print">Completing a deadline or opening reminder does not submit an application or change your stage.</p></div>}</article>;
}
