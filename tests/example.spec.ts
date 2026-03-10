import { test, expect } from '@playwright/test';

test('메인 페이지 로드 확인', async ({ page }) => {
  await page.goto('/');
  // 제목 확인 (AppLogo 등에 포함된 텍스트)
  await expect(page.locator('body')).toContainText('Ledgerrection');
});

test('사이드바 메뉴 클릭 및 페이지 이동', async ({ page }) => {
  await page.goto('/');
  // 1. 기초코드 메뉴 클릭
  await page.click('text=기초코드');
  await expect(page).toHaveURL(/\/basic-codes/);
  
  // 2. 장부관리 메뉴 클릭
  await page.click('text=장부관리');
  await expect(page).toHaveURL(/\/ledgers/);
});
