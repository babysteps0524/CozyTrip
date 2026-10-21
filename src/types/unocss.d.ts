import type { AttributifyAttributes } from '@unocss/preset-attributify';

declare module 'astro' {
  interface AstroBuiltinAttributes extends AttributifyAttributes {
    [key: string]: boolean | string | number | undefined;
  }
}

declare global {
  namespace astroHTML.JSX {
    // HTML 속성에 UnoCSS Attributify 타입 병합
    interface HTMLAttributes extends AttributifyAttributes {
      [key: string]: boolean | string | number | undefined;
    }
  }
}
