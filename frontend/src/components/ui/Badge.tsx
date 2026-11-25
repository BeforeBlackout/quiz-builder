import type { ReactNode } from "react";

import { cx } from "@/utils/cx";

const toneClasses = {
  accent: "bg-accent-soft text-accent",
  neutral: "bg-paper text-muted",
};

type BadgeProps = {
  tone?: keyof typeof toneClasses;
  className?: string;
  children: ReactNode;
};

export function Badge({ tone = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cx(
        "rounded-[5px] px-2.5 py-1 text-[11px] font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
