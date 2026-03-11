export const formatPhoneNumber = (val: string | null | undefined) => {
  if (!val) return '-'
  const num = val.replace(/[^0-9]/g, '')
  
  // 서울 지역번호(02) 처리
  if (num.startsWith('02')) {
    if (num.length === 9) { // 02-123-4567
      return `${num.slice(0, 2)}-${num.slice(2, 5)}-${num.slice(5)}`
    }
    if (num.length === 10) { // 02-1234-5678
      return `${num.slice(0, 2)}-${num.slice(2, 6)}-${num.slice(6)}`
    }
  }

  // 일반적인 3자리 지역번호/식별번호 처리
  if (num.length === 10) { // 031-123-4567
    return `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`
  }
  if (num.length === 11) { // 010-1234-5678
    return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7)}`
  }

  // 기타 케이스 (단축 번호 등)
  if (num.length <= 3) return num
  if (num.length <= 7) return `${num.slice(0, 3)}-${num.slice(3)}`
  
  return num || '-'
}

export const formatDate = (val: string | Date | null | undefined) => {
  if (!val) return '-'
  const date = new Date(val)
  if (isNaN(date.getTime())) return '-'
  return date.toISOString().split('T')[0]
}

/**
 * 일반적인 값의 존재 여부를 확인하여 없으면 하이픈(-)을 반환하는 함수
 */
export const displayValue = (val: any) => {
  if (val === null || val === undefined || val === '') return '-'
  return val
}

/**
 * 숫자를 천 단위 콤마 형식으로 포맷팅 (예: 1,000,000)
 */
export const formatNumber = (val: number | string | null | undefined) => {
  if (val === null || val === undefined || val === '') return '0'
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num)) return '0'
  return new Intl.NumberFormat().format(num)
}

export const getRoleInfo = (role: number | null) => {
  switch (role) {
    case 1: return { label: '최고관리자', color: 'blue' }
    case 2: return { label: '관리자', color: 'green' }
    case 3: return { label: '재정담당', color: 'yellow' }
    default: return { label: '사용자', color: 'gray' }
  }
}
