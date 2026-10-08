"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createRecord, experienceFromRecord, type AppData, type TrackedRecord, type Experience, type RichOpportunity, type StudentProfile } from "@/lib/domain";
import { recordEvents, experienceEvents } from "@/lib/operating-system";
import { measure, type MetricAction } from "@/lib/product-metrics";
import type { DiscoveryFeedback, ActionDisposition, ActivityEvent } from "@/lib/workspace-events";
import { useWorkspaceNavigation } from "./use-workspace-navigation";
import { useWorkspaceStorage } from "./use-workspace-storage";
export type { View } from "@/lib/navigation";
export type Connections={ai:boolean;search:boolean;aiProvider?:string;aiSetup?:"ready"|"missing"|"invalid"};
type Workspace=ReturnType<typeof useWorkspaceNavigation>&{
 data:AppData;ready:boolean;error:string;conflict:boolean;stalled:boolean;connections:Connections|null;recovery:()=>Promise<Record<string,string|null>>;reloadStored:()=>Promise<void>;
 discoveryArea:string;startDiscovery:(area:string)=>void;
 save:(item:RichOpportunity)=>void;updateRecord:(id:string,patch:Partial<TrackedRecord>)=>void;removeRecord:(id:string)=>void;
 updateProfile:(value:StudentProfile)=>void;updateExperience:(entry:Experience)=>void;removeExperience:(id:string)=>void;
 startExperience:(record:TrackedRecord)=>void;openOpportunity:(item:RichOpportunity)=>void;recordMetric:(action:MetricAction)=>void;
 importUrl:string;importMode:"link"|"text"|"manual";startImport:(url?:string,manual?:boolean)=>void;
 clearFeedback:(id:string)=>void;setFeedback:(item:RichOpportunity,signal:DiscoveryFeedback["signal"]|null)=>void;setActionState:(state:ActionDisposition)=>void;dismissAlert:(id:string)=>void;toast:(value:string)=>void;replaceData:(data:AppData)=>Promise<void>;
};
const Context=createContext<Workspace|null>(null);
export function useWorkspace(){const value=useContext(Context);if(!value)throw new Error("Workspace missing");return value;}
export function WorkspaceProvider({children}:{children:ReactNode}){
 const storage=useWorkspaceStorage(),{data,setData}=storage,navigation=useWorkspaceNavigation(),{navigate,setActiveExperience,setActiveOpportunity}=navigation;
 const [discoveryArea,setDiscoveryArea]=useState(""),[connections,setConnections]=useState<Connections|null>(null);
 const [importUrl,setImportUrl]=useState(""),[importMode,setImportMode]=useState<"link"|"text"|"manual">("text"),[message,setMessage]=useState("");
 useEffect(()=>{fetch("/api/status").then(r=>{if(!r.ok)throw new Error();return r.json();}).then(setConnections).catch(()=>setConnections(null));},[]);
 useEffect(()=>{if(!message)return;const timer=setTimeout(()=>setMessage(""),4500);return()=>clearTimeout(timer);},[message]);
 useEffect(()=>{if(storage.ready)setData(current=>current.metrics.startedAt?current:{...current,metrics:{...current.metrics,startedAt:new Date().toISOString()}});},[storage.ready,setData]);
 function appendEvents(current:AppData,events:Omit<ActivityEvent,"id">[]){return [...events.map(e=>({...e,id:crypto.randomUUID()})),...current.activity].slice(0,5000);}
 function recordMetric(action:MetricAction){setData(current=>({...current,metrics:measure(current.metrics,action)}));}
 function openOpportunity(item:RichOpportunity){setData(current=>({...current,discoveries:item.source==="catalogue"||current.records.some(r=>r.opportunity.id===item.id)?current.discoveries:[item,...current.discoveries.filter(o=>o.id!==item.id)].slice(0,200)}));setActiveOpportunity(item.id);}
 function save(item:RichOpportunity){
  setData(current=>current.records.some(r=>r.opportunity.id===item.id||["imported","manual"].includes(item.source)&&!!item.url&&r.opportunity.url===item.url)?current:{...current,metrics:measure(current.metrics,"save"),records:[createRecord(item),...current.records],activity:appendEvents(current,[{kind:"Saved",at:new Date().toISOString(),recordId:item.id,experienceId:"",title:item.title,themes:item.careerAreas.length?item.careerAreas:[item.sector]}])});
  setMessage("Added to this workspace");
 }
 function updateRecord(id:string,patch:Partial<TrackedRecord>){setData(current=>{const previous=current.records.find(r=>r.opportunity.id===id);if(!previous)return current;const next={...previous,...patch};return {...current,metrics:previous.intent!=="Shortlisted"&&next.intent==="Shortlisted"?measure(current.metrics,"shortlist"):current.metrics,records:current.records.map(r=>r.opportunity.id===id?next:r),activity:appendEvents(current,recordEvents(previous,next,new Date().toISOString()))};});}
 function removeRecord(id:string){setData(current=>({...current,records:current.records.filter(r=>r.opportunity.id!==id)}));setMessage("Removed from tracker. Existing experiences are kept.");}
 function updateExperience(entry:Experience){setData(current=>({...current,experiences:current.experiences.some(e=>e.id===entry.id)?current.experiences.map(e=>e.id===entry.id?entry:e):[entry,...current.experiences],activity:appendEvents(current,experienceEvents(current.experiences.find(e=>e.id===entry.id),entry,new Date().toISOString()))}));}
 function startExperience(record:TrackedRecord){const entry=data.experiences.find(e=>e.opportunityId===record.opportunity.id)||experienceFromRecord(record);if(!data.experiences.some(e=>e.id===entry.id))updateExperience(entry);setActiveExperience(entry.id);navigate("reflect");}
 const value:Workspace={...navigation,...storage,connections,discoveryArea,startDiscovery:area=>{setDiscoveryArea(area);navigate("finder");},save,updateRecord,removeRecord,updateProfile:profile=>setData(current=>({...current,profile})),updateExperience,removeExperience:id=>setData(current=>({...current,experiences:current.experiences.filter(e=>e.id!==id)})),startExperience,openOpportunity,recordMetric,importUrl,importMode,
 startImport:(url="",manual=false)=>{setImportUrl(url);setImportMode(manual?"manual":url?"link":"text");navigate("summarise");},dismissAlert:id=>setData(current=>({...current,dismissedAlerts:[...new Set([...current.dismissedAlerts,id])].slice(-2000)})),toast:setMessage,
 clearFeedback:id=>setData(current=>({...current,feedback:current.feedback.filter(f=>f.opportunityId!==id)})),setFeedback:(item,signal)=>setData(current=>({...current,feedback:[...current.feedback.filter(f=>f.opportunityId!==item.id),...(signal?[{opportunityId:item.id,title:item.title,sector:item.sector,category:item.category,provider:item.provider,subjects:item.subjects,signal,at:new Date().toISOString()}]:[])].slice(-2000)})),setActionState:state=>setData(current=>({...current,actionStates:[...current.actionStates.filter(s=>s.id!==state.id),state].slice(-3000)}))};
 return <Context.Provider value={value}>{children}{message&&<div className="toast" role="status">{message}</div>}</Context.Provider>;
}
