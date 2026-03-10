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
      await page.getByText('재정부', { exact: false }).click();
  } catch (e) {
      console.log('재정부 button not found, checking login fields...');
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

  // 2. '기초코드등록' 메뉴 진입
  console.log('Entering "기초코드등록" menu...');
  // 상단 메뉴바에서 '기초코드등록' 텍스트를 포함하는 링크 클릭
  try {
    // "기초코드등록" 또는 유사한 텍스트를 찾음. (공백이 있을 수 있으므로 정규식 사용)
    const menuLink = page.locator('a', { hasText: /기초\s*코드\s*등록/ }).first();
    if (await menuLink.isVisible()) {
        await menuLink.click();
        await page.waitForTimeout(3000);
    } else {
        console.error('Menu "기초코드등록" not found.');
        await page.screenshot({ path: 'basic_codes_error.png' });
        await browser.close();
        return;
    }
  } catch (e) {
    console.error('Error clicking menu:', e);
    await browser.close();
    return;
  }

  // 3. 메인 화면 캡처 및 서브 메뉴 분석
  await page.screenshot({ path: 'basic_codes_main.png' });
  console.log('Captured main screen of Basic Codes.');

  // 좌측 메뉴 영역(보통 aside, nav, 또는 특정 클래스)에서 링크 추출
  // DOM 구조를 모르므로 화면 좌측(x < 300)에 있는 링크들을 수집하는 휴리스틱 사용
  const subMenuItems = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    // 화면 좌측에 위치하고, 상단 헤더가 아닌(y > 100) 링크들 필터링
    return links
      .filter(a => {
        const rect = a.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.left < 300 && rect.top > 80 && a.innerText.trim().length > 0;
      })
      .map(a => ({
        text: a.innerText.trim(),
        href: a.href
      }));
  });

  // 중복 제거 및 유효한 메뉴 필터링 (너무 짧거나 긴 텍스트 제외)
  const uniqueSubMenus = subMenuItems.filter((item, index, self) =>
    index === self.findIndex((t) => t.text === item.text && t.href === item.href) &&
    item.text.length > 1 && item.text.length < 20 &&
    !item.text.includes('로그아웃') // 로그아웃 제외
  );

  console.log('Identified sub menus:', uniqueSubMenus.map(m => m.text));
  fs.writeFileSync('basic_codes_submenus.json', JSON.stringify(uniqueSubMenus, null, 2));

  // 4. 각 서브 메뉴 순회 및 캡처
  // 최대 10개까지만 순회 (시간 절약)
  for (let i = 0; i < Math.min(uniqueSubMenus.length, 10); i++) {
    const item = uniqueSubMenus[i];
    console.log(`Visiting sub menu [${i+1}/${uniqueSubMenus.length}]: ${item.text}`);
    
    try {
        await page.goto(item.href);
        await page.waitForTimeout(2000); // 로딩 대기
        
        // 파일명 안전하게 변환
        const safeName = item.text.replace(/[^a-z0-9가-힣]/gi, '_');
        await page.screenshot({ path: `basic_codes_sub_${i}_${safeName}.png` });
        
        // 페이지 텍스트 추출 (분석용)
        const pageText = await page.innerText('body');
        fs.writeFileSync(`basic_codes_sub_${i}_${safeName}.txt`, pageText);
    } catch (e) {
        console.error(`Failed to visit ${item.text}:`, e);
    }
  }

  await browser.close();
})();
