export interface ThemeTokens {
  colors: {
    background: string
    foreground: string
    accent: string
    glass: string
    glow: string
  }
  radius: { sm: string; md: string; lg: string; xl: string }
  motion: { fast: number; normal: number; slow: number }
  blur: { sm: string; md: string; lg: string }
}

export const neuralAITheme: ThemeTokens = {
  colors: {
    background: '#030712',
    foreground: '#f8fafc',
    accent: '#7c3aed',
    glass: 'rgba(255,255,255,.07)',
    glow: 'rgba(124,58,237,.48)'
  },
  radius: { sm: '10px', md: '16px', lg: '24px', xl: '32px' },
  motion: { fast: 140, normal: 240, slow: 460 },
  blur: { sm: '8px', md: '18px', lg: '32px' }
}

export const premiumThemes = {
  'Neural AI': neuralAITheme,
  'Luxury Black Gold': {
    ...neuralAITheme,
    colors: { ...neuralAITheme.colors, accent: '#f6c453', glow: 'rgba(246,196,83,.42)' }
  },
  'Aurora Glass': {
    ...neuralAITheme,
    colors: { ...neuralAITheme.colors, accent: '#38bdf8', glow: 'rgba(56,189,248,.42)' }
  }
} satisfies Record<string, ThemeTokens>

export function tokensToCssVariables(tokens: ThemeTokens) {
  return {
    '--os-bg': tokens.colors.background,
    '--os-fg': tokens.colors.foreground,
    '--os-accent': tokens.colors.accent,
    '--os-glass': tokens.colors.glass,
    '--os-glow': tokens.colors.glow,
    '--os-radius-xl': tokens.radius.xl,
    '--os-motion-normal': `${tokens.motion.normal}ms`,
    '--os-blur-lg': tokens.blur.lg
  } as Record<string, string>
}
