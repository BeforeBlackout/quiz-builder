import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

type SummaryItem = { label: string; value: ReactNode };

type SummaryCardProps = {
  title: string;
  icon?: string;
  stats: SummaryItem[];
  rows: SummaryItem[];
};

export function SummaryCard({ title, icon, stats, rows }: SummaryCardProps) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        {icon ? <Icon src={icon} /> : null}
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <div className="mt-5 flex gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="w-32">
            <p className="text-[31px] leading-none font-semibold">{stat.value}</p>
            <p className="mt-1 text-[11px] text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="my-5 h-px bg-line" />
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between py-1.5 text-[12px]">
          <span className="text-muted">{row.label}</span>
          <span className="font-medium">{row.value}</span>
        </div>
      ))}
    </Card>
  );
}
