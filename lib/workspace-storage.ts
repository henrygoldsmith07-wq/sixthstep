import { appSchema, emptyData, type AppData } from "./domain";
import { loadWorkspace, storageKey, type StorageReader } from "./persistence";

export type StorageBackend=StorageReader&{setItem:(key:string,value:string)=>void;removeItem:(key:string)=>void};
export type WorkspaceSnapshot=ReturnType<typeof loadWorkspace>;
export type SaveOutcome={status:"saved"}|{status:"conflict";error:string};
export interface WorkspaceStorage {
  load():Promise<WorkspaceSnapshot>;
  save(data:AppData):Promise<SaveOutcome>;
  replace(data:AppData):Promise<void>;
  recovery():Promise<Record<string,string|null>>;
  // Removes only the SixthStep-controlled storage keys, never using clear(), so an
  // unrelated app's data is never touched. Used by the explicit "Delete all data" control.
  clear():Promise<void>;
  subscribe?(changed:()=>void):()=>void;
  // True when a deliberate erase elsewhere is still in effect. Lets the interface name the
  // real cause of a cross-tab change instead of guessing between two ordinary versions.
  erased?():boolean;
}
// Metrics change on every view, so a raw byte comparison turns ordinary two-tab use into
// a permanent conflict. Strip metrics before comparing; a corrupted raw value is never equal.
export function authoredEqual(a:string|null,b:string|null):boolean {
  const authored=(raw:string|null)=>{if(!raw)return "";try{const {metrics:_ignored,...rest}=JSON.parse(raw);return JSON.stringify(rest);}catch{return raw}};
  return authored(a)===authored(b);
}
export const conflictBackupKey="sixthstep-before-replacement-v2";
export const originalKeys=[storageKey,"sixthstep-saved-v1","sixthstep-profile-v1","sixthstep-journal-v1",conflictBackupKey];
// A deliberate erase leaves a marker behind, because storage events are the only
// cross-tab channel and they cannot distinguish a write from a deletion.
//
// Without it the erase promise was only half true. One tab erased cleanly, but
// another tab still held the erased workspace in memory and still showed the
// conflict choices — so "Keep this tab's version", or an autosave, wrote every
// erased record straight back. A student who deleted their data on one tab got
// it restored from another, by a button this product offered, with no indication why.
//
// The marker holds a timestamp and nothing else, so it stores nothing the erase
// was supposed to remove. The next genuine edit retires it, so it cannot itself
// resurrect anything, and it is excluded from recovery() because it is state,
// not student data.
export const eraseTombstoneKey="sixthstep-erased-at-v2";
// What a tab that is still holding pre-erase edits is told. It names the cause, so the
// student knows saving was refused because of an erase rather than guessing which of two
// ordinary versions to keep.
export const anotherTabErasedMessage="Your data was erased in another tab. This tab is still holding the deleted version, so it will not be saved. Reopen this tab to see the erased, empty workspace.";
/** True when a marker left by an explicit erase is still in effect. */
export function hasEraseTombstone(storage:StorageBackend){return storage.getItem(eraseTombstoneKey)!==null;}
// The exact bytes a workspace with no student content serialises to. Compared against the same
// appSchema.parse round trip save() performs, so a schema default change cannot silently drift.
const pristineWorkspaceJSON=JSON.stringify(appSchema.parse(emptyData));

