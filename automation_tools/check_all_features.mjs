import { chromium } from '@playwright/test';
import path from 'path';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const screenshotDir = 'analysis_results/screenshots';
  
  const urls = [
    { name: 'entries_index', url: 'http://localhost:3000/entries' },
    { name: 'entries_general', url: 'http://localhost:3000/entries/general' },
    { name: 'ledgers_index', url: 'http://localhost:3000/ledgers' },
    { name: 'ledgers_donors', url: 'http://localhost:3000/ledgers/donors' },
    { name: 'reports_index', url: 'http://localhost:3000/reports' },
    { name: 'reports_trial', url: 'http://localhost:3000/reports/trial-balance' },
  ];

  for (const item of urls) {
      console.log(`Checking ${item.url} ...`);
      try {
        await page.goto(item.url);
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(screenshotDir, `check_${item.name}.png`) });
      } catch (e) {
        console.error(`Failed to check ${item.name}:`, e.message);
      }
  }
  
  await browser.close();
})();
