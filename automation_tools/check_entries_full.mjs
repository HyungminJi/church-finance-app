import { chromium } from '@playwright/test';
import path from 'path';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const screenshotDir = 'analysis_results/screenshots';
  
  const urls = [
    { name: 'excel-upload', url: 'http://localhost:3000/entries/excel-upload' },
    { name: 'mobile-collection', url: 'http://localhost:3000/entries/mobile-collection' },
    { name: 'omission-check', url: 'http://localhost:3000/entries/omission-check' },
    { name: 'reservation', url: 'http://localhost:3000/entries/reservation' },
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
