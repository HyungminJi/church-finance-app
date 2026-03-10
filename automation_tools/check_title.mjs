import { chromium } from '@playwright/test';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/');
  const title = await page.title();
  fs.writeFileSync('actual_title.txt', title);
  console.log('Title saved to actual_title.txt:', title);
  await browser.close();
})();
