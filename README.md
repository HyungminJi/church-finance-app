# Church Finance App (교회 재정 관리 시스템)

교회의 성도 정보, 구역 조직, 예산 수립 및 회계 전표 처리를 통합적으로 관리하기 위한 웹 애플리케이션입니다.

## 🚀 주요 기능

- **성도 관리**: 출석/제적 성도 구분 관리, 엑셀 대량 등록 및 다운로드, 상세 검색 필터링.
- **구역 관리**: 구역 및 상위 소속(교구 등) 조직 관리, 구역장(리더) 지정, 자연 정렬(Natural Sort) 기반의 목록 출력.
- **기초 코드 관리**: 계정과목 및 직분 등 공통 코드 체계 관리.
- **예산 및 회계**: 수입/지출 예산 수립, 전표 입력 및 장부(Ledgers) 관리, 결산 보고서 생성.

## 🛠 기술 스택

- **Frontend**: [Nuxt 3](https://nuxt.com/) (Vue 3, TypeScript), [Nuxt UI](https://ui.nuxt.com/), TailwindCSS
- **Backend**: Nitro (Nuxt Server Engine), [Kysely](https://kysely.dev/) (SQL Query Builder)
- **Database**: PostgreSQL
- **Testing**: [Playwright](https://playwright.dev/) (E2E Test)
- **Package Manager**: pnpm

## 📁 프로젝트 구조

- `app/`: Vue 컴포넌트, 페이지, 레이아웃 및 클라이언트 사이드 로직.
- `server/`: API 엔드포인트(`api/`) 및 데이터베이스 유틸리티(`utils/`).
- `DB/`: 데이터베이스 테이블 스키마 및 초기 데이터 SQL 파일.
- `.gemini/`: AI 에이전트 협업을 위한 작업 가이드 및 진행 상황 기록.
- `tests/`: 시스템 안정성 검증을 위한 Playwright 테스트 시나리오.

## ⚙️ 시작하기

### 1. 의존성 설치
```bash
pnpm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 데이터베이스 연결 정보를 설정합니다.
```env
DATABASE_URL="postgresql://user:password@localhost:5432/church_finance"
```

### 3. 개발 서버 실행
```bash
pnpm dev
```

## 🤖 AI 에이전트 협업 가이드

본 프로젝트는 AI 에이전트(Gemini CLI)와 긴밀하게 협업하며 개발됩니다.

- **맥락 유지**: 세션 시작 전 반드시 `.gemini/PROGRESS.md`를 읽어 이전 작업 내역을 파악합니다.
- **작업 기록**: 모든 중요한 코드 변경 사항은 `PROGRESS.md`에 업데이트하여 다음 세션으로 전달합니다.
- **UI 규칙**:
    - 모든 클릭 가능한 요소(버튼, 링크 등)에는 `cursor-pointer` 클래스를 필수 적용합니다.
    - 버튼 색상 가이드:
        - **Primary (Blue)**: 등록, 수정, 조회, 저장 등 주요 액션
        - **Success (Green)**: 엑셀 다운로드, 재등록, 성공 상태
        - **Error (Red)**: 삭제, 제적, PDF 다운로드 등 파괴적/중요 액션
        - **Neutral (Gray)**: 취소, 초기화, 닫기 등 보조 액션

## 🧪 테스트 및 검증

코드 변경 후에는 반드시 관련 테스트를 수행하여 안정성을 확보합니다.
```bash
npx playwright test
```
