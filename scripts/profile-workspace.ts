import { performance } from "node:perf_hooks";
import { catalogue } from "../lib/catalogue";
import { createRecord, emptyData } from "../lib/domain";
import { discover, defaultFilters, recommendations } from "../lib/recommendations";
import { workspaceItems } from "../lib/operating-system";

// Synthetic copies benchmark scale; these never enter the published catalogue.
const entries=Array.from({length:3000},(_,i)=>({...catalogue[i%catalogue.length],id:"benchmark-"+i}));
const data={...structuredClone(emptyData),profile:{...emptyData.profile,configured:true,subjects:["Physics","Maths"],interests:["Engineering"]},records:entries.slice(0,500).map(item=>createRecord(item))};
const excluded=data.records.map(r=>r.opportunity.id),context={records:data.records,experiences:data.experiences,feedback:data.feedback};
function measure(label:string,run:()=>unknown){run();const start=performance.now();for(let i=0;i<3;i++)run();console.log(label+": "+((performance.now()-start)/3).toFixed(1)+" ms (mean of 3 warm runs)");}
console.log("Synthetic scale:",entries.length,"catalogue entries /",data.records.length,"saved opportunities");
measure("Search and filter",()=>discover(entries,{...defaultFilters,query:"engineering",free:true}));
measure("Explainable recommendations",()=>recommendations(entries,data.profile,excluded,context));
measure("Home domain actions",()=>workspaceItems(data,entries));
measure("Snapshot serialization",()=>JSON.stringify(data));
console.log("Snapshot:",Buffer.byteLength(JSON.stringify(data)),"bytes");
