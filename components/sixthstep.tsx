"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowRight, Search, Bookmark, Sparkles, Compass, Check, X, MapPin, Clock3, SlidersHorizontal, GraduationCap, BriefcaseBusiness, Code2, HeartPulse, Scale, Palette, Wrench, Leaf, Plus, Download, LoaderCircle, FileText, Settings2, ChevronDown, ExternalLink, Menu, CheckCircle2, CircleHelp, Trash2 } from "lucide-react";
import { catalogue } from "@/lib/catalogue";
import { sectors, type Opportunity, type SavedOpportunity, type Summary, type Reflection } from "@/lib/types";
import { filterOpportunities, matchReason } from "@/lib/filter";
import { csvCell } from "@/lib/csv";

type Tab="finder"|"summarise"|"saved"|"reflect"|"settings";
type Profile={year:string;subjects:string;interests:string[]};
const defaultProfile:Profile={year:"Year 12",subjects:"",interests:[]};
const tabs=[{id:"finder" as Tab,label:"Find experience",icon:Compass},{id:"summarise" as Tab,label:"AI summariser",icon:Sparkles},{id:"saved" as Tab,label:"My opportunities",icon:Bookmark},{id:"reflect" as Tab,label:"Experience journal",icon:FileText}];
const sectorIcon:Record<string,typeof Code2>={"Technology":Code2,"Engineering":Wrench,"Healthcare":HeartPulse,"Business & finance":BriefcaseBusiness,"Law":Scale,"Creative & media":Palette};
const themes:Record<string,string>={"Technology":"lavender","Engineering":"sage","Healthcare":"pink","Business & finance":"sand","Law":"blue","Creative & media":"peach"};
const themeFor=(sector:string)=>themes[sector]||"sage";

