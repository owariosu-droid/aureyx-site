import type { Metadata } from "next";
import OwnerAdmin from "@/components/OwnerAdmin";
import "./admin.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Owner sign-in | Aureyx", robots: { index: false, follow: false, nocache: true } };
export default function AdminPage() { return <main className="owner-admin"><OwnerAdmin /></main>; }
