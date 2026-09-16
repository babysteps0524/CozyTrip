import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  as?: "div" | "section" | "article" | "main";
}

export default function Container({ children, as = "div" }: ContainerProps) {
  const Component = as;

  return (
    <Component w="full" max-w="7xl" mx="auto" px="4 sm:6 lg:8">
      {children}
    </Component>
  );
}
