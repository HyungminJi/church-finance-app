import { test, expect } from '@playwright/test';

test.describe('사이드바 활성화 상태 테스트', () => {
  test('기초코드 페이지 진입 시 메뉴 활성화 확인', async ({ page }) => {
    // 1. 기초코드 페이지 이동 (네트워크 유휴 상태까지 대기)
    await page.goto('/basic-codes', { waitUntil: 'networkidle', timeout: 60000 });
    
    // 2. 사이드바의 '기초코드' 링크 활성화 스타일 확인 (새로운 브랜드 블루 색상 클래스 적용)
    const activeMenu = page.getByRole('link', { name: '기초코드', exact: true });
    await expect(activeMenu).toBeVisible({ timeout: 15000 });
    
    // 현재 레이아웃에서 활성화 시 text-brand-blue 클래스 사용
    await expect(activeMenu).toHaveClass(/text-brand-blue/);
  });
});
