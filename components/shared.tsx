"use client";
import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";
import { ArrowRight, Download, CircleHelp } from "lucide-react";
import { csvCell } from "@/lib/csv";
export { safePublicHref as safeHref } from "@/lib/public-link";
export function download(name:string,content:string,type="text/plain"){
 const url=URL.createObjectURL(new Blob([content],{type})),link=document.createElement("a");link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function Heading({eyebrow,title,description,action}:{eyebrow:string;title:string;description:string;action?:ReactNode}){
 return <div className="page-heading feature-heading"><div><span className="eyebrow muted">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
export function Notice({children}:{children:ReactNode}){return <div className="notice compact"><CircleHelp size={17}/><span>{children}</span></div>;}
export function Empty({title,children,action,label}:{title:string;children:ReactNode;action?:()=>void;label?:string}){
 return <div className="empty-state roomy"><h3>{title}</h3><p>{children}</p>{action&&<button className="button primary" onClick={action}>{label}<ArrowRight size={16}/></button>}</div>;
}
export function Field({label,children,hint}:{label:string;children:ReactNode;hint?:string}){
 const id=useId(),hintId=id+"-hint";
 const element=children as ReactElement<{id?:string;"aria-describedby"?:string}>;
 const control=isValidElement(children)?cloneElement(element,{id,"aria-describedby":[element.props["aria-describedby"],hint?hintId:undefined].filter(Boolean).join(" ")||undefined}):children;
 return <div className="form-field"><label className="field-label" htmlFor={id}>{label}</label>{control}{hint&&<span id={hintId} className="input-hint">{hint}</span>}</div>;
}
export function ExportButton({name,text,label="Export"}:{name:string;text:string;label?:string}){
 return <button type="button" className="button secondary" onClick={()=>download(name,text)}><Download size={15}/>{label}</button>;
}
export function Lines({title,items}:{title:string;items:string[]}){return <><h3>{title}</h3>{items.length?<ul className="output-list">{items.map((item,i)=><li key={i}>{item}</li>)}</ul>:<p className="fine-print">Not stated</p>}</>;}
// Escaping lives in lib/csv.ts so exports and tests share one guard. The inline copy this
// replaced only inspected the first character, so " =SUM(A1)" reached the spreadsheet live.
export function csv(rows:(string|number)[][]){return rows.map(row=>row.map(value=>csvCell(String(value))).join(",")).join("\r\n");}
