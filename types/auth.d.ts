declare module '#auth-utils' {
  interface User {
    id: string
    church_id: string
    login_id: string
    name: string
    role: number
    church_role_name: string | null
    sys_role_name: string
    impersonating_church_name?: string // Master 권한의 테넌트 스위칭 표시용
  }

  interface UserSession {
    user: User
    loggedInAt: Date
  }
}

export {}
