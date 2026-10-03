import { availability, daysUntil, recordDeadline, todayISO, evidenceBank, type TrackedRecord, type AppData, type SkillEvidence, type RichOpportunity, type ApplicationQuestion } from "./domain";
import { recommendations } from "./recommendations";
export const requirementOptions=["Eligibility checked","Application account created","Application form started","Personal statement required","Written questions required","Teacher reference required","Predicted grades required","CV required","Supporting documents required","Interview required","School approval required","Parental consent required","Travel / accommodation"];
export function staleSource(item:RichOpportunity,today=todayISO()){const d=daysUntil(item.checkedAt.slice(0,10),today);return item.source==="catalogue"&&(d===null||d< -45);}
export function deadlineIntelligence(item:RichOpportunity,today=todayISO()){
 const state=availability(item,today),days=daysUntil(item.deadlineDate,today);
 const kind=state==="Closed"?"Application closed":item.deadlineDate?"Confirmed date":/rolling|ongoing|any time|self.paced/i.test(item.deadline)?"Rolling deadline":item.openingPeriod||/open/i.test(item.deadline)?"Expected opening period · check source":item.closingPeriod||/clos/i.test(item.deadline)?"Expected closing period · check source":/autumn|spring|summer|winter|expected|usually|typically/i.test(item.deadline)?"Expected period · check source":"Deadline not announced";
 return {kind,detail:item.deadline,stale:staleSource(item,today),days};
}
export function questionCount(question:ApplicationQuestion){return question.limitKind==="Words"?question.draft.trim().split(/\s+/).filter(Boolean).length:[...question.draft].length;}
export function starComplete(e:SkillEvidence){return !!e.star&&Object.values(e.star).every(v=>v.trim());}
export function evidenceStrength(e:SkillEvidence){return starComplete(e)?"Complete STAR":e.whatHappened.trim()&&e.learning.trim()?"Context, action & learning":"Personal action recorded";}
export function evidenceKey(e:{experienceId:string;id:string}){return e.experienceId+"::"+e.id;}
export function evidenceText(e:ReturnType<typeof evidenceBank>[number],star=false){
 const parts=star?[["Situation",e.star?.situation||e.whatHappened],["Task",e.star?.task||""],["Action",e.star?.action||e.action],["Result",e.star?.result||""]]:[["Context",e.whatHappened],["My action",e.action],["Learning",e.learning]];
 return e.experienceName+" — "+e.skill+(e.date?" ("+e.date+")":"")+"\n"+parts.map(([key,value])=>key+": "+(value.trim()||"[Add your own detail]")).join("\n");
}
const evidenceRelations=[
 {terms:["problem","difficult","challenge","solve"],skills:["Problem solving","Analytical thinking","Resilience"]},
 {terms:["team","collaborat","group"],skills:["Teamwork","Communication","Leadership"]},
 {terms:["communicat","explain","present"],skills:["Communication"]},
 {terms:["leader","leadership","initiative"],skills:["Leadership","Organisation"]},
 {terms:["learn","interest","motivat"],skills:["Independent learning","Technical skills"]},
 {terms:["research","analyse","analys","design"],skills:["Analytical thinking","Technical skills","Creativity"]}
];
export function suggestEvidence(question:string,entries:ReturnType<typeof evidenceBank>){
 const lower=question.toLowerCase(),wanted=evidenceRelations.filter(r=>r.terms.some(t=>lower.includes(t))).flatMap(r=>r.skills);
 return entries.map(e=>{
  const reasons:string[]=[];let rank=0;
  if(wanted.includes(e.skill)){reasons.push("Recorded "+e.skill.toLowerCase()+" example relates to this question");rank+=3;}
  const words=lower.split(/[^a-z0-9]+/).filter(w=>w.length>4&&!["describe","about","programme","demonstrated","experience"].includes(w));
  if(words.some(w=>[e.action,e.whatHappened,e.learning,e.experienceName].join(" ").toLowerCase().includes(w))){reasons.push("Your recorded notes share a topic with this question");rank++;}
  return {evidence:e,reasons,rank};
 }).filter(v=>v.rank>0).sort((a,b)=>b.rank-a.rank||Number(starComplete(b.evidence))-Number(starComplete(a.evidence))||a.evidence.experienceName.localeCompare(b.evidence.experienceName));
}
export type InAppAlert={id:string;title:string;detail:string;recordId?:string;experienceId?:string;kind:"urgent"|"review"|"explore"};
export function workspaceAlerts(data:AppData,catalogue:RichOpportunity[],today=todayISO()){
 const alerts:InAppAlert[]=[];
 const add=(r:TrackedRecord,suffix:string,title:string,detail:string,kind:InAppAlert["kind"]="review")=>alerts.push({id:r.opportunity.id+":"+suffix,title,detail,recordId:r.opportunity.id,kind});
 for(const r of data.records){
  if(["Not pursuing","Unsuccessful"].includes(r.status))continue;
  const title=r.opportunity.title,days=daysUntil(recordDeadline(r),today);
  if(r.status==="Completed"){if(!data.experiences.some(e=>e.opportunityId===r.opportunity.id&&e.whatDid.trim()))add(r,"reflect","Reflect while it is fresh",title+" is completed. Record what you actually did.");continue;}
  if(["Saved","Researching","Preparing application"].includes(r.status)&&days!==null&&days>=0&&days<=7)add(r,"deadline:"+recordDeadline(r),days===0?"Application closes today":days===1?"Closing tomorrow":"Closing this week",title+" · "+(r.deadlineOverride?"student-entered deadline":"published deadline"),"urgent");
  if(r.nextActionDate&&(daysUntil(r.nextActionDate,today)??0)<0&&r.nextAction)add(r,"action:"+r.nextActionDate+":"+r.nextAction.slice(0,60),"Next action is overdue",r.nextAction,"urgent");
  if(["Applying","Shortlisted"].includes(r.intent)&&r.requirements.some(t=>/reference/i.test(t.label)&&!t.done))add(r,"reference","Reference requirement still incomplete",title+" · confirm what your teacher needs.");
  const event=daysUntil(r.eventDate,today);
  if(r.status==="Interview / next stage"&&event!==null&&event>=0&&event<=7)add(r,"interview:"+r.eventDate,"Interview / next stage approaching",title+" · "+r.eventDate,"urgent");
  if(r.status==="Applied"&&r.appliedAt&&(daysUntil(r.appliedAt,today)??0)<=-21)add(r,"response:"+r.appliedAt,"No recorded update for three weeks",title+" · check the provider's expected response time.");
  if(r.status==="Saved"&&availability(r.opportunity,today)==="Closed")add(r,"closed:"+r.opportunity.deadlineDate,"A saved opportunity may now be closed",title+" · check the original source.");
  if(r.deadlineOverride)add(r,"override:"+r.deadlineDate,"Deadline changed manually",title+" · original: "+(r.opportunity.deadlineDate||r.opportunity.deadline));
  if(["Applying","Shortlisted"].includes(r.intent)&&staleSource(r.opportunity,today))add(r,"stale:"+r.opportunity.checkedAt,"Source has not been checked recently",title+" · verify current dates and criteria.");
 }
 const matches=recommendations(catalogue,data.profile,data.records.map(r=>r.opportunity.id),{records:data.records,experiences:data.experiences});
 for(const {item,match} of matches.filter(v=>v.match.rank>=7).filter(v=>{const d=daysUntil(v.item.addedAt,today);return d!==null&&d<=0&&d>=-7;}).slice(0,1))alerts.push({id:"new:"+item.id+":"+item.addedAt,title:"A recently added opportunity connects to your interests",detail:item.title+" · "+match.reasons.slice(0,2).join("; "),kind:"explore"});
 return alerts.filter(a=>!data.dismissedAlerts.includes(a.id)).sort((a,b)=>Number(b.kind==="urgent")-Number(a.kind==="urgent"));
}
