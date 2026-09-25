import Link from "next/link";

const links = [
  { name: "Home", href: "/" },
  { name: "Artists", href: "/artists" },
  { name: "Music", href: "/#releases" },
  { name: "Videos", href: "/#videos" },
  { name: "osu!", href: "/gaming/osu" },
  { name: "Nocturna", href: "https://nocturnakits.gumroad.com/l/oeveok", external: true },
];

export default function Navbar() {
  return (
    <nav
      aria-label="Main navigation"
      className="aureyx-nav sticky top-0 z-50 w-full border-b border-white/10 bg-[#242424]/90 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pt-5 pb-7 sm:px-6 md:px-8">
        <Link
          href="/"
          aria-label="Aureyx home"
          className="shrink-0 text-base font-black tracking-[0.2em] text-white no-underline transition-colors hover:text-white/70 md:text-2xl"
        >
          AUREYX
        </Link>

        <ul
          style={{ columnGap: "48px" }}
          className="m-0 ml-auto flex list-none flex-wrap items-center justify-end gap-y-3 p-0 text-xs uppercase tracking-[0.15em]"
        >
          {links.map((link) => (
            <li key={link.href}>
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-2 text-white/60 no-underline transition-colors hover:text-white"
                >
                  {link.name} ↗
                </a>
              ) : (
                <Link
                  href={link.href}
                  className="inline-block py-2 text-white/60 no-underline transition-colors hover:text-white"
                >
                  {link.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
