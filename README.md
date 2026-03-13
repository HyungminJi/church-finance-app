# Church Finance App (교회 재정 관리 시스템 - Ledgerrection)

Ledgerrection은 교회의 성도 정보, 구역 조직, 예산 수립 및 회계 전표 처리를 통합적으로 관리하기 위해 설계된 견고하고 직관적인 웹 애플리케이션입니다.

## 🤝 AI-Human Collaborative Development

이 프로젝트는 **인간 개발자와 AI 에이전트(Gemini CLI)의 긴밀한 협업**을 통해 빌드되고 있습니다. 단순한 코드 생성을 넘어, 비즈니스 로직 설계부터 UI/UX 일관성 유지, 테스트 자동화까지 모든 과정을 AI와 함께 수행합니다.

- **맥락 인지(Context-Aware)**: AI는 `.gemini/PROGRESS.md`와 `GEMINI.md`를 통해 과거의 결정 사항과 현재의 개발 맥락을 완벽히 이해하고 작업을 수행합니다.
- **기술적 정교함**: 모든 코드는 TypeScript 기반의 타입 안정성을 지향하며, 복잡한 SQL 쿼리는 Kysely를 통해 안전하게 처리됩니다.
- **연속성 보장**: 각 개발 세션의 종료 시점에 진행 상황을 상세히 기록하여 다음 세션에서 지식의 단절 없이 개발을 이어갑니다.

## 🚀 주요 기능 및 아키텍처

### 💰 지능형 예산 및 회계 시스템
- **실시간 계층 합산**: 수입/지출 예산 입력 시 상위 계정 및 총계가 즉시 계산되는 고도화된 반응형 로직.
- **Natural Hierarchy Sort**: 계정코드를 숫자의 크기와 계층 구조(Level)를 동시에 고려하여 정렬하는 지능형 알고리즘 적용.
- **보안 및 무결성**: 과거 회계년도 데이터 자동 잠금(ReadOnly) 및 `bcryptjs` 기반의 안전한 권한 관리.

### 👥 성도 및 조직 관리
- **성도 라이프사이클**: 등록, 수정, 제적, 재등록으로 이어지는 성도 데이터의 전체 생애주기 관리.
- **세분화된 권한 체계**: 최고관리자부터 일반 사용자까지 4단계의 역할 기반 접근 제어(RBAC).
- **데이터 대량 처리**: 엑셀 양식을 통한 대량 등록 및 모든 검색 필터가 적용된 엑셀 내보내기 지원.

### 🛠 핵심 기술 아키텍처
- **Promise 기반 전역 모달**: `useUIStore`와 `AppModal`을 연동하여 `await ui.showConfirm(...)` 방식으로 동작하는 직관적인 모달 시스템.
- **Type-safe DB Access**: Kysely와 PostgreSQL을 결합하여 런타임 오류를 최소화한 데이터베이스 레이어.
- **Modern UI Stack**: Nuxt UI v3와 Tailwind CSS v4를 활용한 현대적이고 빠른 사용자 인터페이스.

## 🎨 디자인 시스템 및 UX 가이드

Ledgerrection은 브랜드 정체성과 사용자 편의성을 위해 엄격한 UI 규칙을 준수합니다.

- **브랜드 컬러**: Primary Blue (`#3CAFFF`), Point Green (`#91D700`).
- **상호작용**: 클릭 가능한 모든 요소에 `cursor-pointer` 적용 및 `disabled` 상태의 시각적 명확화.
- **버튼 의미론**:
    - **Primary (Blue)**: 등록, 저장, 조회 등 핵심 액션.
    - **Success (Green)**: 엑셀 다운로드, 재등록 등 긍정적 상태.
    - **Danger (Red)**: 삭제, 제적, PDF 다운로드 등 파괴적/오류 액션.
    - **Neutral (Gray Border)**: 취소, 초기화, 보조 액션.

## ⚙️ 기술 스택 (Tech Stack)

- **Framework**: [Nuxt 3.21.1](https://nuxt.com/) (Vue 3, TypeScript)
- **UI Library**: [Nuxt UI 3.3.7](https://ui.nuxt.com/), [Tailwind CSS v4](https://tailwindcss.com/)
- **State**: Pinia (Modal, Auth, FiscalYear)
- **Database**: PostgreSQL with [Kysely](https://kysely.dev/)
- **Auth**: Nuxt Auth Utils
- **Testing**: [Playwright](https://playwright.dev/) (13/13 Pass)
- **Utilities**: XLSX (Excel), bcryptjs (Encryption)

## 🚀 시작하기

### 1. 의존성 설치 및 환경 설정
```bash
pnpm install
# .env 파일에 DATABASE_URL, NUXT_SESSION_PASSWORD 설정 필요
```

### 2. 실행 및 테스트
```bash
pnpm dev    # 개발 서버 실행
pnpm test   # Playwright E2E 테스트 수행
```

---
*본 문서는 Ledgerrection 개발 팀(인간 & AI)에 의해 지속적으로 업데이트됩니다.*
