"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { albums } from "@/data/albums";

export default function Releases() {
  return (
    <section
      id="releases"
      className="
        relative
        z-10
        max-w-7xl
        mx-auto
        px-6
        py-32
      "
    >
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mb-20"
      >
        <p
          className="
            text-xs
            uppercase
            tracking-[0.4em]
            text-zinc-600
            mb-5
          "
        >
          Aureyx Archive
        </p>

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-end
            md:justify-between
            gap-6
          "
        >
          <h2
            className="
              text-4xl
              md:text-6xl
              font-black
              tracking-tight
              text-white
            "
          >
            Releases
          </h2>

          <p
            className="
              max-w-md
              text-sm
              leading-7
              text-zinc-600
            "
          >
            Music released through Aureyx and its connected artists.
          </p>
        </div>

        <div className="mt-8 h-px w-full bg-white/10" />
      </motion.div>

      {/* Grid */}
      <div
        className="
          grid
          grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          gap-x-6
          gap-y-14
          md:gap-10
        "
      >
        {albums.map((album, index) => (
          <motion.a
            key={album.title}
            href={album.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: Math.min(index * 0.06, 0.3),
            }}
            whileHover={{ y: -6 }}
            className="group block"
          >
            {/* Album artwork */}
            <div
              className="
                relative
                aspect-square
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-zinc-900
                transition-all
                duration-500

                group-hover:border-white/25
                group-hover:shadow-[0_20px_60px_rgba(255,255,255,0.06)]
              "
            >
              <Image
                src={album.image}
                alt={album.title}
                fill
                sizes="
                  (max-width: 768px) 50vw,
                  (max-width: 1024px) 33vw,
                  25vw
                "
                className="
                  object-cover
                  transition-all
                  duration-700
                  group-hover:scale-105
                "
              />

              {/* dark overlay */}
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/80
                  via-black/10
                  to-transparent
                  opacity-40
                  transition-opacity
                  duration-500
                  group-hover:opacity-70
                "
              />

              {/* hover indicator */}
              <div
                className="
                  absolute
                  bottom-4
                  left-4
                  right-4
                  flex
                  items-center
                  justify-between
                  opacity-0
                  translate-y-2
                  transition-all
                  duration-300

                  group-hover:opacity-100
                  group-hover:translate-y-0
                "
              >
                <span
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.25em]
                    text-white/70
                  "
                >
                  Open release
                </span>

                <ArrowUpRight className="w-4 h-4 text-white/70" />
              </div>
            </div>

            {/* Release information */}
            <div className="mt-5">
              <h3
                className="
                  text-sm
                  md:text-base
                  text-zinc-300
                  tracking-[0.06em]
                  transition-colors
                  duration-300
                  group-hover:text-white
                "
              >
                {album.title}
              </h3>

              <p
                className="
                  mt-2
                  text-[10px]
                  uppercase
                  tracking-[0.25em]
                  text-zinc-700
                "
              >
                Aureyx
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}