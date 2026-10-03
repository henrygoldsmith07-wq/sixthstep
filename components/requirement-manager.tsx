"use client";
import { useState } from "react";
import type { TrackedRecord } from "@/lib/domain";
import { requirementOptions } from "@/lib/intelligence";
import { useWorkspace } from "./workspace-context";
import { Field, Notice } from "./shared";
export function RequirementManager({record}:{record:TrackedRecord}){
 const {updateRecord,toast}=useWorkspace(),[requirement,setRequirement]=useState(requirementOptions[0]),[custom,setCustom]=useState("");
 const update=(patch:Partial<TrackedRecord>)=>updateRecord(record.opportunity.id,patch);
 function addRequirement(label:string){if(!label.trim()||record.requirements.length>=40)return;if(record.requirements.some(r=>r.label.toLowerCase()===label.trim().toLowerCase())){toast("That requirement is already recorded");return;}update({requirements:[...record.requirements,{id:crypto.randomUUID(),label:label.trim(),note:"",done:false}]});setCustom("");}

 return (<details className="workspace-section"><summary>Application requirements</summary><Notice>Nothing is assumed. Add only requirements you have confirmed with the provider. “Complete” means you have dealt with that item.</Notice>
 <div className="form-grid"><Field label="Confirmed requirement"><select className="text-input" value={requirement} onChange={e=>setRequirement(e.target.value)}>{requirementOptions.map(r=><option key={r}>{r}</option>)}</select></Field><div className="field-cta"><button className="button secondary" disabled={record.requirements.length>=40} onClick={()=>addRequirement(requirement)}>Add confirmed requirement</button></div></div>
 <form className="requirement-form" onSubmit={e=>{e.preventDefault();addRequirement(custom);}}><Field label="Other confirmed requirement"><input className="text-input" maxLength={250} value={custom} onChange={e=>setCustom(e.target.value)}/></Field><button className="button secondary" disabled={!custom.trim()||record.requirements.length>=40}>Add requirement</button></form>
 <ul className="task-list">{record.requirements.map(r=><li key={r.id}><div className="requirement-row"><label><input type="checkbox" checked={r.done} onChange={()=>update({requirements:record.requirements.map(v=>v.id===r.id?{...v,done:!v.done}:v)})}/><span>{r.label}</span></label><Field label={"Requirement notes: "+r.label}><input className="text-input" maxLength={1000} value={r.note} onChange={e=>update({requirements:record.requirements.map(v=>v.id===r.id?{...v,note:e.target.value}:v)})}/></Field></div><button className="icon-button" aria-label={"Remove requirement "+r.label} onClick={()=>update({requirements:record.requirements.filter(v=>v.id!==r.id)})}>×</button></li>)}</ul></details>);
}
