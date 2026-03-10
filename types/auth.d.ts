declare module '#auth-utils' {
  interface User {
    id: string
    login_id: string
    name: string
    role: number
    church_role_name: string | null
    sys_role_name: string
  }

  interface UserSession {
    user: User
    loggedInAt: Date
  }
}

export {}
