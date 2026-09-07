"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  Gamepad2,
  Music2,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";

const sections = [
  {
    title: "Collective",
    subtitle: "Aureyx Artists",
    description:
      "Meet the artists and collaborators working under the Aureyx collective.",
    href: "/artists",
    icon: Users,
  },
  {
    title: "osu!",
    subtitle: "Gaming Archive",
    description:
      "A personal archive of my best scores, memorable plays, mapping projects and progress.",
    href: "/gaming/osu",
    icon: Gamepad2,
  },
  {
    title: "Music",
    subtitle: "Releases & Projects",
    description:
      "Explore releases, projects, sound kits and music connected to Aureyx.",
    href: "/music",
    icon: Music2,
  },
  {
    title: "Blog",
    subtitle: "Thoughts & Interests",
    description:
      "Posts about games, music, technology, creative projects and whatever else I'm interested in.",
    href: "/blog",
    icon: BookOpen,
  },
];

export default function ExploreGrid() {
  return (
    <section
      className="
        max-w-6xl
        mx-auto
        px-6
        py-28
      "
    >
      {/* Centered heading */}
      <div className="text-center mb-16">
        <p
          className="
            text-xs
            uppercase
            tracking-[0.4em]
            text-white/50
            mb-4
          "
        >
          Navigate
        </p>

        <h2
          className="
            text-4xl
            md:text-5xl
            font-black
            text-white
          "
        >
          Explore Aureyx
        </h2>

        <p
          className="
            mt-5
            max-w-xl
            mx-auto
            text-sm
            md:text-base
            text-white/60
            leading-7
          "
        >
          Music, artists, gaming history, creative projects and
          everything connected to the Aureyx archive.
        </p>
      </div>

      {/* Navigation cards */}
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-6
          max-w-4xl
          mx-auto
        "
      >
        {sections.map((section, index) => {
          const Icon = section.icon;

          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.06,
              }}
            >
              <Link
                href={section.href}
                className="
                  group
                  relative
                  flex
                  min-h-[220px]
                  flex-col
                  justify-between
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.035]
                  p-7
                  text-white
                  no-underline
                  transition-all
                  duration-300

                  hover:-translate-y-1
                  hover:border-white/25
                  hover:bg-white/[0.065]
                "
              >
                <div className="flex items-start justify-between">
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
                      bg-white/[0.04]
                    "
                  >
                    <Icon className="w-5 h-5 text-white/70" />
                  </div>

                  <ArrowUpRight
                    className="
                      w-5
                      h-5
                      text-white/30
                      transition-all
                      duration-300
                      group-hover:text-white
                      group-hover:translate-x-1
                      group-hover:-translate-y-1
                    "
                  />
                </div>

                <div className="mt-10">
                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.25em]
                      text-white/40
                    "
                  >
                    {section.subtitle}
                  </p>

                  <h3
                    className="
                      mt-2
                      text-2xl
                      font-semibold
                      text-white
                    "
                  >
                    {section.title}
                  </h3>

                  <p
                    className="
                      mt-3
                      text-sm
                      leading-6
                      text-white/60
                    "
                  >
                    {section.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}