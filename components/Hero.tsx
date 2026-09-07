// components/Hero.tsx

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Music2,
  Radio,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";

const platforms = [
  {
    title: "Listen",
    subtitle: "Spotify",
    href: "https://open.spotify.com/artist/1IwiBlGpQaMr8dV7u5LtjI",
    icon: Music2,
  },
  {
    title: "Archive",
    subtitle: "Bandcamp",
    href: "https://dystofuturemusic.bandcamp.com/",
    icon: Radio,
  },
  {
    title: "Connect",
    subtitle: "All Links",
    href: "https://linktr.ee/dystofuturemusic",
    icon: ExternalLink,
  },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden text-white">

      {/* HERO */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center">

        {/* Character */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative"
          >
            {/* Glow behind image */}
            <div
              className="
                absolute
                inset-10
                bg-white/10
                blur-[80px]
                rounded-full
              "
            />

            <Image
              src="/aureyx-girl.png"
              alt="Aureyx"
              width={340}
              height={340}
              priority
              className="
                relative
                rounded-3xl
                border
                border-white/10
                shadow-[0_0_70px_rgba(255,255,255,0.08)]              "
            />
          </motion.div>
        </motion.div>

        {/* Logo */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.2,
          }}
          className="
            mt-10
            text-5xl
            sm:text-6xl
            md:text-8xl
            font-black
            tracking-[0.22em]
            sm:tracking-[0.3em]
            md:tracking-[0.35em]
            text-white
          "
        >
          AUREYX
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.45,
          }}
          className="
            mt-6
            max-w-xl
            text-sm
            sm:text-base
            text-zinc-400
            tracking-[0.08em]
            leading-relaxed
          "
        >
          fragmented transmissions from forgotten timelines
        </motion.p>

        {/* tiny identifier */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.6,
          }}
          className="
            mt-4
            text-[10px]
            uppercase
            tracking-[0.4em]
            text-white/20
          "
        >
          signal // aureyx
        </motion.p>

        {/* PLATFORM SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.7,
          }}
          className="mt-16 w-full max-w-4xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {platforms.map((platform) => {
              const Icon = platform.icon;

              return (
                <a
                  key={platform.title}
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.035]
                    backdrop-blur-md
                    p-6
                    transition-all
                    duration-500
                    hover:-translate-y-1
                    hover:border-white/20
                    hover:bg-white/[0.07]
                    hover:shadow-[0_15px_50px_rgba(176,38,255,0.10)]
                  "
                >
                  {/* subtle hover glow */}
                  <div
                    className="
                      absolute
                      inset-0
                      opacity-0
                      group-hover:opacity-100
                      transition-opacity
                      duration-500
                      bg-gradient-to-br
                      from-white/[0.08]
                      via-transparent
                      to-white/[0.02]
                    "
                  />

                  <div className="relative flex items-center">

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-white/10
                        bg-black/20
                      "
                    >
                      <Icon className="w-5 h-5 text-white/80" />
                    </div>

                    <div className="ml-4 text-left">
                      <h3 className="uppercase tracking-[0.18em] text-sm">
                        {platform.title}
                      </h3>

                      <p className="text-zinc-500 text-xs mt-1">
                        {platform.subtitle}
                      </p>
                    </div>

                    <ArrowUpRight
                      className="
                        ml-auto
                        h-4
                        w-4
                        text-white/20
                        transition-all
                        duration-300
                        group-hover:text-white
                        group-hover:translate-x-1
                        group-hover:-translate-y-1
                      "
                    />

                  </div>
                </a>
              );
            })}

          </div>
        </motion.div>

      </div>

      {/* SOUND KITS */}
      <div className="relative z-10 px-6 py-24">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="
            relative
            overflow-hidden
            max-w-5xl
            mx-auto
            rounded-3xl
            border
            border-white/10
            bg-white/[0.035]
            backdrop-blur-md
            px-8
            py-16
            md:p-16
            text-center
          "
        >

          {/* Background glow */}
          <div
            className="
              absolute
              top-[-100px]
              left-1/2
              -translate-x-1/2
              w-[400px]
              h-[200px]
              bg-white/[0.06]
              blur-[100px]
            "
          />

          <div className="relative">
            <p className="text-xs uppercase tracking-[0.4em] text-white/25 mb-5">
              Nocturna
            </p>

            <h2 className="text-3xl md:text-5xl uppercase tracking-[0.2em] text-white">
              Sound Kits
            </h2>

            <p className="mt-6 text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              textures, forgotten frequencies, ambient fragments and nostalgic
              atmospheres.
            </p>

            <a
              href="https://nocturnakits.gumroad.com/l/oeveok"
              target="_blank"
              rel="noopener noreferrer"
              className="
                group
                inline-flex
                items-center
                gap-3
                mt-10
                px-8
                py-4
                rounded-xl
                bg-white
                text-black
                text-sm
                uppercase
                font-medium
                tracking-[0.18em]
                transition-all
                duration-300
                hover:bg-zinc-200
                hover:scale-[1.02]
              "
            >
              Open Gumroad

              <ArrowUpRight
                className="
                  w-4
                  h-4
                  transition-transform
                  group-hover:translate-x-1
                  group-hover:-translate-y-1
                "
              />
            </a>
          </div>

        </motion.div>

      </div>

    </section>
  );
}