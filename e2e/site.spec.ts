import { test, expect } from "@playwright/test";
test("search, bookmark, change status and reload saved data",async({page})=>{
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("/");await expect(page.getByRole("heading",{name:/Your next step/})).toBeVisible();
 await page.screenshot({path:"../../work/sixthstep-desktop.png",fullPage:true});
 await page.getByRole("button",{name:"Technology",exact:true}).click();
 await expect(page.locator(".opportunity-card")).toHaveCount(2);
 await page.getByRole("button",{name:"Save Try a career in technology",exact:true}).click();
 await page.getByRole("link",{name:/My opportunities/}).click();
 await expect(page.getByRole("button",{name:"Try a career in technology",exact:true})).toBeVisible();
 await page.getByLabel("Application status for Try a career in technology").selectOption("Applied");
 await page.reload();await expect(page.getByLabel("Application status for Try a career in technology")).toHaveValue("Applied");
 expect(errors).toEqual([]);
});
test("details modal works with keyboard and source information",async({page})=>{
 await page.goto("/");await page.getByRole("button",{name:"Inside the world of Leonardo",exact:true}).click();
 const dialog=page.getByRole("dialog");await expect(dialog).toBeVisible();
 await expect(dialog.getByRole("link",{name:"Visit provider"})).toHaveAttribute("href",/leonardo.springpod.com/);
 await page.keyboard.press("Escape");await expect(dialog).not.toBeVisible();
});
test("summary and reflection flows render and export using mocked provider responses",async({page})=>{
 await page.route("**/api/status",r=>r.fulfill({json:{ai:true,search:true}}));
 await page.route("**/api/summarise",r=>r.fulfill({json:{summary:{title:"Engineering experience",overview:"Learn about engineering through a virtual task.",activities:["Complete an engineering task"],skills:["Problem solving"],eligibility:"Not stated",duration:"Not stated",deadline:"Not stated",cost:"Free",steps:["Check the original source"]},sourceUrl:null}}));
 await page.route("**/api/reflect",r=>r.fulfill({json:{reflection:{summary:"I completed a virtual engineering task.",skills:["Problem solving: compared solutions"],cvBullet:"Completed a virtual engineering simulation.",nextSteps:["Explore a placement"]}}}));
 await page.goto("/#summarise");
 await page.getByLabel("Opportunity description").fill("This virtual engineering programme includes practical tasks, career insights and activities for students.");
 await page.getByRole("button",{name:"Summarise this opportunity"}).click();
 await expect(page.getByRole("heading",{name:"Engineering experience",exact:true})).toBeVisible();
 const download=page.waitForEvent("download");await page.getByRole("button",{name:"Export summary"}).click();expect((await download).suggestedFilename()).toBe("sixthstep-summary.txt");
 await page.getByRole("link",{name:"Experience journal"}).click();
 await page.getByLabel("What did you do and learn?").fill("During a virtual engineering simulation I compared two solutions and learned how to explain a design choice.");
 await page.getByRole("button",{name:"Help me reflect"}).click();
 await expect(page.getByText("Completed a virtual engineering simulation.",{exact:true})).toBeVisible();
});
test("mobile navigation, filters and layout remain usable",async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto("/");
 await page.getByRole("button",{name:"Open navigation"}).click();
 await page.getByRole("link",{name:"AI summariser"}).click();
 await expect(page.getByRole("heading",{name:/Make sense of your/})).toBeVisible();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);expect(overflow).toBe(false);
 await page.screenshot({path:"../../work/sixthstep-mobile.png",fullPage:true});
});
test("missing keys show a clear setup message, never simulated AI",async({page})=>{
 await page.goto("/#summarise");
 await page.getByLabel("Opportunity description").fill("This is a public virtual work experience programme with practical tasks and activities for students.");
 await page.getByRole("button",{name:"Summarise this opportunity"}).click();
 await expect(page.getByRole("alert")).toContainText("Groq API key");
 await expect(page.getByRole("button",{name:"Export summary"})).toHaveCount(0);
});
