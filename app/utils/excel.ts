import * as XLSX from 'xlsx'

/**
 * 데이터를 엑셀 파일로 내보내는 가장 기본적인 공통 함수
 */
export const downloadAsExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
  if (!data || data.length === 0) {
    if (process.client) alert('다운로드할 데이터가 없습니다.')
    return
  }

  try {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    const dateStr = new Date().toISOString().slice(0, 10)
    const finalFileName = `${fileName}_${dateStr}.xlsx`

    XLSX.writeFile(workbook, finalFileName)
  } catch (error) {
    console.error('Excel download failed:', error)
    if (process.client) alert('엑셀 다운로드 중 오류가 발생했습니다.')
  }
}

/**
 * 장부(Ledger) 형식의 복잡한 데이터를 엑셀로 내보내는 공통 함수
 * @param accounts 계정별 요약 데이터 배열
 * @param fileName 저장될 파일 이름
 * @param title 시트 이름
 */
export const downloadLedgerExcel = (accounts: any[], fileName: string, title: string = '총계정원장') => {
  if (!accounts || accounts.length === 0) {
    if (process.client) alert('다운로드할 데이터가 없습니다.')
    return
  }

  const excelData: any[] = []
  
  accounts.forEach(acnt => {
    const typeLabel = acnt.type === 'INCOME' ? '수입' : (acnt.type === 'EXPENSE' ? '지출' : acnt.type)
    
    // 1. 계정 구분 헤더
    excelData.push({
      '구분': '계정정보',
      '계정코드': acnt.code,
      '계정명/항목': `${acnt.name} (${typeLabel})`,
      '예산/금액': acnt.budget || 0,
      '차변(지출)': '',
      '대변(수입)': '',
      '잔액/비고': ''
    })

    // 2. 이월금
    excelData.push({
      '구분': '이월',
      '계정코드': '',
      '계정명/항목': '[전기이월]',
      '예산/금액': '',
      '차변(지출)': acnt.carryDebit || 0,
      '대변(수입)': acnt.carryCredit || 0,
      '잔액/비고': acnt.budget || 0
    })

    // 3. 당기 발생 (조회 기간)
    excelData.push({
      '구분': '당기',
      '계정코드': '',
      '계정명/항목': '[조회기간 발생]',
      '예산/금액': '',
      '차변(지출)': acnt.monthlyDebit || 0,
      '대변(수입)': acnt.monthlyCredit || 0,
      '잔액/비고': ''
    })

    // 4. 누계 및 결산
    excelData.push({
      '구분': '누계',
      '계정코드': '',
      '계정명/항목': '[합계/누계]',
      '예산/금액': acnt.totalExec || 0,
      '차변(지출)': acnt.totalDebit || 0,
      '대변(수입)': acnt.totalCredit || 0,
      '잔액/비고': acnt.balance || 0
    })
    
    // 행 간격 조절을 위한 빈 행
    excelData.push({})
  })

  downloadAsExcel(excelData, fileName, title)
}

/**
 * 일반 리스트 형태의 데이터를 API에서 받아와 즉시 엑셀로 변환하는 함수
 */
export const fetchAndDownloadExcel = async (
  url: string,
  query: any,
  mapper: (item: any) => any,
  fileName: string
) => {
  try {
    const response: any = await $fetch(url, {
      query: { ...query, page: 1, limit: 10000 }
    })

    if (!response.success || !response.data || response.data.length === 0) {
      if (process.client) alert('다운로드할 데이터가 없습니다.')
      return
    }

    const excelData = response.data.map(mapper)
    downloadAsExcel(excelData, fileName)
  } catch (error) {
    console.error('Fetch and Excel download failed:', error)
    if (process.client) alert('엑셀 다운로드 처리 중 오류가 발생했습니다.')
  }
}
