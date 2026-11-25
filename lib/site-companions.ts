export const COMPANION_POLL_MS = 5 * 60 * 1000;
export const COMPANION_TIMEOUT_MS = 4000;
export const COMPANION_CONTROL_LIMIT = 600;

export type CompanionHealth = "unknown" | "ok" | "degraded" | "unavailable" | "offline";
export type CompanionRect = { left: number; top: number; right: number; bottom: number };
export type CompanionEligibility = { visible: boolean; online: boolean; desktop: boolean };

export function companionHealth(payload: unknown): CompanionHealth {
  if (!payload || typeof payload !== "object") return "unavailable";
  const status = (payload as { status?: unknown }).status;
  return status === "ok" || status === "degraded" ? status : "unavailable";
}

// A resumed tab keeps its previous deadline; visibility/network events cannot
// create a burst of requests. The first check waits for the initial page paint.
export function companionPollDelay(lastAttempt: number | null, now: number, eligibility: CompanionEligibility) {
  if (!eligibility.visible || !eligibility.online || !eligibility.desktop) return null;
  if (lastAttempt === null) return 1000;
  return Math.max(1000, COMPANION_POLL_MS - Math.max(0, now - lastAttempt));
}

export function companionCorners(width: number, height: number) {
  return {
    left: { left: 4, top: height - 82, right: 68, bottom: height - 5 },
    right: { left: width - 68, top: height - 82, right: width - 4, bottom: height - 5 },
  };
}

export function companionRectOverlaps(a: CompanionRect, b: CompanionRect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

export function availableCompanionCorners(width: number, height: number, controls: CompanionRect[]) {
  // Large, dense interfaces keep all their space. No unbounded layout scan.
  if (width < 1440 || height < 400 || controls.length > COMPANION_CONTROL_LIMIT) return { left: false, right: false };
  const corners = companionCorners(width, height);
  return {
    left: !controls.some((rect) => companionRectOverlaps(corners.left, rect)),
    right: !controls.some((rect) => companionRectOverlaps(corners.right, rect)),
  };
}
