"use client";

import { useEffect, useRef, useState } from "react";
import {
  availableCompanionCorners,
  companionHealth,
  companionPollDelay,
  COMPANION_CONTROL_LIMIT,
  COMPANION_TIMEOUT_MS,
  type CompanionHealth,
} from "@/lib/site-companions";
import "./site-companions.css";

const desktopQuery = "(min-width: 1440px) and (hover: hover) and (pointer: fine)";
const controlsQuery = 'a[href],button,input:not([type="hidden"]),select,textarea,summary,[role="button"],[role="slider"],[contenteditable="true"],audio[controls],video[controls],iframe';

export default function SiteCompanions() {
  const layer = useRef<HTMLDivElement>(null);
  const [health, setHealth] = useState<CompanionHealth>("unknown");

  useEffect(() => {
    const desktop = window.matchMedia(desktopQuery);
    const touch = window.matchMedia("(any-pointer: coarse)");
    let disposed = false;
    let lastAttempt: number | null = null;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    let layoutTimer: ReturnType<typeof setTimeout> | undefined;
    let request: AbortController | null = null;
    let controls = Array.from(document.querySelectorAll<HTMLElement>(controlsQuery));
    let controlsChanged = false;

    const eligibility = () => ({ visible: document.visibilityState === "visible", online: navigator.onLine, desktop: desktop.matches && !touch.matches });

    function checkCorners() {
      if (!layer.current || disposed) return;
      if (!eligibility().desktop) {
        layer.current.dataset.left = "hidden";
        layer.current.dataset.right = "hidden";
        return;
      }
      if (controlsChanged) {
        controls = Array.from(document.querySelectorAll<HTMLElement>(controlsQuery));
        controlsChanged = false;
      }
      // Read at most 600 rectangles once after scrolling/resizing has settled.
      // The usual case is a few dozen; never poll or scan on animation frames.
      const rects = controls.length <= COMPANION_CONTROL_LIMIT
        ? controls.filter((control) => control.isConnected).map((control) => control.getBoundingClientRect()).filter((rect) => rect.width > 0 && rect.height > 0)
        : controls.map(() => ({ left: 0, right: 0, top: 0, bottom: 0 }));
      const safe = availableCompanionCorners(window.innerWidth, window.innerHeight, rects);
      layer.current.dataset.left = safe.left ? "visible" : "hidden";
      layer.current.dataset.right = safe.right ? "visible" : "hidden";
      layer.current.dataset.settling = "false";
    }

    function scheduleLayout() {
      if (!layer.current || disposed) return;
      layer.current.dataset.settling = "true";
      clearTimeout(layoutTimer);
      layoutTimer = setTimeout(checkCorners, 200);
    }

    function schedulePoll() {
      clearTimeout(pollTimer);
      if (disposed) return;
      const delay = companionPollDelay(lastAttempt, Date.now(), eligibility());
      if (delay !== null) pollTimer = setTimeout(checkHealth, delay);
    }

    async function checkHealth() {
      if (disposed || !Object.values(eligibility()).every(Boolean)) return;
      lastAttempt = Date.now();
      const controller = new AbortController();
      request = controller;
      const timeout = setTimeout(() => controller.abort(), COMPANION_TIMEOUT_MS);
      try {
        const response = await fetch("/api/health", { method: "GET", credentials: "omit", cache: "no-store", redirect: "error", signal: controller.signal });
        const payload: unknown = response.ok ? await response.json() : null;
        if (!disposed && eligibility().visible && navigator.onLine) setHealth(companionHealth(payload));
      } catch {
        if (!disposed && eligibility().visible && navigator.onLine) setHealth("unavailable");
      } finally {
        clearTimeout(timeout);
        if (request === controller) request = null;
        schedulePoll();
      }
    }

    function environmentChanged() {
      const current = eligibility();
      if (layer.current) layer.current.dataset.paused = current.visible ? "false" : "true";
      if (!current.online) setHealth("offline");
      if (!current.visible || !current.online || !current.desktop) request?.abort();
      schedulePoll();
      scheduleLayout();
    }

    // A new route or a newly opened player can add controls. Ignore plain text
    // updates (for example live pitch readings), and batch structural changes.
    const observer = new MutationObserver((records) => {
      const changed = records.some((record) => [...record.addedNodes, ...record.removedNodes].some((node) => node instanceof Element && (node.matches(controlsQuery) || node.querySelector(controlsQuery))));
      if (changed) { controlsChanged = true; scheduleLayout(); }
    });
    observer.observe(document.body, { subtree: true, childList: true });
    document.addEventListener("visibilitychange", environmentChanged);
    window.addEventListener("online", environmentChanged);
    window.addEventListener("offline", environmentChanged);
    window.addEventListener("scroll", scheduleLayout, { passive: true });
    window.addEventListener("resize", scheduleLayout, { passive: true });
    desktop.addEventListener("change", environmentChanged);
    touch.addEventListener("change", environmentChanged);
    environmentChanged();

    return () => {
      disposed = true;
      clearTimeout(pollTimer);
      clearTimeout(layoutTimer);
      request?.abort();
      observer.disconnect();
      document.removeEventListener("visibilitychange", environmentChanged);
      window.removeEventListener("online", environmentChanged);
      window.removeEventListener("offline", environmentChanged);
      window.removeEventListener("scroll", scheduleLayout);
      window.removeEventListener("resize", scheduleLayout);
      desktop.removeEventListener("change", environmentChanged);
      touch.removeEventListener("change", environmentChanged);
    };
  }, []);

  return <div ref={layer} className="site-companions" aria-hidden="true" data-health={health} data-left="hidden" data-right="hidden" data-settling="true" data-paused="false">
    <div className="site-companion companion-cat">
      <svg viewBox="0 0 44 48" focusable="false" fill="none">
        <path className="companion-ground" d="M8 43c8-3 20-3 28 0" />
        <g className="companion-float">
          <path className="companion-tail" d="M32 37c13 2 11-15 5-10-3 2-1 6 1 5" />
          <path className="companion-body" d="m10 18 1-11 10 7c4-1 5-1 8 0l7-7 1 12c3 5 1 13-4 16l1 6H12l1-7c-5-4-6-11-3-16Z" />
          <path className="companion-chest" d="m16 32 6 3 7-4-3 10h-9Z" />
          <path className="companion-ears" d="m13 13 1-3 4 5m12 0 4-5v4" />
          <path className="companion-eyes" d="m14 23 4 1m9 0 4-1" />
          <path className="companion-nose" d="m21 27 2 0-1 1Z" />
          <path className="companion-collar" d="M17 33h11" />
          <circle className="companion-status" cx="22" cy="35" r="1.7" />
        </g>
      </svg>
    </div>
    <div className="site-companion companion-ghost">
      <svg viewBox="0 0 44 48" focusable="false" fill="none">
        <path className="companion-ground" d="M8 43c8-3 20-3 28 0" />
        <g className="companion-float">
          <path className="companion-halo" d="M14 9c0-3 16-3 16 0s-16 3-16 0Z" />
          <path className="companion-body" d="M10 28c0-19 25-20 25-1l2 11-7-2-4 5-5-4-7 3-6-3 2-9Z" />
          <path className="companion-chest" d="M14 22c0-8 16-10 18 1l-1 12-5 3-5-4-7 3Z" />
          <path className="companion-eyes" d="m15 24 3 1m8 0 3-1" />
          <path className="companion-nose" d="m21 29 2 0" />
          <circle className="companion-status" cx="22" cy="35" r="1.7" />
        </g>
      </svg>
    </div>
  </div>;
}
