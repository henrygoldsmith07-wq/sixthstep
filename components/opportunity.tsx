"use client";
import { useEffect, useRef } from "react";
import { Bookmark, ArrowUpRight, X, CircleHelp, MapPin, Clock3, CheckCircle2, Sparkles, ExternalLink, Plus } from "lucide-react";
import { deadlineLabel, daysUntil, availability, dateLabel, type RichOpportunity } from "@/lib/domain";
import { deadlineIntelligence } from "@/lib/intelligence";
import { matchOpportunity } from "@/lib/recommendations";
import { useWorkspace } from "./workspace-context";
import { safeHref, Lines, Notice } from "./shared";
const themes:Record<string,string>={"Technology":"lavender","Engineering":"sage","Healthcare":"pink","Business & finance":"sand","Law":"blue","Creative & media":"peach","Science & research":"sage","Humanities & social sciences":"sand"};
export function SourceBadge({item}:{item:RichOpportunity}){
 const checked=item.source==="catalogue"&&item.sourceKind==="Programme";
 const label=checked?(deadlineIntelligence(item).stale?"Source checked · stale":"Source checked"):item.source==="web"?(item.sourceKind==="Directory"?"Web directory · unverified":"Web result · unverified"):item.source==="imported"?"Imported · review details":item.sourceKind==="Directory"?"Provider directory":"Your own record";
 return <span className={"source-badge "+(checked?"checked":item.sourceKind==="Directory"&&item.source==="catalogue"?"directory":"unverified")}>{checked?<CheckCircle2 size={12}/>:<CircleHelp size={12}/>} {label}</span>;
}
export function Fit({item,compact=false}:{item:RichOpportunity;compact?:boolean}){
 const {data}=useWorkspace(),match=matchOpportunity(item,data.profile,{records:data.records,experiences:data.experiences});
 if(!data.profile.configured)return null;
 return <div className="fit-reasons">{!compact&&match.reasons.length>0&&<h3>Why this may suit you</h3>}{match.reasons.length>0&&<p className="match-note"><Sparkles size={13}/>{compact?match.reasons.slice(0,2).join(" · "):"Good fit because: "+match.reasons.join("; ")+ "."}</p>}
 {!compact&&[...match.conflicts,...match.checks].length>0&&<h3>Check before applying</h3>}{!compact&&[...match.conflicts,...match.checks].map((check,i)=><p className="fit-check" key={i}><CircleHelp size={13}/>{check}</p>)}
 </div>;
}
export function OpportunityCard({item,onOpen,compare,onCompare}:{item:RichOpportunity;onOpen:()=>void;compare?:boolean;onCompare?:()=>void}){
 const {data,save,updateRecord,setActiveRecord,navigate}=useWorkspace(),saved=data.records.some(r=>r.opportunity.id===item.id);
 const days=daysUntil(item.deadlineDate),state=availability(item);
 return <article className={"opportunity-card "+(themes[item.sector]||"sage")}>
 <div className="card-top"><SourceBadge item={item}/><button className={"icon-button bookmark-button "+(saved?"is-saved":"")} aria-label={(saved?"Open saved ":"Save ")+item.title} aria-pressed={saved} onClick={()=>{if(saved){setActiveRecord(item.id);navigate("saved");}else save(item);}}><Bookmark size={18} fill={saved?"currentColor":"none"}/></button></div>
 <p className="provider-name">{item.provider}</p><button className="card-title" onClick={onOpen}><h3>{item.title}</h3></button>
 <p className="card-description">{item.description}</p><div className="card-meta"><span><MapPin size={13}/>{item.format==="Virtual"?"Virtual":item.location}</span><span><Clock3 size={13}/>{item.duration}</span></div>
 <dl className="opportunity-facts"><div><dt>Sector</dt><dd>{item.sector}</dd></div><div><dt>Years / age</dt><dd>{item.years.join(", ")||"Year not stated"} · {item.minAge!==undefined||item.maxAge!==undefined?(item.minAge??"?")+"–"+(item.maxAge??"?"):"Age not stated"}</dd></div><div><dt>Cost / delivery</dt><dd>{item.cost} · {item.format}</dd></div><div><dt>Applications</dt><dd>{state==="Unknown"?"Check source":state} · {deadlineIntelligence(item).kind}</dd></div></dl><Fit item={item} compact/>{item.source==="web"&&<p className="fine-print">{item.resultKind||"Unclassified"} · {item.authority||"Other source"}</p>}
 {item.deadlineDate&&<p className={"deadline-note "+(days!==null&&days>=0&&days<=30?"soon":days!==null&&days<0?"past":"")}>{days!==null&&days>=0&&days<=30?"Closing soon · ":""}{deadlineLabel(item.deadlineDate)}</p>}
 {state==="Not yet open"||state==="Closed"?<p className="fine-print">Applications: {state.toLowerCase()}</p>:null}
 <details className="card-checks"><summary>Eligibility & source</summary><p>{item.eligibility}</p><p>{item.subjectRequirements}</p><p>Checked: {item.checkedAt?dateLabel(item.checkedAt.slice(0,10)):"Not checked by SixthStep"}{deadlineIntelligence(item).stale?" · Possibly stale":""}</p><p>{matchOpportunity(item,data.profile).checks.join("; ")||"Read the full provider criteria before applying."}</p></details><div className="card-bottom"><span className="type-tag">{item.category}</span><div className="card-controls"><button className="inline-link" aria-label={"Shortlist "+item.title} onClick={()=>{if(!saved)save(item);updateRecord(item.id,{intent:"Shortlisted"});}}>Shortlist</button>{onCompare&&<button className="compare-toggle" aria-pressed={compare} onClick={onCompare} aria-label={"Compare "+item.title}>{compare?"Selected":"Compare"}</button>}<button className="card-link" onClick={onOpen} aria-label={"View details: "+item.title}><ArrowUpRight size={20}/></button></div></div>
 </article>;
}
export function OpportunityDialog({item,onClose}:{item:RichOpportunity|null;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null),{save,data,startImport}=useWorkspace();
 useEffect(()=>{if(item&&!ref.current?.open)ref.current?.showModal();if(!item&&ref.current?.open)ref.current?.close();},[item]);
 return <dialog ref={ref} className="opportunity-dialog" onCancel={onClose} onClick={e=>{if(e.target===ref.current)onClose();}}>
 {item&&<div className="dialog-content"><button className="icon-button close-dialog" aria-label="Close details" onClick={onClose}><X size={21}/></button><SourceBadge item={item}/><p className="provider-name">{item.provider}</p><h2>{item.title}</h2><p className="dialog-description">{item.description}</p>
 {item.sourceKind==="Directory"&&<Notice>This is a directory, not a single placement. Choose a programme on the provider website.</Notice>}
 {item.source==="web"&&<Notice>This result has not been checked by SixthStep. Open the source or import it for editable extraction. Age suitability and availability are not verified.</Notice>}
 {item.source==="catalogue"&&<p className="fine-print">Source details checked {dateLabel(item.checkedAt.slice(0,10))}. This does not guarantee eligibility or current availability.</p>}
 <Fit item={item}/>
 <dl className="details-grid">{[
 ["Type",item.category],["Sector",item.sector+" · "+item.subSector],["Format",item.format],["Location",item.location],
 ["Eligibility",item.eligibility],["Age",item.minAge!==undefined||item.maxAge!==undefined?(item.minAge??"Not stated")+"–"+(item.maxAge??"no upper limit stated"):"Not stated"],
 ["School years",item.years.join(", ")||"Not stated"],["Relevant subjects",item.subjects.join(", ")||"Not stated"],["Subject requirements",item.subjectRequirements],["Geographic restrictions",item.geography],
 ["Cost",item.cost],["Duration",item.duration],["Start date",dateLabel(item.startDate)],
 ["Deadline",item.deadlineDate?dateLabel(item.deadlineDate)+" · "+item.deadline:item.deadline],
 ["Applications",availability(item)],["Application opening",item.openingDate?dateLabel(item.openingDate):item.openingPeriod||"Not stated"],["Expected closing period",item.closingPeriod||"Not stated"],["Certificate",item.certificate],["Selection",item.selection]
 ].map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
 <Lines title="What you could do" items={item.activities}/><Lines title="Skills to explore" items={item.skills}/>
 {deadlineIntelligence(item).stale&&<Notice>Source has not been checked recently. Verify current availability, dates and eligibility.</Notice>}{item.unconfirmed.length>0&&<Notice>Unconfirmed: {item.unconfirmed.join("; ")}</Notice>}
 <div className="dialog-actions">{safeHref(item.url)&&<a className="button primary" href={safeHref(item.url)} target="_blank" rel="noreferrer">Visit provider <ExternalLink size={15}/></a>}<button className="button secondary" disabled={data.records.some(r=>r.opportunity.id===item.id)} onClick={()=>save(item)}><Bookmark size={15}/>{data.records.some(r=>r.opportunity.id===item.id)?"Saved":"Save opportunity"}</button><button className="button text-button" onClick={()=>{startImport(item.url);onClose();}}><Plus size={15}/>Import / review page</button></div>
 <details className="setup-details"><summary>Sources and uncertainty</summary>{(item.sourceUrls.length?item.sourceUrls:[item.url]).filter(u=>safeHref(u)).map(u=><p key={u}><a href={safeHref(u)} target="_blank" rel="noreferrer">{new URL(u).hostname} <ExternalLink size={12}/></a></p>)}<p>Unknown facts stay “Not stated”. Activities and skills describe the programme; they are not achievements you can claim before completing it.</p></details></div>}
 </dialog>;
}
export function Comparison({items,onClose}:{items:RichOpportunity[];onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null),{data,save,updateRecord,toast}=useWorkspace();
 useEffect(()=>{ref.current?.showModal();},[]);
 const fields:[string,(item:RichOpportunity)=>string][]=[
 ["Provider",i=>i.provider],["Type",i=>i.category],["Sector",i=>i.sector],["Location",i=>i.location],["Format",i=>i.format],["Duration",i=>i.duration],
 ["Eligibility",i=>i.eligibility],["Cost",i=>i.cost],["Deadline",i=>i.deadlineDate?dateLabel(i.deadlineDate):i.deadline],
 ["Selection process",i=>i.selection],["Relevant subjects",i=>i.subjects.join("; ")||"Not stated"],["Time commitment",i=>i.durationBand],["Applications",i=>availability(i)+" · "+deadlineIntelligence(i).kind],["Checks",i=>{const m=matchOpportunity(i,data.profile,{records:data.records,experiences:data.experiences});return [...m.conflicts,...m.checks,...i.unconfirmed].join("; ")||"Check all provider criteria";}],["Activities",i=>i.activities.join("; ")||"Not stated"],["Skills",i=>i.skills.join("; ")||"Not stated"],
 ["Your fit",i=>{const m=matchOpportunity(i,data.profile,{records:data.records,experiences:data.experiences});return [...m.reasons,...m.conflicts,...m.checks].join("; ")||"Set your profile to see relevant connections";}]
 ];
 return <dialog ref={ref} className="comparison-dialog" onCancel={onClose}><div className="dialog-content"><button className="icon-button close-dialog" aria-label="Close comparison" onClick={onClose}><X/></button><h2>Compare your possibilities</h2><p className="card-intro">Look at the trade-offs. Rows with different values are highlighted; there is no winner. Check original sources before deciding.</p><button className="button primary" onClick={()=>{for(const item of items){save(item);updateRecord(item.id,{intent:"Shortlisted"});}toast("These possibilities are now in your shortlist");}}>Save this shortlist</button><div className="table-scroll comparison-scroll" tabIndex={0} aria-label="Opportunity comparison table"><table className="comparison-table"><caption className="sr-only">Side-by-side opportunity comparison</caption><thead><tr><th scope="col">Detail</th>{items.map(i=><th scope="col" key={i.id}>{i.title}<SourceBadge item={i}/></th>)}</tr></thead><tbody>{fields.map(([label,get])=><tr key={label} className={new Set(items.map(get)).size>1?"comparison-difference":""}><th scope="row">{label}</th>{items.map(i=><td key={i.id}>{get(i)}</td>)}</tr>)}<tr><th scope="row">Next step</th>{items.map(i=><td key={i.id}><button className="button secondary" disabled={data.records.some(r=>r.opportunity.id===i.id)} onClick={()=>save(i)}>{data.records.some(r=>r.opportunity.id===i.id)?"Saved":"Save opportunity"}</button></td>)}</tr></tbody></table></div></div></dialog>;
}
