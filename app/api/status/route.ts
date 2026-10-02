import { aiStatus } from "@/lib/ai";
export const dynamic="force-dynamic";
export async function GET() {
 return Response.json({...aiStatus(),search:!!process.env.TAVILY_API_KEY?.trim()},{headers:{"Cache-Control":"no-store"}});
}
