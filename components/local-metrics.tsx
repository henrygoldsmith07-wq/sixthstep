"use client";
import { productMetrics } from "@/lib/product-metrics";
import { useWorkspace } from "./workspace-context";
import { download } from "./shared";
export function LocalMetrics(){
 const {data}=useWorkspace(),metrics=productMetrics(data);
 const rows:[[string,number],...[string,number][]]=[["Opportunity details viewed",metrics.viewed],["Opportunities saved",metrics.saved],["Shortlist actions",metrics.shortlisted],["Applications started",metrics.started],["Submissions recorded",metrics.submitted],["Programmes completed",metrics.completed],["Reflections completed",metrics.reflections],["Evidence examples recorded",metrics.evidence],["Evidence reuse actions",metrics.reused]];
 return <details className="workspace-section local-metrics"><summary>How this workspace is being used</summary><p className="fine-print">Private, local counts describe recorded behaviour. No analytics are sent anywhere. Older actions without a recorded event are not reconstructed; these are not scores of your ability or effort.</p><dl className="metric-list">{rows.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}<div><dt>Active applications with a next action</dt><dd>{metrics.active?metrics.withNextAction+" / "+metrics.active+" ("+metrics.nextActionPercent+"%)":"No active applications"}</dd></div><div><dt>First save after local measurement began</dt><dd>{metrics.firstSaveMinutes===null?"Not recorded":metrics.firstSaveMinutes+" minutes"}</dd></div></dl><button className="button secondary" onClick={()=>download("sixthstep-local-metrics.json",JSON.stringify({measurementStartedAt:data.metrics.startedAt,...metrics},null,2),"application/json")}>Export local counts</button></details>;
}
