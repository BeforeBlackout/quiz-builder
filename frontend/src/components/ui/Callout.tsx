import type { ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";
import { cx } from "@/utils/cx";

const toneClasses = {
  accent: { box: "bg-accent-wash", title: "text-accent", body: "text-muted" },
  success: { box: "bg-success-soft", title: "text-success", body: "text-success-muted" },
};

type CalloutProps = {
  tone: keyof typeof toneClasses;
  icon: string;
  title: string;
  children: ReactNode;
};

export function Callout({ tone, icon, title, children }: CalloutProps) {
  const classes = toneClasses[tone];
  return (
    <section className={cx("rounded-[10px] p-5.5", classes.box)}>
      <div className="flex items-center gap-3">
        <Icon src={icon} />
        <p className={cx("text-[13px] font-semibold", classes.title)}>{title}</p>
      </div>
      <p className={cx("mt-3 text-[12px] leading-[1.45]", classes.body)}>{children}</p>
    </section>
  );
}
