import { ApiError, safePublicUrl } from "./security";
export async function tavily(path:"search"|"extract",body:Record<string,unknown>) {
 if(!process.env.TAVILY_API_KEY) throw new ApiError(503,"Live web search needs a Tavily API key. You can still browse the provider collection or paste opportunity text.");
 let response:Response;
 try{response=await fetch("https://api.tavily.com/"+path,{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+process.env.TAVILY_API_KEY},body:JSON.stringify(body),signal:AbortSignal.timeout(18000),cache:"no-store"});}
 catch(error){if(error instanceof Error&&["TimeoutError","AbortError"].includes(error.name))throw new ApiError(504,"The source service took too long. Try again, or paste the opportunity text.");throw new ApiError(503,"The source service could not be reached. Try the checked collection or pasted text.");}
 if(!response.ok) throw new ApiError(response.status===429?429:503,response.status===429?"The free search allowance is busy or used up. Try the provider collection.":"Web search is temporarily unavailable. Try pasted text or the provider collection.");
 let data;
 try{data=await response.json();}catch{throw new ApiError(502,"The source service returned unreadable data. Try again or paste the opportunity text.");}
 if(!data||!Array.isArray(data.results)||data.results.some((item:unknown)=>!item||typeof item!=="object"||Array.isArray(item)))throw new ApiError(502,"The source service returned incomplete results. Try again or use the checked collection.");
 return data;
}
export async function extractOpportunity(url:string):Promise<string> {
 const safe=safePublicUrl(url);
 // Extraction happens through Tavily, never via arbitrary server-side URL fetching.
 const data=await tavily("extract",{urls:[safe],extract_depth:"basic"});
 const content=data.results?.[0]?.raw_content;
 if(typeof content!=="string" || content.trim().length<60) throw new ApiError(422,"This page couldn't be read. Paste the opportunity description instead.");
 return content.slice(0,12000);
}
