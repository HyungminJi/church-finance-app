import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  const dataDir = 'analysis_results/data';

  console.log('Logging in...');
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

  const targets = [
    { id: 'funds', url: 'https://fin.ohjic.com/ledger/financestatement/main' },
    { id: 'ledger', url: 'https://fin.ohjic.com/ledger/ledgerMain/main' },
    { id: 'total', url: 'https://fin.ohjic.com/ledger/totalAcnt/preMain' },
    { id: 'rank', url: 'https://fin.ohjic.com/ledger/donationRank/main' },
    { id: 'stats', url: 'https://fin.ohjic.com/ledger/donation_stats/main' },
    { id: 'receipt', url: 'https://fin.ohjic.com/ledger/receipts/regi_receipt_form' }
  ];

  for (const item of targets) {
      console.log(`Analyzing ${item.id}...`);
      try {
          await page.goto(item.url, { waitUntil: 'networkidle', timeout: 30000 });
          await page.waitForTimeout(3000);

          // iframe 찾기
          const frames = page.frames();
          let targetFrame = frames.find(f => f.name() === 'mainf' || f.url().includes(item.url.split('/').pop()));
          
          if (!targetFrame) {
             targetFrame = page.mainFrame(); // iframe이 없으면 메인 프레임
          }

          const text = await targetFrame.innerText('body');
          fs.writeFileSync(path.join(dataDir, `deep_${item.id}.txt`), text);
          
          // 버튼 및 주요 요소 추출
          const elements = await targetFrame.evaluate(() => {
              const buttons = Array.from(document.querySelectorAll('button, .btn, input[type="button"], a.btn')).map(b => b.innerText.trim() || b.value).filter(t => t);
              const headers = Array.from(document.querySelectorAll('th')).map(th => th.innerText.trim());
              return { buttons, headers };
          });
          
          fs.writeFileSync(path.join(dataDir, `deep_${item.id}_elements.json`), JSON.stringify(elements, null, 2));

      } catch (e) {
          console.error(`Error analyzing ${item.id}:`, e.message);
      }
  }

  await browser.close();
})();
