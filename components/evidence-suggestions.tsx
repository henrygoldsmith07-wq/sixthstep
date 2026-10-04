"use client";
import { diversifyEvidence, evidenceGaps, evidenceKey, starComplete, suggestEvidence } from "@/lib/intelligence";
import type { EvidenceItem } from "@/lib/application-preparation";
import type { TrackedRecord, ApplicationQuestion } from "@/lib/domain";
import { useWorkspace } from "./workspace-context";
export function EvidenceSuggestions({record,question,bank,onCopy}:{record:TrackedRecord;question:ApplicationQuestion;bank:EvidenceItem[];onCopy:(e:EvidenceItem,star?:boolean)=>void}){
 const {navigate,setActiveExperience}=useWorkspace();
 const ranked=suggestEvidence(question.question,bank,{careerAreas:record.opportunity.careerAreas.length?record.opportunity.careerAreas:[record.opportunity.sector],experienceTypes:[record.opportunity.category]});
 // One example per experience first, so the list shows range rather than five views of the same event.
 const suggestions=diversifyEvidence(ranked),visible=suggestions.slice(0,5);
 const gaps=evidenceGaps(question.question,bank);
 return <details className="evidence-suggestions" open={!question.draft.trim()}><summary>Evidence for this question ({suggestions.length})</summary><p className="fine-print">Matches use your recorded skills, topics and career areas. Inspect the original example before reusing it.</p>
 {gaps.length>0&&<p className="fine-print">This question looks for {gaps.join(", ").toLowerCase()}, and you have not recorded an example {gaps.length===1?"of it":"of them"} yet. Add one in Experiences if you have something real to write about.</p>}
 {visible.length?visible.map(({evidence:e,reasons})=><div className="evidence-suggestion-wrap" key={evidenceKey(e)}><p className="fine-print">{reasons[0]}</p><details className="evidence-suggestion"><summary>{e.experienceName} — {e.skill}</summary><p>{reasons.join("; ")}</p><dl><dt>Context</dt><dd>{e.whatHappened||"Not recorded"}</dd><dt>Your recorded action</dt><dd>{e.action}</dd><dt>Result</dt><dd>{e.star?.result||"Not recorded — add your own result"}</dd><dt>Learning</dt><dd>{e.learning||"Not recorded"}</dd></dl><p className="fine-print">{e.date||"Date not recorded"} · {starComplete(e)?"Complete STAR recorded":"STAR details may be missing"}</p><div className="detail-actions"><button className="button secondary" onClick={()=>onCopy(e)}>Copy to draft</button><button className="button secondary" onClick={()=>onCopy(e,true)}>Build STAR response</button><button className="inline-link" onClick={()=>{setActiveExperience(e.experienceId);navigate("reflect");}}>Inspect source experience</button></div></details></div>):<p className="card-intro">No recorded examples connect yet. Capture one specific action in Experiences.</p>}
 {suggestions.length>visible.length&&<p className="fine-print">Showing {visible.length} of {suggestions.length} matching examples.</p>}
 <button className="inline-link" onClick={()=>navigate("evidence")}>Browse all my evidence</button></details>;
}