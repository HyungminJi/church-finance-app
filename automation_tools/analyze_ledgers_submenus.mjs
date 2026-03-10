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

  // 2. 장부관리 하위 메뉴 분석
  const targets = [
    { name: 'ledgers_funds', url: 'https://fin.ohjic.com/ledger/financestatement/main' },
    { name: 'ledgers_ledger', url: 'https://fin.ohjic.com/ledger/ledgerMain/main' },
    { name: 'ledgers_total', url: 'https://fin.ohjic.com/ledger/totalAcnt/preMain' },
    { name: 'ledgers_rank', url: 'https://fin.ohjic.com/ledger/donationRank/main' },
    { name: 'ledgers_stats', url: 'https://fin.ohjic.com/ledger/donation_stats/main' },
    { name: 'ledgers_receipt', url: 'https://fin.ohjic.com/ledger/receipts/regi_receipt_form' }
  ];

  for (const item of targets) {
      console.log(`Analyzing ${item.name}...`);
      try {
          await page.goto(item.url, { waitUntil: 'networkidle', timeout: 30000 });
          await page.waitForTimeout(3000);

          await page.screenshot({ path: path.join(screenshotDir, `${item.name}.png`), fullPage: true });
          const text = await page.innerText('body');
          fs.writeFileSync(path.join(dataDir, `${item.name}.txt`), text);
          
          const tableData = await page.evaluate(() => {
              const headers = Array.from(document.querySelectorAll('th')).map(th => th.innerText.trim().replace(/\n/g, ' '));
              return { headers };
          });
          fs.writeFileSync(path.join(dataDir, `${item.name}_headers.json`), JSON.stringify(tableData, null, 2));
      } catch (e) {
          console.error(`Error analyzing ${item.name}:`, e.message);
      }
  }

  await browser.close();
})();
