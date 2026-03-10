import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // 1. 로그인 페이지 접속
  await page.goto('/login', { waitUntil: 'networkidle' });

  // 2. 요소 로드 대기
  const idInput = page.locator('input[placeholder="아이디를 입력하세요"]');
  await idInput.waitFor({ state: 'visible', timeout: 30000 });

  // 3. 관리자 계정 입력 (이미 생성된 계정 사용)
  await idInput.fill('admin');
  await page.fill('input[placeholder="비밀번호를 입력하세요"]', 'admin123!');
  
  // 4. 로그인 버튼 클릭
  await page.click('button:has-text("로그인 하기")');
  
  // 5. 로그인 상태 확인 (사이드바 메뉴 중 하나인 '기초 코드 관리' 링크가 보이는지 확인)
  // window.location.href 새로고침에 대응하기 위해 충분한 시간 대기
  try {
    const navLink = page.locator('a:has-text("기초코드")');
    await navLink.waitFor({ state: 'visible', timeout: 45000 });
    
    // URL 확인
    await expect(page).toHaveURL('/');
  } catch (e) {
    // 실패 시 현재 URL과 상태 출력 (디버깅용)
    console.log('Current URL after login attempt:', page.url());
    throw e;
  }

  // 6. 인증 상태(쿠키/스토리지) 저장
  await page.context().storageState({ path: authFile });
});
