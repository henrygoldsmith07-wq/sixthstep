"use client";
import { useEffect, useRef, useState } from "react";
import { Leaf, LayoutDashboard, CalendarDays, Compass, Bookmark, FileText, Layers3, Settings2, Menu, X, ArrowRight } from "lucide-react";
import { WorkspaceProvider, useWorkspace, type View } from "./workspace-context";
import { Calendar } from "./calendar";
import { Dashboard } from "./dashboard";
import { Explore } from "./explore";

import { Tracker } from "./tracker";
import { Journal } from "./journal";
import { EvidenceBank } from "./evidence";
import { Profile } from "./profile";
import { catalogue } from "@/lib/catalogue";
import { opportunityCollection } from "@/lib/opportunity-repository";
import { evidenceBank } from "@/lib/domain";
import { evidenceKey } from "@/lib/intelligence";
import { OpportunityDialog } from "./opportunity";
import { Empty, download } from "./shared";
const tabs=[
 {id:"dashboard",label:"Home",icon:LayoutDashboard},
 {id:"finder",label:"Explore",icon:Compass},
 {id:"saved",label:"Applications",icon:Bookmark},
 {id:"calendar",label:"Calendar",icon:CalendarDays},
 {id:"reflect",label:"Experiences",icon:FileText},
 {id:"evidence",label:"Evidence",icon:Layers3}
] as const;
function Shell(){
 const {data,view,navigate,ready,error,route,conflict,reloadStored,replaceData,activeOpportunity,setActiveOpportunity,setActiveRecord,setActiveExperience,setActiveEvidence,recordMetric,toast}=useWorkspace();
 const preview=opportunityCollection(catalogue,data.records,data.discoveries).find(o=>o.id===activeOpportunity)||null;
 const missing=ready&&(route.record&&!data.records.some(r=>r.opportunity.id===route.record)?"application":route.experience&&!data.experiences.some(e=>e.id===route.experience)?"experience":route.evidence&&!evidenceBank(data.experiences).some(e=>evidenceKey(e)===route.evidence)?"evidence item":activeOpportunity&&!preview?"opportunity":"");
 useEffect(()=>{if(ready&&activeOpportunity&&preview)recordMetric("view");},[ready,activeOpportunity,preview?.id]);
 const [mobile,setMobile]=useState(false);
 const menuButton=useRef<HTMLButtonElement>(null),menuClose=useRef<HTMLButtonElement>(null),sidebar=useRef<HTMLElement>(null),returnFocus=useRef(false);
 function go(next:View){navigate(next);setMobile(false);}
 function closeMenu(){returnFocus.current=true;setMobile(false);}
 useEffect(()=>{
  if(!mobile){if(returnFocus.current){returnFocus.current=false;menuButton.current?.focus();}return;}menuClose.current?.focus();
  const close=(e:KeyboardEvent)=>{
   if(e.key==="Escape"){e.preventDefault();closeMenu();}
   if(e.key==="Tab"){const buttons=sidebar.current?.querySelectorAll<HTMLButtonElement>("button:not([disabled])");if(!buttons?.length)return;const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  };
  window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close);
 },[mobile]);
 const label=view==="settings"?"Profile":view==="summarise"?"Explore":tabs.find(t=>t.id===view)?.label;
 return <div className="app-shell"><a className="skip-link" href="#main-content" onClick={e=>{e.preventDefault();document.getElementById("main-content")?.focus();}}>Skip to content</a>
 {mobile&&<button className="nav-backdrop" aria-label="Close navigation" onClick={closeMenu}/>}
 <aside ref={sidebar} className={"sidebar "+(mobile?"mobile-open":"")} aria-label="Main navigation" id="main-navigation">
 <button className="brand" onClick={()=>go("dashboard")} aria-label="SixthStep home"><span className="brand-icon"><Leaf strokeWidth={1.8}/></span>SixthStep<span className="brand-dot">.</span></button>
 <button ref={menuClose} className="icon-button mobile-close" aria-label="Close menu" onClick={closeMenu}><X size={20}/></button>
 <p className="nav-section-label">YOUR NEXT CHAPTER</p><nav>{tabs.map(tab=><button key={tab.id} className={"nav-item "+((view===tab.id||view==="summarise"&&tab.id==="finder")?"active":"")} aria-current={(view===tab.id||view==="summarise"&&tab.id==="finder")?"page":undefined} onClick={()=>go(tab.id)}><tab.icon size={18} strokeWidth={1.7}/>{tab.label}{tab.id==="saved"&&data.records.length>0&&<span className="nav-count">{data.records.length}</span>}</button>)}</nav>
 <div className="sidebar-note"><Leaf size={19}/><h3>Room to grow.</h3><p>You don't need to know your whole future. Start with one possibility.</p><button className="inline-link" onClick={()=>go("finder")}>Explore something new <ArrowRight size={12}/></button></div>
 <div className="sidebar-bottom"><button className={"nav-item "+(view==="settings"?"active":"")} aria-current={view==="settings"?"page":undefined} onClick={()=>go("settings")}><Settings2 size={18}/>Profile</button><p className="sidebar-credit">A little experience. A lot of possibility.</p></div>
 </aside><div className="main-shell" inert={mobile}><header className="topbar"><button ref={menuButton} className="icon-button mobile-menu" aria-label="Open menu" aria-expanded={mobile} aria-controls="main-navigation" onClick={()=>setMobile(true)}><Menu size={20}/></button><p className="breadcrumb">Your workspace <span>/</span><strong>{label}</strong></p><span className="topbar-badge"><Leaf size={12}/>Designed for sixth form</span></header>
 <main className="content" id="main-content" tabIndex={-1}>
 {error&&<div className="error-message" role="alert">{error} <button className="inline-link" onClick={()=>go("settings")}>Open backup & recovery</button>{conflict&&<div className="detail-actions"><button className="button secondary" onClick={()=>download("sixthstep-current-edits.json",JSON.stringify(data,null,2),"application/json")}>Export this tab's edits</button><button className="button secondary" onClick={()=>void reloadStored()}>Use the other tab's version</button><button className="button secondary" onClick={()=>void replaceData(data)}>Keep this tab's version</button></div>}</div>}
 {!ready?<p className="notice" role="status">Opening your workspace…</p>:missing?<Empty title={"This "+missing+" is not in this browser."} action={()=>{if(route.record)setActiveRecord("");else if(route.experience)setActiveExperience("");else if(route.evidence)setActiveEvidence("");else setActiveOpportunity("");}} label="Return to my workspace">Links identify local records. Restore a workspace backup on another device, or return to find an existing record.</Empty>:view==="dashboard"?<Dashboard/>:view==="finder"||view==="summarise"?<Explore/>:view==="saved"?<Tracker/>:view==="reflect"?<Journal/>:view==="evidence"?<EvidenceBank/>:view==="calendar"?<Calendar/>:<Profile/>}
 {ready&&preview&&<OpportunityDialog item={preview} onClose={()=>setActiveOpportunity("")}/>}
 <div className="workspace-link"><button className="inline-link" onClick={()=>{if(!navigator.clipboard){toast("Copy the address from your browser to bookmark this workspace.");return;}void navigator.clipboard.writeText(window.location.href).then(()=>toast("Workspace link copied")).catch(()=>toast("Copy the address from your browser to bookmark this workspace."));}}>Copy workspace link</button><span className="fine-print">Application and experience links open the data stored in this browser.</span></div>
 <footer className="footer"><span className="footer-brand">SixthStep.</span><span>Discover. Apply. Reflect. Grow.</span><button className="inline-link" onClick={()=>go("settings")}>Your data & connections <ArrowRight size={12}/></button></footer>
 </main></div></div>;
}
export default function SixthStep(){return <WorkspaceProvider><Shell/></WorkspaceProvider>;}
