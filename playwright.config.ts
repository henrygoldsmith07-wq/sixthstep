import { defineConfig } from "@playwright/test";
export default defineConfig({
 testDir:"./e2e",fullyParallel:false,workers:1,timeout:90000,expect:{timeout:10000},
 use:{baseURL:"http://localhost:3000",headless:true,launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH},trace:"retain-on-failure"},
 webServer:{command:"npm run start",url:"http://localhost:3000",reuseExistingServer:!process.env.CI,timeout:120000}
});
