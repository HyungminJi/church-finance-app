import { chromium } from '@playwright/test';
import path from 'path';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const screenshotDir = 'analysis_results/screenshots';
  
  const urls = [
    { name: 'ledgers_funds', url: 'http://localhost:3000/ledgers/funds' },
    { name: 'ledgers_ledger', url: 'http://localhost:3000/ledgers/ledger' },
    { name: 'ledgers_total', url: 'http://localhost:3000/ledgers/total-account' },
    { name: 'ledgers_rank', url: 'http://localhost:3000/ledgers/rank' },
    { name: 'ledgers_statistics', url: 'http://localhost:3000/ledgers/statistics' },
    { name: 'ledgers_receipts', url: 'http://localhost:3000/ledgers/receipts' },
  ];

  for (const item of urls) {
      console.log(`Checking ${item.url} ...`);
      try {
        await page.goto(item.url);
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(screenshotDir, `check_${item.name}.png`), fullPage: true });
      } catch (e) {
        console.error(`Failed to check ${item.name}:`, e.message);
      }
  }
  
  await browser.close();
})();
