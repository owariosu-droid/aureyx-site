export type OwnerConfig = { url: string; key: string; ownerId: string; origin: string };
export type Tokens = { access_token: string; refresh_token: string; expires_in: number };
export class OwnerError extends Error { constructor(public status: number, message: string) { super(message); } }
export function ownerConfig(): OwnerConfig | null {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_ANON_KEY, ownerId = process.env.AUREYX_OWNER_ID, origin = process.env.AUREYX_SITE_ORIGIN;
  if (!url || !key || !ownerId || !origin) return null;
  try {
    const parsed = new URL(url), site = new URL(origin);
    if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".supabase.co") || parsed.pathname !== "/" || parsed.username || parsed.password || parsed.port || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(ownerId) || site.origin !== origin || (site.protocol !== "https:" && !(site.protocol === "http:" && ["localhost", "127.0.0.1"].includes(site.hostname)))) return null;
    return { url: parsed.origin, key, ownerId, origin };
  } catch { return null; }
}
export function requireSameOrigin(origin: string | null, expected: string) { if (!origin || origin !== expected) throw new OwnerError(403, "This request must come from your admin page."); }
export function createOwnerService(config: OwnerConfig, transport: typeof fetch = fetch) {
  async function request(path: string, method = "GET", body?: unknown, access?: string, extra?: Record<string, string>) {
    const response = await transport(config.url + path, { method, headers: { apikey: config.key, Authorization: `Bearer ${access || config.key}`, "Content-Type": "application/json", ...extra }, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      if (response.status === 429) throw new OwnerError(429, "Too many attempts. Wait a few minutes before trying again.");
      if (response.status === 400 || response.status === 401 || response.status === 403) throw new OwnerError(401, "Sign-in failed or the session expired.");
      throw new OwnerError(503, "The admin service is temporarily unavailable.");
    }
    return response.status === 204 ? null : response.json();
  }
  async function verify(access: string) {
    const user = await request("/auth/v1/user", "GET", undefined, access);
    if (!user || user.id !== config.ownerId) throw new OwnerError(401, "Owner sign-in is required.");
    return user as { id: string; email: string };
  }
  async function signIn(email: string, password: string): Promise<Tokens> {
    const tokens = await request("/auth/v1/token?grant_type=password", "POST", { email, password });
    await verify(tokens.access_token);
    return tokens;
  }
  async function refresh(refreshToken: string): Promise<Tokens> {
    const tokens = await request("/auth/v1/token?grant_type=refresh_token", "POST", { refresh_token: refreshToken });
    await verify(tokens.access_token);
    return tokens;
  }
  return { request, verify, signIn, refresh };
}
