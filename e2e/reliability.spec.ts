import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { appSchema, emptyData, createRecord, enrich, questionSchema, experienceSchema, evidenceBank } from "../lib/domain";
import { linkEvidence } from "../lib/application-preparation";
const at="2026-10-03T12:00:00Z";
const opportunity=enrich({id:"durable",title:"Engineering insight with a deliberately long programme title for mobile review",provider:"Example University",source:"catalogue",checkedAt:"2026-10-03",sector:"Engineering",url:"https://example.ac.uk/insight",deadlineDate:"2026-10-09",deadline:"9 October 2026",startDate:"2026-11-05",openingPeriod:"Autumn 2026"});
const experience=experienceSchema.parse({id:"source",name:"Design exercise",type:"Work experience",careerAreas:["Engineering"],whatDid:"I compared two designs and explained the constraints.",updatedAt:at,skills:[{id:"problem",skill:"Problem solving",whatHappened:"A design exercise",action:"I compared two designs against the constraints.",learning:"Explain the tradeoff."}]});
const record=createRecord(opportunity,at);record.intent="Applying";record.nextAction="Ask my teacher";record.nextActionDate="2026-10-04";record.questions=[questionSchema.parse({id:"first",question:"Describe a difficult problem you solved and explain the personal action you took, the outcome and what you learned.",limitKind:"Words",limit:100}),questionSchema.parse({id:"second",question:"Why are you interested in engineering?",draft:"I enjoy comparing designs."})];
const data=appSchema.parse({...emptyData,profile:{...emptyData.profile,configured:true,subjects:["Physics"],interests:["Engineering"]},records:[record],experiences:[experience]});
async function setup(page:Page,hash="#saved/durable/questions/first",value=data){
 await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,r=>r.abort());await page.clock.setFixedTime(new Date(at));
 await page.addInitScript(snapshot=>{if(!localStorage.getItem("sixthstep-workspace-v2"))localStorage.setItem("sixthstep-workspace-v2",JSON.stringify(snapshot));},value);await page.goto("/"+hash);
}
async function nav(page:Page,name:string){if(await page.getByRole("button",{name:"Open menu",exact:true}).isVisible())await page.getByRole("button",{name:"Open menu",exact:true}).click();await page.locator(".sidebar").getByRole("button",{name:new RegExp("^"+name+"(?: \\d+)?$")}).click();}
test("application and question addresses survive reload and browser back/forward",async({page})=>{
 await setup(page);await expect(page.getByLabel("Select question")).toHaveValue("first");await page.getByLabel("Draft response",{exact:false}).fill("My own first answer.");await page.getByLabel("Select question").selectOption("second");await expect(page).toHaveURL(/#saved\/durable\/questions\/second$/);await page.reload();await expect(page.getByLabel("Select question")).toHaveValue("second");await expect(page.getByLabel("Draft response",{exact:false})).toHaveValue("I enjoy comparing designs.");
 await page.goBack();await expect(page.getByLabel("Select question")).toHaveValue("first");await expect(page.getByLabel("Draft response",{exact:false})).toHaveValue("My own first answer.");await page.goForward();await expect(page.getByLabel("Select question")).toHaveValue("second");
});
test("opportunity, experience and evidence deep links reopen the same source and report missing records",async({page})=>{
 await setup(page,"#finder/opportunities/durable");await expect(page.getByRole("dialog")).toContainText(opportunity.title);await page.reload();await expect(page.getByRole("dialog")).toContainText(opportunity.title);await page.keyboard.press("Escape");await expect(page).toHaveURL(/#finder$/);
 await page.goto("/#reflect/source");await expect(page.getByLabel("Experience name")).toHaveValue(experience.name);await page.reload();await expect(page.getByLabel("What I did",{exact:true})).toHaveValue(experience.whatDid);
 await page.goto("/#evidence/source%3A%3Aproblem");await expect(page.locator(".evidence-card")).toHaveCount(1);await expect(page.locator(".evidence-card")).toBeFocused();await page.reload();await expect(page.locator(".evidence-card")).toContainText(experience.skills[0].action);
 await page.goto("/#saved/missing");await expect(page.getByRole("heading",{name:"This application is not in this browser.",exact:true})).toBeVisible();await page.getByRole("button",{name:"Return to my workspace",exact:true}).click();await expect(page.getByRole("button",{name:"Open workspace",exact:true})).toBeVisible();
});
test("individual and grouped calendar exports retain exact dates and omit approximate periods",async({page})=>{
 await setup(page,"#calendar");const item=page.getByRole("article",{name:"Ask my teacher",exact:true});await item.getByRole("button",{name:"Reminder options",exact:true}).click();const pending=page.waitForEvent("download");await item.getByRole("button",{name:"Export date",exact:true}).click();let file=await pending;let text=await readFile((await file.path())!,"utf8");expect(text).toContain("DTSTART;VALUE=DATE:20261004");expect(text.replace(/\r\n /g,"")).toContain("Student-entered date");expect(text).not.toContain("Autumn 2026");
 await page.getByText("Export to your calendar (.ics)",{exact:true}).click();await page.getByLabel("Deadline",{exact:true}).check();const group=page.waitForEvent("download");await page.getByRole("button",{name:"Export selected groups (1)",exact:true}).click();file=await group;text=await readFile((await file.path())!,"utf8");expect(text).toContain("DTSTART;VALUE=DATE:20261009");expect((text.match(/BEGIN:VEVENT/g)||[]).length).toBe(1);expect(text.replace(/\r\n /g,"")).toContain(opportunity.url);
});
test("another tab's changes are not silently overwritten and current edits can be recovered",async({page,context})=>{
 await setup(page);const other=await context.newPage();await other.goto("/#saved/durable/questions/first");await expect(other.getByLabel("Draft response",{exact:false})).toBeVisible();await page.getByLabel("Draft response",{exact:false}).fill("My first tab's answer.");
 await expect(other.getByRole("alert").filter({hasText:"Another tab changed"})).toBeVisible();await other.getByLabel("Draft response",{exact:false}).fill("My second tab's answer.");await expect(page.getByLabel("Draft response",{exact:false})).toHaveValue("My first tab's answer.");
 await other.getByRole("button",{name:"Keep this tab's version",exact:true}).click();await other.reload();await expect(other.getByLabel("Draft response",{exact:false})).toHaveValue("My second tab's answer.");const before=await other.evaluate(()=>JSON.parse(localStorage.getItem("sixthstep-before-replacement-v2")!));expect(before.records[0].questions[0].draft).toBe("My first tab's answer.");await other.close();
});
test("after one tab erases, a sibling tab shows the banner, reloads stored as empty and cannot restore the deleted data",async({page,context})=>{
 // The cross-tab erase trust claim, exercised end to end. Before the erase
 // marker existed, this tab kept the erased workspace in memory and offered
 // "Keep this tab's version", so a deliberate delete was undone by a button
 // this product rendered. Storage events carry no deletion signal, so the
 // marker is the only cross-tab channel available.
 await setup(page);
 const other=await context.newPage();
 await other.goto("/#saved/durable");
 // The sibling tab really holds live workspace content before the erase.
 await expect(other.getByLabel("Draft response",{exact:false})).toBeVisible();
 expect(await other.evaluate(()=>JSON.parse(localStorage.getItem("sixthstep-workspace-v2")!).records.length)).toBe(1);

 // Erase from the FIRST tab.
 await nav(page,"Profile");
 let confirmMessage="";page.once("dialog",d=>{confirmMessage=d.message();d.accept();});
 await page.getByRole("button",{name:"Delete all SixthStep data",exact:true}).click();
 await expect(confirmMessage).toMatch(/It cannot be undone/);
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem("sixthstep-workspace-v2")===null)).toBe(true);

 // The sibling tab must be told, and the banner must name the cause.
 const banner=other.getByRole("alert").filter({hasText:"erased"});
 await expect(banner).toBeVisible();
 await expect(banner).toContainText("erased in another tab");
 // It must NOT offer to resurrect the erased copy.
 await expect(other.getByRole("button",{name:"Keep this tab's version",exact:true})).toHaveCount(0);

 // "Reload what is stored" (the erased-state variant) must yield an EMPTY
 // workspace — the student-visible proof that the erase took effect.
 await other.getByRole("button",{name:"Reload this tab",exact:true}).click();
 await expect(other.getByRole("alert").filter({hasText:"erased"})).toHaveCount(0);
 await nav(other,"Applications");
 await expect(other.getByRole("heading",{name:"Make room for your next possibility.",exact:true})).toBeVisible();
 await expect(other.getByRole("button",{name:"Open workspace",exact:true})).toHaveCount(0);
 expect(await other.evaluate(()=>localStorage.getItem("sixthstep-workspace-v2")===null)).toBe(true);

 // And the data is genuinely gone: a reload of the sibling tab keeps it empty
 // rather than resurrecting it from an in-memory cache.
 await other.reload();
 await expect(other.getByRole("button",{name:"Open workspace",exact:true})).toHaveCount(0);
 expect(await other.evaluate(()=>localStorage.getItem("sixthstep-workspace-v2")===null)).toBe(true);
 await other.close();
});
test("changed and removed evidence warns visibly while preserving the answer snapshot",async({page})=>{
 const value=structuredClone(data),bank=evidenceBank(value.experiences),q=value.records[0].questions[0];Object.assign(q,linkEvidence(q,bank[0]));q.draft="My own answer keeps the original wording.";value.experiences[0].skills[0].action="I edited the source action.";await setup(page,"#saved/durable/questions/first",value);
 await expect(page.getByRole("alert").filter({hasText:"Source evidence changed"})).toBeVisible();await expect(page.getByLabel("Draft response",{exact:false})).toHaveValue(q.draft);
 await page.evaluate(()=>{const saved=JSON.parse(localStorage.getItem("sixthstep-workspace-v2")!);saved.experiences=[];localStorage.setItem("sixthstep-workspace-v2",JSON.stringify(saved));});await page.reload();await expect(page.getByRole("alert").filter({hasText:"Source evidence was removed"})).toBeVisible();await expect(page.getByLabel("Draft response",{exact:false})).toHaveValue(q.draft);
});
test("copied evidence needs adaptation and empty or over-limit answers cannot be Ready",async({page})=>{
 await setup(page);await page.getByLabel("Response completion").selectOption("Ready");await expect(page.getByRole("alert").filter({hasText:"within its stated limit"})).toBeVisible();await page.locator(".evidence-suggestion summary").first().click();await page.getByRole("button",{name:"Build STAR response",exact:true}).click();await expect(page.getByLabel("Draft response",{exact:false})).toBeFocused();await page.getByLabel("Response completion").selectOption("Ready");await expect(page.getByRole("alert").filter({hasText:"missing evidence prompts"})).toBeVisible();await page.getByLabel("Draft response",{exact:false}).fill("I compared two designs and explained the tradeoff to my group.");await page.getByLabel("Response completion").selectOption("Ready");await expect(page.getByRole("alert").filter({hasText:"Review and adapt"})).toBeVisible();await page.getByLabel("I have reviewed and adapted this evidence",{exact:false}).check();await page.getByLabel("Response completion").selectOption("Ready");await expect(page.getByLabel("Response completion")).toHaveValue("Ready");
});
test("mobile workspaces at 360–430px retain keyboard focus, calm hierarchy and usable controls",async({page})=>{
 await setup(page);for(const width of [360,390,430]){await page.setViewportSize({width,height:844});await expect(page.getByLabel("Draft response",{exact:false})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);await nav(page,"Evidence");await page.getByRole("button",{name:"Use for application",exact:true}).click();await expect(page.getByRole("dialog")).toBeVisible();await page.keyboard.press("Escape");await expect(page.getByRole("button",{name:"Use for application",exact:true})).toBeFocused();await nav(page,"Explore");await page.getByRole("button",{name:/^Filters(?: \(\d+\))?$/}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);await page.getByRole("button",{name:/^Filters(?: \(\d+\))?$/}).click();const cards=page.locator(".opportunity-grid").last().locator(".opportunity-card");await cards.nth(0).getByRole("button",{name:/^Compare /}).click();await cards.nth(1).getByRole("button",{name:/^Compare /}).click();await page.getByRole("button",{name:"Compare opportunities",exact:true}).click();await expect(page.getByRole("dialog").locator(".mobile-comparison")).toBeVisible();await expect(page.getByRole("dialog").locator(".mobile-comparison-item")).toHaveCount(2);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);if(width===360)await page.screenshot({path:"test-results/comparison-final-mobile.png",fullPage:true});await page.keyboard.press("Escape");await nav(page,"Profile");expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);await nav(page,"Calendar");await page.getByRole("button",{name:"Month",exact:true}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);await nav(page,"Home");await expect(page.getByRole("region",{name:"Priority actions"})).toBeVisible();await expect(page.getByRole("heading",{name:"Evidence readiness",exact:true})).not.toBeVisible();await page.getByRole("link",{name:"Skip to content",exact:true}).focus();await page.keyboard.press("Enter");await expect(page.locator("#main-content")).toBeFocused();await expect(page).toHaveURL(/#dashboard$/);await nav(page,"Applications");}
 await page.screenshot({path:"test-results/workspace-final-mobile.png",fullPage:true});
});

