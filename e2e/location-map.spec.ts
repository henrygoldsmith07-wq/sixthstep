import { test, expect, type Page } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import { appSchema, createRecord, defaultProfile, enrich } from "../lib/domain";

const bristol=enrich({id:"bristol-visit",title:"Bristol subject taster",provider:"Example University",sector:"Explore careers",category:"Summer school",format:"In person",source:"catalogue",sourceKind:"Programme",location:"Bristol",checkedAt:"2026-10-03",years:["Year 12"],applicationState:"Open"});
const online=enrich({...bristol,id:"online-visit",title:"Online lab club",format:"Virtual",location:"Online"});
const vague=enrich({...bristol,id:"vague-visit",title:"School-based club",location:"Your school or college"});

async function setup(page:Page){
  await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,r=>r.abort());
  await page.clock.setFixedTime(new Date("2026-10-03T12:00:00Z"));
  const data=appSchema.parse({version:2,profile:{...defaultProfile,configured:true,age:"17",subjects:["Maths"],interests:["Engineering"],location:"Bristol"},records:[createRecord(bristol),createRecord(online),createRecord(vague)],experiences:[]});
  await page.addInitScript(value=>{if(!localStorage.getItem("sixthstep-workspace-v2"))localStorage.setItem("sixthstep-workspace-v2",JSON.stringify(value));},data);
}

test("the map plots a marker only for the town the provider names",async({page})=>{
  await setup(page);await page.goto("/#finder");
  await page.getByRole("button",{name:"Map",exact:true}).click();
  const pin=page.getByRole("button",{name:/^Bristol: \d+ opportunit/});
  await expect(pin).toHaveCount(1);
  await expect(pin).toHaveAttribute("aria-pressed","false");
  await pin.click();
  await expect(pin).toHaveAttribute("aria-pressed","true");
  await expect(page.getByRole("heading",{name:"Bristol",exact:true})).toBeVisible();
  await expect(page.getByText(/schematic/i)).toBeVisible();
  await scan(page);
});

test("the map lists what it cannot place instead of hiding it",async({page})=>{
  await setup(page);await page.goto("/#finder");
  await page.getByRole("button",{name:"Map",exact:true}).click();
  const unplaced=page.locator(".map-gaps");
  await expect(unplaced).toContainText(/online — no place to plot/);
  await expect(unplaced).toContainText(/without a place we can name/);
  await expect(unplaced).toContainText(/cannot be plotted without guessing/i);
  await scan(page);
});

test("a location search reports online, unplaced and elsewhere counts",async({page})=>{
  await setup(page);await page.goto("/#finder");
  await page.getByRole("button",{name:"Filters",exact:true}).click();
  await page.getByLabel("Preferred location",{exact:false}).fill("Bristol");
  const coverage=page.locator(".location-coverage");
  await expect(coverage).toContainText(/in or near Bristol/);
  await expect(coverage).toContainText(/online/);
  await expect(coverage).toContainText(/named elsewhere/);
  await expect(coverage).toContainText(/without a place I can name/);
  const toggle=page.getByLabel(/Also include the \d+ I cannot place/);
  await expect(toggle).not.toBeChecked();
  await toggle.check();
  await expect(page.locator(".opportunity-card")).not.toHaveCount(0);
  await scan(page);
});

async function scan(page:Page){const result=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa"]).analyze();expect(result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))).toEqual([]);}