import type { Experience, RichReflection } from "./domain";
export function studentEvidenceText(experience:Experience) {
 // Model-drafted wording is excluded. Feeding it back as the student's own record let a later
 // reflection ground a new "quote" in text SixthStep itself had written, which compounds.
 return [experience.whatDid,experience.learned,experience.challenges,experience.surprised,experience.enjoyed,experience.disliked,experience.careerImpact,...experience.skills.filter(s=>s.origin!=="ai").flatMap(s=>[s.whatHappened,s.action,s.learning])].filter(Boolean).join("\n");
}
function normalise(text:string){return text.replace(/\s+/g," ").trim().toLowerCase();}
export function hasGroundedQuotes(reflection:RichReflection,experience:Experience){
 const evidence=normalise(studentEvidenceText(experience));
 // An empty skill list satisfies every(), so a reflection with no skills passed the gate with
  // no quote checked at all. A reflection that claims grounded evidence must contain some.
  return reflection.skills.length>0&&reflection.skills.every(skill=>normalise(skill.evidenceQuote).length>=8 && evidence.includes(normalise(skill.evidenceQuote)));
}
// Every number the reflection states outside a skill quote must exist in the student own notes.
// Percentages, counts and durations are the shape an invented achievement takes, and the CV bullet
// is what gets pasted into a real application form.
export function unsupportedClaims(reflection:RichReflection,experience:Experience) {
 const evidence=normalise(studentEvidenceText(experience));
 const authored=[reflection.summary,reflection.cvBullet,reflection.applicationExample,reflection.interviewTalkingPoint,...reflection.nextSteps,Object.values(reflection.star??{}).map(String)];
 const unsupported:string[]=[];
 for(const text of authored){
  for(const match of String(text).matchAll(/\d+(?:\.\d+)?/g)){
   const token=normalise(match[0]);
   if(token.length>1&&!evidence.includes(token))unsupported.push(match[0]);
  }
 }
 return [...new Set(unsupported)];
}
