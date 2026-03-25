import { test, expect } from '@playwright/test';

test.describe('총계정원장 페이지 (Total Account Ledger)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ledgers/total-account');
    // 페이지 로드 대기
    await page.waitForSelector('button:has-text("조회")');
  });

  test('페이지 제목 및 기본 요소 렌더링 확인', async ({ page }) => {
    await expect(page.locator('button:has-text("조회")')).toBeVisible();
    await expect(page.locator('button:has-text("오늘")')).toBeVisible();
    await expect(page.locator('button:has-text("이번달")')).toBeVisible();
  });

  test('데이터 테이블 헤더 확인', async ({ page }) => {
    const headers = ['계정코드', '계정명', '일자', '예산금액', '집행', '집행비율', '차변', '대변', '예산잔액'];
    for (const header of headers) {
      // 정확한 텍스트 매칭을 위해 필터 사용
      await expect(page.locator('th').filter({ hasText: new RegExp(`^${header}$`) })).toBeVisible();
    }
  });

  test('필터 동작 및 조회 버튼 확인', async ({ page }) => {
    const incomeButton = page.locator('button:has-text("수입")').first();
    
    // 클릭 전 상태 확인 (기본 bg-white)
    await expect(incomeButton).toHaveClass(/bg-white/);
    
    // 클릭 실행
    await incomeButton.click();
    
    // 클릭 후 잠시 대기하여 상태 반영 보장 (webkit 대응)
    await page.waitForTimeout(500);

    // 조회 버튼 클릭
    await page.click('button:has-text("조회")');
    
    // 데이터 테이블 응답 대기 (조회된 데이터가 있거나 없거나 둘 중 하나는 보여야 함)
    const tableBody = page.locator('tbody');
    await expect(tableBody).toBeVisible();
  });
});
