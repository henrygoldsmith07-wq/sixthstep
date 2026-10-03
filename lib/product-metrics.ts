import { z } from "zod";
import type { AppData } from "./domain";
export const metricsSchema=z.object({startedAt:z.string().max(50).default(""),firstSavedAt:z.string().max(50).default(""),views:z.number().int().nonnegative().max(1000000000).default(0),shortlists:z.number().int().nonnegative().max(1000000000).default(0),evidenceReuses:z.number().int().nonnegative().max(1000000000).default(0)});
export type ProductMetrics=z.infer<typeof metricsSchema>;
export type MetricAction="view"|"shortlist"|"reuse"|"save";
export function measure(metrics:ProductMetrics,action:MetricAction,at=new Date().toISOString()):ProductMetrics {
  const next={...metrics,startedAt:metrics.startedAt||at};
  if(action==="save")next.firstSavedAt ||= at;
  else {const key=action==="view"?"views":action==="shortlist"?"shortlists":"evidenceReuses";next[key]=Math.min(1000000000,next[key]+1);}
  return next;
}
export function productMetrics(data:AppData){
  const distinct=(kind:string)=>new Set(data.activity.filter(e=>e.kind===kind).map(e=>e.recordId||e.experienceId||e.id)).size;
  const active=data.records.filter(r=>r.intent==="Applying"&&["Saved","Researching","Preparing application","Applied","Interview / next stage","Accepted"].includes(r.status));
  const first=Date.parse(data.metrics.firstSavedAt)-Date.parse(data.metrics.startedAt);
  return {viewed:data.metrics.views,saved:distinct("Saved"),shortlisted:data.metrics.shortlists,started:distinct("Application started"),submitted:distinct("Application submitted"),completed:distinct("Completed programme"),reflections:distinct("Reflection completed"),evidence:new Set(data.activity.filter(e=>e.kind==="Evidence added").map(e=>e.experienceId+":"+e.title)).size,reused:data.metrics.evidenceReuses,active:active.length,withNextAction:active.filter(r=>r.nextAction.trim()).length,nextActionPercent:active.length?Math.round(active.filter(r=>r.nextAction.trim()).length/active.length*100):null,firstSaveMinutes:Number.isFinite(first)&&first>=0?Math.round(first/60000):null};
}
