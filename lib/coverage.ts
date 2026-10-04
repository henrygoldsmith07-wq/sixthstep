import { opportunityContent, relatedAreas } from "./careers";
import type { Experience, RichOpportunity, StudentProfile } from "./domain";

// Coverage reports only what the student has actually recorded. It never turns a
// programme's advertised activities into a personal achievement, and an absence is
// reported as an absence rather than filled in.
export type RecordedCoverage={areas:Map<string,number>;skills:Map<string,number>;experiences:number;examples:number};
export function recordedCoverage(experiences:Experience[]):RecordedCoverage {
 const areas=new Map<string,number>(),skills=new Map<string,number>();
 let recorded=0,examples=0;
 for(const experience of experiences){
  // An experience only counts once the student has written something or added an example.
  if(!experience.whatDid.trim()&&!experience.skills.some(s=>s.action.trim()))continue;
  recorded++;
  for(const area of relatedAreas([...experience.careerAreas,experience.name].join(" ")))areas.set(area.area,(areas.get(area.area)||0)+1);
  for(const skill of experience.skills.filter(s=>s.skill.trim()&&s.action.trim())){examples++;const name=skill.skill.trim();skills.set(name,(skills.get(name)||0)+1);}
 }
 return {areas,skills,experiences:recorded,examples};
}
export type AreaSupport={area:string;experiences:number};
// Areas an opportunity connects to where the student already has recorded work.
export function recordedSupport(item:RichOpportunity,coverage:RecordedCoverage):AreaSupport[] {
 const areas=[...new Set(relatedAreas(opportunityContent(item)).map(a=>a.area))];
 return areas.map(area=>({area,experiences:coverage.areas.get(area)||0})).filter(support=>support.experiences>0);
}
// Career areas the student has said they want to explore but has recorded nothing in yet.
// Only areas the student asked for are reported, so this never invents an interest.
export function unrecordedAreas(profile:StudentProfile,coverage:RecordedCoverage):string[] {
 const wanted=[...new Set(relatedAreas([profile.careerInterests,...profile.interests,profile.outsideInterests].join(" ")).map(a=>a.area))];
 return wanted.filter(area=>!coverage.areas.has(area));
}
export function missingSkills(coverage:RecordedCoverage,wanted:readonly string[]):string[] {
 return [...new Set(wanted.filter(skill=>skill.trim()))].filter(skill=>!coverage.skills.has(skill.trim()));
}