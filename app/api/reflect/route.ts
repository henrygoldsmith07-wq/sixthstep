import { z } from "zod";
import { reflectionSchema } from "@/lib/types";
import { groq } from "@/lib/providers";
import { rateLimit,readBody,apiFailure,ApiError } from "@/lib/security";
export const runtime="nodejs"; export const maxDuration=30;
export async function POST(req:Request) {
 try{
  await rateLimit(req,"reflection",5);
  const body=z.object({notes:z.string().min(60).max(8000)}).safeParse(await readBody(req));
  if(!body.success) throw new ApiError(400,"Add between 60 and 8,000 characters of reflection notes.");
  const reflection=await groq(reflectionSchema,'Turn these work experience notes into a truthful reflection. Describe only what the student actually reports doing. Do not invent responsibilities, qualifications, achievements or measurable impact. Do not upgrade a simulation into employment. JSON keys: summary (short first-person string), skills (string array, each tied to evidence), cvBullet (one truthful CV bullet string), nextSteps (string array of suggested actions).',body.data.notes);
  return Response.json({reflection},{headers:{"Cache-Control":"no-store"}});
 }catch(error){return apiFailure(error);}
}
