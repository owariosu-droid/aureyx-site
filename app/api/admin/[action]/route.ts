import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { randomUUID } from "node:crypto";
import { ownerConfig, createOwnerService, OwnerError, requireSameOrigin, type Tokens } from "@/lib/owner-service";
import { defaultOwnerContent, validateOwnerContent } from "@/lib/owner-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const prefix = process.env.NODE_ENV === "production" ? "__Host-aureyx-" : "aureyx-";
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow, noarchive" } });
async function setTokens(tokens: Tokens) {
  if (typeof tokens.access_token !== "string" || typeof tokens.refresh_token !== "string" || !Number.isFinite(tokens.expires_in)) throw new OwnerError(503, "Invalid authentication response.");
  const jar = await cookies();
  const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/" };
  jar.set(prefix + "access", tokens.access_token, { ...options, maxAge: Math.min(tokens.expires_in, 3600) });
  jar.set(prefix + "refresh", tokens.refresh_token, { ...options, maxAge: 60 * 60 * 24 * 7 });
}
async function clearTokens() {
  const jar = await cookies();
  for (const name of ["access", "refresh"]) jar.set(prefix + name, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
}
async function handle(request: NextRequest, action: string) {
  const config = ownerConfig();
  if (!config) return reply({ configured: false, owner: false, error: "Owner administration is not configured yet." }, 503);
  const service = createOwnerService(config);
  async function auth() {
    const jar = await cookies(), access = jar.get(prefix + "access")?.value, refresh = jar.get(prefix + "refresh")?.value;
    if (access) {
      try { const user = await service.verify(access); return { access, user }; }
      catch (error) { if (!(error instanceof OwnerError) || error.status !== 401) throw error; }
    }
    if (refresh) {
      try { const tokens = await service.refresh(refresh); await setTokens(tokens); return { access: tokens.access_token, user: await service.verify(tokens.access_token) }; }
      catch (error) { await clearTokens(); throw error; }
    }
    throw new OwnerError(401, "Owner sign-in is required.");
  }
  try {
    if (!["session", "login", "logout", "content", "password"].includes(action)) return reply({ error: "Not found." }, 404);
    if (request.method === "GET") {
      if (action === "session") {
        try { await auth(); return reply({ configured: true, owner: true }); }
        catch (error) { if (error instanceof OwnerError && error.status === 401) return reply({ configured: true, owner: false }); throw error; }
      }
      if (action !== "content") return reply({ error: "Method not allowed." }, 405);
      const owner = await auth();
      const rows = await service.request("/rest/v1/owner_content?id=eq.site&select=content,revision", "GET", undefined, owner.access);
      if (!rows[0]) throw new OwnerError(503, "Content storage has not been initialized.");
      const content = Object.keys(rows[0].content).length ? validateOwnerContent(rows[0].content) : defaultOwnerContent();
      return reply({ content, revision: rows[0].revision });
    }
    requireSameOrigin(request.headers.get("origin"), config.origin);
    if (!request.headers.get("content-type")?.startsWith("application/json")) throw new OwnerError(415, "Use JSON for admin requests.");
    if (Number(request.headers.get("content-length")) > 32768) throw new OwnerError(413, "The edit is too large.");
    const chunks: Uint8Array[] = [];
    const reader = request.body?.getReader();
    let size = 0;
    if (reader) {
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.byteLength;
        if (size > 32768) { await reader.cancel(); throw new OwnerError(413, "The edit is too large."); }
        chunks.push(part.value);
      }
    }
    const raw = Buffer.concat(chunks).toString("utf8");
    let body;
    try { body = JSON.parse(raw); } catch { throw new OwnerError(400, "Invalid request."); }
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new OwnerError(400, "Invalid request.");
    if (action === "login") {
      if (typeof body.email !== "string" || body.email.length > 254 || typeof body.password !== "string" || !body.password || body.password.length > 128) throw new OwnerError(400, "Enter your email and password.");
      await setTokens(await service.signIn(body.email.trim(), body.password));
      return reply({ owner: true });
    }
    if (action === "logout") {
      const access = (await cookies()).get(prefix + "access")?.value;
      try { if (access) await service.request("/auth/v1/logout", "POST", undefined, access); }
      finally { await clearTokens(); }
      return reply({ owner: false });
    }
    const owner = await auth();
    if (action === "password") {
      if (typeof body.currentPassword !== "string" || body.currentPassword.length > 128 || typeof body.password !== "string" || body.password.length < 14 || body.password.length > 128 || body.currentPassword === body.password) throw new OwnerError(400, "Use a new password between 14 and 128 characters.");
      const fresh = await service.signIn(owner.user.email, body.currentPassword);
      await service.request("/auth/v1/user", "PUT", { password: body.password }, fresh.access_token);
      // Discard browser tokens and require a fresh sign-in after changing credentials.
      try { await service.request("/auth/v1/logout", "POST", undefined, fresh.access_token); } catch { /* The password changed; local credentials must still be cleared. */ }
      await clearTokens();
      return reply({ changed: true });
    }
    if (action === "content") {
      let content;
      try { content = validateOwnerContent(body.content); } catch (error) { throw new OwnerError(400, error instanceof Error ? error.message : "Invalid content."); }
      if (typeof body.revision !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(body.revision)) throw new OwnerError(400, "Reload the editor before saving.");
      const revision = randomUUID();
      const rows = await service.request(`/rest/v1/owner_content?id=eq.site&revision=eq.${body.revision}`, "PATCH", { content, revision }, owner.access, { Prefer: "return=representation" });
      if (!rows?.length) throw new OwnerError(409, "This content changed in another tab. Reload before saving again.");
      revalidateTag("owner-content", { expire: 0 });
      for (const path of ["/", "/artists", "/artists/[slug]", "/music", "/gaming/geometry-dash"]) revalidatePath(path, "page");
      return reply({ revision });
    }
    return reply({ error: "Method not allowed." }, 405);
  } catch (error) {
    if (error instanceof OwnerError) return reply({ error: error.message }, error.status);
    return reply({ error: "The admin service is temporarily unavailable. Try again shortly." }, 503);
  }
}
export async function GET(request: NextRequest, { params }: { params: Promise<{ action: string }> }) { return handle(request, (await params).action); }
export async function POST(request: NextRequest, { params }: { params: Promise<{ action: string }> }) { return handle(request, (await params).action); }
