import { chromium } from '@playwright/test';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true }); // Headless mode for server environment
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 1. 접속
  console.log('Navigating to https://fin.ohjic.com/index/intro/8099 ...');
  await page.goto('https://fin.ohjic.com/index/intro/8099');
  
  // 2. '재정부' 버튼 클릭
  // 버튼 텍스트나 셀렉터를 찾아 클릭합니다. 
  // 보통 텍스트로 찾거나, 특정 클래스명을 추측하여 접근합니다.
  console.log('Clicking "재정부" button...');
  try {
      await page.getByText('재정부', { exact: false }).click();
  } catch (e) {
      console.log('Text click failed, trying specific selector if available or taking screenshot to debug.');
      // Fallback or specific handling if needed
  }

  // 3. 로그인 화면 대기 및 캡처
  console.log('Waiting for login form...');
  await page.waitForTimeout(2000); // 애니메이션 대기
  await page.screenshot({ path: 'reference_login.png' });
  
  // 4. 로그인 수행
  console.log('Logging in...');
  // 추측되는 ID/PW 입력 필드 셀렉터 (일반적인 name="userId", type="password" 등 시도)
  // 실제 사이트 구조에 따라 다를 수 있으므로, 구체적인 셀렉터가 필요할 수 있습니다.
  // 여기서는 일반적인 input 태그 순서나 placeholder 등을 활용해 봅니다.
  
  // ID 입력 (보통 첫 번째 텍스트 인풋)
  const idInput = page.locator('input[type="text"]').first();
  // PW 입력 (보통 첫 번째 패스워드 인풋)
  const pwInput = page.locator('input[type="password"]').first();
  
  if (await idInput.isVisible() && await pwInput.isVisible()) {
      await idInput.fill('ohjicdemo1');
      await pwInput.fill('demo0657#');
      
      // 로그인 버튼 클릭 (Submit 타입이나 로그인 텍스트)
      await page.keyboard.press('Enter'); // 엔터키로 시도
      // 또는 await page.getByText('로그인').click();
  } else {
      console.error('Login fields not found!');
  }

  // 5. 로그인 후 대시보드 대기
  console.log('Waiting for dashboard...');
  try {
    await page.waitForNavigation({ timeout: 10000 });
  } catch (e) {
    console.log('Navigation timeout or already loaded.');
  }
  await page.waitForTimeout(5000); // 데이터 로딩 대기

  // 6. 대시보드 캡처
  await page.screenshot({ path: 'reference_dashboard.png' });
  console.log('Dashboard screenshot saved.');

  // 7. 메뉴 구조 추출
  console.log('Extracting menu items...');
  // 네비게이션 메뉴의 텍스트들을 추출합니다.
  // nav 태그나 ul/li 구조를 예상합니다.
  const menuItems = await page.evaluate(() => {
      // 일반적인 메뉴 구조 시도
      const items = [];
      document.querySelectorAll('nav a, ul li a, .menu a, .nav a').forEach(el => {
          if (el.innerText.trim()) {
              items.push(el.innerText.trim());
          }
      });
      return [...new Set(items)]; // 중복 제거
  });
  
  fs.writeFileSync('reference_menu.txt', menuItems.join('\n'));
  console.log('Menu items saved to reference_menu.txt');

  await browser.close();
})();
