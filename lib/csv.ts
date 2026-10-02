export function csvCell(value:string):string {
 const safe=/^[\s]*[=+@\-]/.test(value)?"'"+value:value;
 return '"'+safe.replace(/"/g,'""')+'"';
}
