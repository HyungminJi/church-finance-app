import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // 1. 기본 페이지 접속
  console.log('Visiting /basic-codes ...');
  await page.goto('http://localhost:3000/basic-codes');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'check_basic_codes_index.png' });
  
  // 탭 확인
  const tabs = await page.locator('nav[aria-label="Tabs"] a').allInnerTexts();
  console.log('Tabs found:', tabs);
  
  // 2. 계좌관리 탭 클릭
  console.log('Clicking "계좌/외화 코드등록"...');
  await page.getByText('계좌/외화 코드등록').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'check_basic_codes_banks.png' });
  console.log('Current URL:', page.url());
  
  // 3. 예배코드 탭 클릭
  console.log('Clicking "예배코드관리"...');
  await page.getByText('예배코드관리').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'check_basic_codes_worships.png' });
  
  // 4. 초기이월 탭 클릭
  console.log('Clicking "초기이월금 등록"...');
  await page.getByText('초기이월금 등록').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'check_basic_codes_carry.png' });
  
  await browser.close();
})();
