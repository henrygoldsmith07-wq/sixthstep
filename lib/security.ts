import { createHash } from "node:crypto";
export class ApiError extends Error { constructor(public status:number,message:string){super(message);} }
export function safePublicUrl(value:string) {
 let url:URL; try { url=new URL(value); } catch { throw new ApiError(400,"Enter a valid public https:// opportunity link."); }
 const hostname=url.hostname.toLowerCase().replace(/\.$/,"");
 if(url.protocol!=="https:" || url.username || url.password || (url.port && url.port!=="443")
 || !hostname.includes(".") || hostname==="localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal")
 || hostname.endsWith(".localhost") || hostname.includes(":") || /^\d+(\.\d+){3}$/.test(hostname))
 throw new ApiError(400,"Use a public HTTPS website link. Local and numeric addresses are not supported.");
 return url.toString();
}
export async function readBody(req:Request) {
 const length=Number(req.headers.get("content-length")||0);
 if(length>24000) throw new ApiError(413,"Please keep the input under 12,000 characters.");
 if(!req.headers.get("content-type")?.includes("application/json")) throw new ApiError(415,"Send JSON input.");
 // Enforce the limit while reading, including chunked requests without a header.
 const reader=req.body?.getReader();
 if(!reader)throw new ApiError(400,"Invalid request.");
 const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>24000){await reader.cancel();throw new ApiError(413,"Please shorten the input.");}chunks.push(value);}}finally{reader.releaseLock();}
 const text=Buffer.concat(chunks).toString("utf8");
 try{return JSON.parse(text);}catch{throw new ApiError(400,"Invalid request.");}
}
export function sameOrigin(req:Request) {
 const origin=req.headers.get("origin");
 if(origin && origin!==new URL(req.url).origin) throw new ApiError(403,"This request must come from SixthStep.");
}
const requests=new Map<string,{count:number;reset:number}>();
export async function rateLimit(req:Request,kind:string,limit=8) {
 sameOrigin(req);
 const ip=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"local";
 const key="sixthstep:"+kind+":"+createHash("sha256").update(ip).digest("hex").slice(0,24);
 const redisUrl=process.env.UPSTASH_REDIS_REST_URL, token=process.env.UPSTASH_REDIS_REST_TOKEN;
 if(redisUrl && token){
   const script="local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],60) end; return n";
   const response=await fetch(redisUrl,{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify(["EVAL",script,"1",key]),signal:AbortSignal.timeout(5000)});
   if(!response.ok) throw new ApiError(503,"Please try again shortly.");
   const payload=await response.json();
   if(payload.error || typeof payload.result!=="number") throw new ApiError(503,"Please try again shortly.");
   if(payload.result>limit) throw new ApiError(429,"A few too many requests. Try again in a minute.");
   return;
 }
 const now=Date.now();
 for(const [k,v] of requests)if(v.reset<=now)requests.delete(k);
 let bucket=requests.get(key);
 // Never evict a live bucket to make space: that would reset its allowance.
 if(!bucket&&requests.size>=5000)throw new ApiError(503,"The service is busy. Please try again in a minute.");
 if(!bucket || now>bucket.reset) {bucket={count:0,reset:now+60000};requests.set(key,bucket);}
 bucket.count++; if(bucket.count>limit) throw new ApiError(429,"A few too many requests. Try again in a minute.");
}
export function apiFailure(error:unknown) {
 if(error instanceof ApiError) return Response.json({error:error.message},{status:error.status,headers:{"Cache-Control":"no-store"}});
 return Response.json({error:"The service couldn't complete this request. Please try again."},{status:503});
}
