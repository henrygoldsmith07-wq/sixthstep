"use client";
import { useEffect, useState } from "react";
import { Sparkles, Link2, FileText, Plus, LoaderCircle, ArrowRight, ClipboardCheck } from "lucide-react";
import { categories, formats, opportunitySchema, enrich, type RichOpportunity } from "@/lib/domain";
import { sectors } from "@/lib/types";
import { useWorkspace } from "./workspace-context";
import { Heading, Field, Notice, ExportButton, safeHref } from "./shared";
type Mode="link"|"text"|"manual";
const lines=(value:string)=>value.split("\n").map(s=>s.trim()).filter(Boolean).slice(0,30);
const commas=(value:string)=>value.split(",").map(s=>s.trim()).filter(Boolean).slice(0,30);
function ListEditor({value,onCommit,multiline=false,maxLength=1500,id,...props}:{id?:string;"aria-describedby"?:string;value:string[];onCommit:(items:string[])=>void;multiline?:boolean;maxLength?:number}){
 const [buffer,setBuffer]=useState(value.join(multiline?"\n":", "));
 const commit=()=>onCommit((multiline?lines(buffer):commas(buffer)).map(s=>s.slice(0,multiline?500:120)));
 return multiline?<textarea id={id} aria-describedby={props["aria-describedby"]} className="large-textarea short-textarea" maxLength={maxLength} value={buffer} onChange={e=>setBuffer(e.target.value)} onBlur={commit}/>:<input id={id} aria-describedby={props["aria-describedby"]} className="text-input" maxLength={maxLength} value={buffer} onChange={e=>setBuffer(e.target.value)} onBlur={commit}/>;
}
export function Importer(){
 const {importUrl,data,connections,save,updateRecord,setActiveRecord,navigate,toast}=useWorkspace();
 const [mode,setMode]=useState<Mode>(importUrl?"link":"text"),[url,setUrl]=useState(importUrl),[text,setText]=useState("");
 const [draft,setDraft]=useState<RichOpportunity|null>(null),[nextAction,setNextAction]=useState(""),[reviewed,setReviewed]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState("");
 useEffect(()=>{if(importUrl){setUrl(importUrl);setMode("link");setDraft(null);setReviewed(false);setError("");}},[importUrl]);
 function choose(next:Mode){setMode(next);setDraft(null);setReviewed(false);setError("");setNextAction("");}
 // Blank titles are permitted while editing, but validated before adding.
 function manual(){const value=enrich({id:"personal-"+crypto.randomUUID(),title:"New opportunity",source:"manual",sourceKind:"Personal record"});setMode("manual");setDraft({...value,title:""});setReviewed(false);setNextAction("");setError("");}
 async function extract(){
  setBusy(true);setError("");setDraft(null);setReviewed(false);
  try{
   const response=await fetch("/api/opportunity",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(mode==="link"?{url}:{text})});
   const result=await response.json();if(!response.ok)throw new Error(result.error||"The opportunity could not be read.");
   setDraft(opportunitySchema.parse(result.opportunity));setNextAction(String(result.nextSteps?.[0]||"Check eligibility and application instructions").slice(0,300));
  }catch(e){setError(e instanceof Error?e.message:"Try again, paste the page text or add the details yourself.");}
  finally{setBusy(false);}
 }
 function update(patch:Partial<RichOpportunity>){setDraft(value=>value?{...value,...patch}:value);setReviewed(false);}
 const existing=draft?data.records.find(r=>r.opportunity.id===draft.id||draft.url&&["imported","manual"].includes(draft.source)&&r.opportunity.url===draft.url):undefined;
 function add(){
  if(!draft)return;
  const parsed=opportunitySchema.safeParse(draft);
  if(!parsed.success){setError("Check the opportunity title, dates and field lengths before adding.");return;}
  if([draft.url,draft.applicationUrl,...draft.sourceUrls].some(v=>v&&!safeHref(v))){setError("Links must be public HTTPS addresses without embedded credentials.");return;}
  if(!reviewed){setError("Review the details and tick the confirmation before adding.");return;}
  const recordId=existing?.opportunity.id||draft.id;
  if(!existing){save(parsed.data);updateRecord(recordId,{nextAction});}
  setActiveRecord(recordId);navigate("saved");toast(existing?"Opened your existing opportunity":"Added to your application workspace");
 }
 const exported=draft?[draft.title,"Provider: "+draft.provider,draft.description,"Type: "+draft.category,"Format: "+draft.format,"Location: "+draft.location,"Duration: "+draft.duration,"Eligibility: "+draft.eligibility,"Subjects: "+draft.subjectRequirements,"Cost: "+draft.cost,"Deadline: "+draft.deadline+(draft.deadlineDate?" ("+draft.deadlineDate+")":""),"Activities:\n"+draft.activities.join("\n"),"Skills you could practise:\n"+draft.skills.join("\n"),"Certificate: "+draft.certificate,"Selection: "+draft.selection,"Source: "+draft.url,"Application: "+draft.applicationUrl,"Unconfirmed:\n"+draft.unconfirmed.join("\n"),"My next action: "+nextAction].join("\n\n"):"";
 return <><Heading eyebrow="READ IT. UNDERSTAND IT. TAKE THE NEXT STEP." title="Make an opportunity clearer." description="Paste a programme link or its text. Review the important details, then add it to the same workspace as your saved opportunities."/>
 <div className="workspace-grid import-workspace"><section className="workspace-card import-input"><div className="segmented" aria-label="Input method">
 <button className={mode==="link"?"selected":""} aria-pressed={mode==="link"} onClick={()=>choose("link")} disabled={busy}><Link2 size={14}/>Paste a link</button>
 <button className={mode==="text"?"selected":""} aria-pressed={mode==="text"} onClick={()=>choose("text")} disabled={busy}><FileText size={14}/>Paste text</button>
 <button className={mode==="manual"?"selected":""} aria-pressed={mode==="manual"} onClick={manual} disabled={busy}><Plus size={14}/>Add myself</button></div>
 {mode!=="manual"?<form onSubmit={e=>{e.preventDefault();void extract();}}>{mode==="link"?<Field label="Opportunity URL" hint="Use the programme page where possible. Some sites block extraction; paste the page text if needed."><input className="text-input" type="url" required maxLength={2000} value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://provider.org/programme"/></Field>:<Field label="Opportunity text" hint="Paste public programme information, including eligibility, dates and application instructions."><textarea className="large-textarea" required minLength={60} maxLength={12000} value={text} onChange={e=>setText(e.target.value)} placeholder="Paste the opportunity description here…"/></Field>}
 <Notice>{mode==="link"?"Reading a link uses the configured search/extraction service and AI provider.":"Summarising text uses the configured AI provider."} Leave out private details. AI can miss information; review the source before applying.</Notice>
 <button className="button primary wide" disabled={busy||(mode==="link"?!url.trim():text.trim().length<60)}>{busy?<LoaderCircle size={16} className="spin"/>:<Sparkles size={16}/>} {busy?"Reading the opportunity…":"Summarise & extract details"}</button></form>:<Notice>You can add and track an opportunity yourself without an AI key. Only enter details you know; leave unknown facts as “Not stated”.</Notice>}
 {error&&<p className="error-message" role="alert">{error}</p>}
 <div className="import-help"><h3>A useful summary becomes a plan.</h3><ol><li>Read the details and check anything unconfirmed.</li><li>Correct dates, eligibility and the application link.</li><li>Add your next action and track the application.</li></ol><p className="fine-print">Missing information stays explicit. An imported page is never labelled as an officially verified or currently open programme.</p>{connections?.ai===false&&<button className="inline-link" onClick={()=>navigate("settings")}>View server connection setup <ArrowRight size={13}/></button>}</div>
 </section><section className="workspace-card summary-output">
 {!draft?<div className="output-placeholder"><div className="placeholder-icon"><ClipboardCheck size={30}/></div><h2>Clarity before commitment.</h2><p>Your reviewed summary will appear here.<br/>Then it can become a saved opportunity.</p></div>:<>
 <span className="eyebrow muted">REVIEW BEFORE ADDING</span><h2>{mode==="manual"?"Your opportunity":"Your opportunity summary"}</h2>
 {draft.unconfirmed.length>0&&<Notice><strong>Unconfirmed:</strong> {draft.unconfirmed.join(" · ")}. Check these against the original source.</Notice>}
 <div className="form-grid"><Field label="Opportunity title"><input className="text-input" maxLength={180} value={draft.title} onChange={e=>update({title:e.target.value})}/></Field><Field label="Provider / organisation"><input className="text-input" maxLength={180} value={draft.provider} onChange={e=>update({provider:e.target.value})}/></Field>
 <Field label="Opportunity category"><select className="text-input" value={draft.category} onChange={e=>update({category:e.target.value as RichOpportunity["category"],type:e.target.value,sourceKind:e.target.value==="Provider directory"?"Directory":mode==="manual"?"Personal record":"Imported"})}>{categories.map(v=><option key={v}>{v}</option>)}</select></Field>
 <Field label="Sector"><select className="text-input" value={draft.sector} onChange={e=>update({sector:e.target.value})}>{[...new Set([...sectors,draft.sector])].map(v=><option key={v}>{v}</option>)}</select></Field></div>
 <Field label="Plain-English summary"><textarea className="large-textarea short-textarea" maxLength={1800} value={draft.description} onChange={e=>update({description:e.target.value})}/></Field>
 <details className="profile-preferences"><summary>Format, location & time commitment</summary><div className="form-grid"><Field label="Format"><select className="text-input" value={draft.format} onChange={e=>update({format:e.target.value as RichOpportunity["format"]})}>{formats.map(v=><option key={v}>{v}</option>)}</select></Field><Field label="Location"><input className="text-input" maxLength={300} value={draft.location} onChange={e=>update({location:e.target.value})}/></Field><Field label="Duration"><input className="text-input" maxLength={300} value={draft.duration} onChange={e=>update({duration:e.target.value})}/></Field><Field label="Duration band"><select className="text-input" value={draft.durationBand} onChange={e=>update({durationBand:e.target.value as RichOpportunity["durationBand"]})}>{["A few hours","1–3 days","4–7 days","1–2 weeks","Several weeks","Longer programme","Self-paced","Not stated"].map(v=><option key={v}>{v}</option>)}</select></Field></div>
 </details><Field label="Eligibility"><textarea className="large-textarea mini-textarea" maxLength={1200} value={draft.eligibility} onChange={e=>update({eligibility:e.target.value})}/></Field>
 <details className="profile-preferences"><summary>Age, subjects & other requirements</summary><div className="form-grid">
 <Field label="Minimum age"><input className="text-input" type="number" min={0} max={100} value={draft.minAge??""} onChange={e=>update({minAge:e.target.value===""?undefined:Number(e.target.value)})}/></Field><Field label="Maximum age"><input className="text-input" type="number" min={0} max={100} value={draft.maxAge??""} onChange={e=>update({maxAge:e.target.value===""?undefined:Number(e.target.value)})}/></Field></div>
 <Field label="Eligible school years" hint="Comma-separated; leave blank if not stated."><ListEditor key={draft.id+"-years"} value={draft.years} maxLength={600} onCommit={years=>update({years})}/></Field><Field label="Relevant subjects" hint="Comma-separated subject names."><ListEditor key={draft.id+"-subjects"} value={draft.subjects} maxLength={600} onCommit={subjects=>update({subjects})}/></Field><Field label="Subject requirements"><textarea className="large-textarea mini-textarea" maxLength={600} value={draft.subjectRequirements} onChange={e=>update({subjectRequirements:e.target.value})}/></Field><Field label="Geographic requirements"><textarea className="large-textarea mini-textarea" maxLength={600} value={draft.geography} onChange={e=>update({geography:e.target.value})}/></Field><Field label="Sub-sector"><input className="text-input" maxLength={150} value={draft.subSector} onChange={e=>update({subSector:e.target.value})}/></Field></details>
 <div className="form-grid"><Field label="Cost"><input className="text-input" maxLength={300} value={draft.cost} onChange={e=>update({cost:e.target.value})}/></Field><Field label="Deadline as stated"><input className="text-input" maxLength={300} value={draft.deadline} onChange={e=>update({deadline:e.target.value})}/></Field><Field label="Confirmed deadline date" hint="Only set a date when the day, month and year are confirmed."><input className="text-input" type="date" value={draft.deadlineDate} onChange={e=>update({deadlineDate:e.target.value})}/></Field><Field label="Programme / event start date"><input className="text-input" type="date" value={draft.startDate} onChange={e=>update({startDate:e.target.value})}/></Field></div>
 <details className="profile-preferences"><summary>Activities, skills & evidence</summary><Field label="What you would actually do" hint="One activity per line. These are programme activities, not achievements you have completed."><ListEditor key={draft.id+"-activities"} value={draft.activities} multiline maxLength={8000} onCommit={activities=>update({activities})}/></Field>
 <Field label="Skills you could practise" hint="Comma-separated; actual evidence is recorded after the experience."><ListEditor key={draft.id+"-skills"} value={draft.skills} onCommit={skills=>update({skills})}/></Field>
 <div className="form-grid"><Field label="Certificate / evidence"><textarea className="large-textarea mini-textarea" maxLength={300} value={draft.certificate} onChange={e=>update({certificate:e.target.value})}/></Field><Field label="Selection process"><textarea className="large-textarea mini-textarea" maxLength={600} value={draft.selection} onChange={e=>update({selection:e.target.value})}/></Field></div>
 </details><Field label="Original source URL"><input className="text-input" type="url" maxLength={2000} value={draft.url} onChange={e=>update({url:e.target.value,sourceUrls:e.target.value?[e.target.value]:[]})}/></Field><Field label="Application URL"><input className="text-input" type="url" maxLength={2000} value={draft.applicationUrl} onChange={e=>update({applicationUrl:e.target.value})}/></Field>
 {safeHref(draft.url)&&<a className="inline-link" href={safeHref(draft.url)} target="_blank" rel="noreferrer">Check the original source <ArrowRight size={13}/></a>}
 <Field label="My next action"><input className="text-input" maxLength={300} value={nextAction} onChange={e=>setNextAction(e.target.value)}/></Field>
 <label className="review-confirmation check-label"><input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)}/>I have reviewed these details and kept unknown information explicit.</label>
 <div className="detail-actions"><button className="button primary" disabled={!reviewed||!draft.title.trim()} onClick={add}>{existing?"Open existing opportunity":"Add to my opportunities"}<ArrowRight size={15}/></button><ExportButton name="sixthstep-opportunity-summary.txt" text={exported} label="Export summary"/></div>
 <p className="fine-print">Adding does not submit an application. Your record and next action are saved in this browser.</p>
 </>}
 </section></div></>;
}
