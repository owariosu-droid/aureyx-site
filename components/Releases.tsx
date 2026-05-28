import Image from "next/image";

const releases = [
  {
    title: "Devourer",
    image: "/devourer.png",
    link: "https://open.spotify.com/artist/1IwiBlGpQaMr8dV7u5LtjI",
  },
  {
    title: "Ouroboros",
    image: "/ouroboros.png",
    link: "https://dystofuturemusic.bandcamp.com/",
  },
  {
    title: "Oblivion",
    image: "/oblivion.png",
    link: "https://linktr.ee/dystofuturemusic",
  },
];

export default function Releases() {
  return (
    <section
      id="releases"
      className="relative z-10 px-6 py-32 max-w-5xl mx-auto"
    >
      {/* Section heading */}
      <div className="mb-20 text-center">
        <p className="uppercase tracking-[0.4em] text-[#39ff14] text-sm mb-4">
          Archive
        </p>

        <h2 className="text-5xl md:text-6xl font-black uppercase tracking-[0.15em]">
          Releases
        </h2>

        <div className="w-32 h-[2px] bg-[#39ff14] mx-auto mt-6 shadow-[0_0_20px_#39ff14]" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 place-items-center">

        {releases.map((release) => (
          <a
            key={release.title}
            href={release.link}
            target="_blank"
            className="group"
          >
            <div className="relative w-[240px] h-[240px] overflow-hidden rounded-2xl border border-zinc-800 bg-black/60 transition-all duration-500 hover:scale-105 hover:border-[#39ff14]/50 hover:shadow-[0_0_40px_rgba(57,255,20,0.25)]">

              {/* Cover */}
              <Image
                src={release.image}
                alt={release.title}
                fill
                className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {/* Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[#39ff14]/10 transition-opacity duration-500" />

              {/* Title */}
              <div className="absolute bottom-0 left-0 p-5">
                <h3 className="text-xl font-bold uppercase tracking-[0.18em] text-white">
                  {release.title}
                </h3>
              </div>

            </div>
          </a>
        ))}

      </div>
    </section>
  );
}