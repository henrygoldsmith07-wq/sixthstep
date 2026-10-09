import { appSchema, type AppData } from "./domain";
import { loadWorkspace, storageKey, type StorageReader } from "./persistence";

export type StorageBackend=StorageReader&{setItem:(key:string,value:string)=>void};
export type WorkspaceSnapshot=ReturnType<typeof loadWorkspace>;
export type SaveOutcome={status:"saved"}|{status:"conflict";error:string};
export interface WorkspaceStorage {
  load():Promise<WorkspaceSnapshot>;
  save(data:AppData):Promise<SaveOutcome>;
  replace(data:AppData):Promise<void>;
  recovery():Promise<Record<string,string|null>>;
  subscribe?(changed:()=>void):()=>void;
}
// Metrics change on every view, so a raw byte comparison turns ordinary two-tab use into
// a permanent conflict. Strip metrics before comparing; a corrupted raw value is never equal.
export function authoredEqual(a:string|null,b:string|null):boolean {
 const authored=(raw:string|null)=>{if(!raw)return "";try{const {metrics:_ignored,...rest}=JSON.parse(raw);return JSON.stringify(rest);}catch{return raw;}};
 return authored(a)===authored(b);
}
export const conflictBackupKey="sixthstep-before-replacement-v2";
const originalKeys=[storageKey,"sixthstep-saved-v1","sixthstep-profile-v1","sixthstep-journal-v1",conflictBackupKey];

export class LocalWorkspaceStorage implements WorkspaceStorage {
  private baseline:string|null=null;
  private loaded=false;
  private needsRecovery=false;
  subscribe?:WorkspaceStorage["subscribe"];
  constructor(private storage:StorageBackend,hook?:WorkspaceStorage["subscribe"]){
   // A storage event fires for every external write, including the metrics-only writes another
   // tab makes on every view. Blocking autosave on those re-created the permanent two-tab
   // deadlock the save path's metrics-aware comparison prevents, so only surface a change
   // when the student-authored content of the stored value actually differs.
   this.subscribe=hook?changed=>hook(()=>{if(!authoredEqual(this.storage.getItem(storageKey),this.baseline))changed();}):undefined;
  }
  async load(){const result=loadWorkspace(this.storage);this.baseline=this.storage.getItem(storageKey);this.loaded=true;this.needsRecovery=!!result.error;return result;}
  async save(data:AppData):Promise<SaveOutcome>{
    if(!this.loaded)throw new Error("Load the workspace before saving.");
    if(this.needsRecovery)throw new Error("Restore a valid backup before replacing unreadable data.");
    const value=JSON.stringify(appSchema.parse(data)),current=this.storage.getItem(storageKey);
    if(current!==this.baseline&&current!==value&&this.authoredDiffers(current,value))return {status:"conflict",error:"Another tab changed this workspace. Your edits are kept here; choose which version to continue with before saving."};
    if(value!==current)this.storage.setItem(storageKey,value);
    this.baseline=value;return {status:"saved"};
  }
  // Local metrics are written on every view and every keystroke, so comparing them made two
  // ordinary tabs look like a conflict and blocked autosave permanently.
  private authoredDiffers(current:string|null,next:string):boolean {return !authoredEqual(current,next);}
  async replace(data:AppData){
    const value=JSON.stringify(appSchema.parse(data)),original=this.storage.getItem(storageKey);
    // Preserve the replaced version first. A failed backup must not overwrite it.
    if(original&&original!==value)this.storage.setItem(conflictBackupKey,original);
    this.storage.setItem(storageKey,value);this.baseline=value;this.loaded=true;this.needsRecovery=false;
  }
  async recovery(){return Object.fromEntries(originalKeys.map(key=>[key,this.storage.getItem(key)]));}
}
export function browserWorkspaceStorage():WorkspaceStorage {
  const adapter=new LocalWorkspaceStorage(window.localStorage,changed=>{
    const listener=(event:StorageEvent)=>{if(event.storageArea===window.localStorage&&(event.key===storageKey||event.key===null))changed();};
    window.addEventListener("storage",listener);return()=>window.removeEventListener("storage",listener);
  });
  const save=adapter.save.bind(adapter),replace=adapter.replace.bind(adapter);
  // Coordinate the compare/write transaction across tabs where Web Locks exist.
  adapter.save=data=>navigator.locks?navigator.locks.request(storageKey,()=>save(data)):save(data);
  adapter.replace=data=>navigator.locks?navigator.locks.request(storageKey,()=>replace(data)):replace(data);
  return adapter;
}
