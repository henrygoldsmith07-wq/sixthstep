export const views = ["dashboard", "finder", "summarise", "saved", "reflect", "evidence", "settings", "calendar"] as const;
export type View = typeof views[number];
export type WorkspaceRoute = {view:View; record?:string; question?:string; experience?:string; evidence?:string; opportunity?:string};

export function readRoute(hash:string):WorkspaceRoute {
  try {
    const parts=hash.replace(/^#/, "").split("/").map(decodeURIComponent);
    const view=parts[0] as View;
    if(!views.includes(view))return {view:"dashboard"};
    if(parts.some(p=>p.length>370)||parts.length>4)return {view};
    if(parts[1]==="opportunities"&&parts[2]&&parts.length===3)return {view,opportunity:parts[2]};
    if(view==="saved"&&parts[1])return {view,record:parts[1],...(parts[2]==="questions"&&parts[3]?{question:parts[3]}:{})};
    if(view==="reflect"&&parts[1])return {view,experience:parts[1]};
    if(view==="evidence"&&parts[1])return {view,evidence:parts[1]};
    return {view};
  }catch{return {view:"dashboard"};}
}

export function routeHash(route:WorkspaceRoute):string {
  const encode=encodeURIComponent;
  if(route.opportunity)return "#"+route.view+"/opportunities/"+encode(route.opportunity);
  if(route.view==="saved"&&route.record)return "#saved/"+encode(route.record)+(route.question?"/questions/"+encode(route.question):"");
  if(route.view==="reflect"&&route.experience)return "#reflect/"+encode(route.experience);
  if(route.view==="evidence"&&route.evidence)return "#evidence/"+encode(route.evidence);
  return "#"+route.view;
}
