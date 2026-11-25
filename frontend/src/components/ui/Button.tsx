import Link from "next/link";
import type { ComponentProps } from "react";

import { cx } from "@/utils/cx";

type ButtonVariant = "primary" | "secondary";

type VariantProps = { variant?: ButtonVariant };

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent font-semibold text-card",
  secondary: "border border-line bg-card font-medium text-ink",
};

function buttonClass(variant: ButtonVariant, className?: string) {
  return cx(
    "inline-flex h-11.25 shrink-0 items-center gap-2 rounded-[10px] px-5 text-sm disabled:opacity-60",
    variantClasses[variant],
    className,
  );
}

export function Button({
  variant = "primary",
  type = "button",
  className,
  ...props
}: ComponentProps<"button"> & VariantProps) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}

export function LinkButton({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & VariantProps) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

export function TextButton({ type = "button", className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex w-fit items-center gap-2 rounded-[5px] px-1.5 py-0.5 font-medium text-accent transition-colors hover:bg-accent-soft",
        className,
      )}
      {...props}
    />
  );
}
