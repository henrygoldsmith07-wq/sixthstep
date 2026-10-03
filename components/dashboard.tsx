"use client";
import { catalogue } from "@/lib/catalogue";
import { recommendations } from "@/lib/recommendations";
import { useWorkspace } from "./workspace-context";
import { QuickSetup } from "./quick-setup";
import { DashboardPriority } from "./dashboard-priority";
import { DashboardDetails } from "./dashboard-details";
export function Dashboard(){
 const {data,navigate,startImport,openOpportunity}=useWorkspace();
 const suggestions=data.records.length<2?recommendations(catalogue,data.profile,data.records.map(r=>r.opportunity.id),{records:data.records,experiences:data.experiences,feedback:data.feedback}).slice(0,3):[];
 return <><header className="home-heading"><div><span className="eyebrow muted">YOUR NEXT CHAPTER</span><h1>Your next step.</h1><p>A clear action, then room to explore.</p></div><div className="detail-actions"><button className="button primary" onClick={()=>navigate("finder")}>Find opportunities</button><button className="inline-link" onClick={()=>startImport()}>Paste an opportunity</button></div></header>{!data.profile.configured&&<QuickSetup/>}<DashboardPriority/>{suggestions.length>0&&<section className="discovery-peek"><h2>Possibilities to explore</h2>{suggestions.map(({item,match})=><button className="compact-record" key={item.id} onClick={()=>openOpportunity(item)}><strong>{item.title}</strong><small>{match.reasons.slice(0,2).join(" · ")}</small></button>)}</section>}<DashboardDetails/></>;
}
