import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  
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
  
  // 2. 전표입력 페이지 접속하여 하위 메뉴 파악
  console.log('Visiting entries page...');
  // 전표입력의 메인 URL (헌금전표입력)
  await page.goto('https://fin.ohjic.com/bill/donation/listview/income', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 상단 탭이나 사이드바에서 메뉴 추출
  // 구조상 상단 탭(ul.nav-tabs 또는 div.tab-menu)에 있을 가능성이 높음
  const menuItems = await page.evaluate(() => {
      // 탭 메뉴 셀렉터 추정 (common modal frame 아래 tab_head 등)
      const tabs = Array.from(document.querySelectorAll('#tab_head li, .nav-tabs li, .tab_menu li a'));
      const links = tabs.map(t => ({
          text: t.innerText.trim(),
          href: t.querySelector('a')?.href || ''
      })).filter(t => t.text);
      
      // 혹은 드롭다운 메뉴에서 추출 (mtDropDown)
      // 자바스크립트 변수 defaultMenu 등을 볼 수 있으면 좋음
      
      return links;
  });

  console.log('Detected menu items:', menuItems);
  fs.writeFileSync(path.join(dataDir, 'entries_submenus.json'), JSON.stringify(menuItems, null, 2));

  // 만약 위 방식이 실패하면, 페이지 텍스트에서 '전표입력' 관련 키워드 주변을 탐색
  const bodyText = await page.innerText('body');
  fs.writeFileSync(path.join(dataDir, 'entries_page_full.txt'), bodyText);

  await browser.close();
})();
