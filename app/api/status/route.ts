export const dynamic="force-dynamic";
export async function GET() { return Response.json({ai:!!process.env.GROQ_API_KEY,search:!!process.env.TAVILY_API_KEY},{headers:{"Cache-Control":"no-store"}}); }
