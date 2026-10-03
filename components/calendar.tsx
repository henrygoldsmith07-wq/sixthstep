"use client";
import { useState } from "react";
import { catalogue } from "@/lib/catalogue";
import { calendarItems, workspaceItems, plusDays } from "@/lib/operating-system";
import { todayISO, dateLabel } from "@/lib/domain";
import { useWorkspace } from "./workspace-context";
import { Heading, Empty } from "./shared";
import { ActionItem } from "./action-items";
import { CalendarExport } from "./calendar-export";
export function Calendar(){
 const {data,navigate,setActionState,openOpportunity}=useWorkspace(),today=todayISO();
 const [view,setView]=useState("Upcoming"),[month,setMonth]=useState(today.slice(0,7)),[day,setDay]=useState(""),[kind,setKind]=useState("All dates"),[count,setCount]=useState(30);
 const all=calendarItems(data,catalogue),filtered=all.filter(i=>kind==="All dates"||i.kind===kind);
 const dated=filtered.filter(i=>i.date),undated=filtered.filter(i=>!i.date),pending=workspaceItems(data,catalogue);
 const visible=dated.filter(i=>view==="Upcoming"?i.date>=today&&i.date<=plusDays(today,90):view==="Month"?i.date.startsWith(month)&&(!day||i.date===day):true);
 const shown=visible.slice(0,count);
 const groups=[...new Set(shown.map(i=>i.date))];
 const monthDays=month?new Date(Number(month.slice(0,4)),Number(month.slice(5)),0).getDate():0;
 const offset=month?(new Date(month+"-01T12:00:00Z").getUTCDay()+6)%7:0;
 return <><Heading eyebrow="YOUR PLAN IN ONE PLACE" title="Your calendar." description="Source dates, your tasks and suggested follow-ups. Approximate periods stay separate from exact dates." action={<button className="button secondary" onClick={()=>navigate("saved")}>Add a task in Applications</button>}/>
 <div className="feature-toolbar" role="group" aria-label="Calendar views">{["Upcoming","Month","Timeline"].map(v=><button key={v} className={"button "+(view===v?"primary":"secondary")} aria-pressed={view===v} onClick={()=>{setView(v);setDay("");setCount(30);}}>{v}</button>)}<label>Date type<select className="text-input" aria-label="Calendar date type" value={kind} onChange={e=>{setKind(e.target.value);setCount(30);}}><option>All dates</option>{[...new Set(all.map(i=>i.kind))].sort().map(k=><option key={k}>{k}</option>)}</select></label></div>
 <CalendarExport items={all} visible={visible} />
 {view==="Month"&&<section className="workspace-card"><label>Choose month<input className="text-input compact-select" type="month" aria-label="Calendar month" value={month} onChange={e=>{setMonth(e.target.value);setDay("");}}/></label><div className="month-grid" aria-label="Month dates">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=><span key={d} className="fine-print">{d}</span>)}{Array.from({length:offset},(_,i)=><span key={"gap-"+i}/>)}{Array.from({length:monthDays},(_,i)=>{const date=month+"-"+String(i+1).padStart(2,"0"),events=dated.filter(v=>v.date===date);return <button key={date} className={"calendar-day "+(date===day?"selected":"")} aria-label={dateLabel(date)+": "+events.length+" items"} aria-pressed={date===day} onClick={()=>setDay(day===date?"":date)}><strong>{i+1}</strong>{events.length>0&&<span>{events.length}<span className="sr-only"> items</span></span>}</button>;})}</div>{day&&<button className="inline-link" onClick={()=>setDay("")}>Show the whole month</button>}</section>}
 {!all.length?<Empty title="Start with one date worth remembering." action={()=>navigate("finder")} label="Find an opportunity">Save a programme with dates, or add a personal next action in Applications.</Empty>:<>{visible.length?groups.map(date=><section className="calendar-group" key={date}><h2>{dateLabel(date)}</h2>{shown.filter(i=>i.date===date).map(item=><ActionItem key={item.id} item={item} onOpportunity={id=>{const item=catalogue.find(i=>i.id===id);if(item)openOpportunity(item);}}/>)}</section>):<Empty title="No exact dates in this view." action={()=>{setView("Timeline");setKind("All dates");}} label="Show all dates">Check the undated items below or add a task date in Applications.</Empty>}{visible.length>count&&<button className="button secondary" onClick={()=>setCount(count+30)}>Show more dates</button>}
 <details className="workspace-section" open={!visible.length}><summary>Approximate periods & undated items ({undated.length})</summary><p className="fine-print">These have no exact scheduling date. Milestones already recorded as complete have no invented completion date.</p>{undated.slice(0,count).map(i=><ActionItem key={i.id} item={i} onOpportunity={id=>{const item=catalogue.find(i=>i.id===id);if(item)openOpportunity(item);}}/>)}{undated.length>count&&<button className="button secondary" onClick={()=>setCount(count+30)}>Show more undated items</button>}</details></>}
 {data.actionStates.length>0&&<details className="workspace-section"><summary>Reminder history & recovery</summary>{data.actionStates.slice().reverse().slice(0,100).map(s=><div className="compact-record" key={s.id}><span>{pending.find(p=>p.id===s.id)?.title||"Earlier reminder · original task may have changed"}<small>{s.state}{s.date?" · "+dateLabel(s.date):""}</small></span><button className="inline-link" onClick={()=>setActionState({...s,state:"Snoozed",date:today,at:new Date().toISOString()})}>Bring back today</button></div>)}<p className="fine-print">Bring back reactivates a reminder if its related task is still outstanding. Completed requirements stay complete.</p></details>}
 </>;
}
