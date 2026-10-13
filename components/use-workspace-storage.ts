"use client";
import { useEffect, useRef, useState } from "react";
import { appSchema, emptyData, type AppData } from "@/lib/domain";
import { browserWorkspaceStorage, hasEraseTombstone, anotherTabErasedMessage, type WorkspaceStorage } from "@/lib/workspace-storage";

export function useWorkspaceStorage(factory=browserWorkspaceStorage){
  // Choose the adapter once per mount. Production bundling may inline the
  // default factory as a new function on each render; it must not rehydrate edits.
  const storageFactory=useRef(factory);
  const [data,setData]=useState<AppData>(emptyData),[ready,setReady]=useState(false),[error,setError]=useState(""),[conflict,setConflict]=useState(false),[stalled,setStalled]=useState(false);
  // Set when another tab deliberately erased the workspace. Kept separate from
  // `conflict` because the two need different UI: a conflict offers a choice
  // between versions, an erased tab must not offer to restore the deleted one.
  const [erased,setErased]=useState(false);
  const adapter=useRef<WorkspaceStorage|null>(null),blocked=useRef(false),epoch=useRef(0),queue=useRef<Promise<void>>(Promise.resolve());
  useEffect(()=>{
    let alive=true,unsubscribe:(()=>void)|undefined;
    try{
      const storage=storageFactory.current();adapter.current=storage;
      void storage.load().then(loaded=>{if(!alive)return;setData(loaded.data);blocked.current=!!loaded.error;setStalled(!!loaded.error);setError(loaded.error);setReady(true);}).catch(()=>{if(alive){blocked.current=true;setStalled(true);setError("Browser storage is unavailable. Export a backup before leaving; changes will not be saved.");setReady(true);}});
      unsubscribe=storage.subscribe?.(()=>{
        // An erase marker means the student deliberately deleted everything on
        // another tab. That is NOT an ordinary conflict: this tab still holds the
        // erased data in memory, so autosave must stop rather than quietly write it
        // back, and the banner must say why instead of offering to "keep" a copy
        // the student deleted on purpose.
        //
        // The stored truth is re-read before speaking, because the marker is
        // retired by the next genuine edit: an erase followed by fresh work
        // elsewhere must not leave this tab frozen on a stale explanation.
        let erased=false;
        // Ask the adapter first, so this hook never reaches into browser storage itself and
        // keeps its promise that only the adapter touches it. The direct read is a fallback
        // for an adapter without the probe, and is still safe because the marker is SixthStep
        // state the erase manager writes, never student data.
        try{erased=adapter.current?.erased?.()??hasEraseTombstone(window.localStorage);}catch{erased=hasEraseTombstone(window.localStorage);}
        if(erased){
          blocked.current=true;setConflict(false);setStalled(true);setErased(true);setError(anotherTabErasedMessage);
          if(adapter.current)void adapter.current.load().then(loaded=>{if(alive)setData(loaded.data)}).catch(()=>{});
          return;
        }
        blocked.current=true;setConflict(true);setError("Another tab changed this workspace. Export your current edits or choose which version to continue with.");
      });
    }catch{blocked.current=true;setStalled(true);setError("Browser storage is unavailable. Export a backup before leaving; changes will not be saved.");setReady(true);}
    return()=>{alive=false;unsubscribe?.();};
  },[]);
  useEffect(()=>{
    if(!ready||blocked.current||!adapter.current)return;
    const generation=epoch.current,snapshot=data;
    queue.current=queue.current.catch(()=>{}).then(async()=>{
      if(generation!==epoch.current||blocked.current)return;
      try{const result=await adapter.current!.save(snapshot);if(result.status==="conflict"){blocked.current=true;setConflict(true);setStalled(true);setError(result.error);}}
      catch{blocked.current=true;setStalled(true);setError("Your browser could not save changes. Export a workspace backup before leaving.");}
    });
  },[data,ready]);
  // "Keep this tab's version" / "Try saving again". No special wording for the
  // erased case: the banner above already explains the erase and replace() refuses
  // with the same message, so pressing it against erased data re-states the reason
  // instead of silently discarding anything the student still wanted.
  async function replaceData(value:AppData){
    ++epoch.current;
    try{await queue.current.catch(()=>{});await adapter.current?.replace(appSchema.parse(value));if(!adapter.current)throw new Error();setData(value);blocked.current=false;setConflict(false);setStalled(false);setErased(false);setError("");}
    catch{blocked.current=true;setStalled(true);setError("The workspace could not be saved. Your stored version has been retained; export your current edits before leaving.");}
  }
  async function reloadStored(){
    ++epoch.current;
    try{await queue.current.catch(()=>{});const loaded=await adapter.current?.load();if(!loaded)throw new Error();if(!loaded.error){setData(loaded.data);setConflict(false);}blocked.current=!!loaded.error;setStalled(!!loaded.error);setError(loaded.error);}
    catch{setError("The stored workspace could not be read. Keep a backup of your current edits.");}
  }
  async function clearWorkspace(){
    ++epoch.current;
    try{await queue.current.catch(()=>{});if(!adapter.current)throw new Error();await adapter.current.clear();setData(emptyData);blocked.current=false;setConflict(false);setStalled(false);setErased(false);setError("");}
    catch{setError("Your data could not be erased from this browser. Export a backup first, then try again.");}
  }
  async function recovery(){if(!adapter.current)throw new Error("Storage is unavailable.");return adapter.current.recovery();}
  return {data,setData,ready,error,conflict,stalled,erased,replaceData,reloadStored,recovery,clearWorkspace};
}
