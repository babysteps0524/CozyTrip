import { defineConfig, presetAttributify, presetWind4, transformerAttributifyJsx } from "unocss";

export default defineConfig({
  presets: [
    presetWind4({
      dark: "media",
    }),

    presetAttributify(),
  ],

  transformers: [transformerAttributifyJsx()],

  theme: {
    breakpoints: {
      xs: "320px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },

    colors: {
      "ct-bg": "#faf9f7",
      "ct-surface": "#ffffff",
      "ct-surface-soft": "#f4f1ec",
      "ct-text": "#1f2933",
      "ct-text-soft": "#52606d",
      "ct-muted": "#7b8794",
      "ct-line": "#e4e0da",

      "ct-primary": "#245b63",
      "ct-primary-dark": "#1d4b52",
      "ct-primary-soft": "#e8f1f1",

      "ct-accent": "#c77b4b",
      "ct-accent-soft": "#f8eee7",

      "ct-dark-bg": "#111718",
      "ct-dark-surface": "#192021",
      "ct-dark-surface-soft": "#222b2c",
      "ct-dark-text": "#edf2f2",
      "ct-dark-text-soft": "#b9c4c5",
      "ct-dark-muted": "#8f9b9c",
      "ct-dark-line": "#344041",
    },

    fontFamily: {
      sans: [
        "Pretendard",
        "Noto Sans KR",
        "Apple SD Gothic Neo",
        "Malgun Gothic",
        "system-ui",
        "sans-serif",
      ].join(", "),

      serif: ["Noto Serif KR", "Batang", "serif"].join(", "),
    },

    boxShadow: {
      soft: "0 8px 30px rgba(31, 41, 51, 0.08)",
      card: "0 4px 18px rgba(31, 41, 51, 0.06)",
    },

    borderRadius: {
      card: "1rem",
    },
  },

  shortcuts: {
    "ct-container": "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",

    "ct-section": "py-12 sm:py-16 lg:py-20",

    "ct-card":
      "overflow-hidden rounded-card border border-ct-line bg-ct-surface shadow-card dark:border-ct-dark-line dark:bg-ct-dark-surface",

    "ct-button":
      "inline-flex items-center justify-center rounded-xl px-4 py-2.5 font-medium transition-transform duration-150 active-scale-95",

    "ct-focus":
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ct-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ct-dark-bg",
  },

  preflights: [
    {
      layer: "base",

      getCSS: () => `
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        html {
          min-width: 320px;
          background: #faf9f7;
          color: #1f2933;
          color-scheme: light;
        }

        body {
          min-width: 320px;
          min-height: 100vh;
          margin: 0;
          background: #faf9f7;
          color: #1f2933;
          font-family:
            Pretendard,
            "Noto Sans KR",
            "Apple SD Gothic Neo",
            "Malgun Gothic",
            system-ui,
            sans-serif;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        img {
          display: block;
          max-width: 100%;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        button,
        a {
          -webkit-tap-highlight-color: transparent;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        @media (prefers-color-scheme: dark) {
          html {
            background: #111718;
            color: #edf2f2;
            color-scheme: dark;
          }

          body {
            background: #111718;
            color: #edf2f2;
          }
        }
      `,
    },
  ],
});
