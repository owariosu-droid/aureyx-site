/* eslint-disable @next/next/no-html-link-for-pages -- Full document navigation preserves the unsaved-edit warning and clears private editor state. */
"use client";
import { useEffect, useState, type FormEvent } from "react";
import { artists } from "@/data/artists";
import type { OwnerContent, PageCopy } from "@/lib/owner-content";

async function api(action: string, body?: unknown) {
  const response = await fetch(`/api/admin/${action}`, { method: body === undefined ? "GET" : "POST", cache: "no-store", headers: body === undefined ? undefined : { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "The request failed.");
  return data;
}
export default function OwnerAdmin() {
  const [ready, setReady] = useState(false), [configured, setConfigured] = useState(false), [owner, setOwner] = useState(false);
  const [email, setEmail] = useState(""), [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""), [nextPassword, setNextPassword] = useState(""), [confirmation, setConfirmation] = useState("");
  const [content, setContent] = useState<OwnerContent | null>(null), [revision, setRevision] = useState("");
  const [selected, setSelected] = useState(artists[0].slug), [busy, setBusy] = useState(false), [dirty, setDirty] = useState(false);
  const [error, setError] = useState(""), [notice, setNotice] = useState("");
  async function loadContent() {
    const data = await api("content"); setContent(data.content); setRevision(data.revision); setDirty(false);
  }
  useEffect(() => {
    let disposed = false;
    const artist = new URLSearchParams(window.location.search).get("artist");
    fetch("/api/admin/session", { cache: "no-store" }).then(r => r.json()).then(async data => {
      if (disposed) return;
      if (artist && artists.some(item => item.slug === artist)) setSelected(artist);
      setConfigured(data.configured === true); setOwner(data.owner === true);
      if (data.owner) await loadContent();
    }).catch(() => { if (!disposed) setError("Could not connect to the admin service. Reload to try again."); }).finally(() => { if (!disposed) setReady(true); });
    return () => { disposed = true; };
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function task(action: () => Promise<void>) { setBusy(true); setError(""); setNotice(""); try { await action(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Try again."); } finally { setBusy(false); } }
  async function login(event: FormEvent) {
    event.preventDefault(); await task(async () => { await api("login", { email, password }); setPassword(""); setOwner(true); await loadContent(); });
  }
  async function save(event: FormEvent) {
    event.preventDefault(); await task(async () => { const data = await api("content", { content, revision }); setRevision(data.revision); setDirty(false); setNotice("Saved. Your published page text is updated."); });
  }
  function artistField(field: "bio" | "role", value: string) {
    if (!content) return;
    setContent({ ...content, artists: { ...content.artists, [selected]: { ...content.artists[selected], [field]: value } } }); setDirty(true); setNotice("");
  }
  function pageField(page: keyof PageCopy, field: string, value: string) {
    if (!content) return;
    setContent({ ...content, pages: { ...content.pages, [page]: { ...content.pages[page], [field]: value } } }); setDirty(true); setNotice("");
  }
  async function changePassword(event: FormEvent) {
    event.preventDefault();
    if (nextPassword !== confirmation) { setError("The new passwords do not match."); return; }
    await task(async () => { await api("password", { currentPassword, password: nextPassword }); setCurrentPassword(""); setNextPassword(""); setConfirmation(""); setContent(null); setOwner(false); setDirty(false); setNotice("Password changed. Sign in with your new password."); });
  }
  return <div className="owner-admin-shell">
    <header><a href="/">Aureyx ↗</a><p>Private administration</p><h1>{owner ? "Owner studio" : "Owner sign-in"}</h1><p>{owner ? "Edit published artist profiles and page descriptions." : "Access is limited to the configured owner account."}</p></header>
    {error && <p className="owner-error" role="alert">{error}</p>}{notice && <p className="owner-notice" role="status">{notice}</p>}
    {!ready ? <p role="status">Checking access…</p> : !configured ? <section><h2>Administration is disabled</h2><p>The owner account and private deployment settings must be configured before anyone can sign in. Public registration is not provided.</p></section> : !owner ? <form onSubmit={login}>
      <label>Email<input type="email" name="email" autoComplete="username" maxLength={254} value={email} onChange={e => setEmail(e.target.value)} required /></label>
      <label>Password<input type="password" name="password" autoComplete="current-password" maxLength={128} value={password} onChange={e => setPassword(e.target.value)} required /></label>
      <button disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form> : <>
      <nav><a href="/artists">View artists ↗</a><a href="/music">View music ↗</a><button type="button" disabled={busy} onClick={() => task(async () => { await api("logout", {}); setContent(null); setOwner(false); setDirty(false); setPassword(""); })}>Sign out</button></nav>
      {!content ? <section><p>The editor could not load. Check the content table setup, then retry.</p><button disabled={busy} onClick={() => task(loadContent)}>Reload editor</button></section> : <form onSubmit={save}>
        <fieldset disabled={busy}><legend>Artist profiles</legend><label>Artist<select aria-label="Artist" value={selected} onChange={e => setSelected(e.target.value)}>{artists.map(artist => <option key={artist.slug} value={artist.slug}>{artist.name}</option>)}</select></label>
          <label>Role<input aria-label="Role" maxLength={100} required value={content.artists[selected].role} onChange={e => artistField("role", e.target.value)} /></label>
          <label>Biography<textarea aria-label="Biography" maxLength={1500} rows={6} required value={content.artists[selected].bio} onChange={e => artistField("bio", e.target.value)} /></label>
        </fieldset>
        <fieldset disabled={busy}><legend>Page text</legend>{(Object.keys(content.pages) as (keyof PageCopy)[]).map(page => <section key={page}><h2>{page === "geometry" ? "Geometry Dash" : page === "home" ? "Homepage" : "Music"}</h2>{Object.entries(content.pages[page]).map(([field, value]) => <label key={field}>{field === "intro" ? "Introduction" : field === "about" ? "About the collective" : "Description"}<textarea required rows={3} maxLength={1200} value={value} onChange={e => pageField(page, field, e.target.value)} /></label>)}</section>)}</fieldset>
        <p>These are public text fields. Passwords and private details do not belong here.</p>
        <button disabled={busy || !dirty}>{busy ? "Saving…" : "Save changes"}</button><span className="owner-save-state">{dirty ? "Unsaved changes" : "Up to date"}</span>
      </form>}
      <details><summary>Change your password</summary><form onSubmit={changePassword}>
        <label>Current password<input type="password" autoComplete="current-password" required maxLength={128} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></label>
        <label>New password<input type="password" autoComplete="new-password" required minLength={14} maxLength={128} value={nextPassword} onChange={e => setNextPassword(e.target.value)} /></label>
        <label>Confirm new password<input type="password" autoComplete="new-password" required minLength={14} maxLength={128} value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label>
        <p>Use at least 14 characters. You’ll sign in again after changing it.</p><button disabled={busy || dirty}>Change password</button>{dirty && <p>Save your content changes first.</p>}
      </form></details>
    </>}
  </div>;
}
