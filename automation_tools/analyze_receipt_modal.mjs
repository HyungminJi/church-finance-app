import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  const screenshotDir = 'analysis_results/screenshots';
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

  console.log('Navigating to receipts page...');
  await page.goto('https://fin.ohjic.com/ledger/receipts/regi_receipt_form', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // iframe 처리
  let targetFrame = page.frames().find(f => f.name() === 'mainf') || page.mainFrame();

  // '기부금영수증 신청' 또는 '금전신청' 버튼 찾기
  console.log('Looking for apply button...');
  const btnLocators = [
      targetFrame.getByRole('button', { name: /신청/ }),
      targetFrame.getByText(/기부금영수증\s*신청/),
      targetFrame.getByText('금전신청')
  ];

  let clicked = false;
  for (const loc of btnLocators) {
      if (await loc.count() > 0 && await loc.first().isVisible()) {
          console.log(`Clicking button: ${await loc.first().innerText()}`);
          await loc.first().click();
          clicked = true;
          break;
      }
  }

  if (clicked) {
      console.log('Waiting for modal to appear...');
      await page.waitForTimeout(3000); // 팝업 애니메이션 대기
      
      await page.screenshot({ path: path.join(screenshotDir, 'receipt_modal.png'), fullPage: true });
      
      // 모달 내부 텍스트 추출
      // 보통 모달은 메인 프레임의 body 끝에 추가되거나, 부모 프레임에 추가됨.
      const modalText = await page.evaluate(() => {
          // bootstrap 모달이나 jQuery UI 다이얼로그 클래스들 탐색
          const modal = document.querySelector('.modal-content, .ui-dialog, [role="dialog"], #layer_popup');
          return modal ? modal.innerText : document.body.innerText; // 못 찾으면 전체 텍스트
      });
      
      fs.writeFileSync(path.join(dataDir, 'receipt_modal.txt'), modalText);
      console.log('Modal data saved.');
  } else {
      console.log('Apply button not found.');
      await page.screenshot({ path: path.join(screenshotDir, 'receipt_modal_fail.png'), fullPage: true });
  }

  await browser.close();
})();
