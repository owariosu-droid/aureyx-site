import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackHome() {
  return (
    <Link
      href="/"
      className="
        group
        inline-flex
        items-center
        gap-2
        text-xs
        uppercase
        tracking-[0.2em]
        text-white/55
        no-underline
        transition-colors
        hover:text-white
      "
    >
      <ArrowLeft
        className="
          w-4
          h-4
          transition-transform
          group-hover:-translate-x-1
        "
      />

      Back to Home
    </Link>
  );
}