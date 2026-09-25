"use client";

import { useEffect } from "react";

// A casual-copying deterrent, not access control. Public images remain
// downloadable, and cross-origin video players control their own menus.
export default function ImageProtection() {
  useEffect(() => {
    const protect = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("img, picture, svg, [data-protected-image], .aureyx-gothic-mark, .nocturna-moon")) {
        event.preventDefault();
      }
    };
    document.addEventListener("contextmenu", protect, true);
    document.addEventListener("dragstart", protect, true);
    return () => {
      document.removeEventListener("contextmenu", protect, true);
      document.removeEventListener("dragstart", protect, true);
    };
  }, []);
  return null;
}
