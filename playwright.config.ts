import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  /* 안정성을 위해 순차 실행으로 변경 (서버 과부하 방지) */
  fullyParallel: false,
  workers: 1, 
  /* 실패 시 재시도 (일시적 네트워크 오류 대응) */
  retries: 1,
  
  reporter: 'html',
  
  /* 개별 테스트 및 타임아웃 최적화 */
  timeout: 60000, 
  use: {
    baseURL: 'http://localhost:3000',
    actionTimeout: 20000,
    navigationTimeout: 40000,
    trace: 'on-first-retry',
  },

  projects: [
    // 1. 인증 설정 (Setup)
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    // 2. 단일 브라우저(Chromium) 테스트로 속도와 정확도 확보
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
