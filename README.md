# Church Finance App (교회 재정 관리 시스템 - Ledgerrection)

Ledgerrection은 교회의 성도 정보, 구역 조직, 예산 수립 및 회계 전표 처리를 통합적으로 관리하기 위해 설계된 **SaaS(Software as a Service) 기반의 견고하고 직관적인 재정 관리 시스템**입니다.

## 🤝 AI-Human Collaborative Development

이 프로젝트는 **인간 개발자와 AI 에이전트(Gemini CLI)의 긴밀한 협업**을 통해 빌드되고 있습니다. 단순한 코드 생성을 넘어, 비즈니스 로직 설계부터 UI/UX 일관성 유지, 테스트 자동화까지 모든 과정을 AI와 함께 수행하며, 모든 결정 사항은 `.gemini/` 디렉토리에 정밀하게 기록되어 연속성을 유지합니다.

## 🚀 주요 기능 및 아키텍처

### 🏢 SaaS 멀티 테넌시 및 강력한 보안 (RBAC)
- **4단계 권한 체계**: 플랫폼 본사(Master, 0), 교회 최고관리자(Admin, 1), 재정 실무자(Manager, 2), 일반 사용자(User, 3)로 구성된 계층적 역할 기반 접근 제어.
- **전역 API Guard**: 서버 미들웨어를 통해 권한 미달 사용자의 민감 데이터(재무, 성도 정보) 접근을 원천 차단하는 2중 보안 체계.
- **기술 지원 모드 (Impersonation)**: Master 권한자가 특정 교회의 환경으로 안전하게 진입하여 VOC를 해결하고 데이터를 점검할 수 있는 컨텍스트 스위칭 기능.

### 💰 지능형 회계 및 기수 관리
- **회계 기수 및 장부 마감**: 각 교회별 '현재 회계 연도'를 지정하고, 특정 시점 이전의 전표 수정을 물리적으로 차단하는 **장부 마감(Lock)** 시스템. 누가 언제 마감했는지에 대한 책임 소재(Accountability) 추적.
- **A4 최적화 보고서**: 결산보고서 및 합계잔액시산표를 웹 UI와 1:1로 일치시켜 인쇄(A4)할 수 있는 초정밀 프린트 레이아웃 엔진 탑재.
- **절대값 기반 복식부기**: 모든 금액을 양수로 저장하되, 계정 타입(수입/지출)에 따라 대차를 자동 계산하는 정교한 재무 로직.

### 🛠 플랫폼 관리자 도구 (Master Only)
- **데이터 무결성 강제 보정**: 통장 기초 잔액 0원화, 전년이월금 전표 자동 생성, 누락된 통장 정보 강제 연결 등 복잡한 데이터 오류를 GUI로 일괄 치료하는 도구.
- **전체 교회 데이터 통합 백업**: 플랫폼 내 모든 교회의 전표 및 성도 데이터를 엑셀로 한 번에 추출하여 통합 통계 및 감사 지원.

### 🎨 테넌트 맞춤형 브랜딩
- **공식 이미지 관리**: 교회별 로고 및 직인(도장) 업로드 기능을 통해 각종 보고서 및 영수증 발행 시 자동 적용.
- **시각적 정체성 강화**: 사이드바 및 헤더에 현재 접속 중인 교회명과 회계 기수를 상시 노출하여 관리자에게 소속감과 데이터 출처 명확성 제공.

## ⚙️ 기술 스택 (Tech Stack)

- **Framework**: [Nuxt 3.21.1](https://nuxt.com/) (Vue 3, TypeScript)
- **UI Library**: [Nuxt UI 3.3.7](https://ui.nuxt.com/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: PostgreSQL with [Kysely](https://kysely.dev/) (Type-safe SQL query builder)
- **Auth**: Nuxt Auth Utils (Secure encrypted cookie session)
- **Hydration**: 앱 초기화 시 세션-Pinia Store 자동 동기화 플러그인 자체 구현
- **Testing**: [Playwright](https://playwright.dev/) (13/13 E2E Tests Passing)
- **Reports**: XLSX (Excel generation), CSS Print-Media shading

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
npx nuxi typecheck # TypeScript 정적 타입 검사
```

---
*본 문서는 Ledgerrection 개발 팀(인간 & AI)에 의해 최신 기능 업데이트에 맞춰 상시 관리됩니다.*
