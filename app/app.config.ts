export default defineAppConfig({
  ui: {
    primary: 'primary',
    gray: 'slate',
    button: {
      slots: {
        base: 'rounded-md'
      },
      defaultVariants: {
        size: 'md',
        color: 'primary',
        variant: 'solid'
      }
    },
    input: {
      slots: {
        base: 'rounded-md'
      }
    },
    select: {
      slots: {
        base: 'rounded-md'
      }
    },
    table: {
      slots: {
        th: 'whitespace-nowrap font-bold'
      }
    },
    card: {
      slots: {
        root: 'rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
      }
    },
    modal: {
      slots: {
        content: 'rounded-2xl'
      }
    }
  }
})
