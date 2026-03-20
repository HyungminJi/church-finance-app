import { test, expect } from '@playwright/test';

test.describe('장부(원장) 조회 테스트 (UC-04)', () => {
  test.beforeEach(async ({ page }) => {
    // 장부 조회 화면 진입
    await page.goto('/ledgers/ledger');
  });

  test('장부 화면 렌더링 및 기본 요소 확인', async ({ page }) => {
    // 1. 페이지 로드 대기
    await page.waitForSelector('text=계정과목', { state: 'visible' });
    
    // 2. 계정과목 트리 그룹 렌더링 확인 (수입, 지출)
    const incomeGroup = page.getByText('수입 (INCOME)');
    const expenseGroup = page.getByText('지출 (EXPENSE)');
    await expect(incomeGroup).toBeVisible();
    await expect(expenseGroup).toBeVisible();

    // 3. 전기 이월 행 확인 (텍스트 매칭 유연하게 처리)
    const prevBalanceRow = page.locator('td', { hasText: /전기 이월/ });
    await expect(prevBalanceRow.first()).toBeVisible();

    // 4. 기간 설정 요소 확인 (오늘/이번달 등의 프리셋 버튼들)
    const thisMonthBtn = page.getByRole('button', { name: '이번달' });
    await expect(thisMonthBtn).toBeVisible();

    // 5. 엑셀 다운로드 버튼 렌더링 확인
    const excelBtn = page.getByRole('button', { name: '엑셀 다운로드' });
    await expect(excelBtn).toBeVisible();
  });
});
