import * as XLSX from 'xlsx'

/**
 * 데이터를 엑셀 파일로 내보내는 공통 함수
 * @param data 엑셀에 들어갈 데이터 배열 (한글 헤더로 매핑된 상태여야 함)
 * @param fileName 확장자를 제외한 파일명
 * @param sheetName 시트 이름 (기본값: 'Sheet1')
 */
export const downloadAsExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
  if (!data || data.length === 0) {
    alert('다운로드할 데이터가 없습니다.')
    return
  }

  try {
    // 워크북 및 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // 파일명 설정 (파일명_날짜.xlsx)
    const dateStr = new Date().toISOString().slice(0, 10)
    const finalFileName = `${fileName}_${dateStr}.xlsx`

    // 다운로드 실행
    XLSX.writeFile(workbook, finalFileName)
  } catch (error) {
    console.error('Excel download failed:', error)
    alert('엑셀 다운로드 중 오류가 발생했습니다.')
  }
}
