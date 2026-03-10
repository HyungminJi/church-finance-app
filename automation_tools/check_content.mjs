import { chromium } from '@playwright/test';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/');
  // 페이지 로딩을 위해 잠시 대기
  await page.waitForTimeout(2000);
  const content = await page.content();
  fs.writeFileSync('page_content.html', content);
  const text = await page.innerText('body');
  fs.writeFileSync('page_text.txt', text);
  console.log('Page content and text saved.');
  await browser.close();
})();
