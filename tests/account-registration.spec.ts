import { test, expect } from '@playwright/test';

test('account code registration with unified modal', async ({ page }) => {
  // 에러 발생 시 alert 처리
  page.on('dialog', async dialog => {
    console.log('Dialog message:', dialog.message());
    await dialog.dismiss();
  });

  // 1. 페이지 접속 (대기 전략 강화)
  await page.goto('/basic-codes', { waitUntil: 'networkidle', timeout: 60000 });

  // 페이지 본문의 제목 확인
  const pageTitle = page.locator('h1.text-2xl:has-text("기초코드")');
  await expect(pageTitle).toBeVisible({ timeout: 15000 });
  
  // 2. '추가' 버튼 클릭 및 모달 확인
  const addButton = page.getByRole('button', { name: '추가' }).first();
  await addButton.waitFor({ state: 'visible', timeout: 15000 });
  await addButton.click();
  
  const modalTitle = page.locator('h3:has-text("계정과목 등록/수정")');
  await expect(modalTitle).toBeVisible();
  
  // 3. 테스트 데이터 입력 (최상위 항목)
  const testCode = 'T' + Date.now().toString().slice(-6);
  await page.locator('#account-code').fill(testCode);
  await page.locator('#account-name').fill('테스트 계정');
  
  // 4. 저장 버튼 클릭
  await page.locator('#save-button').click();
  
  // 5. [추가됨] 성공 알림 모달 처리 (충분한 타임아웃 부여)
  const alertConfirmButton = page.locator('button:has-text("확인")');
  await alertConfirmButton.waitFor({ state: 'visible', timeout: 20000 });
  await alertConfirmButton.click();
  
  // 6. 모달 닫힘 확인
  await expect(modalTitle).toBeHidden({ timeout: 15000 });
  
  // 7. 목록에 추가되었는지 확인
  await expect(page.locator('table')).toContainText(testCode);
  
  // 8. '하위항목추가' 동작 확인
  const testRow = page.locator('tr').filter({ hasText: testCode });
  // 행이 나타나고 버튼이 생길 때까지 대기
  await testRow.getByRole('button', { name: '하위항목추가' }).waitFor({ state: 'visible', timeout: 15000 });
  await testRow.getByRole('button', { name: '하위항목추가' }).click();
  
  // 9. 모달 내 상위 계정 정보 자동 설정 확인
  await expect(modalTitle).toBeVisible();
  await expect(page.locator('input[disabled]').last()).toHaveValue(new RegExp(testCode));
  
  // 10. 하위 항목 데이터 입력 및 저장
  const subCode = testCode + '1';
  await page.locator('#account-code').fill(subCode);
  await page.locator('#account-name').fill('테스트 하위 계정');
  await page.locator('#save-button').click();
  
  // 11. [추가됨] 성공 알림 모달 처리
  await alertConfirmButton.waitFor({ state: 'visible', timeout: 15000 });
  await alertConfirmButton.click();
  
  // 12. 모달 닫힘 및 하위 항목 최종 확인
  await expect(modalTitle).toBeHidden({ timeout: 15000 });
  await expect(page.locator('table')).toContainText(subCode);
});
