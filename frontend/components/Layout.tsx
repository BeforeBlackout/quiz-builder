import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

import { Icon } from "@/components/Icon";

const links = [
  {
    href: "/quizzes",
    label: "My quizzes",
    icon: "/icons/grid.svg",
    iconActive: "/icons/grid-active.svg",
  },
  {
    href: "/create",
    label: "Create quiz",
    icon: "/icons/plus-active.svg",
    iconActive: "/icons/plus.svg",
  },
];

function isActive(pathname: string, href: string) {
  return href === "/quizzes" ? pathname.startsWith("/quizzes") : pathname === href;
}

export function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="flex h-20 shrink-0 items-center border-b border-line-strong bg-card px-6 lg:px-9">
        <Link
          href="/quizzes"
          className="flex items-start gap-0.5 text-[25px] leading-[1.45] font-bold"
        >
          <span className="text-ink">quiz-builder</span>
          <span className="text-accent">.</span>
        </Link>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[220px] shrink-0 border-r border-line-strong bg-card px-5 pt-8 pb-7 md:block">
          <nav className="flex w-[180px] flex-col gap-2">
            <p className="text-[10px] font-semibold tracking-wide text-muted-soft uppercase">
              Workspace
            </p>
            {links.map((link) => {
              const active = isActive(router.pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex h-[46px] items-center gap-3 rounded-lg pl-3.5 text-sm ${
                    active
                      ? "bg-accent-soft font-semibold text-accent"
                      : "font-medium text-ink hover:bg-paper"
                  }`}
                >
                  <Icon src={active ? link.iconActive : link.icon} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <nav className="flex gap-2 border-b border-line-strong bg-card px-4 py-3 md:hidden">
            {links.map((link) => {
              const active = isActive(router.pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-sm ${
                    active
                      ? "bg-accent-soft font-semibold text-accent"
                      : "bg-paper font-medium text-ink"
                  }`}
                >
                  <Icon src={active ? link.iconActive : link.icon} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <main className="min-w-0 flex-1 overflow-auto px-4 py-8 sm:px-8 lg:px-11">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
