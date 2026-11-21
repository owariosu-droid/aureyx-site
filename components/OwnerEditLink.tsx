"use client";
import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
export default function OwnerEditLink({ artist }: { artist?: string }) {
  const [owner, setOwner] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/session", { cache: "no-store", signal: controller.signal }).then(r => r.ok ? r.json() : null).then(data => setOwner(data?.owner === true)).catch(() => {});
    return () => controller.abort();
  }, []);
  if (!owner) return null;
  return <a href={artist ? `/admin?artist=${encodeURIComponent(artist)}` : "/admin"} className="owner-edit-link"><Pencil size={14} /> Edit {artist ? "profile" : "page text"}</a>;
}
