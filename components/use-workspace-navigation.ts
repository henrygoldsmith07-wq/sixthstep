"use client";
import { useEffect, useRef, useState } from "react";
import { readRoute, routeHash, type View, type WorkspaceRoute } from "@/lib/navigation";
export function useWorkspaceNavigation(){
 const [route,setRoute]=useState<WorkspaceRoute>({view:"dashboard"});
 const current=useRef(route),pending=useRef<WorkspaceRoute>(route);
 function commit(next:WorkspaceRoute,replace=false){
  current.current=next;pending.current={...pending.current,...next,opportunity:next.opportunity};setRoute(next);
  const hash=routeHash(next);if(window.location.hash!==hash)window.history[replace?"replaceState":"pushState"](null,"",hash);
 }
 useEffect(()=>{
  const read=()=>{if(window.location.hash==="#main-content")return;const next=readRoute(window.location.hash);current.current=next;pending.current={...pending.current,...next,opportunity:next.opportunity,...(next.view==="saved"?{record:next.record,question:next.question}:next.view==="reflect"?{experience:next.experience}:next.view==="evidence"?{evidence:next.evidence}:{})};setRoute(next);};
  read();window.addEventListener("hashchange",read);window.addEventListener("popstate",read);
  return()=>{window.removeEventListener("hashchange",read);window.removeEventListener("popstate",read);};
 },[]);
 function select(key:"record"|"question"|"experience"|"evidence"|"opportunity",id:string){
  const next={...pending.current,[key]:id||undefined};if(key==="record"&&id!==pending.current.record)next.question=undefined;pending.current=next;
  const relevant=key==="record"||key==="question"?current.current.view==="saved":key==="experience"?current.current.view==="reflect":key==="evidence"?current.current.view==="evidence":true;
  if(relevant)commit({...current.current,[key]:id||undefined,...(key==="record"&&id!==current.current.record?{question:undefined}:{})});
 }
 function navigate(view:View){
  const next:WorkspaceRoute={view,...(view==="saved"?{record:pending.current.record,question:pending.current.question}:view==="reflect"?{experience:pending.current.experience}:view==="evidence"?{evidence:pending.current.evidence}:{})};
  commit(next);window.requestAnimationFrame(()=>document.getElementById("main-content")?.focus({preventScroll:true}));
 }
 return {route,view:route.view,navigate,activeRecord:route.record||"",setActiveRecord:(id:string)=>select("record",id),activeQuestion:route.question||"",setActiveQuestion:(id:string)=>select("question",id),activeExperience:route.experience||"",setActiveExperience:(id:string)=>select("experience",id),activeEvidence:route.evidence||"",setActiveEvidence:(id:string)=>select("evidence",id),activeOpportunity:route.opportunity||"",setActiveOpportunity:(id:string)=>select("opportunity",id)};
}
