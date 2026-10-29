"use client";

import { useEffect, type RefObject } from "react";

export function useDialogFocus(open: boolean, container: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open || !container.current) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = container.current;
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]')).filter((element) => element.getClientRects().length);
    focusable()[0]?.focus({ preventScroll: true });
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0], last = elements.at(-1);
      if (!first || !last) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", trap);
    return () => { document.removeEventListener("keydown", trap); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, [open, container]);
}
