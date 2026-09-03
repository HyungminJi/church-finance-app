# Church Finance App (교회 재정 관리 시스템 - Ledgerrection)

**Ledgerrection**은 성도 관리, 구역 조직, 예산 수립, 회계 전표 처리 및 결산/기부금 영수증 발급까지 교회의 모든 행정 및 재정 업무를 완벽히 디지털화한 **SaaS(Software as a Service) 기반의 올인원 스마트 교회 재정 관리 플랫폼**입니다.

---

## 🤝 AI-Human Collaborative Development

이 프로젝트는 **인간 엔지니어와 AI 에이전트(DeepMind Antigravity / Gemini CLI)의 긴밀한 페어 프로그래밍 협업**을 통해 고도화되고 있습니다. 
단순 코드 생성을 넘어 아키텍처 설계, 보안/RBAC 검증, E2E 테스트 자동화, UI/UX 디자인 표준 준수까지 일관된 컨텍스트(`.gemini/PROGRESS.md`)를 바탕으로 안정적인 품질을 유지합니다.

---

## 🚀 핵심 기능 및 시스템 아키텍처

### 1. 🏢 SaaS 멀티 테넌시 & 4-Tier RBAC 보안 체계
- **4단계 권한 체계 (Level 0 ~ 3)**:
  - **Level 0 (Master)**: 플랫폼 본사 최고관리자 (전체 교회 관제 및 기술지원)
  - **Level 1 (Admin)**: 교회 대표 관리자 (교회 설정, 사용자 권한 부여, 장부 마감)
  - **Level 2 (Manager)**: 재무 실무자 (전표 입력, 원장 관리, 예산 및 기부금 영수증)
  - **Level 3 (User)**: 일반 성도 (본인 헌금 내역 및 증명서 조회)
- **전역 미들웨어 API Guard**: 권한 미달 사용자의 민감 데이터(재무 전표, 성도 개인정보) 접근을 서버 레벨에서 원천 차단.
- **성도-Master 권한 격리**: 본사(Master) 계정과 일반 교회 성도 프로필을 구조적으로 분리하여 테넌트 오염 원천 방지.

### 2. 🛡️ 플랫폼 백오피스 (Back-Office) 인프라
- **독립 백오피스 라우팅 (`/back-office`)**: 다크 네이비 테마 기반의 전용 레이아웃과 미들웨어(`master.ts`)로 일반 서비스 환경과 완전 격리.
- **테넌트 통합 관제 & 임퍼소네이션 (접속 지원)**:
  - 전국 등록 교회의 상태(활성/비활성/정지) 관리 및 원클릭 **[접속]**을 통한 즉각적인 기술지원 모드 전환.
  - 전표 데이터 유무에 따른 안전한 테넌트 영구 삭제 보호 장치 탑재.
- **플랫폼 진단 및 보정 도구 (Tools)**:
  - 기초 잔액 0원화, 전기이월금 전표 강제 생성, 누락 통장 매핑 등 데이터 대차가 깨진 교회를 위한 비상 치료 스크립트 GUI 제공.

### 3. 📊 지능형 3-Tier 맞춤형 대시보드 (Chart.js)
- **권한별 맞춤형 위젯**:
  - **Master**: 전국 교회 가입 추이 시계열 차트 및 SaaS 성장 지표 시각화.
  - **Manager**: 최근 6개월 현금 흐름 추이(Zero-filling 정규화), 계정별 지출 구성비(도넛 차트), 자산 비중(활성 통장 기준), 예산 집행률 실시간 분석.
  - **User**: 본인 연간/월별 헌금 통계 및 개인 맞춤형 환영 배너.

### 4. 💰 지능형 회계 관리 및 자동 마감/이월 엔진
- **회계 마감 자동 이월 프로세스 (Single Transaction)**:
  - 장부 마감 시 마감 기준일까지의 통장별 잔액을 자동 계산하여, 차기 회계 연도 시작일(1/1)에 `전년이월금 (90-04)` 수입 전표 자동 생성.
  - 마감 해제 시 시스템 생성 전표만 정밀하게 일괄 롤백(삭제)하는 안전장치 및 재마감 시 멱등성 보장.
- **장부 마감 Lock & 책임 추적**: 마감일 이전의 전표 생성/수정/삭제를 물리적으로 차단하고 마감자(`closed_by`) 이력 기록.
- **전표 및 장부 관리**:
  - 활성(is_active) 통장 기반의 안전한 전표 등록 및 미사용 통장 과거 내역 분리 조회 지원.
  - 헌금 엑셀 일괄 업로드 및 헌금자 매핑 무결성 보장.

