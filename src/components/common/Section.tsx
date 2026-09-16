import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  as?: "section" | "div" | "article";
  borderTop?: boolean;
  borderBottom?: boolean;
  surface?: boolean;
}

export default function Section({
  children,
  as = "section",
  borderTop = false,
  borderBottom = false,
  surface = false,
}: SectionProps) {
  const Component = as;

  return (
    <Component
      py="12 sm:16 lg:20"
      border-t={borderTop ? "ct-line dark:ct-dark-line" : undefined}
      border-b={borderBottom ? "ct-line dark:ct-dark-line" : undefined}
      bg={surface ? "ct-surface dark:ct-dark-surface" : "transparent"}
    >
      {children}
    </Component>
  );
}
