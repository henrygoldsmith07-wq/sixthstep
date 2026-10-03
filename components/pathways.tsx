"use client";
import { useState } from "react";
import { pathways, pathwayOpportunities } from "@/lib/pathways";
import { catalogue } from "@/lib/catalogue";
import { relatedAreas } from "@/lib/careers";
import { useWorkspace } from "./workspace-context";
import { Empty } from "./shared";


export function Pathways(){
 const {data,navigate,startDiscovery,openOpportunity}=useWorkspace();
 const starting=relatedAreas([data.profile.careerInterests,...data.profile.interests,...data.experiences.flatMap(e=>e.careerAreas)].join(" ")).find(a=>pathways.some(p=>p.area===a.area))?.area||"Engineering";
 const [area,setArea]=useState<string>(starting);
 const path=pathways.find(p=>p.area===area)!,items=pathwayOpportunities(area,catalogue);
 const sources=data.experiences.filter(e=>e.careerAreas.some(c=>relatedAreas(c).some(a=>a.area===area))||e.careerAreas.includes(area));
 return <section className="workspace-card pathway-panel" aria-label="Pathway exploration"><h2>Explore possible pathways</h2><p className="card-intro">A starting area connects to subjects, future routes and things you could try. These are possibilities, not advice about which career you should choose.</p><label>Starting area<select className="text-input compact-select" aria-label="Pathway starting area" value={area} onChange={e=>setArea(e.target.value)}>{pathways.map(p=><option key={p.area}>{p.area}</option>)}</select></label><div className="form-grid"><section><h3>Possible directions</h3><ul>{path.possibilities.map(p=><li key={p}>{p}</li>)}</ul><p className="fine-print">Your activity does not establish commitment, admission eligibility or suitability.</p></section><section><h3>Subjects to explore</h3><p>{path.subjects.join(" · ")}</p><p className="fine-print">These are exploration connections. Entry requirements differ by course and provider.</p><a className="inline-link" href={path.guide} target="_blank" rel="noreferrer">Read the {area==="Medicine"?"NHS careers":"UCAS subject"} guide</a></section></div><h3>Related opportunities to try</h3><p className="fine-print">These share the broad area. Check each programme's exact content and eligibility.</p>{items.length?items.slice(0,4).map(i=><button className="compact-record" key={i.id} onClick={()=>openOpportunity(i)}><strong>{i.title}</strong><small>{i.provider} · {i.category} · Shared {area.toLowerCase()} area</small></button>):<Empty title="Try another exploration area." action={()=>navigate("finder")} label="Browse all opportunities">No related sources are currently in the collection.</Empty>}<div className="detail-actions"><button className="button secondary" onClick={()=>startDiscovery(area==="Medicine"?"Healthcare":area)}>Find more in this area</button></div>{sources.length>0&&<details className="workspace-section"><summary>Your related experiences ({sources.length})</summary>{sources.map(e=><p key={e.id}>{e.name} · area you recorded: {e.careerAreas.join(", ")}</p>)}</details>}</section>;
}
