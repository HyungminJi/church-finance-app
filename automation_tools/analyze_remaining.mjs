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

  // 2. 분석 대상 URL 목록
  const targets = [
    // 전표입력
    { category: 'entries', name: '헌금전표입력', url: 'https://fin.ohjic.com/bill/donation/listview/income' },
    { category: 'entries', name: '일반전표입력', url: 'https://fin.ohjic.com/bill/bill/listview/income' },
    
    // 장부관리
    { category: 'ledgers', name: '재정보고서', url: 'https://fin.ohjic.com/ledger/weekAcnt/preMain/' },
    { category: 'ledgers', name: '헌금자리스트', url: 'https://fin.ohjic.com/ledger/donation/main' },
    
    // 결산/보고서
    { category: 'reports', name: '항목별명세서', url: 'https://fin.ohjic.com/report/finance/preMain' },
    { category: 'reports', name: '합계잔액시산표', url: 'https://fin.ohjic.com/report/trialBalance/preMain' }
  ];

  for (const item of targets) {
      console.log(`Analyzing [${item.category}] ${item.name}...`);
      try {
          await page.goto(item.url, { waitUntil: 'networkidle', timeout: 30000 });
          await page.waitForTimeout(2000);

          // 스크린샷 저장
          await page.screenshot({ path: path.join(screenshotDir, `${item.category}_${item.name}.png`) });
          
          // 텍스트 저장
          const text = await page.innerText('body');
          fs.writeFileSync(path.join(dataDir, `${item.category}_${item.name}.txt`), text);
          
          console.log(`Saved data for ${item.name}`);
      } catch (e) {
          console.error(`Error analyzing ${item.name}:`, e.message);
      }
  }

  await browser.close();
})();
