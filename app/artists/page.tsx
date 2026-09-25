import Image from "next/image";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/app/home.css";
import "@/app/artists/artists.css";
import { artists } from "@/data/artists";

export default function ArtistsPage() {
  return (
    <div className="transmission-home artists-theme relative min-h-screen">
      <Navbar />

      <main className="relative z-10 mx-auto min-h-screen max-w-6xl px-6 py-16 sm:py-24">
        <header className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Aureyx Collective
          </p>
          <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            Artists
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-white/65">
            Artists, producers, and collaborators connected through Aureyx.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {artists.map((artist) => (
            <Link
              key={artist.slug}
              href={`/artists/${artist.slug}`}
              className="artist-directory-card group overflow-hidden rounded-3xl border border-white/10 bg-[#292929] transition hover:border-white/30 hover:bg-[#333]"
            >
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-950 via-[#35303d] to-[#202020]">
                {artist.image ? (
                  <Image
                    src={artist.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-7xl font-black text-white/15">
                    {artist.name.charAt(0)}
                  </span>
                )}
              </div>

              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                  {artist.role}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {artist.name}
                </h2>
                <p className="mt-3 text-sm text-white/60">
                  View artist profile →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}