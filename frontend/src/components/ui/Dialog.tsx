"use client";

import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

const focusableSelector =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

type DialogProps = {
  title: ReactNode;
  description: ReactNode;
  onClose: () => void;
  canClose?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
};

function useBodyScrollLock() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);
}

function useEscapeKey(onEscape: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") onEscape();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled, onEscape]);
}

function trapFocus(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== "Tab") return;

  const items = [...event.currentTarget.querySelectorAll<HTMLElement>(focusableSelector)];
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) return;

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function Dialog({
  title,
  description,
  onClose,
  canClose = true,
  initialFocusRef,
  children,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock();
  useEscapeKey(onClose, canClose);

  useEffect(() => {
    (initialFocusRef?.current ?? panelRef.current)?.focus();
  }, [initialFocusRef]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-ink/40"
        disabled={!canClose}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative w-full max-w-105 rounded-xl border border-line bg-card p-6"
        onKeyDown={trapFocus}
      >
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-muted">
          {description}
        </p>
        {children}
      </div>
    </div>,
    document.body,
  );
}
