"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { appSchema, emptyData, createRecord, experienceFromRecord, type AppData, type TrackedRecord, type Experience, type RichOpportunity, type StudentProfile } from "@/lib/domain";
import { loadWorkspace, storageKey } from "@/lib/persistence";
import { recordEvents, experienceEvents } from "@/lib/operating-system";
import type { DiscoveryFeedback, ActionDisposition, ActivityEvent } from "@/lib/workspace-events";
export type View="dashboard"|"finder"|"summarise"|"saved"|"reflect"|"evidence"|"settings"|"calendar";
export type Connections={ai:boolean;search:boolean;aiProvider?:string;aiSetup?:"ready"|"missing"|"invalid"};
type Workspace={
 data:AppData;ready:boolean;error:string;connections:Connections|null;
 discoveryArea:string;startDiscovery:(area:string)=>void;view:View;navigate:(view:View)=>void;
 save:(item:RichOpportunity)=>void;updateRecord:(id:string,patch:Partial<TrackedRecord>)=>void;removeRecord:(id:string)=>void;
 updateProfile:(value:StudentProfile)=>void;updateExperience:(entry:Experience)=>void;removeExperience:(id:string)=>void;
 startExperience:(record:TrackedRecord)=>void;activeExperience:string;setActiveExperience:(id:string)=>void;
 activeRecord:string;setActiveRecord:(id:string)=>void;importUrl:string;importMode:"link"|"text"|"manual";startImport:(url?:string,manual?:boolean)=>void;
 clearFeedback:(id:string)=>void;setFeedback:(item:RichOpportunity,signal:DiscoveryFeedback["signal"]|null)=>void;setActionState:(state:ActionDisposition)=>void;dismissAlert:(id:string)=>void;activeQuestion:string;setActiveQuestion:(id:string)=>void;toast:(value:string)=>void;replaceData:(data:AppData)=>void;
};
const Context=createContext<Workspace|null>(null);
export function useWorkspace(){const value=useContext(Context);if(!value)throw new Error("Workspace missing");return value;}
export function WorkspaceProvider({children}:{children:ReactNode}){
 const [data,setData]=useState<AppData>(emptyData),[ready,setReady]=useState(false),[error,setError]=useState(""),[blocked,setBlocked]=useState(false);
 const [discoveryArea,setDiscoveryArea]=useState("");
 const [view,setView]=useState<View>("dashboard"),[connections,setConnections]=useState<Connections|null>(null);
 const [activeRecord,setActiveRecord]=useState(""),[activeExperience,setActiveExperience]=useState(""),[importUrl,setImportUrl]=useState(""),[importMode,setImportMode]=useState<"link"|"text"|"manual">("text"),[message,setMessage]=useState(""),[activeQuestion,setActiveQuestion]=useState("");
 useEffect(()=>{
  try {const loaded=loadWorkspace(localStorage);setData(loaded.data);setError(loaded.error);setBlocked(!!loaded.error);if(loaded.migrated&&!loaded.error)setMessage("Your saved opportunities and notes have moved into your workspace.");}
  catch {setError("Browser storage is unavailable. Export a backup before leaving; changes will not be saved.");setBlocked(true);}
  setReady(true);
 },[]);
 useEffect(()=>{
  if(!ready||blocked)return;
  try{localStorage.setItem(storageKey,JSON.stringify(appSchema.parse(data)));}
  catch{setError("Your browser could not save changes. Export a workspace backup before leaving.");}
 },[data,ready,blocked]);
 useEffect(()=>{fetch("/api/status").then(r=>{if(!r.ok)throw new Error();return r.json();}).then(setConnections).catch(()=>setConnections(null));},[]);
 useEffect(()=>{
  const read=()=>{const hash=window.location.hash.slice(1);if(["dashboard","finder","summarise","saved","reflect","evidence","settings","calendar"].includes(hash))setView(hash as View);};
  read();window.addEventListener("hashchange",read);return()=>window.removeEventListener("hashchange",read);
 },[]);
 useEffect(()=>{if(!message)return;const timer=setTimeout(()=>setMessage(""),4500);return()=>clearTimeout(timer);},[message]);
 function navigate(next:View){setView(next);window.location.hash=next;window.requestAnimationFrame(()=>document.getElementById("main-content")?.focus({preventScroll:true}));}
 function appendEvents(current:AppData,events:Omit<ActivityEvent,"id">[]){return [...events.map(e=>({...e,id:crypto.randomUUID()})),...current.activity].slice(0,5000);}
 function save(item:RichOpportunity){
  setData(current=>current.records.some(r=>r.opportunity.id===item.id||["imported","manual"].includes(item.source)&&!!item.url&&r.opportunity.url===item.url)?current:{...current,records:[createRecord(item),...current.records],activity:appendEvents(current,[{kind:"Saved",at:new Date().toISOString(),recordId:item.id,experienceId:"",title:item.title,themes:item.careerAreas.length?item.careerAreas:[item.sector]}])});
  setMessage("Saved to your opportunities");
 }
 function updateRecord(id:string,patch:Partial<TrackedRecord>){setData(current=>{const previous=current.records.find(r=>r.opportunity.id===id);if(!previous)return current;const next={...previous,...patch};return {...current,records:current.records.map(r=>r.opportunity.id===id?next:r),activity:appendEvents(current,recordEvents(previous,next,new Date().toISOString()))};});}
 function removeRecord(id:string){setData(current=>({...current,records:current.records.filter(r=>r.opportunity.id!==id)}));setMessage("Removed from tracker. Existing experiences are kept.");}
 function updateExperience(entry:Experience){setData(current=>({...current,experiences:current.experiences.some(e=>e.id===entry.id)?current.experiences.map(e=>e.id===entry.id?entry:e):[entry,...current.experiences],activity:appendEvents(current,experienceEvents(current.experiences.find(e=>e.id===entry.id),entry,new Date().toISOString()))}));}
 function startExperience(record:TrackedRecord){
  const existing=data.experiences.find(e=>e.opportunityId===record.opportunity.id);
  const entry=existing||experienceFromRecord(record);
  if(!existing)updateExperience(entry);
  setActiveExperience(entry.id);navigate("reflect");
 }
 const value:Workspace={data,ready,error,connections,discoveryArea,startDiscovery:area=>{setDiscoveryArea(area);navigate("finder");},view,navigate,save,updateRecord,removeRecord,updateProfile:profile=>setData(current=>({...current,profile})),updateExperience,
 removeExperience:id=>setData(current=>({...current,experiences:current.experiences.filter(e=>e.id!==id)})),
 startExperience,activeExperience,setActiveExperience,activeRecord,setActiveRecord,importUrl,importMode,
 startImport:(url="",manual=false)=>{setImportUrl(url);setImportMode(manual?"manual":url?"link":"text");navigate("summarise");},activeQuestion,setActiveQuestion,dismissAlert:id=>setData(current=>({...current,dismissedAlerts:[...new Set([...current.dismissedAlerts,id])].slice(-2000)})),toast:setMessage,
 clearFeedback:id=>setData(current=>({...current,feedback:current.feedback.filter(f=>f.opportunityId!==id)})),setFeedback:(item,signal)=>setData(current=>({...current,feedback:[...current.feedback.filter(f=>f.opportunityId!==item.id),...(signal?[{opportunityId:item.id,title:item.title,sector:item.sector,category:item.category,provider:item.provider,subjects:item.subjects,signal,at:new Date().toISOString()}]:[])].slice(-2000)})),setActionState:state=>setData(current=>({...current,actionStates:[...current.actionStates.filter(s=>s.id!==state.id),state].slice(-3000)})),
 replaceData:next=>{setData(appSchema.parse(next));setBlocked(false);setError("");setMessage("Workspace restored");}
 };
 return <Context.Provider value={value}>{children}{message&&<div className="toast" role="status">{message}</div>}</Context.Provider>;
}
