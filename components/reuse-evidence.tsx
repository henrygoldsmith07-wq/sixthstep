"use client";
import { useEffect, useRef, useState } from "react";
import { questionSchema, evidenceBank, type ApplicationQuestion } from "@/lib/domain";
import { evidenceText } from "@/lib/intelligence";
import { useWorkspace } from "./workspace-context";
import { Field, Notice } from "./shared";
import { linkEvidence } from "@/lib/application-preparation";
export function ReuseEvidence({evidence,purpose,onClose}:{evidence:ReturnType<typeof evidenceBank>[number];purpose:"Application"|"Interview";onClose:()=>void}){
 const {data,updateRecord,setActiveRecord,setActiveQuestion,navigate,toast,recordMetric}=useWorkspace(),ref=useRef<HTMLDialogElement>(null);
 const candidates=data.records.filter(r=>!["Completed","Not pursuing","Unsuccessful"].includes(r.status));
 const [recordId,setRecordId]=useState(candidates[0]?.opportunity.id||""),[questionId,setQuestionId]=useState(""),[text,setText]=useState("Describe a time you demonstrated "+evidence.skill.toLowerCase()+"."),[star,setStar]=useState(false),[error,setError]=useState("");
 const record=candidates.find(r=>r.opportunity.id===recordId),question=record?.questions.find(q=>q.id===questionId);
 useEffect(()=>{const previous=document.activeElement;ref.current?.showModal();return()=>{if(previous instanceof HTMLElement&&previous.isConnected)previous.focus();};},[]);
 function reuse(){
  if(!record)return;
  const entry:ApplicationQuestion=question||questionSchema.parse({id:crypto.randomUUID(),question:text.trim(),purpose});
  const draft=[entry.draft.trim(),evidenceText(evidence,star)].filter(Boolean).join("\n\n");
  if(draft.length>20000){setError("The selected draft is full. Shorten it before adding evidence.");return;}
  const next={...entry,draft,status:"Draft" as const,...linkEvidence(entry,evidence)};
  updateRecord(record.opportunity.id,{questions:question?record.questions.map(q=>q.id===question.id?next:q):[...record.questions,next]});
  recordMetric("reuse");setActiveRecord(record.opportunity.id);setActiveQuestion(next.id);onClose();navigate("saved");toast("Recorded evidence copied to your draft. Review and adapt it before using.");
 }
 return <dialog ref={ref} className="opportunity-dialog" onCancel={onClose}><div className="dialog-content"><button className="icon-button close-dialog" aria-label="Close evidence reuse" onClick={onClose}>×</button><h2>Use your recorded evidence</h2><p className="card-intro">{evidence.experienceName} — {evidence.skill}</p><Notice>This copies your recorded words and retains a source reference. It does not invent an answer or send your application to AI.</Notice>
 {!candidates.length?<p className="card-intro">Save an opportunity first, then return here to use this example in an application or interview draft.</p>:<><Field label="Destination opportunity"><select className="text-input" value={recordId} onChange={e=>{setRecordId(e.target.value);setQuestionId("");setError("");}}>{candidates.map(r=><option key={r.opportunity.id} value={r.opportunity.id}>{r.opportunity.title}</option>)}</select></Field><Field label="Destination question"><select className="text-input" value={questionId} onChange={e=>setQuestionId(e.target.value)}><option value="">Create a new {purpose.toLowerCase()} question</option>{record?.questions.map(q=><option key={q.id} value={q.id}>{q.question}</option>)}</select></Field>
 {!question&&<Field label="Question to prepare"><textarea className="large-textarea mini-textarea" maxLength={1500} value={text} onChange={e=>setText(e.target.value)}/></Field>}
 <label className="review-confirmation"><input type="checkbox" checked={star} onChange={e=>setStar(e.target.checked)}/>Use a STAR structure. Missing details remain prompts for you to fill.</label><pre className="evidence-preview">{evidenceText(evidence,star)}</pre>
 {error&&<p className="error-message" role="alert">{error}</p>}<button className="button primary" disabled={!record||!question&&(!text.trim()||record.questions.length>=40)} onClick={reuse}>Copy to selected draft</button></>}</div></dialog>;
}
