import { chromium } from '@playwright/test';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  
  // 1. 로그인
  console.log('Navigating to login page...');
  await page.goto('https://fin.ohjic.com/index/intro/8099');
  
  try {
      const btn = await page.getByText('재정부', { exact: false });
      if (await btn.isVisible()) {
          await btn.click();
      }
  } catch (e) {
      console.log('재정부 button handling error:', e.message);
  }
  
  await page.waitForTimeout(2000);
  
  const idInput = page.locator('input[type="text"]').first();
  const pwInput = page.locator('input[type="password"]').first();
  
  if (await idInput.isVisible()) {
      await idInput.fill('ohjicdemo1');
      await pwInput.fill('demo0657#');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
  }
  
  // 2. 성도 목록 페이지 접속
  const targetUrl = "https://fin.ohjic.com/registration/memList/main/member/";
  console.log(`Visiting ${targetUrl} ...`);
  
  try {
      await page.goto(targetUrl, { timeout: 60000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000); // 데이터 로딩 대기

      await page.screenshot({ path: 'analyze_members.png' });
      console.log('Screenshot saved.');
      
      const text = await page.innerText('body');
      fs.writeFileSync('analyze_members.txt', text);
      console.log('Text content saved.');

      // 테이블 헤더 추출 시도
      const headers = await page.evaluate(() => {
          const ths = Array.from(document.querySelectorAll('th'));
          return ths.map(th => th.innerText.trim()).filter(t => t.length > 0);
      });
      console.log('Detected headers:', headers);

  } catch (e) {
      console.error('Failed to visit members page:', e);
      await page.screenshot({ path: 'analyze_members_error.png' });
  }

  await browser.close();
})();
