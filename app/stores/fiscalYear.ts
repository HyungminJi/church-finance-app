
import { ref } from 'vue'

export const useFiscalYearStore = defineStore('fiscalYear', () => {
  const selectedYear = ref(new Date().getFullYear())

  function setFiscalYear(year: number) {
    selectedYear.value = year
  }

  return {
    selectedYear,
    setFiscalYear
  }
})
