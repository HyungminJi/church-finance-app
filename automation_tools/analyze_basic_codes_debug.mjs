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
      
      try {
        await page.waitForNavigation({ timeout: 15000 });
      } catch (e) {
        console.log('Navigation timeout, checking current URL...');
      }
  }
  
  console.log('Current URL:', page.url());
  const bodyText = await page.innerText('body');
  fs.writeFileSync('debug_body_text.txt', bodyText);
  await page.screenshot({ path: 'debug_dashboard.png' });
  
  // "기초코드등록" 메뉴 찾기 시도
  // 정확한 텍스트 매칭 대신, 포함 여부 확인
  const menuText = '기초코드등록';
  if (bodyText.includes(menuText)) {
      console.log(`Found "${menuText}" in page text.`);
      // 클릭 시도
      try {
          await page.getByText(menuText, { exact: false }).click();
          console.log(`Clicked "${menuText}".`);
          await page.waitForTimeout(3000);
          await page.screenshot({ path: 'basic_codes_clicked.png' });
          
          // 하위 메뉴 분석 로직 (여기서부터는 클릭 성공 시에만 수행)
          // ... (이전과 동일한 로직, 생략하거나 간단히 구현)
          const subMenuText = await page.innerText('body');
          fs.writeFileSync('basic_codes_page_text.txt', subMenuText);
          
      } catch (e) {
          console.error(`Failed to click "${menuText}":`, e);
      }
  } else {
      console.log(`"${menuText}" not found in page text.`);
      // 다른 메뉴 이름일 수 있으므로 전체 링크 텍스트 출력
      const links = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => a.innerText.trim()).filter(t => t));
      console.log('Available links:', links.slice(0, 20)); // 상위 20개만 출력
  }

  await browser.close();
})();
