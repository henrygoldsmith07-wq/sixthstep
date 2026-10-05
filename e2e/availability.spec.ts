import { test, expect } from "@playwright/test";
import { appSchema, createRecord, defaultProfile, enrich } from "../lib/domain";

const undated=enrich({id:"no-state",title:"Provider has not said it is open",provider:"Example Trust",sector:"Explore careers",category:"Career exploration",format:"Virtual",source:"catalogue",sourceKind:"Programme",location:"Online",checkedAt:"2026-10-03",applicationState:"Unknown"});
const known=enrich({...undated,id:"known-open",title:"Applications confirmed open",applicationState:"Open"});

test("a card says so when the provider has not stated whether it is open",async({page})=>{
  await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,r=>r.abort());
  await page.clock.setFixedTime(new Date("2026-10-03T12:00:00Z"));
  const data=appSchema.parse({version:2,profile:{...defaultProfile,configured:true,age:"17",subjects:["Maths"],interests:["Engineering"]},records:[createRecord(undated),createRecord(known)],experiences:[]});
  await page.addInitScript(value=>{if(!localStorage.getItem("sixthstep-workspace-v2"))localStorage.setItem("sixthstep-workspace-v2",JSON.stringify(value));},data);
  await page.goto("/#finder");
  // Best fit ranks across the whole catalogue, so narrow to these two records first.
  await page.getByLabel("Search opportunities").fill("Example Trust");

  const heading=page.getByRole("heading",{name:"Provider has not said it is open",exact:true});
  await expect(heading).toHaveCount(1);
  // Silence here would read as "nothing to worry about", which is exactly the wrong impression.
  await expect(page.locator(".opportunity-card").filter({has:heading})).toContainText("the provider has not said whether it is open");
  await expect(page.locator(".opportunity-card").filter({has:heading})).toContainText("check with them");

  const knownHeading=page.getByRole("heading",{name:"Applications confirmed open",exact:true});
  await expect(knownHeading).toHaveCount(1);
  await expect(page.locator(".opportunity-card").filter({has:knownHeading})).not.toContainText("check with them");
});