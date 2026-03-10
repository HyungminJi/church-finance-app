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
      await page.waitForNavigation({ timeout: 15000 }).catch(() => {});
  }
  
  console.log('Logged in.');
  await page.waitForTimeout(3000);

  // 2. 하위 메뉴 URL 직접 방문 및 분석
  const subMenus = [
    { name: "계정과목등록", url: "https://fin.ohjic.com/registration/acntTitle/listview/income" },
    { name: "계좌_외화_코드등록", url: "https://fin.ohjic.com/registration/bankAccount/main" },
    { name: "예배코드관리", url: "https://fin.ohjic.com/registration/worship" },
    { name: "성도_거래처_목록", url: "https://fin.ohjic.com/registration/memList/main/member/" },
    { name: "초기이월금_등록", url: "https://fin.ohjic.com/registration/carry/main" }
  ];

  for (const menu of subMenus) {
      console.log(`Visiting ${menu.name} at ${menu.url} ...`);
      try {
          await page.goto(menu.url);
          // 페이지 로드 대기 (네트워크 유휴 상태 또는 특정 요소)
          try {
            await page.waitForLoadState('networkidle', { timeout: 5000 });
          } catch(e) {}
          await page.waitForTimeout(2000);

          await page.screenshot({ path: `basic_codes_${menu.name}.png` });
          
          // 텍스트 추출
          const text = await page.innerText('body');
          fs.writeFileSync(`basic_codes_${menu.name}.txt`, text);
          console.log(`Saved screenshot and text for ${menu.name}`);
      } catch (e) {
          console.error(`Failed to visit ${menu.name}:`, e);
      }
  }

  await browser.close();
})();
