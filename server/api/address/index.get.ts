export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const confmKey = 'devU01TX0FVVEgyMDI2MDIyNjEzMTkyMTExNzY1OTg='
  const currentPage = query.currentPage || 1
  const countPerPage = query.countPerPage || 10
  const keyword = query.keyword

  if (!keyword) {
    return { results: { common: { errorCode: "E0001", errorMessage: "검색어를 입력해주세요." } } }
  }

  const url = `https://business.juso.go.kr/addrlink/addrLinkApi.do?confmKey=${confmKey}&currentPage=${currentPage}&countPerPage=${countPerPage}&keyword=${encodeURIComponent(keyword as string)}&resultType=json`

  try {
    const response = await $fetch(url, { parseResponse: txt => JSON.parse(txt) })
    return response
  } catch (error) {
    console.error('Juso API Error:', error)
    return { results: { common: { errorCode: "E9999", errorMessage: "주소 검색 API 호출 중 오류가 발생했습니다." } } }
  }
})
