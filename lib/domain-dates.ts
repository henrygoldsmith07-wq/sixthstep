import { z } from "zod";
export function isDate(value:string):boolean {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const date=new Date(value+"T12:00:00Z");
 return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value;
}
export const dateSchema=z.string().refine(v=>v===""||isDate(v),"Use a real date in YYYY-MM-DD format");
// Calendar-day arithmetic on the same noon-UTC basis as daysUntil, so shifting a
// date never crosses a DST boundary or drifts by a day.
export function shiftDate(date:string,days:number){return isDate(date)?new Date(Date.parse(date+"T12:00:00Z")+days*86400000).toISOString().slice(0,10):"";}
