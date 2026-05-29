import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/auth/login');
  
  await page.fill('input[placeholder="아이디를 입력하세요"]', 'admin');
  await page.fill('input[placeholder="비밀번호를 입력하세요"]', 'password');
  await page.click('button:has-text("로그인")');
  
  console.log('Waiting for navigation...');
  await page.waitForNavigation();
  
  console.log('Current URL:', page.url());
  const content = await page.content();
  
  if (content.includes('500')) {
    console.log('Page has a 500 error!');
    const errorText = await page.locator('.message').textContent().catch(() => 'no error text');
    console.log('Error text:', errorText);
  } else {
    console.log('No 500 error found in HTML.');
    const menus = await page.locator('aside nav a').allTextContents();
    console.log('Sidebar menus:', menus);
  }

  await browser.close();
})();
