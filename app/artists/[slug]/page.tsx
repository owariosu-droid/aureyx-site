import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundEffects from "@/components/BackgroundEffects";
import { artists } from "@/data/artists";

export function generateStaticParams() {
  return artists.map((artist) => ({ slug: artist.slug }));
}

export default async function ArtistProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = artists.find((item) => item.slug === slug);

  if (!artist) notFound();

  return (
    <div className="relative min-h-screen">
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10 mx-auto min-h-screen max-w-5xl px-6 py-16 sm:py-24">
        <Link
          href="/artists"
          className="text-sm text-white/60 transition hover:text-white"
        >
          ← All artists
        </Link>

        <article className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#292929]">
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-square bg-gradient-to-br from-purple-950 via-[#35303d] to-[#202020]">
              {artist.image ? (
                <Image
                  src={artist.image}
                  alt={`${artist.name} artwork`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-9xl font-black text-white/15">
                  {artist.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-12">
              <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                {artist.role}
              </p>
              <h1 className="mt-4 text-5xl font-bold text-white">
                {artist.name}
              </h1>
              <p className="mt-6 leading-8 text-white/70">{artist.bio}</p>

              {artist.links && artist.links.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-3">
                  {artist.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-white/20 px-5 py-3 text-sm text-white transition hover:bg-white/10"
                    >
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}