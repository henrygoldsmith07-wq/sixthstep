"use client";
import { recordDeadline, deadlineLabel, type TrackedRecord } from "@/lib/domain";
import { deadlineIntelligence } from "@/lib/intelligence";
import { useWorkspace } from "./workspace-context";
import { Field } from "./shared";
export function ApplicationDates({record,open,onOpenChange}:{record:TrackedRecord;open:boolean;onOpenChange:(open:boolean)=>void}){
 const {updateRecord}=useWorkspace();
 const update=(patch:Partial<TrackedRecord>)=>updateRecord(record.opportunity.id,patch);
 return <><details className="workspace-section" open={open} onToggle={e=>onOpenChange(e.currentTarget.open)}><summary>Dates, links & outcome</summary><div className="form-grid"><Field label="Application deadline" hint="Enter or correct a date. Leave blank to remove the countdown."><input className="text-input" type="date" value={recordDeadline(record)} onChange={e=>update({deadlineDate:e.target.value,deadlineOverride:true})}/></Field><div className="deadline-editor"><p className="field-label">Deadline context</p><p>{deadlineLabel(recordDeadline(record),record.opportunity.deadline)}</p><p className="fine-print">{deadlineIntelligence(record.opportunity).kind}{deadlineIntelligence(record.opportunity).stale?" · Possibly stale source":""}</p>{record.deadlineOverride&&<p className="fine-print">Student-entered override · original source deadline: {record.opportunity.deadlineDate||record.opportunity.deadline}</p>}{record.deadlineOverride&&<button className="inline-link" onClick={()=>update({deadlineOverride:false})}>Use source deadline again</button>}</div>
 <Field label="Application URL" hint="A public HTTPS link"><input className="text-input" type="url" maxLength={2000} value={record.applicationUrl} onChange={e=>update({applicationUrl:e.target.value})}/></Field><Field label="Date applied"><input className="text-input" type="date" value={record.appliedAt} onChange={e=>update({appliedAt:e.target.value})}/></Field>
 <Field label="Interview / event date"><input className="text-input" type="date" value={record.eventDate} onChange={e=>update({eventDate:e.target.value})}/></Field><Field label="Outcome"><input className="text-input" maxLength={1000} placeholder="e.g. Waiting for a reply" value={record.outcome} onChange={e=>update({outcome:e.target.value})}/></Field></div>
</details>
<details className="workspace-section"><summary>Notes</summary> <Field label="My notes"><textarea className="large-textarea short-textarea" maxLength={6000} value={record.notes} onChange={e=>update({notes:e.target.value})} placeholder="Questions to ask, application ideas, travel plans…"/></Field></details></>;
}
