export default defineAppConfig({
  ui: {
    primary: 'primary', // main.css에서 정의한 커스텀 primary 팔레트 사용
    gray: 'slate',
    button: {
      rounded: 'rounded-md',
      default: {
        size: 'md',
        color: 'primary',
        variant: 'solid'
      }
    },
    input: {
      rounded: 'rounded-md',
    },
    select: {
      rounded: 'rounded-md',
    },
    table: {
      th: {
        base: 'whitespace-nowrap',
      },
    },
    card: {
      rounded: 'rounded-lg',
      background: 'bg-white dark:bg-slate-900',
    }
  }
})
