import { evidenceBank, type ApplicationQuestion, type TrackedRecord } from "./domain";
import { evidenceKey, questionCount } from "./intelligence";
export type EvidenceItem=ReturnType<typeof evidenceBank>[number];
export function evidenceSignature(e:EvidenceItem){
 const text=JSON.stringify([e.experienceName,e.organisation,e.date,e.skill,e.whatHappened,e.action,e.learning,e.quote,e.star,e.sectors]);
 let hash=2166136261;for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(16);
}
export function linkEvidence(question:ApplicationQuestion,e:EvidenceItem){
 const id=evidenceKey(e);return {evidenceIds:[...new Set([...question.evidenceIds,id])].slice(0,60),evidenceSnapshots:[...question.evidenceSnapshots.filter(s=>s.id!==id),{id,signature:evidenceSignature(e)}].slice(0,60),evidenceReviewed:false};
}
export function evidenceIssues(question:ApplicationQuestion,bank:EvidenceItem[]){
 return question.evidenceIds.flatMap<{id:string;kind:"removed"|"unknown"|"changed";message:string}>(id=>{
  const source=bank.find(e=>evidenceKey(e)===id),snapshot=question.evidenceSnapshots.find(s=>s.id===id);
  if(!source)return [{id,kind:"removed" as const,message:"Source evidence was removed. Review any copied text before using this answer."}];
  if(!snapshot)return [{id,kind:"unknown" as const,message:"The source version was not recorded for this older draft. Compare your copied text with the original experience."}];
  if(snapshot.signature!==evidenceSignature(source))return [{id,kind:"changed" as const,message:"Source evidence changed after it was copied. Your draft has been kept unchanged; compare it with the original experience."}];
  return [];
 });
}
export function questionValidity(q:ApplicationQuestion){
 const issues:string[]=[];
 if(!q.draft.trim()||q.limit>0&&q.limitKind!=="None"&&questionCount(q)>q.limit)issues.push("Add a draft within its stated limit before marking it ready or submitted.");
 if(/\[Add your own detail\]/i.test(q.draft))issues.push("Fill the missing evidence prompts with your own details before marking this answer ready.");
 if(q.evidenceIds.length&&!q.evidenceReviewed)issues.push("Review and adapt the copied evidence to answer this question before marking it ready.");
 return issues;
}
export function applicationPreparation(record:TrackedRecord,bank:EvidenceItem[]){
 const requirements=record.requirements.filter(r=>!r.done).length,tasks=record.checklist.filter(r=>!r.done).length;
 const answers=record.questions.filter(q=>q.status==="Draft"||questionValidity(q).length).length;
 const changedSources=record.questions.reduce((n,q)=>n+evidenceIssues(q,bank).length,0);
 const known=record.requirements.length>0||record.questions.length>0;
 return {requirements,tasks,answers,changedSources,label:!known?"Confirm the provider requirements":requirements||tasks||answers||changedSources?"Preparation still needs attention":"Recorded preparation complete — review the provider before submitting"};
}
