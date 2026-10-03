"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { appSchema, emptyData, createRecord, experienceFromRecord, type AppData, type TrackedRecord, type Experience, type RichOpportunity, type StudentProfile } from "@/lib/domain";
import { loadWorkspace, storageKey } from "@/lib/persistence";
export type View="dashboard"|"finder"|"summarise"|"saved"|"reflect"|"evidence"|"settings";
export type Connections={ai:boolean;search:boolean;aiProvider?:string;aiSetup?:"ready"|"missing"|"invalid"};
type Workspace={
 data:AppData;ready:boolean;error:string;connections:Connections|null;
 view:View;navigate:(view:View)=>void;
 save:(item:RichOpportunity)=>void;updateRecord:(id:string,patch:Partial<TrackedRecord>)=>void;removeRecord:(id:string)=>void;
 updateProfile:(value:StudentProfile)=>void;updateExperience:(entry:Experience)=>void;removeExperience:(id:string)=>void;
 startExperience:(record:TrackedRecord)=>void;activeExperience:string;setActiveExperience:(id:string)=>void;
 activeRecord:string;setActiveRecord:(id:string)=>void;importUrl:string;startImport:(url?:string)=>void;
 toast:(value:string)=>void;replaceData:(data:AppData)=>void;
};
const Context=createContext<Workspace|null>(null);
export function useWorkspace(){const value=useContext(Context);if(!value)throw new Error("Workspace missing");return value;}
export function WorkspaceProvider({children}:{children:ReactNode}){
 const [data,setData]=useState<AppData>(emptyData),[ready,setReady]=useState(false),[error,setError]=useState(""),[blocked,setBlocked]=useState(false);
 const [view,setView]=useState<View>("dashboard"),[connections,setConnections]=useState<Connections|null>(null);
 const [activeRecord,setActiveRecord]=useState(""),[activeExperience,setActiveExperience]=useState(""),[importUrl,setImportUrl]=useState(""),[message,setMessage]=useState("");
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
  const read=()=>{const hash=window.location.hash.slice(1);if(["dashboard","finder","summarise","saved","reflect","evidence","settings"].includes(hash))setView(hash as View);};
  read();window.addEventListener("hashchange",read);return()=>window.removeEventListener("hashchange",read);
 },[]);
 useEffect(()=>{if(!message)return;const timer=setTimeout(()=>setMessage(""),4500);return()=>clearTimeout(timer);},[message]);
 function navigate(next:View){setView(next);window.location.hash=next;}
 function save(item:RichOpportunity){
  setData(current=>current.records.some(r=>r.opportunity.id===item.id||["imported","manual"].includes(item.source)&&!!item.url&&r.opportunity.url===item.url)?current:{...current,records:[createRecord(item),...current.records]});
  setMessage("Saved to your opportunities");
 }
 function updateRecord(id:string,patch:Partial<TrackedRecord>){setData(current=>({...current,records:current.records.map(r=>r.opportunity.id===id?{...r,...patch}:r)}));}
 function removeRecord(id:string){setData(current=>({...current,records:current.records.filter(r=>r.opportunity.id!==id)}));setMessage("Removed from tracker. Existing experiences are kept.");}
 function updateExperience(entry:Experience){setData(current=>({...current,experiences:current.experiences.some(e=>e.id===entry.id)?current.experiences.map(e=>e.id===entry.id?entry:e):[entry,...current.experiences]}));}
 function startExperience(record:TrackedRecord){
  const existing=data.experiences.find(e=>e.opportunityId===record.opportunity.id);
  const entry=existing||experienceFromRecord(record);
  if(!existing)updateExperience(entry);
  setActiveExperience(entry.id);navigate("reflect");
 }
 const value:Workspace={data,ready,error,connections,view,navigate,save,updateRecord,removeRecord,updateProfile:profile=>setData(current=>({...current,profile})),updateExperience,
 removeExperience:id=>setData(current=>({...current,experiences:current.experiences.filter(e=>e.id!==id)})),
 startExperience,activeExperience,setActiveExperience,activeRecord,setActiveRecord,importUrl,
 startImport:(url="")=>{setImportUrl(url);navigate("summarise");},toast:setMessage,
 replaceData:next=>{setData(appSchema.parse(next));setBlocked(false);setError("");setMessage("Workspace restored");}
 };
 return <Context.Provider value={value}>{children}{message&&<div className="toast" role="status">{message}</div>}</Context.Provider>;
}
