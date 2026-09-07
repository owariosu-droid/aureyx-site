"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Artists",
    href: "/artists",
  },
  {
    name: "osu!",
    href: "/gaming/osu",
  },
  {
    name: "Releases",
    href: "/#releases",
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="
        sticky
        top-0
        z-50
        w-full
        border-b
        border-white/10
        bg-[#242424]/90
        backdrop-blur-xl
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          flex
          items-center
          justify-between
          px-6
          md:px-8
          py-5
        "
      >
        {/* Logo - always returns home */}
        <Link
          href="/"
          className="
            text-xl
            md:text-2xl
            font-black
            tracking-[0.3em]
            text-white
            no-underline
            transition-colors
            hover:text-white/70
          "
        >
          AUREYX
        </Link>

        {/* Desktop menu */}
        <div
          className="
            hidden
            md:flex
            items-center
            gap-10
            text-xs
            uppercase
            tracking-[0.18em]
          "
        >
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="
                text-white/60
                no-underline
                transition-colors
                duration-300
                hover:text-white
              "
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="
            md:hidden
            flex
            items-center
            justify-center
            text-white/70
            hover:text-white
          "
          aria-label="Toggle navigation"
        >
          {open ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="
            md:hidden
            border-t
            border-white/10
            bg-[#242424]
            px-6
            py-6
          "
        >
          <div className="flex flex-col gap-6">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setOpen(false)}
                className="
                  text-sm
                  uppercase
                  tracking-[0.18em]
                  text-white/65
                  no-underline
                  hover:text-white
                  transition-colors
                "
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}