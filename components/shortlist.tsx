"use client";
import { useState } from "react";
import { intentions, type RichOpportunity } from "@/lib/domain";
import { useWorkspace } from "./workspace-context";
import { Heading, Empty, Field } from "./shared";
import { Comparison, SourceBadge, Fit } from "./opportunity";
export function Shortlist({onBrowse}:{onBrowse:()=>void}){
 const {data,updateRecord,setActiveRecord,navigate}=useWorkspace(),[filter,setFilter]=useState("Shortlisted"),[ids,setIds]=useState<string[]>([]),[compare,setCompare]=useState(false);
 const records=data.records.filter(r=>["Saved","Researching","Preparing application"].includes(r.status)&&(filter==="All interests"||r.intent===filter));
 const selected=data.records.filter(r=>ids.includes(r.opportunity.id)).map(r=>r.opportunity);
 return <><Heading eyebrow="MAKE SPACE TO CHOOSE" title="Your shortlist." description="Keep possibilities light until you're ready. Compare the trade-offs, then choose what deserves an application."/>
 <Field label="Shortlist view"><select className="text-input compact-select" value={filter} onChange={e=>setFilter(e.target.value)}><option>All interests</option>{intentions.map(i=><option key={i}>{i}</option>)}</select></Field>
 {!records.length?<Empty title="Keep a few possibilities in view." action={onBrowse} label="Browse opportunities">Save something that interests you, then mark it Shortlisted. You can explore before committing to an application.</Empty>:<div className="tracked-list">{records.map(r=><article className="workspace-card" key={r.opportunity.id}><SourceBadge item={r.opportunity}/><p className="provider-name">{r.opportunity.provider}</p><h2>{r.opportunity.title}</h2><Fit item={r.opportunity} compact/><Field label={"Interest level for "+r.opportunity.title}><select className="text-input" value={r.intent} onChange={e=>updateRecord(r.opportunity.id,{intent:e.target.value as typeof r.intent})}>{intentions.map(i=><option key={i}>{i}</option>)}</select></Field><div className="detail-actions"><label className="toggle-label"><input type="checkbox" checked={ids.includes(r.opportunity.id)} disabled={!ids.includes(r.opportunity.id)&&ids.length>=4} onChange={e=>setIds(current=>e.target.checked?[...current,r.opportunity.id]:current.filter(id=>id!==r.opportunity.id))}/>Compare {r.opportunity.title}</label><button className="button primary" onClick={()=>{updateRecord(r.opportunity.id,{intent:"Applying",status:"Preparing application"});setActiveRecord(r.opportunity.id);navigate("saved");}}>Choose to apply</button><button className="button secondary" onClick={()=>{setActiveRecord(r.opportunity.id);navigate("saved");}}>Open workspace</button></div></article>)}</div>}
 {ids.length>0&&<div className="comparison-bar"><span>{ids.length} / 4 selected</span><button className="button primary" disabled={selected.length<2} onClick={()=>setCompare(true)}>Compare shortlist</button><button className="button secondary" onClick={()=>setIds([])}>Clear selection</button></div>}
 {compare&&<Comparison items={selected as RichOpportunity[]} onClose={()=>setCompare(false)}/>}</>;
}
