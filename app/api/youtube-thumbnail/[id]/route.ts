const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

const cacheHeaders = {
  "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
  "X-Content-Type-Options": "nosniff",
};

function fallbackThumbnail() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#080809"/><stop offset="1" stop-color="#321016"/></linearGradient></defs><rect width="1280" height="720" fill="url(#g)"/><circle cx="640" cy="360" r="76" fill="#ff2438"/><path d="M621 317v86l73-43z" fill="white"/><text x="640" y="500" fill="#c9c3c5" font-family="Arial,sans-serif" font-size="28" letter-spacing="10" text-anchor="middle">AUREYX VIDEO</text></svg>`;
  return new Response(svg, {
    headers: { ...cacheHeaders, "Content-Type": "image/svg+xml; charset=utf-8" },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!VIDEO_ID.test(id)) return new Response("Invalid video id", { status: 400 });

  for (const size of ["maxresdefault", "hqdefault", "mqdefault"]) {
    try {
      const response = await fetch(`https://i.ytimg.com/vi/${id}/${size}.jpg`, {
        signal: AbortSignal.timeout(4500),
        next: { revalidate: 604800 },
      });
      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok || !contentType.startsWith("image/")) continue;

      return new Response(await response.arrayBuffer(), {
        headers: { ...cacheHeaders, "Content-Type": contentType },
      });
    } catch {
      // Try the next official YouTube thumbnail size.
    }
  }

  return fallbackThumbnail();
}
