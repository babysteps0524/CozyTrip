import type { AttributifyAttributes } from '@unocss/preset-attributify';

declare global {
  namespace astroHTML.JSX {
    interface HTMLAttributes extends AttributifyAttributes {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    }
  }
}

export {};
