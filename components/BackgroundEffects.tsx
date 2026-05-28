"use client";

import { motion } from "framer-motion";

export default function BackgroundEffects() {
  return (
    <>
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 6,
          repeat: Infinity
        }}
        className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-neonPink blur-[140px] rounded-full opacity-30"
      />

      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 8,
          repeat: Infinity
        }}
        className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-neonGreen blur-[140px] rounded-full opacity-20"
      />
    </>
  );
}