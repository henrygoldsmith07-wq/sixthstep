import { z } from "zod";
export function isDate(value:string):boolean {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const date=new Date(value+"T12:00:00Z");
 return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value;
}
export const dateSchema=z.string().refine(v=>v===""||isDate(v),"Use a real date in YYYY-MM-DD format");
