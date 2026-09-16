import type { AttributifyAttributes } from "@unocss/preset-attributify";

declare module "react" {
  interface HTMLAttributes<T> extends AttributifyAttributes {
    [key: string]: unknown;
  }

  interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
    [key: string]: unknown;
  }
}

export {};
