export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export const surface = 'rounded-3xl border border-white/10 bg-white/[.045] backdrop-blur-2xl'
