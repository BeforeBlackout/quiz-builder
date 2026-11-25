import type { ReactNode } from "react";

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="text-[11px] font-medium text-muted">{children}</span>;
}
