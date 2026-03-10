import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  
  console.log('Visiting basic-codes page...');
  try {
    await page.goto('http://localhost:3000/basic-codes', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // DB 데이터 로딩 대기
    
    await page.screenshot({ path: 'analysis_results/screenshots/db_connection_verified.png' });
    
    const rowCount = await page.locator('tbody tr').count();
    console.log('Number of rows in table:', rowCount);
    
    if (rowCount > 0) {
      const firstCode = await page.locator('tbody tr:first-child td:first-child').innerText();
      const firstName = await page.locator('tbody tr:first-child td:nth-child(2)').innerText();
      console.log(`First account from DB: [${firstCode}] ${firstName}`);
    } else {
      console.error('No data found in table! Check if DB connection or API is working.');
    }
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
