import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundEffects from "@/components/BackgroundEffects";
import { ExternalLink } from "lucide-react";

export default function OsuPage() {
  return (
    <>
      <BackgroundEffects />
      <Navbar />

      <main
        className="
          relative
          z-10
          min-h-screen
          max-w-5xl
          mx-auto
          px-6
          py-28
        "
      >
        <div className="text-center">

          <p
            className="
              text-xs
              uppercase
              tracking-[0.4em]
              text-white/50
              mb-5
            "
          >
            Gaming Archive
          </p>

          <h1
            className="
              text-5xl
              md:text-7xl
              font-black
              text-white
            "
          >
            osu!
          </h1>

          <p
            className="
              mt-7
              max-w-2xl
              mx-auto
              text-white/65
              leading-8
            "
          >
            I've played osu! for around two years and it's become
            one of my favorite games. This section is mostly a
            personal archive of my best scores, memorable plays,
            mapping projects and my progress over time.
          </p>

          <a
            href="https://osu.ppy.sh/users/37255712"
            target="_blank"
            rel="noopener noreferrer"
            className="
              group
              inline-flex
              items-center
              gap-3
              mt-9
              rounded-xl
              border
              border-white/15
              bg-white/[0.05]
              px-6
              py-4
              text-xs
              uppercase
              tracking-[0.18em]
              text-white
              transition-all

              hover:bg-white/[0.1]
              hover:border-white/30
            "
          >
            View osu! Profile

            <ExternalLink
              className="
                w-4
                h-4
                group-hover:translate-x-1
                group-hover:-translate-y-1
                transition-transform
              "
            />
          </a>
        </div>

        {/* Add score/map sections underneath later */}

      </main>

      <Footer />
    </>
  );
}