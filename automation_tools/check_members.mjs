import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Visiting /basic-codes/members ...');
  await page.goto('http://localhost:3000/basic-codes/members');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'check_members.png' });
  console.log('Screenshot saved to check_members.png');
  
  // 탭 활성화 확인
  const activeTab = await page.innerText('nav[aria-label="Tabs"] a.text-blue-600');
  console.log('Active Tab:', activeTab);
  
  // 테이블 데이터 확인
  const firstRowName = await page.innerText('tbody tr:first-child td:nth-child(4)');
  console.log('First member name:', firstRowName);
  
  await browser.close();
})();
