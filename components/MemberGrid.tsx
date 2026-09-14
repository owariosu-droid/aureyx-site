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
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "80px 24px",
        boxSizing: "border-box",
      }}
    >
      {showHeader && (
        <div
          style={{
            marginBottom: "48px",
            textAlign: "center",
          }}
        >
          <p
            className="text-white/50"
            style={{
              margin: "0 0 16px",
              fontSize: "12px",
              lineHeight: 1.6,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
            }}
          >
            Aureyx Collective
          </p>

          <h2
            className="text-white"
            style={{
              margin: 0,
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 900,
              lineHeight: 1.2,
            }}
          >
            Collaborators
          </h2>

          <p
            className="text-white/60"
            style={{
              maxWidth: "560px",
              margin: "20px auto 0",
              fontSize: "14px",
              lineHeight: 1.8,
            }}
          >
            Artists and creatives contributing to the growing Aureyx
            collective.
          </p>
        </div>
      )}

      {/* Members */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 230px), 1fr))",
          gap: "48px",
          maxWidth: "1100px",
          margin: "0 auto",
          justifyItems: "center",
          alignItems: "start",
        }}
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
            style={{
              width: "100%",
              maxWidth: "230px",
              minWidth: 0,
            }}
          >
            <Link
              href={`/artists/${member.slug}`}
              className="
                group transition-colors duration-300
                hover:bg-white/[0.065]
              "
              style={{
                display: "block",
                overflow: "hidden",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backgroundColor: "rgba(255, 255, 255, 0.035)",
                color: "white",
                textDecoration: "none",
                boxSizing: "border-box",
              }}
            >
              {/* Portrait */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1 / 1",
                  overflow: "hidden",
                  backgroundColor: "#27272a",
                }}
              >
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="230px"
                  style={{ objectFit: "cover" }}
                  className="
                    grayscale transition-all duration-500
                    group-hover:scale-105 group-hover:grayscale-0
                  "
                />

                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.55), transparent 65%)",
                  }}
                />
              </div>

              {/* Info */}
              <div style={{ padding: "24px 20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "18px",
                        fontWeight: 600,
                        lineHeight: 1.4,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {member.name}
                    </h3>

                    <p
                      style={{
                        margin: "10px 0 0",
                        fontSize: "10px",
                        lineHeight: 1.8,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "rgba(255, 255, 255, 0.55)",
                      }}
                    >
                      {member.role}
                    </p>
                  </div>

                  <ArrowUpRight
                    aria-hidden="true"
                    style={{
                      width: "16px",
                      height: "16px",
                      flexShrink: 0,
                      marginTop: "4px",
                      color: "rgba(255, 255, 255, 0.4)",
                    }}
                    className="
                      transition-transform
                      group-hover:translate-x-1
                      group-hover:-translate-y-1
                    "
                  />
                </div>

                <p
                  style={{
                    margin: "20px 0 0",
                    fontSize: "14px",
                    lineHeight: 1.75,
                    overflowWrap: "anywhere",
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
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