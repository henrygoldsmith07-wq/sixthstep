"use client";
import { useEffect, useRef, useState } from "react";
import { appSchema, emptyData, type AppData } from "@/lib/domain";
import { browserWorkspaceStorage, type WorkspaceStorage } from "@/lib/workspace-storage";

export function useWorkspaceStorage(factory=browserWorkspaceStorage){
  const [data,setData]=useState<AppData>(emptyData),[ready,setReady]=useState(false),[error,setError]=useState(""),[conflict,setConflict]=useState(false);
  const adapter=useRef<WorkspaceStorage|null>(null),blocked=useRef(false),epoch=useRef(0),queue=useRef<Promise<void>>(Promise.resolve());
  useEffect(()=>{
    let alive=true,unsubscribe:(()=>void)|undefined;
    try{
      const storage=factory();adapter.current=storage;
      void storage.load().then(loaded=>{if(!alive)return;setData(loaded.data);blocked.current=!!loaded.error;setError(loaded.error);setReady(true);}).catch(()=>{if(alive){blocked.current=true;setError("Browser storage is unavailable. Export a backup before leaving; changes will not be saved.");setReady(true);}});
      unsubscribe=storage.subscribe?.(()=>{blocked.current=true;setConflict(true);setError("Another tab changed this workspace. Export your current edits or choose which version to continue with.");});
    }catch{blocked.current=true;setError("Browser storage is unavailable. Export a backup before leaving; changes will not be saved.");setReady(true);}
    return()=>{alive=false;unsubscribe?.();};
  },[factory]);
  useEffect(()=>{
    if(!ready||blocked.current||!adapter.current)return;
    const generation=epoch.current,snapshot=data;
    queue.current=queue.current.catch(()=>{}).then(async()=>{
      if(generation!==epoch.current||blocked.current)return;
      try{const result=await adapter.current!.save(snapshot);if(result.status==="conflict"){blocked.current=true;setConflict(true);setError(result.error);}}
      catch{blocked.current=true;setError("Your browser could not save changes. Export a workspace backup before leaving.");}
    });
  },[data,ready]);
  async function replaceData(value:AppData){
    ++epoch.current;
    try{await queue.current.catch(()=>{});await adapter.current?.replace(appSchema.parse(value));if(!adapter.current)throw new Error();setData(value);blocked.current=false;setConflict(false);setError("");}
    catch{blocked.current=true;setError("The workspace could not be saved. Your stored version has been retained; export your current edits before leaving.");}
  }
  async function reloadStored(){
    ++epoch.current;
    try{await queue.current.catch(()=>{});const loaded=await adapter.current?.load();if(!loaded)throw new Error();if(!loaded.error){setData(loaded.data);setConflict(false);}blocked.current=!!loaded.error;setError(loaded.error);}
    catch{setError("The stored workspace could not be read. Keep a backup of your current edits.");}
  }
  async function recovery(){if(!adapter.current)throw new Error("Storage is unavailable.");return adapter.current.recovery();}
  return {data,setData,ready,error,conflict,replaceData,reloadStored,recovery};
}
