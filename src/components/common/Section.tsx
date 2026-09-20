import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  as?: "section" | "div" | "article";
  borderTop?: boolean;
  borderBottom?: boolean;
  surface?: boolean;
  id?: string;
}

export default function Section({
  children,
  as = "section",
  borderTop = false,
  borderBottom = false,
  surface = false,
  id,
}: SectionProps) {
  const Component = as;

  return (
    <Component
      id={id}
      className={[
        "py-12 sm:py-16 lg:py-20",
        id ? "scroll-mt-24" : "",
        borderTop ? "border-t border-ct-line dark:border-ct-dark-line" : "",
        borderBottom ? "border-b border-ct-line dark:border-ct-dark-line" : "",
        surface ? "bg-ct-surface dark:bg-ct-dark-surface" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Component>
  );
}
