import type { HTMLAttributes } from "react";

import { cx } from "@/utils/cx";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "section" | "fieldset" | "div";
  padded?: boolean;
};

export function Card({ as: Tag = "section", padded = true, className, ...props }: CardProps) {
  return (
    <Tag
      className={cx("rounded-xl border border-line bg-card", padded && "p-6", className)}
      {...props}
    />
  );
}
