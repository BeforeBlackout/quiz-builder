import type { ReactNode } from "react";

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-[31px] leading-[1.45] font-semibold tracking-tight">{children}</h1>;
}

type PageHeaderProps = {
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <PageTitle>{title}</PageTitle>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
