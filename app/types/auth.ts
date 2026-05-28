// 시스템 테넌트 ID (DB에 등록된 본사 ID - MASTER 전용)
export const SYSTEM_CHURCH_ID = '00000000-0000-0000-0000-000000000000';

/**
 * SaaS 권한 체계 정의 (Hierarchy 0 ~ 3)
 * 숫자가 낮을수록 높은 권한을 가집니다.
 */
export enum UserRole {
  MASTER = 0,    // 플랫폼 본사 (모든 테넌트 접근, 시스템 전역 설정, 기술 지원)
  ADMIN = 1,     // 개별 교회(테넌트) 최고관리자 (기본 정보 관리, 사용자 초대/권한)
  MANAGER = 2,   // 개별 교회 재정 실무자 (전표 입력, 예산 수립, 장부 마감 전 수정)
  USER = 3       // 개별 교회 일반 사용자 (조회 전용)
}

/**
 * UI 출력을 위한 권한 메타 정보
 */
export const ROLE_META = {
  [UserRole.MASTER]: { label: '플랫폼 본사', color: 'primary' },
  [UserRole.ADMIN]: { label: '교회 관리자', color: 'success' },
  [UserRole.MANAGER]: { label: '재정 담당자', color: 'warning' },
  [UserRole.USER]: { label: '일반 사용자', color: 'neutral' }
} as const;
