import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  const screenshotDir = 'analysis_results/screenshots';
  const dataDir = 'analysis_results/data';

  // 1. 로그인
  console.log('Logging in to reference site...');
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

  // 2. 작정헌금 메뉴 분석
  const targets = [
    { name: 'pledge_status_raw', url: 'https://fin.ohjic.com/dtmn/determination/set_display' },
    { name: 'pledge_statistics_raw', url: 'https://fin.ohjic.com/dtmn/determination/monthly_income_report' }
  ];

  for (const item of targets) {
      console.log(`Analyzing ${item.name}...`);
      try {
          await page.goto(item.url, { waitUntil: 'networkidle', timeout: 30000 });
          await page.waitForTimeout(3000);

          await page.screenshot({ path: path.join(screenshotDir, `${item.name}.png`), fullPage: true });
          const text = await page.innerText('body');
          fs.writeFileSync(path.join(dataDir, `${item.name}.txt`), text);
          
          // 테이블 구조 상세 추출
          const tableData = await page.evaluate(() => {
              const headers = Array.from(document.querySelectorAll('th')).map(th => th.innerText.trim());
              const rows = Array.from(document.querySelectorAll('tbody tr')).slice(0, 5).map(tr => 
                  Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim())
              );
              const buttons = Array.from(document.querySelectorAll('button, .btn, input[type="button"]'))
                  .map(b => b.innerText.trim() || b.value).filter(t => t);
              return { headers, rows, buttons };
          });
          fs.writeFileSync(path.join(dataDir, `${item.name}_structure.json`), JSON.stringify(tableData, null, 2));
          console.log(`Successfully analyzed ${item.name}`);
      } catch (e) {
          console.error(`Error analyzing ${item.name}:`, e.message);
      }
  }

  await browser.close();
})();
