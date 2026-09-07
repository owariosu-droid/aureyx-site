import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundEffects from "@/components/BackgroundEffects";
import BackHome from "@/components/BackHome";

import { members } from "@/data/members";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const member = members.find(
    (member) => member.slug === slug
  );

  if (!member) {
    notFound();
  }

  return (
    <>
      <BackgroundEffects />
      <Navbar />

      <main
        className="
          min-h-screen
          max-w-6xl
          mx-auto
          px-6
          py-28
        "
      >
        <BackHome/>
        
        <div
          className="
            grid
            md:grid-cols-[380px_1fr]
            gap-12
            md:gap-20
            items-start
          "
        >
          {/* Portrait */}
          <div
            className="
              relative
              aspect-square
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-zinc-900
            "
          >
            <Image
              src={member.image}
              alt={member.name}
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Information */}
          <div>
            <p
              className="
                text-xs
                uppercase
                tracking-[0.35em]
                text-zinc-600
              "
            >
              {member.role}
            </p>

            <h1
              className="
                mt-5
                text-5xl
                md:text-7xl
                font-black
              "
            >
              {member.name}
            </h1>

            <div
              className="
                w-20
                h-px
                bg-zinc-700
                mt-8
              "
            />

            <p
              className="
                mt-8
                text-zinc-400
                leading-8
                max-w-xl
              "
            >
              {member.description}
            </p>

            {/* Links */}
            <div className="flex flex-wrap gap-3 mt-10">

              {member.links.spotify && (
                <a
                  href={member.links.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    border
                    border-white/10
                    rounded-xl
                    px-5
                    py-3
                    text-sm
                    text-zinc-400
                    hover:text-white
                    hover:bg-white/[0.05]
                    transition-all
                  "
                >
                  Spotify
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {member.links.youtube && (
                <a
                  href={member.links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    border
                    border-white/10
                    rounded-xl
                    px-5
                    py-3
                    text-sm
                    text-zinc-400
                    hover:text-white
                    hover:bg-white/[0.05]
                    transition-all
                  "
                >
                  YouTube
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}