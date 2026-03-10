export const formatPhoneNumber = (val: string) => {
  if (!val) return ''
  const num = val.replace(/[^0-9]/g, '')
  if (num.length <= 3) return num
  if (num.length <= 7) return `${num.slice(0, 3)}-${num.slice(3)}`
  return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7, 11)}`
}

export const getRoleInfo = (role: number | null) => {
  switch (role) {
    case 1: return { label: '최고관리자', color: 'blue' }
    case 2: return { label: '관리자', color: 'green' }
    case 3: return { label: '재정담당', color: 'yellow' }
    default: return { label: '사용자', color: 'gray' }
  }
}
