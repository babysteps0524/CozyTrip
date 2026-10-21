import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWind4,
  transformerAttributifyJsx,
} from 'unocss';

export default defineConfig({
  presets: [
    presetWind4({ dark: 'media' }),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
  ],
  transformers: [transformerAttributifyJsx()],
  theme: {
    colors: {
      brand: {
        50: 'oklch(0.97 0.025 75)',
        100: 'oklch(0.93 0.045 75)',
        500: 'oklch(0.62 0.105 38)',
        600: 'oklch(0.55 0.12 38)',
        700: 'oklch(0.47 0.105 38)',
        900: 'oklch(0.32 0.055 38)',
      },
      ink: 'oklch(0.27 0.025 55)',
      muted: 'oklch(0.50 0.025 65)',
      surface: 'oklch(0.99 0.008 85)',
      canvas: 'oklch(0.97 0.018 82)',
      line: 'oklch(0.89 0.025 78)',
      accent: 'oklch(0.76 0.12 72)',
      sage: 'oklch(0.70 0.065 135)',
    },
    fontFamily: { sans: 'Pretendard, "Noto Sans KR", system-ui, sans-serif' },
    boxShadow: {
      card: '0 10px 30px oklch(0.27 0.025 55 / 0.07)',
      lift: '0 18px 40px oklch(0.27 0.025 55 / 0.13)',
    },
  },
  shortcuts: {
    'container-wide': 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
    'focus-ring':
      'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-500',
    'btn-primary':
      'inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 active:translate-y-px focus-ring',
    'btn-secondary':
      'inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-brand-500 hover:text-brand-700 dark:bg-slate-900 dark:text-slate-100',
    eyebrow: 'text-xs font-bold uppercase tracking-[.16em] text-brand-600',
    'section-title':
      'text-2xl font-bold tracking-tight text-ink sm:text-3xl dark:text-white',
    'muted-copy': 'text-sm leading-7 text-muted dark:text-slate-300',
  },
});
