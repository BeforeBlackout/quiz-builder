import type { ComponentProps } from "react";

import { cx } from "@/utils/cx";

type TextInputProps = ComponentProps<"input"> & { compact?: boolean };

export function TextInput({ compact = false, className, ...props }: TextInputProps) {
  return (
    <input
      className={cx(
        "rounded-lg border border-border-input bg-card px-3.5 text-sm text-ink placeholder:text-muted",
        compact ? "py-1.5" : "h-11",
        className,
      )}
      {...props}
    />
  );
}
