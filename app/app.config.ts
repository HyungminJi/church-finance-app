export default defineAppConfig({
  ui: {
    primary: 'blue',
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
