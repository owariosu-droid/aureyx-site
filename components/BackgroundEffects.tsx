"use client";

import { motion } from "framer-motion";

export default function BackgroundEffects() {
  return (
    <div
      className="
        fixed
        inset-0
        z-0
        overflow-hidden
        pointer-events-none
        bg-[#202020]
      "
    >
      {/* light gray glow */}
      <motion.div
        animate={{
          x: [0, 80, -40, 0],
          y: [0, 40, 10, 0],
          opacity: [0.18, 0.28, 0.18],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          top-[-250px]
          left-[-150px]
          w-[700px]
          h-[700px]
          rounded-full
          bg-zinc-400
          blur-[190px]
        "
      />

      {/* darker graphite area */}
      <motion.div
        animate={{
          x: [0, -60, 20, 0],
          y: [0, -30, 20, 0],
          opacity: [0.12, 0.2, 0.12],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          bottom-[-250px]
          right-[-150px]
          w-[750px]
          h-[750px]
          rounded-full
          bg-zinc-500
          blur-[220px]
        "
      />

      {/* subtle center highlight */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035),transparent_60%)]
        "
      />

      {/* soft vignette */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.35)_100%)]
        "
      />
    </div>
  );
}