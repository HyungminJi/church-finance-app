import { chromium } from '@playwright/test';
import path from 'path';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const screenshotDir = 'analysis_results/screenshots';
  
  console.log('Visiting /budget ...');
  await page.goto('http://localhost:3000/budget');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotDir, 'check_budget_income.png') });
  
  console.log('Visiting /budget/expense ...');
  await page.goto('http://localhost:3000/budget/expense');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotDir, 'check_budget_expense.png') });
  
  await browser.close();
})();
