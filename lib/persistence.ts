import { appSchema, defaultProfile, emptyData, enrich, createRecord, experienceSchema, type AppData } from "./domain";
type StorageReader={getItem:(key:string)=>string|null};
export const storageKey="sixthstep-workspace-v2";
function parseLegacy(storage:StorageReader,key:string) {const raw=storage.getItem(key);return raw?JSON.parse(raw):null;}
export function loadWorkspace(storage:StorageReader):{data:AppData;error:string;migrated:boolean} {
 const current=storage.getItem(storageKey);
 if(current){
  try{return {data:appSchema.parse(JSON.parse(current)),error:"",migrated:false};}
  catch{return {data:structuredClone(emptyData),error:"Saved workspace data could not be loaded. Export the original backup before replacing it. Changes are temporary until you restore a valid backup.",migrated:false};}
 }
 const data=structuredClone(emptyData);let error="";
 try {
  const old=parseLegacy(storage,"sixthstep-saved-v1");
  if(Array.isArray(old))for(const item of old){
   try {
    const record=createRecord(enrich(item),typeof item.savedAt==="string"?item.savedAt:new Date().toISOString());
    record.status=item.status==="Applied"?"Applied":item.status==="Completed"?"Completed":"Saved";
    if(!data.records.some(r=>r.opportunity.id===record.opportunity.id))data.records.push(record);
   }catch {error="Some old saved opportunities could not be migrated. Your original v1 data is still retained.";}
  }
 }catch{error="Old saved opportunities could not be loaded. Your original v1 data is still retained.";}
 try {
  const old=parseLegacy(storage,"sixthstep-profile-v1");
  if(old&&typeof old==="object")data.profile={...defaultProfile,year:typeof old.year==="string"?old.year:"Year 12",subjects:typeof old.subjects==="string"?old.subjects.split(/[,;\n]/).map((s:string)=>s.trim()).filter(Boolean):[],interests:Array.isArray(old.interests)?old.interests.filter((s:unknown)=>typeof s==="string"):[],configured:!!(old.interests?.length||old.subjects)};
 }catch{error ||= "Old profile data could not be loaded. Original data is retained.";}
 try {
  const old=parseLegacy(storage,"sixthstep-journal-v1");
  if(typeof old==="string"&&old.trim())data.experiences.push(experienceSchema.parse({id:"legacy-notes",name:"My previous experience notes",whatDid:old.slice(0,4500),learned:old.length>4500?old.slice(4500,7000):"",updatedAt:new Date().toISOString()}));
 }catch{error ||= "Old journal data could not be loaded. Original data is retained.";}
 return {data:appSchema.parse(data),error,migrated:data.records.length>0||data.experiences.length>0||data.profile.configured};
}
export function backupJSON(data:AppData){return JSON.stringify(data,null,2);}
export function restoreWorkspace(text:string):AppData {
 if(text.length>5000000)throw new Error("This backup is too large.");
 const parsed=appSchema.safeParse(JSON.parse(text));
 if(!parsed.success)throw new Error("This is not a valid SixthStep workspace backup.");
 const data=parsed.data;
 if(new Set(data.records.map(r=>r.opportunity.id)).size!==data.records.length||new Set(data.experiences.map(e=>e.id)).size!==data.experiences.length)throw new Error("This backup has duplicate record IDs.");
 for(const record of data.records)if(new Set(record.questions.map(q=>q.id)).size!==record.questions.length||new Set(record.requirements.map(r=>r.id)).size!==record.requirements.length)throw new Error("This backup has duplicate question or requirement IDs.");
 for(const experience of data.experiences)if(new Set(experience.skills.map(s=>s.id)).size!==experience.skills.length)throw new Error("This backup has duplicate evidence IDs.");
 return data;
}
