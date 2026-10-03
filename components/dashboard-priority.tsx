"use client";
import { catalogue } from "@/lib/catalogue";
import { priorityActions } from "@/lib/operating-system";
import { ActionItem } from "./action-items";
import { Empty } from "./shared";
import { useWorkspace } from "./workspace-context";
export function DashboardPriority(){
 const {data,navigate,openOpportunity}=useWorkspace(),actions=priorityActions(data,catalogue);
 const open=(id:string)=>{const item=catalogue.find(i=>i.id===id);if(item)openOpportunity(item);};
 return <section className="priority-panel" aria-label="Priority actions"><div className="panel-heading"><div><span className="eyebrow muted">WHAT MATTERS NOW</span><h2>Do these next</h2></div><button className="inline-link" onClick={()=>navigate("calendar")}>Open calendar</button></div><details className="priority-rules"><summary>How these actions are ordered</summary><p className="fine-print">Overdue tasks, near deadlines and interviews, outstanding preparation, openings and reflection. Different applications get space before a second urgent action from the same one.</p></details>{actions.priority.length?actions.priority.map(item=><ActionItem key={item.id} item={item} onOpportunity={open}/>):<Empty title="Find one opportunity worth exploring." action={()=>navigate("finder")} label="See my opportunities">Save a possibility and choose a next step. Confirmed dates appear automatically.</Empty>}{actions.remaining.length>0&&<details className="workspace-section"><summary>Everything else ({actions.remaining.length})</summary>{actions.remaining.slice(0,30).map(item=><ActionItem key={item.id} item={item} onOpportunity={open}/>)}{actions.remaining.length>30&&<button className="inline-link" onClick={()=>navigate("calendar")}>View the full timeline</button>}</details>}</section>;
}