function useLocal<T>(key:string,initial:T,validate:(value:unknown)=>value is T){
 const [value,setValue]=useState<T>(initial),[ready,setReady]=useState(false),[error,setError]=useState("");
 useEffect(()=>{try{const raw=localStorage.getItem(key);if(raw){const parsed=JSON.parse(raw);if(validate(parsed))setValue(parsed);}}catch{setError("Your browser couldn't load saved data.");}setReady(true);},[key,validate]);
 useEffect(()=>{if(!ready)return;try{localStorage.setItem(key,JSON.stringify(value));}catch{setError("Your browser couldn't save changes. Export a copy before leaving.");}},[value,ready,key]);
 return {value,setValue,error,ready};
}
function validSaved(value:unknown):value is SavedOpportunity[]{return Array.isArray(value)&&value.every(v=>v&&typeof v.id==="string"&&typeof v.title==="string"&&typeof v.url==="string"&&/^https:\/\//.test(v.url)&&typeof v.description==="string"&&typeof v.sector==="string"&&Array.isArray(v.tags)&&["Interested","Applied","Completed"].includes(v.status));}
function validProfile(v:unknown):v is Profile{return typeof v==="object"&&v!==null&&"year" in v&&typeof v.year==="string"&&"subjects" in v&&typeof v.subjects==="string"&&"interests" in v&&Array.isArray(v.interests)&&v.interests.every(i=>typeof i==="string");}
function validString(v:unknown):v is string{return typeof v==="string";}
function downloadFile(name:string,content:string,type="text/plain"){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function sourceLink(value:string){try{const u=new URL(value);return u.protocol==="https:"?u.href:"#";}catch{return "#";}}
function formatDate(value:string){try{return new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"Europe/London"}).format(new Date(value));}catch{return value;}}

function HeroArt(){
 return <div className="hero-art" aria-hidden="true">
   <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
   <span className="art-star star-one">✦</span><span className="art-star star-two">✧</span>
   <div className="art-card art-card-back"><span className="tiny-label">YOUR POSSIBILITIES</span><div className="art-line"/><div className="art-line short"/></div>
   <div className="art-card art-card-front"><div className="art-card-top"><span className="art-logo"><BriefcaseBusiness size={21}/></span><span className="art-tick"><Check size={15}/></span></div><strong>Your next chapter</strong><span>More than a line on your CV.</span><div className="art-pill"><Leaf size={12}/> Room to grow</div></div>
   <div className="art-arrow"><ArrowUpRight size={41} strokeWidth={1.5}/></div>
   <div className="art-note"><Sparkles size={14}/> A little curiosity goes a long way</div>
 </div>;
}

function OpportunityCard({item,saved,onSave,onOpen,reason}:{item:Opportunity;saved:boolean;onSave:()=>void;onOpen:()=>void;reason:string|null}){
 const Icon=sectorIcon[item.sector]||Compass;
 return <article className={"opportunity-card "+themeFor(item.sector)}>
  <div className="card-top"><span className="provider-mark"><Icon size={22} strokeWidth={1.6}/></span><button type="button" className={"icon-button bookmark-button "+(saved?"is-saved":"")} onClick={onSave} aria-label={(saved?"Remove saved ":"Save ")+item.title} aria-pressed={saved}><Bookmark size={19} fill={saved?"currentColor":"none"}/></button></div>
  <p className="provider-name">{item.provider}</p>
  <button type="button" className="card-title" onClick={onOpen}><h3>{item.title}</h3></button>
  <p className="card-description">{item.description}</p>
  <div className="card-meta"><span><MapPin size={13}/>{item.location}</span><span><Clock3 size={13}/>{item.duration}</span></div>
  {reason&&<p className="match-note"><Sparkles size={12}/>{reason}</p>}
  <div className="card-bottom"><span className="type-tag">{item.type}</span><button type="button" className="card-link" onClick={onOpen} aria-label={"View details: "+item.title}><ArrowUpRight size={20}/></button></div>
 </article>;
}

function OpportunityDialog({item,onClose,onSave,saved,onSummarise}:{item:Opportunity|null;onClose:()=>void;onSave:()=>void;saved:boolean;onSummarise:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{if(item){dialog.current?.showModal();}else{dialog.current?.close();}},[item]);
 return <dialog className="opportunity-dialog" ref={dialog} onCancel={onClose} onClick={e=>{if(e.target===dialog.current)onClose();}}>
  {item&&<div className="dialog-content"><button type="button" className="icon-button close-dialog" onClick={onClose} aria-label="Close details"><X size={21}/></button>
   <span className={"detail-badge "+themeFor(item.sector)}>{item.sector}</span><p className="provider-name">{item.provider}</p><h2>{item.title}</h2><p className="dialog-description">{item.description}</p>
   {item.type==="Provider directory"&&<div className="notice"><CircleHelp size={18}/><span>This is a programme directory. Choose a specific programme on the provider's website to check dates and eligibility.</span></div>}
   {item.source==="web"&&<div className="notice"><CircleHelp size={18}/><span>This is a web search result. Availability and suitability for your age have not been verified.</span></div>}
   <dl className="details-grid">{[["Format",item.type],["Location",item.location],["Duration",item.duration],["Eligibility",item.eligibility],["Cost",item.cost],["Deadline",item.deadline]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
   <p className="fine-print">Source checked {formatDate(item.checkedAt)}. Confirm current details with the provider before applying. Simulations are learning activities and should be described accurately on your CV.</p>
   <div className="dialog-actions"><a className="button primary" href={sourceLink(item.url)} target="_blank" rel="noreferrer">Visit provider <ExternalLink size={16}/></a><button type="button" className="button secondary" onClick={onSave}><Bookmark size={16}/>{saved?"Saved":"Save opportunity"}</button><button type="button" className="button text-button" onClick={onSummarise}><Sparkles size={16}/> Summarise page</button></div>
  </div>}
 </dialog>;
}

export default function SixthStep(){
 const [tab,setTab]=useState<Tab>("finder"),[mobileNav,setMobileNav]=useState(false);
 const savedStore=useLocal<SavedOpportunity[]>("sixthstep-saved-v1",[],validSaved);
 const profileStore=useLocal<Profile>("sixthstep-profile-v1",defaultProfile,validProfile);
 const journalStore=useLocal<string>("sixthstep-journal-v1","",validString);
 const {value:saved,setValue:setSaved}=savedStore,{value:profile,setValue:setProfile}=profileStore;
 const [query,setQuery]=useState(""),[sector,setSector]=useState("All sectors"),[format,setFormat]=useState("All formats"),[age,setAge]=useState(""),[freeOnly,setFreeOnly]=useState(false),[verifiedAge,setVerifiedAge]=useState(false),[location,setLocation]=useState("");
 const [showFilters,setShowFilters]=useState(false),[live,setLive]=useState<Opportunity[]|null>(null),[searchBusy,setSearchBusy]=useState(false),[searchError,setSearchError]=useState(""),[selected,setSelected]=useState<Opportunity|null>(null),[sort,setSort]=useState("recommended");
 const [connections,setConnections]=useState<{ai:boolean;search:boolean}|null>(null);
 const [mode,setMode]=useState<"text"|"url">("text"),[input,setInput]=useState(""),[summary,setSummary]=useState<Summary|null>(null),[summarySource,setSummarySource]=useState(""),[summaryBusy,setSummaryBusy]=useState(false),[summaryError,setSummaryError]=useState("");
 const [reflection,setReflection]=useState<Reflection|null>(null),[reflectionBusy,setReflectionBusy]=useState(false),[reflectionError,setReflectionError]=useState("");
 const [toast,setToast]=useState("");
 const [editSummary,setEditSummary]=useState(false);
 useEffect(()=>{fetch("/api/status").then(r=>r.json()).then(setConnections).catch(()=>setConnections(null));},[]);
 useEffect(()=>{const read=()=>{const value=window.location.hash.slice(1);if(["finder","summarise","saved","reflect","settings"].includes(value))setTab(value as Tab);};read();window.addEventListener("hashchange",read);return()=>window.removeEventListener("hashchange",read);},[]);
 useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(""),3200);return()=>clearTimeout(timer);},[toast]);
 function navigate(next:Tab){setTab(next);window.location.hash=next;setMobileNav(false);}
 function toggleSave(item:Opportunity){setSaved(items=>items.some(v=>v.id===item.id)?items.filter(v=>v.id!==item.id):[...items,{...item,status:"Interested",savedAt:new Date().toISOString()}]);setToast(saved.some(v=>v.id===item.id)?"Removed from your opportunities":"Saved to your opportunities");}
 function openSummary(item:Opportunity){setSelected(null);setMode("url");setInput(item.url);setSummary(null);setSummaryError("");navigate("summarise");}
 async function searchWeb(){
  setSearchBusy(true);setSearchError("");
  try{const response=await fetch("/api/search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query,location,sector,format,age})});const data=await response.json();if(!response.ok)throw new Error(data.error);setLive(data.results);}
  catch(error){setSearchError(error instanceof Error?error.message:"Search couldn't complete.");}
  finally{setSearchBusy(false);}
 }
 async function summarise(){
  setSummaryBusy(true);setSummaryError("");setSummary(null);setEditSummary(false);
  try{const response=await fetch("/api/summarise",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(mode==="url"?{url:input.trim()}:{text:input})});const data=await response.json();if(!response.ok)throw new Error(data.error);setSummary(data.summary);setSummarySource(data.sourceUrl||"");}
  catch(error){setSummaryError(error instanceof Error?error.message:"Summary couldn't complete.");}
  finally{setSummaryBusy(false);}
 }
 async function reflect(){
  setReflectionBusy(true);setReflectionError("");setReflection(null);
  try{const response=await fetch("/api/reflect",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({notes:journalStore.value})});const data=await response.json();if(!response.ok)throw new Error(data.error);setReflection(data.reflection);}
  catch(error){setReflectionError(error instanceof Error?error.message:"Reflection couldn't complete.");}
  finally{setReflectionBusy(false);}
 }
 let results=filterOpportunities(live??catalogue,{query:live?"":query,sector,format,freeOnly,age,verifiedAge});
 results=[...results].sort((a,b)=>sort==="az"?a.title.localeCompare(b.title):Number(profile.interests.includes(b.sector))-Number(profile.interests.includes(a.sector)));
 const activeFilters=sector!=="All sectors"||format!=="All formats"||age||freeOnly||verifiedAge||query;
 function resetFilters(){setQuery("");setSector("All sectors");setFormat("All formats");setAge("");setFreeOnly(false);setVerifiedAge(false);setLocation("");}
 function exportSaved(){const quote=csvCell;const csv=["Title,Provider,Status,Source,Eligibility,Deadline",...saved.map(i=>[i.title,i.provider,i.status,i.url,i.eligibility,i.deadline].map(quote).join(","))].join("\r\n");downloadFile("sixthstep-opportunities.csv",csv,"text/csv");}
 function summaryText(s:Summary){return [s.title,s.overview,"Activities: "+s.activities.join("; "),"Skills: "+s.skills.join(", "),"Eligibility: "+s.eligibility,"Duration: "+s.duration,"Deadline: "+s.deadline,"Cost: "+s.cost,"Next steps:\n"+s.steps.map((v,i)=>(i+1)+". "+v).join("\n"),summarySource?"Source: "+summarySource:""].join("\n\n");}

 return <div className="app-shell">
 <a className="skip-link" href="#main">Skip to content</a>
 <aside className={"sidebar "+(mobileNav?"mobile-open":"")}>
  <a className="brand" href="#finder" onClick={()=>navigate("finder")}><span className="brand-icon"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19v-5h5V9h5V4h6v15H4Z" fill="currentColor"/></svg></span>sixthstep<span className="brand-dot">.</span></a>
  <button type="button" className="icon-button mobile-close" onClick={()=>setMobileNav(false)} aria-label="Close navigation"><X/></button>
  <p className="nav-section-label">YOUR NEXT CHAPTER</p>
  <nav aria-label="Main navigation">{tabs.map(({id,label,icon:Icon})=><a key={id} className={"nav-item "+(tab===id?"active":"")} href={"#"+id} onClick={()=>navigate(id)} aria-current={tab===id?"page":undefined}><Icon size={19}/><span>{label}</span>{id==="saved"&&saved.length>0&&<span className="nav-count">{saved.length}</span>}{id==="summarise"&&<span className="ai-label">AI</span>}</a>)}</nav>
  <div className="sidebar-note"><div className="note-illustration"><Leaf size={26} strokeWidth={1.5}/><span>✦</span></div><h3>Big futures.<br/>Small first steps.</h3><p>You don't need it all figured out. Start with something that interests you.</p><button type="button" className="note-link" onClick={()=>{navigate("settings");}}>Set your interests <ArrowRight size={15}/></button></div>
  <div className="sidebar-bottom"><button type="button" className={"nav-item "+(tab==="settings"?"active":"")} onClick={()=>navigate("settings")}><Settings2 size={18}/> My preferences</button><div className="student-profile"><span className="avatar"><GraduationCap size={20}/></span><span><strong>Your student space</strong><small>{profile.year} · UK sixth form</small></span></div></div>
 </aside>
 {mobileNav&&<button type="button" className="nav-backdrop" aria-label="Close navigation" onClick={()=>setMobileNav(false)}/>}
 <div className="main-shell">
  <header className="topbar"><button type="button" className="icon-button mobile-menu" onClick={()=>setMobileNav(true)} aria-label="Open navigation"><Menu size={22}/></button><div className="breadcrumb">Your future <span>/</span> <strong>{tab==="settings"?"My preferences":tabs.find(v=>v.id===tab)?.label}</strong></div><span className="topbar-badge"><span className="green-dot"/> Made for sixth form</span><button type="button" className="topbar-avatar" onClick={()=>navigate("settings")} aria-label="Open student preferences"><GraduationCap size={19}/></button></header>
  <main id="main" className="content" tabIndex={-1}>
  {tab==="finder"&&<>
   <section className="hero"><div className="hero-copy"><span className="eyebrow"><span className="little-spark">✦</span> A WORLD OF POSSIBILITIES</span><h1>Your next step<br/>starts <em>here.</em></h1><p>Find work experience that feels like you.<br className="desktop-br"/> Explore your interests. Give your future a head start.</p><div className="hero-footer"><span><CheckCircle2 size={16}/> Free to explore</span><span><GraduationCap size={18}/> Year 12 & 13</span></div></div><HeroArt/></section>
   <section className="search-section" aria-label="Find work experience">
    <form className="search-bar" onSubmit={e=>{e.preventDefault();if(connections?.search)void searchWeb();}}><div className="search-input"><Search size={21}/><input aria-label="Search opportunities" value={query} onChange={e=>setQuery(e.target.value)} placeholder="A career, company, or something you're curious about…" maxLength={160}/>{query&&<button type="button" className="icon-button small" onClick={()=>setQuery("")} aria-label="Clear search"><X size={15}/></button>}</div><div className="location-input"><MapPin size={18}/><input aria-label="Search location" placeholder="Town or UK region" maxLength={100} value={location} onChange={e=>setLocation(e.target.value)}/></div><button type="submit" className="button primary search-submit" disabled={searchBusy||!connections?.search}>{searchBusy?<LoaderCircle size={17} className="spin"/>:<Search size={17}/>} Search the web</button></form>
    <div className="search-help"><span>{connections?.search?"Browse our collection below, or search the web for current opportunities.":"Search the provider collection by keyword. Connect Tavily in settings to search the web."}</span>{live&&<button type="button" className="inline-link" onClick={()=>{setLive(null);setSearchError("");}}>Back to collection</button>}</div>
    {searchError&&<p role="alert" className="error-message">{searchError}</p>}
    <div className="sector-tabs" role="group" aria-label="Career sector">{sectors.map(s=><button type="button" key={s} onClick={()=>setSector(s)} className={"sector-tab "+(sector===s?"selected":"")} aria-pressed={sector===s}>{s}</button>)}</div>
   </section>
   <section aria-label="Opportunities">
    <div className="section-header"><div><span className="eyebrow muted">FIND YOUR THING</span><h2>{live?"From across the web":profile.interests.length?"Explore your possibilities":"A little inspiration to get started"}<span className="result-count">{results.length}</span></h2><p>{live?"Search results need a source check before you apply.":"Trusted places to explore, with the details that matter."}</p></div><button type="button" className={"button filter-button "+(showFilters?"filter-active":"")} onClick={()=>setShowFilters(!showFilters)} aria-expanded={showFilters}><SlidersHorizontal size={16}/> Filters {activeFilters&&<span className="filter-dot"/>}</button></div>
    {showFilters&&<div className="filter-panel"><label>Experience type<select value={format} onChange={e=>setFormat(e.target.value)}><option>All formats</option><option>Virtual experience</option><option>Job simulations</option><option>In person</option></select></label><label>Your age<select value={age} onChange={e=>setAge(e.target.value)}><option value="">Any age</option><option value="16">16</option><option value="17">17</option><option value="18">18</option></select></label><label className="check-label"><input type="checkbox" checked={freeOnly} onChange={e=>setFreeOnly(e.target.checked)}/> Confirmed free only</label><label className="check-label"><input type="checkbox" checked={verifiedAge} onChange={e=>setVerifiedAge(e.target.checked)}/> Explicit age eligibility only</label><button type="button" className="inline-link" onClick={resetFilters}>Reset filters</button><p className="filter-explanation">Unknown age requirements stay visible unless you choose explicit eligibility. Town and age are included when you search the web; result details still need checking.</p></div>}
    <div className="results-toolbar"><span>{live?"Live search results":"Curated provider collection"} <span className="toolbar-dot">·</span> {results.length} {results.length===1?"result":"results"}</span><label>Sort by <select aria-label="Sort opportunities" value={sort} onChange={e=>setSort(e.target.value)}><option value="recommended">Recommended</option><option value="az">A–Z</option></select></label></div>
    {searchBusy?<div className="empty-state"><LoaderCircle className="spin" size={30}/><h3>Finding possibilities…</h3><p>Checking the web for work experience sources.</p></div>:results.length?<div className="opportunity-grid">{results.map(item=><OpportunityCard key={item.id} item={item} saved={saved.some(i=>i.id===item.id)} onSave={()=>toggleSave(item)} onOpen={()=>setSelected(item)} reason={matchReason(item,profile.interests)}/>)}</div>:<div className="empty-state"><Search size={32}/><h3>A different search might open a door.</h3><p>No matches for these filters. Try a broader career interest, or search the web for local placements.</p><button type="button" className="button secondary" onClick={resetFilters}>Clear filters</button></div>}
   </section>
   <section className="summariser-banner"><div className="banner-icon"><Sparkles size={25} strokeWidth={1.5}/></div><div><h3>Long description? Let's make it simple.</h3><p>Turn an opportunity page into the things you actually need to know.</p></div><button type="button" className="button secondary" onClick={()=>navigate("summarise")}>Try the AI summariser <ArrowUpRight size={16}/></button></section>
  </>}
  {tab==="summarise"&&<>
   <PageHeading eyebrow="LESS SCROLLING. MORE CLARITY." title="Make sense of your" emphasis="next step." description="The important details, in plain English. Paste an opportunity and let AI help you understand it."/>
   <div className="workspace-grid"><section className="workspace-card"><div className="workspace-card-heading"><span className="workspace-icon"><FileText size={21}/></span><h2>Your opportunity</h2></div>
    <div className="segmented"><button type="button" className={mode==="text"?"selected":""} onClick={()=>{setMode("text");setInput("");setSummaryError("");}}>Paste a description</button><button type="button" className={mode==="url"?"selected":""} onClick={()=>{setMode("url");setInput("");setSummaryError("");}}>Use a link</button></div>
    <form onSubmit={e=>{e.preventDefault();void summarise();}}><label className="field-label" htmlFor="summary-input">{mode==="text"?"Opportunity description":"Public opportunity URL"}</label>{mode==="text"?<textarea id="summary-input" className="large-textarea" value={input} onChange={e=>setInput(e.target.value)} maxLength={12000} minLength={60} required placeholder="Paste the programme description here. Include requirements, dates, and application details if available…"/>:<input id="summary-input" className="text-input" type="url" value={input} onChange={e=>setInput(e.target.value)} required maxLength={2000} placeholder="https://…"/>}
    <p className="input-hint">{mode==="text"?input.length.toLocaleString()+" / 12,000 characters · minimum 60":"Some websites block extraction. If a link won't work, paste the text."}</p>
    <div className="notice compact"><CircleHelp size={16}/><span>Use public opportunity information. Leave out names, contact details, and private documents.</span></div>
    {summaryError&&<p className="error-message" role="alert">{summaryError}</p>}
    <button className="button primary wide" disabled={summaryBusy||!input.trim()} type="submit">{summaryBusy?<LoaderCircle className="spin" size={17}/>:<Sparkles size={17}/>} {summaryBusy?"Making it clearer…":"Summarise this opportunity"}</button>
    </form><p className="fine-print">Powered by Groq. Link extraction uses Tavily. AI can make mistakes; check the original before applying.</p>
   </section><section className="workspace-card summary-output" aria-live="polite">{summary?<><span className="eyebrow muted"><Sparkles size={13}/> YOUR OPPORTUNITY, SIMPLIFIED</span><h2>{summary.title}</h2>{editSummary?<><label className="field-label" htmlFor="edit-overview">Edit your summary</label><textarea id="edit-overview" className="large-textarea edit-textarea" maxLength={1500} value={summary.overview} onChange={e=>setSummary({...summary,overview:e.target.value})}/></>:<p className="output-overview">{summary.overview}</p>}<dl className="details-grid">{[["Who can apply",summary.eligibility],["Time commitment",summary.duration],["Deadline",summary.deadline],["Cost",summary.cost]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><OutputList title="What you'll do" items={summary.activities}/><h3>Skills you could develop</h3><div className="skill-tags">{summary.skills.map((v,i)=><span key={i}>{v}</span>)}</div><OutputList title="Your next steps" items={summary.steps}/><div className="output-actions"><button type="button" className="button text-button" onClick={()=>setEditSummary(!editSummary)}>{editSummary?"Done editing":"Edit overview"}</button><button type="button" className="button secondary" onClick={()=>downloadFile("sixthstep-summary.txt",summaryText(summary))}><Download size={16}/> Export summary</button>{summarySource&&<a className="inline-link" href={sourceLink(summarySource)} target="_blank" rel="noreferrer">Check source <ExternalLink size={14}/></a>}</div></>:<div className="output-placeholder"><span className="placeholder-icon"><Sparkles size={32} strokeWidth={1.4}/></span><h3>{summaryBusy?"Goodbye, information overload.":"The useful stuff, all in one place."}</h3><p>Activities, eligibility, deadlines, skills,<br/>and how to take the next step.</p><div className="placeholder-line"/><div className="placeholder-line shorter"/><div className="placeholder-line"/></div>}</section></div>
  </>}
  {tab==="saved"&&<>
   <PageHeading eyebrow="A LITTLE ORGANISATION GOES A LONG WAY" title="Your possibilities," emphasis="in one place." description="Keep track of the opportunities you're exploring, applying for, and completing."/>
   <div className="tracker-stats">{(["Interested","Applied","Completed"] as const).map(status=><div key={status}><span>{status==="Interested"?<Bookmark size={18}/>:status==="Applied"?<ArrowUpRight size={18}/>:<CheckCircle2 size={18}/>} {status}</span><strong>{saved.filter(i=>i.status===status).length}</strong></div>)}</div>
   <div className="section-header"><div><h2>My opportunities <span className="result-count">{saved.length}</span></h2><p>Saved on this browser. Export a copy to take them with you.</p></div><button type="button" className="button secondary" onClick={exportSaved} disabled={!saved.length}><Download size={16}/> Export CSV</button></div>
   {saved.length?<div className="saved-list">{saved.map(item=><article className="saved-row" key={item.id}><span className={"saved-icon "+themeFor(item.sector)}><Bookmark size={20}/></span><div className="saved-row-info"><p className="provider-name">{item.provider}</p><button type="button" className="plain-title" onClick={()=>setSelected(item)}>{item.title}</button><span className="fine-print">{item.type} · {item.location}</span></div><label className="sr-only" htmlFor={"status-"+item.id}>Application status for {item.title}</label><select id={"status-"+item.id} className={"status-select "+item.status.toLowerCase()} value={item.status} onChange={e=>setSaved(items=>items.map(v=>v.id===item.id?{...v,status:e.target.value as SavedOpportunity["status"]}:v))}><option>Interested</option><option>Applied</option><option>Completed</option></select><a className="icon-button" href={sourceLink(item.url)} target="_blank" rel="noreferrer" aria-label={"Visit provider for "+item.title}><ArrowUpRight size={20}/></a><button type="button" className="icon-button" onClick={()=>toggleSave(item)} aria-label={"Remove "+item.title}><Trash2 size={17}/></button></article>)}</div>:<div className="empty-state roomy"><Bookmark size={35}/><h3>Your next chapter is still a blank page.</h3><p>Save something that catches your eye. You can come back to it here.</p><button type="button" className="button primary" onClick={()=>navigate("finder")}>Explore opportunities <ArrowRight size={16}/></button></div>}
  </>}
  {tab==="reflect"&&<>
   <PageHeading eyebrow="TURN EXPERIENCE INTO UNDERSTANDING" title="Look back." emphasis="Move forward." description="Capture what you did, what you learned, and where you want to go next."/>
   <div className="workspace-grid"><section className="workspace-card"><div className="workspace-card-heading"><span className="workspace-icon"><Leaf size={22}/></span><h2>Your experience notes</h2></div><p className="card-intro">Think about an activity you completed, a challenge you faced, and one thing you learned. Say whether it was a placement, simulation, or insight event.</p><form onSubmit={e=>{e.preventDefault();void reflect();}}><label className="field-label" htmlFor="reflection-notes">What did you do and learn?</label><textarea id="reflection-notes" className="large-textarea journal-textarea" maxLength={8000} minLength={60} required value={journalStore.value} onChange={e=>journalStore.setValue(e.target.value)} placeholder="During my virtual engineering programme, I completed…\n\nSomething I found challenging was…\n\nThis helped me understand…"/><p className="input-hint">{journalStore.value.length} / 8,000 characters · notes saved on this browser</p><div className="notice compact"><CircleHelp size={16}/><span>AI reflection sends these notes to Groq. Keep names and private details out of your notes.</span></div>{reflectionError&&<p className="error-message" role="alert">{reflectionError}</p>}<button type="submit" className="button primary wide" disabled={reflectionBusy||journalStore.value.trim().length<60}>{reflectionBusy?<LoaderCircle className="spin" size={17}/>:<Sparkles size={17}/>} {reflectionBusy?"Finding the learning…":"Help me reflect"}</button></form><button type="button" className="button text-button" disabled={!journalStore.value} onClick={()=>downloadFile("sixthstep-experience-notes.txt",journalStore.value)}><Download size={15}/> Export my notes</button></section><section className="workspace-card summary-output" aria-live="polite">{reflection?<><span className="eyebrow muted">WHAT YOU'RE TAKING WITH YOU</span><h2>Your experience reflection</h2><p className="output-overview">{reflection.summary}</p><OutputList title="Skills with evidence" items={reflection.skills}/><h3>A starting point for your CV</h3><blockquote>{reflection.cvBullet}</blockquote><OutputList title="Keep growing" items={reflection.nextSteps}/><p className="fine-print">Edit this to sound like you and check every statement is accurate.</p><button type="button" className="button secondary" onClick={()=>downloadFile("sixthstep-reflection.txt",[reflection.summary,...reflection.skills,reflection.cvBullet,...reflection.nextSteps].join("\n\n"))}><Download size={16}/> Export reflection</button></>:<div className="output-placeholder"><span className="placeholder-icon"><Leaf size={32}/></span><h3>There's learning in every experience.</h3><p>See your skills more clearly,<br/>and find the words to describe them.</p></div>}</section></div>
  </>}
  {tab==="settings"&&<>
   <PageHeading eyebrow="MAKE THIS SPACE YOURS" title="Your interests." emphasis="Your direction." description="A few preferences help put relevant possibilities first. It's okay if you're still exploring."/>
   <div className="workspace-grid"><section className="workspace-card"><h2>About your interests</h2><p className="card-intro">Saved on this browser. Recommendations use career interests; subjects are your own notes.</p><label className="field-label" htmlFor="study-year">School year</label><select className="text-input" id="study-year" value={profile.year} onChange={e=>setProfile({...profile,year:e.target.value})}><option>Year 12</option><option>Year 13</option><option>Exploring sixth form</option></select><label className="field-label" htmlFor="subjects">Subjects you're studying</label><input className="text-input" id="subjects" maxLength={200} value={profile.subjects} onChange={e=>setProfile({...profile,subjects:e.target.value})} placeholder="e.g. Biology, Psychology, English"/><p className="field-label">Careers you're curious about</p><div className="interest-grid">{sectors.slice(1).map(s=><button type="button" key={s} aria-pressed={profile.interests.includes(s)} className={"interest-button "+(profile.interests.includes(s)?"selected":"")} onClick={()=>setProfile({...profile,interests:profile.interests.includes(s)?profile.interests.filter(i=>i!==s):[...profile.interests,s]})}>{profile.interests.includes(s)?<Check size={15}/>:<Plus size={15}/>} {s}</button>)}</div><div className="notice compact"><CheckCircle2 size={16}/><span>Your preferences save automatically on this device.</span></div><button type="button" className="button primary wide" onClick={()=>navigate("finder")}>Find my next step <ArrowRight size={16}/></button></section>
   <section className="workspace-card"><h2>AI & search connections</h2><p className="card-intro">The collection and tracker work without API keys. The site owner can connect the free API tiers in Vercel.</p><div className="connection-row"><span className="workspace-icon"><Sparkles size={20}/></span><div><strong>Groq</strong><p>Summaries & experience reflections</p></div><span className={"connection-status "+(connections?.ai?"connected":"")}>{connections===null?"Checking":connections.ai?"Connected":"Needs setup"}</span></div><div className="connection-row"><span className="workspace-icon"><Search size={20}/></span><div><strong>Tavily</strong><p>Web search & link extraction</p></div><span className={"connection-status "+(connections?.search?"connected":"")}>{connections===null?"Checking":connections.search?"Connected":"Needs setup"}</span></div><details className="setup-details"><summary>How to connect the free API tiers <ChevronDown size={16}/></summary><ol><li>An adult site owner creates keys at <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">Groq</a> and <a href="https://app.tavily.com" target="_blank" rel="noreferrer">Tavily</a>.</li><li>In the Vercel project, open Settings → Environment Variables.</li><li>Add <code>GROQ_API_KEY</code> and <code>TAVILY_API_KEY</code> as server secrets.</li><li>Redeploy the site. The connections will appear here.</li></ol><p>Free allowances have limits. Keep paid billing disabled if you want to stay on free plans. Never paste keys into student-facing pages.</p></details><div className="privacy-card"><Leaf size={20}/><h3>A little privacy by design</h3><p>No student account is needed. Bookmarks, preferences and notes live in this browser. AI features send only the text you submit. Export anything you want to keep.</p></div></section></div>
  </>}
  {(savedStore.error||profileStore.error||journalStore.error)&&<p className="error-message" role="alert">{savedStore.error||profileStore.error||journalStore.error}</p>}
  <footer className="footer"><span className="footer-brand">sixthstep.</span><span>A first step towards a future that feels like you.</span><button type="button" className="inline-link" onClick={()=>navigate("settings")}>Privacy & connections <ArrowUpRight size={13}/></button></footer>
  </main>
 </div>
 <OpportunityDialog item={selected} onClose={()=>setSelected(null)} onSave={()=>{if(selected)toggleSave(selected);}} saved={!!selected&&saved.some(i=>i.id===selected.id)} onSummarise={()=>{if(selected)openSummary(selected);}}/>
 {toast&&<div className="toast" role="status"><CheckCircle2 size={17}/>{toast}</div>}
 </div>;
}

function PageHeading({eyebrow,title,emphasis,description}:{eyebrow:string;title:string;emphasis:string;description:string}){
 return <section className="page-heading"><span className="eyebrow"><span className="little-spark">✦</span> {eyebrow}</span><h1>{title}<br/><em>{emphasis}</em></h1><p>{description}</p></section>;
}
function OutputList({title,items}:{title:string;items:string[]}){return <><h3>{title}</h3>{items.length?<ul className="output-list">{items.map((v,i)=><li key={i}>{v}</li>)}</ul>:<p className="fine-print">Not stated in the supplied description.</p>}</>;}
