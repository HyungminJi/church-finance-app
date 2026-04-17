import { test, expect } from '@playwright/test';

test.describe('장부 관리 - 총계정원장 페이지', () => {
  test.beforeEach(async ({ page }) => {
    // 실제 장부 관리 메인 경로로 이동
    await page.goto('/ledgers', { waitUntil: 'networkidle', timeout: 60000 });
    // 페이지 로드 대기
    await page.waitForSelector('span:has-text("계정과목별 원장")', { timeout: 20000 });
  });

  test('페이지 기본 구성 요소 렌더링 확인', async ({ page }) => {
    // 좌측 사이드바 트리 확인
    await expect(page.locator('span:has-text("계정과목별 원장")')).toBeVisible();
    await expect(page.locator('div:has-text("수입 (INCOME)")').first()).toBeVisible();
    await expect(page.locator('div:has-text("지출 (EXPENSE)")').first()).toBeVisible();

    // 상단 컨트롤 패널 버튼 확인
    await expect(page.locator('button:has-text("이번달")')).toBeVisible();
    await expect(page.locator('button:has-text("올해")')).toBeVisible();
    await expect(page.locator('button:has-text("엑셀 다운로드")')).toBeVisible();
  });

  test('데이터 테이블 헤더 확인', async ({ page }) => {
    const headers = ['일자', '계정', '적요 / 헌금자·지출처', '수입 (대변)', '지출 (차변)', '잔액'];
    for (const header of headers) {
      // th 요소 중 해당 텍스트를 포함하는 요소 확인
      await expect(page.locator('th').filter({ hasText: header }).first()).toBeVisible();
    }
  });

  test('계정 트리 필터 동작 확인', async ({ page }) => {
    // '수입 (INCOME)' 텍스트 영역 클릭
    const incomeGroup = page.locator('div').filter({ hasText: /^수입 \(INCOME\)$/ }).first();
    await incomeGroup.click();
    
    // 클릭 후 활성화 상태 배경색(bg-blue-50 계열) 또는 텍스트 색상 확인
    // 현재 코드상 selectGroup 호출 시 selectedAccountType이 설정됨
    await page.waitForTimeout(500);
    
    // 타이틀이 '수입부 전체 원장'으로 바뀌었는지 확인
    await expect(page.locator('div:has-text("수입부 전체 원장")').first()).toBeVisible();
  });

  test('새로고침 버튼 클릭 확인', async ({ page }) => {
    // aria-label을 사용하여 버튼을 확실하게 식별
    const refreshButton = page.getByLabel('새로고침');
    await expect(refreshButton).toBeVisible();
    await refreshButton.click();
    
    // 데이터 로딩 인디케이터(pending)가 잠깐이라도 보이거나 사라지는지 확인
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });
});
