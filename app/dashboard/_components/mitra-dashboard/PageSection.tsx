import type { ReactNode } from "react";

interface PageSectionProps {
  children: ReactNode;
  className?: string;
}

export function PageSection({ children, className = "" }: PageSectionProps) {
  return <section className={`grid min-w-0 grid-cols-1 gap-4 ${className}`}>{children}</section>;
}
