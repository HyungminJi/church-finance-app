import * as XLSX from 'xlsx'

/**
 * 데이터를 엑셀 파일로 내보내는 공통 함수 (이미 가공된 데이터용)
 */
export const downloadAsExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
  if (!data || data.length === 0) {
    alert('다운로드할 데이터가 없습니다.')
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
    alert('엑셀 다운로드 중 오류가 발생했습니다.')
  }
}

/**
 * API 호출부터 엑셀 다운로드까지 수행하는 통합 공통 함수 (서버 조회용)
 */
export const fetchAndDownloadExcel = async (
  url: string,
  query: any,
  mapper: (item: any) => any,
  fileName: string
) => {
  try {
    const response: any = await $fetch(url, {
      query: {
        ...query,
        page: 1,
        limit: 10000 
      }
    })

    if (!response.success || !response.data || response.data.length === 0) {
      alert('다운로드할 데이터가 없습니다.')
      return
    }

    const excelData = response.data.map(mapper)
    downloadAsExcel(excelData, fileName)
  } catch (error) {
    console.error('Fetch and Excel download failed:', error)
    alert('엑셀 다운로드 처리 중 오류가 발생했습니다.')
  }
}
