import { ApiError, safePublicUrl } from "./security";
export async function tavily(path:"search"|"extract",body:Record<string,unknown>) {
 if(!process.env.TAVILY_API_KEY) throw new ApiError(503,"Live web search needs a Tavily API key. You can still browse the provider collection or paste opportunity text.");
 const response=await fetch("https://api.tavily.com/"+path,{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+process.env.TAVILY_API_KEY},body:JSON.stringify(body),signal:AbortSignal.timeout(18000),cache:"no-store"});
 if(!response.ok) throw new ApiError(response.status===429?429:503,response.status===429?"The free search allowance is busy or used up. Try the provider collection.":"Web search is temporarily unavailable. Try pasted text or the provider collection.");
 return response.json();
}
export async function extractOpportunity(url:string):Promise<string> {
 const safe=safePublicUrl(url);
 // Extraction happens through Tavily, never via arbitrary server-side URL fetching.
 const data=await tavily("extract",{urls:[safe],extract_depth:"basic"});
 const content=data.results?.[0]?.raw_content;
 if(typeof content!=="string" || content.trim().length<60) throw new ApiError(422,"This page couldn't be read. Paste the opportunity description instead.");
 return content.slice(0,12000);
}
