"use client";
import { useState } from "react";
import { calendarExport, exactCalendarItems } from "@/lib/calendar-export";
import { catalogue } from "@/lib/catalogue";
import { opportunityCollection } from "@/lib/opportunity-repository";
import type { WorkspaceItem } from "@/lib/operating-system";
import { download } from "./shared";
import { useWorkspace } from "./workspace-context";
export function CalendarExport({items,visible}:{items:WorkspaceItem[];visible:WorkspaceItem[]}){
 const {data}=useWorkspace(),[kinds,setKinds]=useState<string[]>([]),[message,setMessage]=useState("");
 const exact=exactCalendarItems(items),types=[...new Set(exact.map(i=>i.kind))].sort(),selected=exact.filter(i=>kinds.includes(i.kind));
 function exportDates(dates:WorkspaceItem[]){const valid=exactCalendarItems(dates);download("sixthstep-calendar.ics",calendarExport(valid,opportunityCollection(catalogue,data.records,data.discoveries),window.location.origin),"text/calendar;charset=utf-8");setMessage(valid.length+" exact dates exported. Approximate and unknown dates were excluded.");}
 return <details className="workspace-section calendar-export"><summary>Export to your calendar (.ics)</summary><p className="fine-print">All-day events retain date provenance and provider links. Event IDs stay stable across exports; your calendar app controls how repeated imports are handled. This is a file export, not ongoing sync.</p><div className="detail-actions"><button className="button secondary" disabled={!exact.length} onClick={()=>exportDates(items)}>Export full calendar</button><button className="button secondary" disabled={!exactCalendarItems(visible).length} onClick={()=>exportDates(visible)}>Export dates in this view</button></div><fieldset className="export-types"><legend>Choose date groups</legend>{types.map(kind=><label key={kind}><input type="checkbox" checked={kinds.includes(kind)} onChange={e=>setKinds(current=>e.target.checked?[...current,kind]:current.filter(k=>k!==kind))}/>{kind}</label>)}</fieldset><button className="button secondary" disabled={!selected.length} onClick={()=>exportDates(selected)}>Export selected groups ({selected.length})</button>{message&&<p role="status">{message}</p>}</details>;
}
