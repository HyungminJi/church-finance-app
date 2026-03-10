import { chromium } from '@playwright/test';
import path from 'path';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const screenshotDir = 'analysis_results/screenshots';
  
  // 1. 기부금영수증 페이지 확인
  console.log('Visiting /ledgers/receipts ...');
  await page.goto('http://localhost:3000/ledgers/receipts');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotDir, 'verify_receipts_update.png'), fullPage: true });
  
  // 버튼 존재 여부 로그 출력
  const pdfBtn = await page.isVisible('button:has-text("PDF 저장")');
  const emailBtn = await page.isVisible('button:has-text("이메일 보내기")');
  console.log(`'PDF 저장' 버튼 존재 여부: ${pdfBtn}`);
  console.log(`'이메일 보내기' 버튼 존재 여부: ${emailBtn}`);

  // 2. 자금명세서 페이지 확인
  console.log('Visiting /ledgers/funds ...');
  await page.goto('http://localhost:3000/ledgers/funds');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotDir, 'verify_funds_update.png'), fullPage: true });
  
  await browser.close();
})();
