import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  
  const screenshotDir = 'analysis_results/screenshots';
  const dataDir = 'analysis_results/data';

  // 1. 로그인
  console.log('Navigating to login page...');
  await page.goto('https://fin.ohjic.com/index/intro/8099');
  try {
      const btn = await page.getByText('재정부', { exact: false });
      if (await btn.isVisible()) await btn.click();
  } catch (e) {}
  await page.waitForTimeout(2000);
  const idInput = page.locator('input[type="text"]').first();
  const pwInput = page.locator('input[type="password"]').first();
  if (await idInput.isVisible()) {
      await idInput.fill('ohjicdemo1');
      await pwInput.fill('demo0657#');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
  }
  console.log('Logged in.');

  // 2. 예산작성 페이지 분석 (수입/지출)
  const budgetUrls = [
    { name: "예산작성_수입", url: "https://fin.ohjic.com/budget/income" },
    { name: "예산작성_지출", url: "https://fin.ohjic.com/budget/expense" }
  ];

  for (const item of budgetUrls) {
      console.log(`Analyzing ${item.name}...`);
      try {
          await page.goto(item.url, { waitUntil: 'networkidle' });
          await page.waitForTimeout(2000);

          await page.screenshot({ path: path.join(screenshotDir, `budget_${item.name}.png`) });
          const text = await page.innerText('body');
          fs.writeFileSync(path.join(dataDir, `budget_${item.name}.txt`), text);
          
          // 테이블 헤더 및 주요 버튼 파악
          const info = await page.evaluate(() => {
              const headers = Array.from(document.querySelectorAll('th')).map(th => th.innerText.trim());
              const buttons = Array.from(document.querySelectorAll('button, input[type="button"]')).map(b => b.value || b.innerText.trim());
              return { headers, buttons };
          });
          fs.writeFileSync(path.join(dataDir, `budget_${item.name}_info.json`), JSON.stringify(info, null, 2));
      } catch (e) {
          console.error(`Error analyzing ${item.name}:`, e.message);
      }
  }

  await browser.close();
})();
