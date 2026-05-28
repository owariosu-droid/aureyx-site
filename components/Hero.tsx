// components/Hero.tsx

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Music2,
  Radio,
  ExternalLink
} from "lucide-react";

const albums = [
  {
    title: "Devourer",
    image: "/devourer.png",
    link: "https://dystofuturemusic.bandcamp.com/album/devourer",
  },
  {
    title: "Ouroboros",
    image: "/ouroboros.png",
    link: "https://open.spotify.com/album/6W9618MAoMyOgYcWgx6glU",
  },
  {
    title: "Oblivion",
    image: "/oblivion.png",
    link: "https://dystofuturemusic.bandcamp.com/album/oblivion",
  },
    title: "夢の結界 ~ Dream Barrier",
    image: "/dream-barrier.png",
    link: "https://dystofuturemusic.bandcamp.com/track/dream-barrier",
  };
];

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden text-white">

      {/* HERO */}
      <div className="flex flex-col justify-center items-center px-6 pt-36 text-center">

        {/* Character */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image
            src="/aureyx-girl.png"
            alt="Aureyx"
            width={340}
            height={340}
            className="
              rounded-3xl
              border border-white/10
              shadow-[0_0_60px_rgba(176,38,255,0.15)]
            "
          />
        </motion.div>

        {/* Logo */}
        <h1
          className="
            mt-10
            text-6xl
            md:text-8xl
            font-black
            tracking-[0.35em]
            text-white
          "
        >
          AUREYX
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-xl text-zinc-400 tracking-[0.08em] leading-relaxed">
          fragmented transmissions from forgotten timelines
        </p>

        {/* PLATFORM SECTION */}
        <div className="mt-16 w-full max-w-4xl">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Spotify */}
            <a
              href="https://open.spotify.com/artist/1IwiBlGpQaMr8dV7u5LtjI"
              target="_blank"
              className="
                group
                rounded-2xl
                border border-white/10
                bg-white/5
                backdrop-blur-md
                p-6
                hover:bg-white/10
                transition-all
              "
            >
              <div className="flex flex-col items-center">
                <Music2 className="w-8 h-8 mb-4" />

                <h3 className="uppercase tracking-[0.2em] text-sm text-white">
                  Listen
                </h3>

                <p className="text-zinc-400 text-sm mt-2">
                  Spotify
                </p>
              </div>
            </a>

            {/* Bandcamp */}
            <a
              href="https://dystofuturemusic.bandcamp.com/"
              target="_blank"
              className="
                group
                rounded-2xl
                border border-white/10
                bg-white/5
                backdrop-blur-md
                p-6
                hover:bg-white/10
                transition-all
              "
            >
              <div className="flex flex-col items-center">
                <Radio className="w-8 h-8 mb-4" />

                <h3 className="uppercase tracking-[0.2em] text-sm text-white">
                  Archive
                </h3>
                <p className="text-zinc-400 text-sm mt-2">
                  Bandcamp
                </p>
              </div>
            </a>

            {/* Portal */}
            <a
              href="https://linktr.ee/dystofuturemusic"
              target="_blank"
              className="
                group
                rounded-2xl
                border border-white/10
                bg-white/5
                backdrop-blur-md
                p-6
                hover:bg-white/10
                transition-all
              "
            >
              <div className="flex flex-col items-center">
                <ExternalLink className="w-8 h-8 mb-4" />

                <h3 className="uppercase tracking-[0.2em] text-sm">
                  Connect
                </h3>

                <p className="text-zinc-400 text-sm mt-2">
                  All Links
                </p>
              </div>
            </a>

          </div>
        </div>
      </div>

      {/* RELEASES */}
      <div id="releases" className="mt-32 px-6 max-w-7xl mx-auto">

        <h2 className="text-3xl uppercase tracking-[0.25em] text-center mb-14 text-white">
          Releases
        </h2>

        <div className="flex flex-wrap justify-center gap-10">

          {albums.map((album, index) => (
            <motion.a
              key={index}
              href={album.link}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -8 }}
              className="group"
            >

              {/* Album Cover */}
              <div
                className="
                  w-[240px]
                  overflow-hidden
                  rounded-2xl
                  border border-white/10
                  bg-white/5
                  backdrop-blur-sm
                  transition-all
                  duration-500
                  hover:border-white/20
                  hover:shadow-[0_0_30px_rgba(176,38,255,0.15)]
                "
              >
                <Image
                  src={album.image}
                  alt={album.title}
                  width={240}
                  height={240}
                  className="
                    object-cover
                    transition-transform
                    duration-700
                    group-hover:scale-105
                  "
                />
              </div>

              {/* Title BELOW art */}
              <h3
                className="
                  mt-5
                  text-center
                  text-white
                  uppercase
                  tracking-[0.18em]
                  text-sm
                "
              >
                {album.title}
              </h3>

            </motion.a>
          ))}

        </div>
      </div>

      {/* SOUND KITS */}
      <div className="mt-36 px-6 pb-32">

        <div
          className="
            max-w-5xl
            mx-auto
            rounded-3xl
            border border-white/10
            bg-white/5
            backdrop-blur-md
            p-12
            text-center
          "
        >

          <h2 className="text-4xl uppercase tracking-[0.25em] text-white">
            Sound Kits
          </h2>

          <p className="mt-6 text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            textures, forgotten frequencies, ambient fragments and nostalgic atmospheres
          </p>

          <a
            href="https://nocturnakits.gumroad.com/l/oeveok"
            target="_blank"
            className="
              inline-block
              mt-10
              px-10
              py-4
              rounded-2xl
              bg-white
              text-black
              uppercase
              tracking-[0.18em]
              hover:bg-zinc-200
              transition-all
              duration-300
            "
          >
            Open Gumroad
          </a>

        </div>

      </div>

    </section>
  );
}