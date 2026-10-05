import type { Experience, RichReflection } from "./domain";
export function studentEvidenceText(experience:Experience) {
 return [experience.whatDid,experience.learned,experience.challenges,experience.surprised,experience.enjoyed,experience.disliked,experience.careerImpact,...experience.skills.flatMap(s=>[s.whatHappened,s.action,s.learning])].filter(Boolean).join("\n");
}
function normalise(text:string){return text.replace(/\s+/g," ").trim().toLowerCase();}
export function hasGroundedQuotes(reflection:RichReflection,experience:Experience){
 const evidence=normalise(studentEvidenceText(experience));
 // An empty skill list satisfies every(), so a reflection with no skills passed the gate with
  // no quote checked at all. A reflection that claims grounded evidence must contain some.
  return reflection.skills.length>0&&reflection.skills.every(skill=>normalise(skill.evidenceQuote).length>=8 && evidence.includes(normalise(skill.evidenceQuote)));
}
