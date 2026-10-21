/// <reference types="astro/client" />

import type { AttributifyAttributes } from '@unocss/preset-attributify';

declare global {
  namespace astroHTML.JSX {
    // HTML 속성에 UnoCSS Attributify 타입 병합
    interface HTMLAttributes extends AttributifyAttributes {
      [key: string]: boolean | string | number | undefined;
    }
  }
}

// Bun 테스트 모듈 타입 선언
declare module 'bun:test' {
  export function describe(name: string, fn: () => void): void;
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function expect(actual: unknown): {
    toBe(expected: unknown): void;
    toBeTrue(): void;
    toBeFalse(): void;
    toBeNull(): void;
    toBeUndefined(): void;
    toContain(expected: unknown): void;
    toHaveLength(length: number): void;
    toMatch(regexp: RegExp): void;
  };
}
