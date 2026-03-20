/**
 * 전역 인쇄 공통 함수
 */
export const printPage = () => {
  if (process.client) {
    window.print()
  }
}
