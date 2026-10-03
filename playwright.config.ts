import { defineConfig } from "@playwright/test";
const port=Number(process.env.SIXTHSTEP_TEST_PORT||3000);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error("Use a valid SIXTHSTEP_TEST_PORT between 1024 and 65535.");
export default defineConfig({
 testDir:"./e2e",fullyParallel:false,workers:1,timeout:90000,expect:{timeout:10000},
 use:{baseURL:"http://localhost:"+port,headless:true,launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH},trace:"retain-on-failure"},
 webServer:{command:"npm run start -- --port "+port,url:"http://localhost:"+port,reuseExistingServer:!process.env.CI,timeout:120000}
});
