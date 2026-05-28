import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/auth/login');
  await page.waitForTimeout(3000);
  
  const errorOverlay = page.locator('vite-error-overlay');
  if (await errorOverlay.count() > 0) {
    const errorText = await errorOverlay.evaluate(el => el.shadowRoot ? el.shadowRoot.innerHTML : el.innerHTML);
    console.log('OVERLAY ERROR:', errorText.substring(0, 1000));
  } else {
    console.log('No overlay found.');
  }
  await browser.close();
})();
