import { relatedAreas, opportunityContent } from "./careers";
import { availability, todayISO, type RichOpportunity } from "./domain";
export const pathways=[
 {area:"Engineering",possibilities:["Mechanical engineering","Electrical engineering","Aerospace engineering","Civil engineering","Computer engineering","Degree apprenticeships"],subjects:["Maths","Physics","Design and Technology","Computer Science"],guide:"https://www.ucas.com/explore/subjects/engineering-and-technology"},
 {area:"Medicine",possibilities:["Medicine","Dentistry","Biomedical science","Pharmacy","Allied health professions","Healthcare research","Health volunteering"],subjects:["Biology","Chemistry","Psychology"],guide:"https://www.healthcareers.nhs.uk/FindYourCareer/intro"},
 {area:"Technology",possibilities:["Computer science","Software engineering","Cybersecurity","Data science","Digital degree apprenticeships"],subjects:["Computer Science","Maths"],guide:"https://www.ucas.com/explore/subjects/engineering-and-technology"},
 {area:"Science & research",possibilities:["Physics","Chemistry","Biological sciences","Materials science","Research","Engineering"],subjects:["Maths","Physics","Chemistry","Biology"],guide:"https://www.ucas.com/explore/subjects/engineering-and-technology"}
];
export function pathwayOpportunities(area:string,items:RichOpportunity[],today=todayISO()){
 return items.filter(i=>availability(i,today)!=="Closed"&&(i.sector===area||i.careerAreas.includes(area)||relatedAreas(opportunityContent(i)).some(a=>a.area===area)));
}
