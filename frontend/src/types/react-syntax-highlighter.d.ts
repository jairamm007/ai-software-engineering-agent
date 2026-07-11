declare module "react-syntax-highlighter" {
  import type { ComponentType, HTMLAttributes, ReactNode } from "react";

  export const Prism: ComponentType<{
    language?: string;
    style?: Record<string, unknown>;
    customStyle?: Record<string, unknown>;
    codeTagProps?: HTMLAttributes<HTMLElement>;
    children?: ReactNode;
  }>;
}

declare module "react-syntax-highlighter/dist/esm/styles/prism" {
  export const oneLight: Record<string, unknown>;
}