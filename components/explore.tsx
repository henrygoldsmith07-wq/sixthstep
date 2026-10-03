"use client";
import { useState } from "react";
import { useWorkspace } from "./workspace-context";
import { Finder } from "./finder";
import { Importer } from "./importer";
import { Shortlist } from "./shortlist";
export function Explore(){
 const {view,navigate,startImport,importMode}=useWorkspace(),[shortlist,setShortlist]=useState(false);
 return <><div className="explore-nav" role="group" aria-label="Explore workflows"><button className={"button "+(view==="finder"&&!shortlist?"primary":"secondary")} aria-pressed={view==="finder"&&!shortlist} onClick={()=>{setShortlist(false);navigate("finder");}}>Browse opportunities</button><button className="button secondary" onClick={()=>{setShortlist(false);navigate("finder");setTimeout(()=>document.querySelector<HTMLInputElement>('[aria-label="Search opportunities"]')?.focus(),0);}}>Web search</button><button className={"button "+(view==="summarise"?"primary":"secondary")} aria-pressed={view==="summarise"} onClick={()=>{setShortlist(false);startImport();}}>Paste an opportunity</button><button className="button secondary" onClick={()=>{setShortlist(false);startImport("",true);}}>Add manually</button><button className={"button "+(shortlist?"primary":"secondary")} aria-pressed={shortlist} onClick={()=>{navigate("finder");setShortlist(true);}}>My shortlist</button></div>
 {shortlist?<Shortlist onBrowse={()=>setShortlist(false)}/>:view==="summarise"?<Importer key={importMode} initialMode={importMode}/>:<Finder/>}</>;
}