### 5. 📑 기부금 영수증 & A4 최적화 인쇄 엔진
- **실시간 직인(도장) 이미지 합성**: 환경설정에서 업로드한 교회 직인 이미지를 투명 배경 처리하여 영수증 및 보고서 대표자 영역에 자동 정렬/출력.
- **초정밀 인쇄 레이아웃**: 결산보고서, 합계잔액시산표, 기부금 영수증을 웹 브라우저 및 A4 인쇄/PDF 규격에 1:1로 최적화.

### 6. 👥 성도 및 행정 통합 관리
- **도로명주소 검색 API 연동**: 공통 주소 검색 모달(`AddressSearchModal`)을 통한 행정구역 주소 표준화 및 임의 입력 방지.
- **성도/구역/기관 통합 관리**: 교인 등록, 구역(Cell Group) 편성, 외부 기관 관리 및 시스템 로그인 권한 동적 부여.
- **작정헌금 캠페인 통계**: 캠페인별 목표액 대비 달성률 및 월별 납입 현황 실시간 집계.

### 7. 🎨 테넌트 맞춤형 브랜딩 & 테마
- **시각적 정체성(Visual Identity)**: 교회별 포인트 컬러(Theme Color) 동적 적용, 로고 바인딩, 헤더 실시간 정보 캡슐(소속 교회명 및 회계 기수 상시 노출).

---

## ⚙️ 기술 스택 (Tech Stack)

| 구분 | 기술 / 라이브러리 | 설명 |
| :--- | :--- | :--- |
| **Frontend & SSR** | **Nuxt 3** (Vue 3, TypeScript) | 풀스택 SSR/SSG 프레임워크 |
| **UI & Styling** | **Nuxt UI v3**, **Tailwind CSS v4** | 모던 디자인 시스템 및 반응형 UI |
| **Data Visualization** | **Chart.js**, **vue-chartjs** | 반응형 인터랙티브 차트 엔진 |
| **Database & ORM** | **PostgreSQL**, **Kysely** | 타입 안전(Type-safe) SQL 쿼리 빌더 |
| **Auth & Security** | **Nuxt Auth Utils**, **bcryptjs** | 암호화 쿠키 세션 및 비밀번호 해싱 |
| **State Management** | **Pinia** + `auth-sync` 플러그인 | 새로고침 시 세션 자동 복원(Hydration) |
| **Testing** | **Playwright** | E2E(종단간) 시나리오 자동화 테스트 |
| **Export & Tools** | **XLSX** (SheetJS) | 전표/성도 데이터 대량 엑셀 추출 및 업로드 |
| **CI/CD** | **GitHub Actions** | `main` 브랜치 자동 빌드 및 배포 파이프라인 |

---

## 🚀 시작하기 (Getting Started)

### 1. 의존성 설치 및 환경 변수 설정
```bash
# 의존성 설치
pnpm install

# .env 파일 설정
DATABASE_URL="postgresql://user:password@localhost:5432/church_finance"
NUXT_SESSION_PASSWORD="your-32-characters-minimum-secure-key"
NUXT_PUBLIC_ROAD_ADDRESS_KEY="your-road-address-api-key"
```

### 2. 개발 및 빌드
```bash
# 개발 서버 실행
pnpm dev

# TypeScript 정적 타입 검사
npx nuxi typecheck

# Playwright E2E 테스트 실행
pnpm test

# 프로덕션 빌드
pnpm build
```

---

## 📁 디렉토리 구조 (Directory Structure)

```text
church-finance-app/
├── app/
│   ├── components/       # 재사용 가능한 UI 컴포넌트 (모달, 차트, 인쇄 서식 등)
│   ├── layouts/          # 기본(default) 및 백오피스(back-office) 레이아웃
│   ├── middleware/       # 라우트 가드 (auth.ts, master.ts 등)
│   ├── pages/            # Nuxt 파일 기반 라우팅
│   │   ├── back-office/  # 플랫폼 관리자(Master) 전용 화면 (교회 관리, 진단 도구 등)
│   │   ├── basic-codes/  # 기초코드 (성도/헌금자 관리 등)
│   │   ├── dashboard/    # 3-Tier 맞춤형 대시보드
│   │   ├── entries/      # 헌금/지출 전표 입력 및 작정 관리
│   │   ├── ledgers/      # 회계 장부 (원장 조회, 영수증, 결산보고서 등)
│   │   └── settings/     # 교회 정보, 장부 마감, 백업 환경설정
│   ├── plugins/          # 클라이언트 플러그인 (auth-sync 등)
│   ├── server/           # Nitro 서버 엔진 (API 라우트, DB 연결, 트랜잭션)
│   ├── stores/           # Pinia 전역 상태 관리
│   └── types/            # TypeScript 타입 및 인터페이스 정의
└── tests/                # Playwright E2E 테스트 스위트
```

---

*본 문서는 Ledgerrection 팀(인간 & AI)에 의해 지속적으로 최신화됩니다.*
