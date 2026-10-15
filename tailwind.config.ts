import type { Config } from 'tailwindcss'

const withAlpha = (v: string) => `rgb(var(${v}) / <alpha-value>)`

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 语义层（随浅色/深色模式切换）
        bg: withAlpha('--c-bg'),
        surface: withAlpha('--c-surface'),
        'surface-2': withAlpha('--c-surface-2'),
        line: withAlpha('--c-border'),
        fg: withAlpha('--c-text'),
        muted: withAlpha('--c-muted'),

        // 多巴胺强调色（固定，不随模式变化）
        brand: withAlpha('--c-brand'),
        accent: withAlpha('--c-accent'),
        solar: withAlpha('--c-solar'),
        pop: withAlpha('--c-pop'),
        flash: withAlpha('--c-flash'),
        coral: withAlpha('--c-coral'),
      },
      fontFamily: {
        sans: [
          'Inter',
          'HarmonyOS Sans SC',
          'PingFang SC',
          'Microsoft YaHei',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
      fontSize: {
        // 大胆字阶：桌面 1.333 / 移动 1.25
        'display-sm': ['2.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-md': ['3.25rem', { lineHeight: '1.02', letterSpacing: '-0.035em' }],
        'display-lg': ['4rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
        'display-xl': ['5rem', { lineHeight: '0.98', letterSpacing: '-0.04em' }],
      },
      borderRadius: {
        card: '20px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgb(11 10 18 / 0.04), 0 8px 24px -12px rgb(11 10 18 / 0.12)',
        lift: '0 2px 4px rgb(11 10 18 / 0.06), 0 20px 40px -16px rgb(11 10 18 / 0.22)',
        glow: '0 0 0 1px rgb(var(--c-brand) / 0.25), 0 12px 32px -12px rgb(var(--c-brand) / 0.45)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translate3d(0, 16px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translate3d(0, -18px, 0) scale(0.94)' },
          '60%': { opacity: '1', transform: 'translate3d(0, 3px, 0) scale(1.02)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0) scale(1)' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -14px, 0)' },
        },
        ripple: {
          from: { opacity: '0.5', transform: 'scale(0)' },
          to: { opacity: '0', transform: 'scale(2.4)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 420ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 300ms ease both',
        'toast-in': 'toast-in 320ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'gradient-pan': 'gradient-pan 8s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
        float: 'float 9s ease-in-out infinite',
        ripple: 'ripple 560ms ease-out forwards',
        'pop-in': 'pop-in 220ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
      },
    },
  },
  plugins: [],
}

export default config
