import { releases } from "@/lib/releases";

export const dynamic = "force-static";
export const revalidate = 300;

// Content readiness only. No secrets, visitor data, or external service probes.
export function GET() {
  const ready = releases.length > 0 && releases.every((release) => release.access !== "supporter" || !!release.preview);
  return Response.json({ status: ready ? "ok" : "degraded" }, {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=300", "X-Content-Type-Options": "nosniff" },
  });
}
