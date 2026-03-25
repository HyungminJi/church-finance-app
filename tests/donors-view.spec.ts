import { test, expect } from '@playwright/test';

test.describe('헌금자 리스트 페이지 (Donors List)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ledgers/donors');
    // 페이지 로드 및 API 응답 대기
    await page.waitForSelector('table');
  });

  test('화면 기본 구성 요소 확인', async ({ page }) => {
    // 필터 영역 버튼 확인
    await expect(page.getByRole('button', { name: '오늘' })).toBeVisible();
    await expect(page.getByRole('button', { name: '이번달' })).toBeVisible();
    
    // 요약 카드 확인 (데이터 로딩 대기 고려)
    await expect(page.getByText('총 헌금 건수')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('기간 합계 금액')).toBeVisible({ timeout: 10000 });
    
    // 인쇄/엑셀 버튼 확인
    await expect(page.getByRole('button', { name: '인쇄' })).toBeVisible();
    await expect(page.getByRole('button', { name: '엑셀' })).toBeVisible();
  });

  test('검색어 입력 필터링 테스트', async ({ page }) => {
    const searchInput = page.getByPlaceholder('성도명 또는 적요 검색');
    await expect(searchInput).toBeVisible();
    
    // 임의의 검색어 입력 (조회 API 호출 확인 용도)
    await searchInput.fill('테스트');
    await page.keyboard.press('Enter');
    
    // 로딩 인디케이터가 나타났다 사라지는지 확인하거나 테이블 상태 확인
    await expect(page.locator('table')).toBeVisible();
  });

  test('테이블 헤더 정합성 확인', async ({ page }) => {
    const expectedHeaders = ['일자', '성도명', '직분', '헌금종류 (계정)', '금액', '적요/비고'];
    for (const header of expectedHeaders) {
      await expect(page.locator('th', { hasText: header })).toBeVisible();
    }
  });
});