export class LocalWorkspaceStorage implements WorkspaceStorage {
  private baseline:string|null=null;
  private loaded=false;
  private needsRecovery=false;
  subscribe?:WorkspaceStorage["subscribe"];
  constructor(private storage:StorageBackend,hook?:WorkspaceStorage["subscribe"]){
   // A storage event fires for every external write, including the metrics-only writes another
   // tab makes on every view. Blocking autosave on those re-created the permanent two-tab
   // deadlock the save path's metrics-aware comparison prevents, so a change is only surfaced
   // when the student-authored content of the stored value actually differs.
   //
   // An erase is checked first. An erased value and an empty stored value both hold no
   // authored content, so the metrics-aware comparison alone cannot tell a deliberate erase
   // from an ordinary write — and the sibling tab would otherwise never be told it happened.
    this.subscribe=hook?changed=>hook(()=>{if(hasEraseTombstone(this.storage)||!authoredEqual(this.storage.getItem(storageKey),this.baseline))changed();}):undefined;
  }
  async load(){const result=loadWorkspace(this.storage);
   // A marker set since this adapter was created means the student deliberately deleted
   // everything, here or in another tab. Report the empty workspace as the stored truth
   // rather than falling back to the v1 keys: the same erase removed those, and
   // resurrecting them would undo the deletion this marker exists to protect.
    if(hasEraseTombstone(this.storage)){result.data=structuredClone(emptyData);result.error="";result.migrated=false;}
    this.baseline=this.storage.getItem(storageKey);this.loaded=true;this.needsRecovery=!!result.error;return result;}
  async save(data:AppData):Promise<SaveOutcome>{
    if(!this.loaded)throw new Error("Load the workspace before saving.");
    if(this.needsRecovery)throw new Error("Restore a valid backup before replacing unreadable data.");
    const value=JSON.stringify(appSchema.parse(data)),current=this.storage.getItem(storageKey);
    if(current!==this.baseline&&current!==value&&this.authoredDiffers(current,value)){
     // A tab holding pre-erase edits in memory is not an ordinary conflict. The other tab
     // erased on purpose, so the honest outcomes are "saved" and "empty": offering to
     // overwrite the empty workspace with the erased data would undo a deliberate deletion.
      if(hasEraseTombstone(this.storage))return {status:"conflict",error:anotherTabErasedMessage};
      return {status:"conflict",error:"Another tab changed this workspace. Your edits are kept here; choose which version to continue with before saving."};
    }
    // Opening the app, or finishing a deliberate erase, must leave nothing stored: a workspace
    // holding no student content never creates the key. A real edit still persists normally.
    if(current===null&&value===pristineWorkspaceJSON)return {status:"saved"};
    if(value!==current){
     // The first genuine edit after an erase retires the marker: the student is deliberately
     // starting again, so the "erased in another tab" explanation must not follow them.
      if(hasEraseTombstone(this.storage))this.storage.removeItem(eraseTombstoneKey);
      this.storage.setItem(storageKey,value);
    }
    this.baseline=value;return {status:"saved"};
  }
  // Local metrics are written on every view and every keystroke, so comparing them made two
  // ordinary tabs look like a conflict and blocked autosave permanently.
  private authoredDiffers(current:string|null,next:string):boolean {return !authoredEqual(current,next);}
  async replace(data:AppData){
    // "Keep this tab's version" is an explicit student choice, so it normally wins over a
    // storage change. It must not win over a deliberate erase: restoring the deleted copy
    // would undo the one action whose entire purpose was to remove it. Refuse, keep the
    // erased (empty) state, and let the student re-open the tab to see it.
    if(hasEraseTombstone(this.storage)&&authoredDiffersFromEmpty(data))throw new Error(anotherTabErasedMessage);
    const value=JSON.stringify(appSchema.parse(data)),original=this.storage.getItem(storageKey);
    // Preserve the replaced version first. A failed backup must not overwrite it.
    if(original&&original!==value)this.storage.setItem(conflictBackupKey,original);
    // The same invariant save() keeps: a workspace that carries no student content leaves
    // nothing stored. Without this, resolving a conflict to "the empty version" would write
    // a key a student never created — so "delete everything" would still leave a trace, and
    // the next tab's baseline comparison would differ for a workspace the student never wrote.
    if(original!==value){
      if(value===pristineWorkspaceJSON)this.storage.removeItem(storageKey);
      else this.storage.setItem(storageKey,value);
    }
    this.baseline=this.storage.getItem(storageKey);this.loaded=true;this.needsRecovery=false;
  }
  async recovery(){return Object.fromEntries(originalKeys.map(key=>[key,this.storage.getItem(key)]));}
  // Whether a deliberate erase is still in effect. Read-only and state-only: it reports the
  // marker and never returns student data.
  erased(){return hasEraseTombstone(this.storage);}
  // The stored state is now known to be empty rather than unread, so a later edit must be
  // saveable: leaving loaded=false made the interface's own post-delete save throw, which
  // surfaced a false "could not save" warning and blocked autosave until a reload.
  async clear(){
    // Set the marker before removing the workspace key, not after. Removal dispatches a
    // storage event; if the marker were written afterwards, the sibling tab would handle
    // that event before the marker existed and tell the student the generic cause instead
    // of the true one — the deletion would still be safe, but the explanation would be wrong.
    try{this.storage.setItem(eraseTombstoneKey,String(Date.now()));}catch{/* a blocked storage cannot signal other tabs; the local erase still holds */}
    for(const key of originalKeys)this.storage.removeItem(key);
    // The marker is SixthStep state rather than student data, so it is re-asserted after the
    // removals in case a browser drops a write made immediately before a removal burst.
    try{this.storage.setItem(eraseTombstoneKey,String(Date.now()));}catch{/* as above */}
    this.baseline=null;this.loaded=true;this.needsRecovery=false;
  }
}
// A workspace that would write student content back. Used only to decide whether a stale tab's
// data is erased data; an empty workspace is always allowed through because it writes nothing.
function authoredDiffersFromEmpty(data:AppData):boolean {
  return !authoredEqual(JSON.stringify(appSchema.parse(data)),pristineWorkspaceJSON);
}
export function browserWorkspaceStorage():WorkspaceStorage {
  const adapter=new LocalWorkspaceStorage(window.localStorage,changed=>{
    const listener=(event:StorageEvent)=>{if(event.storageArea===window.localStorage&&(event.key===storageKey||event.key===eraseTombstoneKey||event.key===null))changed();};
    window.addEventListener("storage",listener);return()=>window.removeEventListener("storage",listener);
  });
  const save=adapter.save.bind(adapter),replace=adapter.replace.bind(adapter),clear=adapter.clear.bind(adapter);
  // Coordinate the compare/write transaction across tabs where Web Locks exist.
  adapter.save=data=>navigator.locks?navigator.locks.request(storageKey,()=>save(data)):save(data);
  adapter.replace=data=>navigator.locks?navigator.locks.request(storageKey,()=>replace(data)):replace(data);
  adapter.clear=()=>navigator.locks?navigator.locks.request(storageKey,()=>clear()):clear();
  return adapter;
}
