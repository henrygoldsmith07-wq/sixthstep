"use client";
import { useState, useMemo } from "react";
import { ArrowRight, Leaf, CalendarDays } from "lucide-react";
import { catalogue } from "@/lib/catalogue";
import { nextSteps, recordDeadline, dateLabel, daysUntil, evidenceBank, skillNames } from "@/lib/domain";
import { recordedCoverage, unrecordedAreas, missingSkills } from "@/lib/coverage";
import { recommendations } from "@/lib/recommendations";
import { workspaceAlerts, starComplete } from "@/lib/intelligence";
import { OpportunityCard } from "./opportunity";
import { useWorkspace } from "./workspace-context";
import { Empty } from "./shared";
export function DashboardDetails(){
 const {data,navigate,setActiveRecord,startExperience,dismissAlert,openOpportunity}=useWorkspace(),[allAlerts,setAllAlerts]=useState(false);
 const {steps,alerts,deadlines,waiting,evidence,unreflected,coverage,recorded,gaps,missingSkillsList,recommended}=useMemo(()=>
 {const c=recordedCoverage(data.experiences);return {
  steps:nextSteps(data.records,data.experiences),
  alerts:workspaceAlerts(data,catalogue),
  deadlines:data.records.filter(r=>["Saved","Researching","Preparing application"].includes(r.status)&&recordDeadline(r)).sort((a,b)=>recordDeadline(a).localeCompare(recordDeadline(b))),
  waiting:data.records.filter(r=>["Applied","Interview / next stage"].includes(r.status)),
  evidence:evidenceBank(data.experiences),
  unreflected:data.records.filter(r=>r.status==="Completed").filter(r=>!data.experiences.some(e=>e.opportunityId===r.opportunity.id&&(e.reflectionCompletedAt||e.reflection))),
  coverage:c,
  recorded:[...c.areas.entries()].sort((a,b)=>b[1]-a[1]),
  gaps:unrecordedAreas(data.profile,c),
  missingSkillsList:missingSkills(c,skillNames),
  recommended:recommendations(catalogue,data.profile,data.records.map(r=>r.opportunity.id),{records:data.records,experiences:data.experiences,feedback:data.feedback}).slice(0,3)
 };},[data]);
 function open(id:string){setActiveRecord(id);navigate("saved");}
 const onboard=[data.profile.configured,data.profile.configured&&recommended.length>0||data.records.length>0,data.records.length>0,data.records.some(r=>r.nextAction.trim())];

 return <> {data.profile.configured&&!onboard.every(Boolean)&&<details className="workspace-section"><summary>Getting started</summary><section className="onboarding-card" aria-label="Getting started"><span className="eyebrow muted">ONE SMALL STEP AT A TIME</span><h2>From an interest to a next action.</h2><p>Add only what helps you get started. You can refine your profile later.</p><div className="onboarding-actions">{[
 ["Set my interests","Subjects and careers to explore",()=>navigate("settings")],
 ["See recommendations","Understand why opportunities connect",()=>navigate("finder")],
 ["Save one possibility","Bookmark or shortlist something worth trying",()=>navigate("finder")],
 ["Add a next action","Give your chosen opportunity a concrete next step",()=>data.records.length?open(data.records[0].opportunity.id):navigate("finder")]
 ].map(([label,description,action],i)=><button key={String(label)} onClick={action as ()=>void}><span>{onboard[i]?"✓":"0"+(i+1)}</span><strong>{String(label)}</strong><small>{String(description)}</small><ArrowRight size={16}/></button>)}</div></section></details>}
 {alerts.length>0&&<details className="workspace-section"><summary>Source checks & other alerts ({alerts.length})</summary><section className="workspace-card alerts-panel" aria-label="In-app alerts"><div className="panel-heading"><h2>Worth your attention</h2><span className="fine-print">{alerts.length} current alerts</span></div><ul className="alerts-list">{(allAlerts?alerts:alerts.slice(0,4)).map(a=><li key={a.id} className={a.kind}><div><strong>{a.title}</strong><p>{a.detail}</p></div><div className="alert-actions"><button className="button secondary" aria-label={"Review alert: "+a.title} onClick={()=>{if(a.recordId)open(a.recordId);else navigate("finder");}}>Review</button><button className="icon-button" aria-label={"Dismiss alert: "+a.title} onClick={()=>dismissAlert(a.id)}>×</button></div></li>)}</ul>{alerts.length>4&&<button className="inline-link" onClick={()=>setAllAlerts(!allAlerts)}>{allAlerts?"Show fewer alerts":"Show all alerts"}</button>}<p className="fine-print">In-app reminders update when you return. Dismissing keeps an alert quiet until its underlying date or detail changes.</p></section></details>}
 <details className="workspace-section"><summary>Application overview & deadlines</summary><div className="dashboard-grid"><section className="workspace-card"><div className="panel-heading"><h2>Your application actions</h2><button className="inline-link" onClick={()=>navigate("saved")}>My workspace <ArrowRight size={13}/></button></div>
 {steps.length?<ul className="action-list">{steps.slice(0,7).map(step=><li key={step.id}><button onClick={()=>{const r=data.records.find(r=>r.opportunity.id===step.recordId);if(step.kind==="reflection"&&r)startExperience(r);else open(step.recordId);}}><span className={"action-icon "+(step.overdue?"overdue":"")}><Leaf size={17}/></span><span><strong>{step.title}</strong><small>{step.date?dateLabel(step.date)+(step.overdue?" · Overdue":""):"Choose a date in your workspace"}{step.priority==="High"?" · High priority":""}</small></span><ArrowRight size={15}/></button></li>)}</ul>:<Empty title="A next step starts with a possibility." action={()=>navigate("finder")} label="Find something to try">Save an opportunity and add a small action, like checking its requirements or asking for a reference.</Empty>}</section>
 <section className="workspace-card"><div className="panel-heading"><h2>Upcoming deadlines</h2><CalendarDays size={19}/></div>{["Overdue","Today","Next 7 days","Next 30 days"].map(label=>{const records=deadlines.filter(r=>{const d=daysUntil(recordDeadline(r));return d!==null&&(label==="Overdue"?d<0:label==="Today"?d===0:label==="Next 7 days"?d>0&&d<=7:d>7&&d<=30);});return <section className="deadline-group" key={label}><h3>{label}{label==="Next 30 days"?" · days 8–30":""}</h3>{records.length?records.slice(0,3).map(r=><button className="compact-record" key={r.opportunity.id} onClick={()=>open(r.opportunity.id)}><strong>{r.opportunity.title}</strong><small>{dateLabel(recordDeadline(r))}{r.deadlineOverride?" · Manually changed":""}</small><ArrowRight size={13}/></button>):<p className="fine-print">No confirmed dates in this window.</p>}</section>;})}<p className="fine-print">Rolling, expected and unknown periods never get a countdown. Full dates later than 30 days stay in Applications.</p>
 {waiting.length>0&&<><h3 className="section-subtitle">Awaiting a response</h3>{waiting.slice(0,3).map(r=><button className="compact-record" key={r.opportunity.id} onClick={()=>open(r.opportunity.id)}><strong>{r.opportunity.title}</strong><small>{r.status}{r.appliedAt?" · Applied "+dateLabel(r.appliedAt):""}</small><ArrowRight size={13}/></button>)}</>}</section></div></details>
 {recommended.length>0&&<details className="workspace-section"><summary>More opportunities to explore</summary><section className="discovery-section"><div className="section-header"><div><h2>Recommended for you</h2><p>Explained connections to your profile, saved interests and recorded reflections.</p></div><button className="inline-link" onClick={()=>navigate("finder")}>Explore more <ArrowRight size={13}/></button></div><div className="opportunity-grid">{recommended.map(({item})=><OpportunityCard key={item.id} item={item} onOpen={()=>openOpportunity(item)}/>)}</div></section></details>}
 <details className="workspace-section"><summary>Saved possibilities & evidence readiness</summary><div className="dashboard-grid"><section className="workspace-card"><div className="panel-heading"><h2>Saved recently</h2><Leaf size={18}/></div>{data.records.length?data.records.slice().sort((a,b)=>b.savedAt.localeCompare(a.savedAt)).slice(0,4).map(r=><button className="compact-record" key={r.opportunity.id} onClick={()=>open(r.opportunity.id)}><strong>{r.opportunity.title}</strong><small>{r.intent} · {r.status} · {r.opportunity.provider}</small><ArrowRight size={14}/></button>):<p className="card-intro">Your saved opportunities will be here when you come back.</p>}</section>
 <section className="workspace-card"><h2>Evidence readiness</h2><div className="readiness-facts"><p><strong>{evidence.length}</strong> recorded evidence examples</p><p><strong>{evidence.filter(starComplete).length}</strong> complete STAR examples</p><p><strong>{unreflected.length}</strong> completed opportunities need reflection</p></div>{unreflected.slice(0,3).map(r=><button className="compact-record" key={r.opportunity.id} onClick={()=>startExperience(r)}><strong>{r.opportunity.title}</strong><small>Completed · reflect while the details are fresh</small><ArrowRight size={13}/></button>)}
 {recorded.length>0&&<><h3 className="section-subtitle">Areas you have recorded</h3><p className="fine-print">{recorded.map(([area,count])=>area+" ("+count+")").join(" · ")}</p></>}
 {gaps.length>0&&<><h3 className="section-subtitle">Areas you want to explore, with nothing recorded yet</h3><p className="fine-print">{gaps.join(" · ")} · something in these areas could be a way to start building evidence.</p></>}
 {coverage.examples>0&&<><h3 className="section-subtitle">Skills you have recorded</h3><p className="fine-print">{[...coverage.skills.entries()].map(([name,count])=>name+" ("+count+")").join(" · ")}</p><h3 className="section-subtitle">Workspace skills with nothing recorded yet</h3><p className="fine-print">{missingSkillsList.join(" · ")} · these are the workspace's own skill list, not any programme's claims.</p></>}
 <div className="detail-actions"><button className="button secondary" onClick={()=>navigate("reflect")}>Open my journal</button><button className="inline-link" onClick={()=>navigate("evidence")}>Evidence bank</button></div></section></div></details></>;
}



