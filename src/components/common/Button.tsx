import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  type = "button",
  disabled = false,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      ct-button
      w={fullWidth ? "full" : undefined}
      bg={
        variant === "primary" ? "ct-primary" : "ct-surface dark:ct-dark-surface"
      }
      text={variant === "primary" ? "white" : "ct-text dark:ct-dark-text"}
      border={
        variant === "secondary" ? "~ ct-line dark:ct-dark-line" : undefined
      }
      hover={
        variant === "primary"
          ? "bg-ct-primary-dark"
          : "bg-ct-surface-soft dark:bg-ct-dark-surface-soft"
      }
      un-disabled="opacity-50 cursor-not-allowed"
      {...props}
    >
      {children}
    </button>
  );
}
