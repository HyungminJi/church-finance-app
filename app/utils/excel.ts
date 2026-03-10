import * as XLSX from 'xlsx'

/**
 * API 호출부터 엑셀 다운로드까지 수행하는 통합 공통 함수
 * @param url API 엔드포인트
 * @param query 검색 필터 조건
 * @param mapper 데이터를 엑셀 헤더 형식으로 변환하는 함수
 * @param fileName 저장할 파일명 (날짜 제외)
 */
export const fetchAndDownloadExcel = async (
  url: string,
  query: any,
  mapper: (item: any) => any,
  fileName: string
) => {
  try {
    // 1. 데이터 조회 (페이징 없이 전체 조회)
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

    // 2. 데이터 변환 (Mapper 적용)
    const excelData = response.data.map(mapper)

    // 3. 엑셀 워크북 생성 및 다운로드
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

    const dateStr = new Date().toISOString().slice(0, 10)
    const finalFileName = `${fileName}_${dateStr}.xlsx`

    XLSX.writeFile(workbook, finalFileName)
  } catch (error) {
    console.error('Fetch and Excel download failed:', error)
    alert('엑셀 다운로드 처리 중 오류가 발생했습니다.')
  }
}
