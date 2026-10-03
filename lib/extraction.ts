import { z } from "zod";
import { categories, formats, dateSchema, isDate } from "./domain";
const str=(n:number)=>z.string().max(n);
export const extractedSchema=z.object({
 title:str(180),provider:str(180),description:str(1800),category:z.enum(categories),sector:str(100),subSector:str(150),
 activities:z.array(str(500)).max(8),skills:z.array(str(150)).max(10),eligibility:str(1200),
 minAge:z.number().int().min(0).max(100).nullable(),maxAge:z.number().int().min(0).max(100).nullable(),ageQuote:str(1200),
 years:z.array(str(80)).max(8),yearQuote:str(1200),subjects:z.array(str(100)).max(12),subjectRequirements:str(600),
 geography:str(600),location:str(300),format:z.enum(formats),duration:str(300),cost:str(300),
 deadline:str(300),deadlineDate:dateSchema,deadlineQuote:str(1200),startDate:dateSchema,startQuote:str(1200),
 applicationUrl:str(2000),certificate:str(300),selection:str(600),nextSteps:z.array(str(500)).max(8),unconfirmed:z.array(str(160)).max(25)
});
export type Extracted=z.infer<typeof extractedSchema>;
const months=["january","february","march","april","may","june","july","august","september","october","november","december"];
export function explicitDate(text:string):string {
 const iso=text.match(/\b\d{4}-\d{2}-\d{2}\b/);if(iso&&isDate(iso[0]))return iso[0];
 const natural=text.toLowerCase().replace(/(\d)(st|nd|rd|th)\b/g,"$1").match(/\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s*,?\s*(20\d{2})\b/);
 if(!natural)return "";
 const month=months.findIndex(m=>m.startsWith(natural[2].slice(0,3)))+1;
 const result=natural[3]+"-"+String(month).padStart(2,"0")+"-"+natural[1].padStart(2,"0");
 return isDate(result)?result:"";
}
export function quoteInSource(quote:string,source:string){return !!quote.trim()&&source.replace(/\s+/g," ").toLowerCase().includes(quote.replace(/\s+/g," ").trim().toLowerCase());}
export function confirmedDate(value:string,quote:string,source:string) {return value&&quoteInSource(quote,source)&&explicitDate(quote)===value?value:"";}

export function confirmedAge(quote:string,source:string,minAge:number|null,maxAge:number|null){
 if(!quoteInSource(quote,source)||!/age|aged|years? old|year-olds?|over|under|older|younger|\d\s*[–-]\s*\d/i.test(quote))return false;
 const numbers=quote.match(/\b\d{1,2}\b/g)?.map(Number)||[];
 return (minAge===null||numbers.includes(minAge))&&(maxAge===null||numbers.includes(maxAge));
}
