// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.
/**
 * BrandButton - Button variants using brand styles
 * From BRANDING.json
 */

import { ComponentChildren } from "preact";

interface ButtonProps {
  children: ComponentChildren;
  variant?: "primary" | "secondary" | "ghost";
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function BrandButton({
  children,
  variant = "primary",
  href,
  onClick,
  className = ""
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-heading font-bold transition-all duration-fast";

  const variants = {
    primary: "bg-gradient-logo text-background-dark px-6 py-3 rounded-xl hover:scale-105 hover:shadow-glow",
    secondary: "border-2 border-primary text-primary px-6 py-3 rounded-xl hover:bg-primary hover:text-background-dark",
    ghost: "bg-primary/10 text-primary-300 px-6 py-3 rounded-xl hover:bg-primary/20"
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  const content = (
    <span>{children}</span>
  );

  if (href) {
    return <a href={href} class={classes}>{content}</a>;
  }

  return (
    <button onClick={onClick} class={classes}>
      {content}
    </button>
  );
}
