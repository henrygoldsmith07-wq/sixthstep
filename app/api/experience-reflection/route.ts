import { experienceSchema, reflectionInput, richReflectionSchema } from "@/lib/domain";
import { hasGroundedQuotes, studentEvidenceText } from "@/lib/grounding";
import { generateJson } from "@/lib/ai";
import { rateLimit,readBody,apiFailure,ApiError } from "@/lib/security";
export const runtime="nodejs";export const maxDuration=30;
export async function POST(req:Request) {
 try {
  await rateLimit(req,"reflection",5);
  const parsed=experienceSchema.safeParse(await readBody(req));
  if(!parsed.success)throw new ApiError(400,"Check the experience fields and keep your notes concise.");
  const experience=parsed.data,notes=reflectionInput(experience);
  if(studentEvidenceText(experience).trim().length<60)throw new ApiError(400,"Add at least 60 characters describing what you actually did or learned.");
  if(notes.length>12000)throw new ApiError(400,"Shorten this experience to 12,000 characters before using AI.");
  const reflection=await generateJson(richReflectionSchema,
   'Reflect on a sixth-form student experience using only their own evidence. Never invent achievements, responsibilities, qualifications, numbers, impact, or results. Preserve whether this was a simulation, placement, event or competition. Metadata such as programme title is not evidence of a skill. Plans and next-step intentions are not completed achievements. If an outcome is missing say "Not provided" rather than implying success. Every skill must include a verbatim evidenceQuote of at least 8 characters from one of the student evidence fields (not headings or metadata). Return JSON keys: summary (concise first-person reflection); skills (array of objects with skill, evidenceQuote, whatHappened, action, learning); star (object with situation, task, action, result); cvBullet; applicationExample; interviewTalkingPoint; nextSteps (string array). Application and interview examples must stay specific and truthful. Suggest only follow-up actions, never claim them completed.',notes);
  if(!hasGroundedQuotes(reflection,experience))throw new ApiError(502,"The reflection contained a skill without a matching quote from your notes. Please try again or add your own evidence.");
  return Response.json({reflection},{headers:{"Cache-Control":"no-store"}});
 }catch(error){return apiFailure(error);}
}
