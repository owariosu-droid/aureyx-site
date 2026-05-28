// components/Navbar.tsx

"use client";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full overflow-hidden">

      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#120018,#000000,#1a0030,#000000)] bg-[length:300%_300%] animate-gradient opacity-95" />

      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-md border-b border-[#39ff14]/20" />

      {/* Navbar content */}
      <div className="relative max-w-7xl mx-auto flex items-center justify-between px-8 py-6">

        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-2xl font-black tracking-[0.25em] text-[#39ff14] drop-shadow-[0_0_10px_#39ff14]">
            AUREYX
          </h1>
        </div>

        {/* Center nav */}
        <div className="absolute left-1/2 -translate-x-1/2">

          <div className="flex items-center gap-[90px] text-sm uppercase tracking-[0.12em] text-white whitespace-nowrap">

            <a
              href="#releases"
              className="hover:text-[#39ff14] transition-colors duration-300"
            >
              Releases
            </a>

            <a
              href="#archive"
              className="hover:text-[#b026ff] transition-colors duration-300"
            >
              Archive
            </a>

            <a
              href="https://open.spotify.com/artist/1IwiBlGpQaMr8dV7u5LtjI"
              target="_blank"
              className="hover:text-white transition-colors duration-300"
            >
              Spotify
            </a>

          </div>

        </div>

        {/* Right spacer */}
        <div className="w-[120px]" />

      </div>

    </nav>
  );
}