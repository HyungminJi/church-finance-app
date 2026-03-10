import { test, expect } from '@playwright/test';

test('account code registration with unified modal', async ({ page }) => {
  // 에러 발생 시 alert 처리
  page.on('dialog', async dialog => {
    console.log('Dialog message:', dialog.message());
    await dialog.dismiss();
  });

  // 1. 페이지 접속
  await page.goto('/basic-codes');
  await page.waitForLoadState('networkidle');

  // 페이지 본문의 제목 확인 (상단바와 중복 방지를 위해 h1 중 text-2xl 클래스 확인)
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
  
  // 5. 모달 닫힘 확인 (애니메이션 고려)
  await expect(modalTitle).toBeHidden({ timeout: 15000 });
  
  // 6. 목록에 추가되었는지 확인
  await expect(page.locator('table')).toContainText(testCode);
  
  // 7. '하위항목추가' 동작 확인
  const testRow = page.locator('tr').filter({ hasText: testCode });
  await testRow.getByRole('button', { name: '하위항목추가' }).click();
  
  // 8. 모달 내 상위 계정 정보 자동 설정 확인
  await expect(modalTitle).toBeVisible();
  await expect(page.locator('input[disabled]').last()).toHaveValue(new RegExp(testCode));
  
  // 9. 하위 항목 데이터 입력 및 저장
  const subCode = testCode + '1';
  await page.locator('#account-code').fill(subCode);
  await page.locator('#account-name').fill('테스트 하위 계정');
  await page.locator('#save-button').click();
  
  // 10. 모달 닫힘 및 하위 항목 최종 확인
  await expect(modalTitle).toBeHidden({ timeout: 15000 });
  await expect(page.locator('table')).toContainText(subCode);
});
