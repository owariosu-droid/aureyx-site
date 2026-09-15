import Image from "next/image";
import {
  ExternalLink,
  Lightbulb,
  Map,
  Music2,
  Star,
  Wrench,
} from "lucide-react";

type MappingProject = {
  title: string;
  artist?: string;
  difficulty: string;
  status: "Started" | "Revising" | "Idea";
  details: string;
  description: string;
  image?: string;
  imagePosition?: string;
  href?: string;
};

const projects: MappingProject[] = [
  {
    title: "Cynthoni of Flames",
    artist: "Cynthoni",
    difficulty: "Watch my Skin Erupt in a Cynthoni of Flames",
    status: "Started",
    details: "6.66★ · Single difficulty",
    description:
      "A single-difficulty mapping project for Cynthoni of Flames.",
    image: "/osu/cynthoni-art.jpg",
    href: "https://osu.ppy.sh/beatmapsets/2575406#osu/5735879",
  },
  {
    title: "Yandere Era",
    artist: "Cynthoni",
    difficulty: "overmapped ULTRA | heartburst extreme",
    status: "Started",
    details: "Low 8★ + high 5★ · Two difficulties",
    description:
      "Two difficulties exploring the same song at different intensity levels.",
    image: "/osu/cynthoni-art.jpg",
    href: "https://osu.ppy.sh/beatmapsets/2611691#osu/5850023",
  },
  {
    title: "Augoeides",
    difficulty: "Fantasia",
    status: "Revising",
    details: "Existing difficulty · Revisions",
    description: "Fixing up the existing map.",
    image: "/osu/augoeides.jpg",
    imagePosition: "35% 50%",
    href: "https://osu.ppy.sh/beatmapsets/2521751#osu/5567029",
  },
  {
    title: "Dork After Dark",
    artist: "Cynthoni",
    difficulty: "Thinking of mapping",
    status: "Idea",
    details: "Target: mid-to-high 7★ · Single difficulty",
    description:
      "Probably want this to be a mid-to-high seven-star single difficulty.",
    image: "/osu/dork-after-dark.png",
    imagePosition: "50% 50%",
  },
  {
    title: "Mousou Happy End",
    artist: "Nanawo Akari",
    difficulty: "Thinking of mapping",
    status: "Idea",
    details: "Low-star difficulty · Possible harder version",
    description:
      "Been thinking of mapping a low-star difficulty using this song. But I might throw in a super hard difficulty too.",
       image: "/osu/mousou-happy-end.jpg",
       imagePosition: "50% 50%",
  },
];

function MappingCard({ project }: { project: MappingProject }) {
  const StatusIcon =
    project.status === "Idea"
      ? Lightbulb
      : project.status === "Revising"
        ? Wrench
        : Map;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#292929] transition-colors hover:border-pink-300/30">
      {/* All artwork uses the same square frame */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#222]">
        {project.image ? (
          <Image
            src={project.image}
            alt={`${project.title} artwork`}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 340px"
            className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
            style={{
              objectPosition: project.imagePosition ?? "50% 50%",
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#36303b] to-[#202020] px-6 text-center">
            <Music2
              aria-hidden="true"
              className="h-12 w-12 text-pink-200/35"
              strokeWidth={1}
            />
            <span className="text-xs uppercase tracking-[0.2em] text-white/40">
              Mapping project
            </span>
          </div>
        )}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
        />

        <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
          <StatusIcon aria-hidden="true" className="h-3.5 w-3.5" />
          {project.status}
        </span>
      </div>

      {/* Project information */}
      <div className="flex flex-1 flex-col p-6">
        {project.artist && (
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-pink-200/70">
            {project.artist}
          </p>
        )}

        <h3 className="text-xl font-semibold leading-snug text-white">
          {project.title}
        </h3>

        <p className="mt-2 text-xs leading-6 text-white/50">
          {project.difficulty}
        </p>

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-white/5 bg-black/15 px-3 py-3">
          <Star
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-pink-200/70"
          />
          <p className="text-xs leading-6 text-white/75">
            {project.details}
          </p>
        </div>

        <p className="mb-6 mt-4 text-sm leading-7 text-white/65">
          {project.description}
        </p>

        {project.href ? (
          <a
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${project.title} on osu!`}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pink-200"
          >
            View beatmap
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </a>
        ) : (
          <p className="mt-auto flex items-center gap-2 text-xs text-white/45">
            <Lightbulb aria-hidden="true" className="h-4 w-4" />
            Still an idea
          </p>
        )}
      </div>
    </article>
  );
}

export default function OsuMapping() {
  const started = projects.filter((project) => project.status !== "Idea");
  const ideas = projects.filter((project) => project.status === "Idea");

  return (
    <section
      aria-labelledby="mapping-heading"
      className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-8"
    >
      <div className="mx-auto mb-9 max-w-2xl text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-pink-200/15 bg-pink-300/5">
          <Map aria-hidden="true" className="h-5 w-5 text-pink-200/80" />
        </div>

        <p className="text-[10px] uppercase tracking-[0.25em] text-white/45">
          From listening to mapping
        </p>

        <h2
          id="mapping-heading"
          className="mt-3 text-3xl font-semibold text-white"
        >
          Mapping projects
        </h2>

        <p className="mt-4 text-sm leading-7 text-white/60">
          Maps I&apos;ve started, maps I&apos;m revisiting, and songs
          I&apos;m thinking about mapping.
        </p>
      </div>

      <h3 className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-white/60">
        <Wrench aria-hidden="true" className="h-4 w-4" />
        In progress
      </h3>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {started.map((project) => (
          <MappingCard key={project.title} project={project} />
        ))}
      </div>

      <h3 className="mb-5 mt-10 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-white/60">
        <Lightbulb aria-hidden="true" className="h-4 w-4" />
        Thinking of mapping
      </h3>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ideas.map((project) => (
          <MappingCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
}