export function safePublicHref(value:string){
 try {
  const url=new URL(value),host=url.hostname.toLowerCase().replace(/\.$/,"");
  if(url.protocol!=="https:"||url.username||url.password||url.port&&url.port!=="443"||!host.includes(".")||host.includes(":")||/^\d+(\.\d+){3}$/.test(host)||/\.(local|internal|localhost)$/.test(host))return "";
  return url.toString();
 }catch{return "";}
}
