"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { members } from "@/data/members";

type MemberGridProps = {
  showHeader?: boolean;
};

export default function MemberGrid({
  showHeader = true,
}: MemberGridProps) {
  return (
    <section
      className="
        max-w-7xl
        mx-auto
        px-6
        py-24
      "
    >
      {/* Heading */}
      {showHeader && (
        <div className="mb-16 text-center">
          <p
            className="
              text-xs
              uppercase
              tracking-[0.4em]
              text-white/50
              mb-4
            "
          >
            Aureyx Collective
          </p>

          <h2
            className="
              text-4xl
              md:text-5xl
              font-black
              text-white
            "
          >
            Collaborators
          </h2>

          <p
            className="
              max-w-xl
              mx-auto
              mt-5
              text-sm
              leading-7
              text-white/60
            "
          >
            Artists and creatives contributing to the growing Aureyx
            collective.
          </p>

          <Link
            href="/artists"
            className="
              group
              inline-flex
              items-center
              gap-2
              mt-7
              text-xs
              uppercase
              tracking-[0.2em]
              text-white/60
              no-underline
              hover:text-white
              transition-colors
            "
          >
            View collective

            <ArrowUpRight
              className="
                w-4
                h-4
                transition-transform
                group-hover:translate-x-1
                group-hover:-translate-y-1
              "
            />
          </Link>
        </div>
      )}

      {/* Members */}
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-7
          max-w-6xl
          mx-auto
          justify-items-center
        "
      >
        {members.map((member, index) => (
          <motion.div
            key={member.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: index * 0.06,
            }}
            className="
              w-full
              max-w-[230px]
            "
          >
            <Link
              href={`/artists/${member.slug}`}
              className="
                group
                block
                h-full
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-white/[0.035]
                text-white
                no-underline
                transition-all
                duration-300
                hover:border-white/25
                hover:bg-white/[0.065]
                hover:-translate-y-1
              "
            >
              {/* Portrait */}
              <div
                className="
                  relative
                  w-full
                  h-[230px]
                  overflow-hidden
                  bg-zinc-800
                "
              >
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="230px"
                  className="
                    object-cover
                    grayscale
                    transition-all
                    duration-500
                    group-hover:scale-105
                    group-hover:grayscale-0
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/55
                    via-transparent
                    to-transparent
                  "
                />
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3
                      className="
                        text-lg
                        font-semibold
                        text-white
                      "
                    >
                      {member.name}
                    </h3>

                    <p
                      className="
                        mt-1
                        text-[10px]
                        uppercase
                        tracking-[0.2em]
                        text-white/55
                      "
                    >
                      {member.role}
                    </p>
                  </div>

                  <ArrowUpRight
                    className="
                      w-4
                      h-4
                      text-white/40
                      transition-all
                      group-hover:text-white
                      group-hover:translate-x-1
                      group-hover:-translate-y-1
                    "
                  />
                </div>

                <p
                  className="
                    mt-4
                    text-sm
                    leading-6
                    text-white/70
                    line-clamp-4
                  "
                >
                  {member.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}