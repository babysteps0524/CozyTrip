/// <reference types="astro/client" />
/// <reference path="./types/unocss.d.ts" />

import type { AttributifyAttributes } from '@unocss/preset-attributify';

// Astro 컴포넌트에 UnoCSS Attributify 타입 병합
declare module 'astro' {
  interface AstroBuiltinAttributes extends AttributifyAttributes {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
}