test("saved work stays actionable before optional profile setup on mobile",async({page})=>{
 const value=structuredClone(data);value.profile.configured=false;
 await page.setViewportSize({width:390,height:844});await setup(page,"#dashboard",value);
 const priority=page.getByRole("region",{name:"Priority actions"});
 await expect(priority.getByRole("article",{name:"Ask my teacher",exact:true})).toBeVisible();
 await expect(page.getByRole("region",{name:"Quick student setup"})).not.toBeVisible();
 const bounds=await priority.boundingBox();expect(bounds?.y).toBeLessThan(400);
 await page.screenshot({path:"test-results/home-saved-work-mobile.png",fullPage:true});
 await page.getByText("Shape your discovery preferences",{exact:true}).click();
 await expect(page.getByRole("region",{name:"Quick student setup"})).toBeVisible();
});
test("an erase in one tab is authoritative in the other: it names the cause and reloads empty",async({page,context})=>{
  await setup(page);const other=await context.newPage();await other.goto("/#dashboard");await expect(other.getByRole("heading",{name:"Your next step.",exact:true})).toBeVisible();
  // Tab A deletes everything on purpose, which must include confirming the destructive prompt.
  await nav(page,"Profile");page.on("dialog",d=>d.accept());
  await page.getByRole("button",{name:"Delete all SixthStep data",exact:true}).click();
  await expect(page.getByText(/All SixthStep workspace data has been removed/)).toBeVisible();
  // Tab B is still holding the deleted workspace in memory. It must be told the real cause,
  // and it must not be offered the button whose purpose is to restore this tab's version.
  await expect(other.getByRole("alert").filter({hasText:/erased in another tab/i})).toBeVisible();
  await expect(other.getByRole("button",{name:"Keep this tab's version",exact:true})).toHaveCount(0);
  await other.getByRole("button",{name:"Reload this tab",exact:true}).click();
  await expect(other.getByRole("alert").filter({hasText:/erased in another tab/i})).toBeHidden();
  // The deletion is honoured: the workspace is empty and nothing was written back.
  const stored=await other.evaluate(()=>localStorage.getItem("sixthstep-workspace-v2"));
  expect(stored===null||JSON.parse(stored).records.length===0).toBe(true);
  await expect(other.getByRole("button",{name:"Find opportunities",exact:true})).toBeVisible();
  expect(await other.evaluate(()=>localStorage.getItem("sixthstep-journal-v1"))).toBe(null);
  await other.close();
});
