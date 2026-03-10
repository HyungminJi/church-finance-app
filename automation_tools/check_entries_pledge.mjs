import { chromium } from '@playwright/test';
import path from 'path';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const screenshotDir = 'analysis_results/screenshots';
  
  const urls = [
    { name: 'campaign', url: 'http://localhost:3000/entries/campaign' },
    { name: 'pledge-status', url: 'http://localhost:3000/entries/pledge-status' },
    { name: 'pledge-statistics', url: 'http://localhost:3000/entries/pledge-statistics' },
  ];

  for (const item of urls) {
      console.log(`Checking ${item.url} ...`);
      try {
        await page.goto(item.url);
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(screenshotDir, `check_entries_${item.name}.png`) });
      } catch (e) {
        console.error(`Failed to check ${item.name}:`, e.message);
      }
  }
  
  await browser.close();
})();
