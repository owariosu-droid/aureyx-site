import type { ReactNode } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

import Navbar from "@/components/Navbar";
import OsuMapping from "@/components/OsuMapping";
import Footer from "@/components/Footer";
import BackgroundEffects from "@/components/BackgroundEffects";

const profileUrl = "https://osu.ppy.sh/users/37255712";

/*
  After saving your screenshot to:
  public/osu/sev26-practice.jpg

  Change null below to:
  "/osu/sev26-practice.jpg"
*/
const highlightImage: string | null = "/osu/sev26-practice.jpg";

const goals = [
  "Mr. Kill Myself (Darkness) — HDHR FC",
  "Higher's High (Counterattack) — FC",
  "Hades the Rise (Hardest) — HDHR FC",
  "L'erisia (Roll_Pan's Special) — HDHR FC",
  "Cyberia Lyr3 (present day present time hahaha) — FC (This would be so firetrucking cool)",
  "Seclusion (Isolation) — FC",
  "Shadow Corps (Undead Empress of a Fairy Empire) — HD FC (This is probably the only endgame score that I want genuinely)",
];

const equipment = [
  { label: "Keyboard", value: "Yuki Aim Polar75 8K (Oni 2.0)" },
  { label: "Tablet", value: "Gaomon S620" },
  { label: "Mouse", value: "GravaStar Mercury M2 Wireless" },
];

const projects = [
  {
    title: "Cynthoni of Flames",
    difficulty: "Watch my Skin Erupt in a Cynthoni of Flames",
    description: "Cynthoni · 6.66 star single diff",
    href: "https://osu.ppy.sh/beatmapsets/2575406#osu/5735879",
  },
  {
    title: "Yandere Era",
    difficulty: "overmapped ULTRA | heartburst extreme",
    description: "Cynthoni · Low 8 star and high 5 star diffs",
    href: "https://osu.ppy.sh/beatmapsets/2611691#osu/5850023",
  },
  {
    title: "Augoeides",
    difficulty: "Fantasia",
    description: "Fixing it up rn.",
    href: "https://osu.ppy.sh/beatmapsets/2521751#osu/5567029",
  },
];

function Card({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
      <h2 className="mb-6 text-center text-2xl font-semibold text-white">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ExternalButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
    >
      {children}
      <ExternalLink aria-hidden="true" className="h-4 w-4 shrink-0" />
    </a>
  );
}

export default function OsuPage() {
  return (
    <div className="osu-theme">
      <BackgroundEffects />
      <Navbar />

      <main className="relative z-10 mx-auto min-h-screen max-w-6xl px-6 py-16 sm:py-24">
        {/* Profile */}
            <header className="relative isolate mx-auto mb-10 max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#282428] px-6 py-10 text-center sm:p-12"> 
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
            >
            <Image
                src="/osu/osu-logo.png"
                alt=""
                fill
                sizes="768px"
                className="object-cover opacity-[0.07]"
              />
            </div>

{/* Visible osu! badge */}
            <Image
              src="/osu/osu-logo.png"
              alt="osu!"
              width={56}
              height={56}
              className="mx-auto mb-5 rounded-full"
          />
        
        <p className="mb-7 text-xs uppercase tracking-[0.3em] text-white/50">
            Gaming Archive
        </p>

          <Image
            src="https://a.ppy.sh/37255712"
            alt="My osu! profile avatar"
            width={112}
            height={112}
            unoptimized
            className="mx-auto h-28 w-28 rounded-2xl border border-white/15 object-cover"
          />

          <h1 className="mt-6 text-5xl font-black text-white sm:text-6xl">
            osu!
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-white/65">
            Maps I love, scores I&apos;m working toward, and things
            I&apos;m creating along the way.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <ExternalButton href={profileUrl}>
              View osu! profile
            </ExternalButton>

            <span className="inline-flex flex-wrap items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm">
              <span className="text-white/50">Discord</span>
              <span className="select-all font-medium text-white">
                owari2323
              </span>
            </span>
          </div>
        </header>

        <div className="space-y-8">
          {/* About me */}
          <Card title="About me">
            <div className="mx-auto max-w-2xl space-y-5 text-center text-sm leading-8 text-white/70 sm:text-base">
              <p>
                Hi, I also make music alongside playing osu! Feel free
                to check it out:
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <ExternalButton href="https://www.youtube.com/@lyrlvst">
                  Lyrlvst
                </ExternalButton>

                <ExternalButton href="https://www.youtube.com/@Aureyx-u6c">
                  Aureyx
                </ExternalButton>
              </div>

              <p>
                I love playing maps that generally play good with hidden
                or hardrock, as well as songs that I just find cool!
                <br />
                Feel free to send me maps or music.
              </p>
            </div>

            <dl className="mt-8 grid gap-4 md:grid-cols-3">
              {equipment.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-black/10 p-5 text-center"
                >
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-white/45">
                    {item.label}
                  </dt>
                  <dd className="mt-3 text-sm leading-6 text-white/85">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* Goals */}
          <Card title="Goals">
            <p className="mx-auto mb-7 max-w-2xl text-center text-sm italic leading-7 text-white/60">
              I don&apos;t intend to have a time constraint on any of
              these, been only playing when I really want to recently.
              I think they would be very cool scores to have nonetheless!
            </p>

            <ul className="grid list-none gap-3 p-0 sm:grid-cols-2">
              {goals.map((goal) => (
                <li
                  key={goal}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/10 p-5"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-white/40"
                  />
                  <span className="text-sm leading-7 text-white/80">
                    {goal}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-7 text-center text-sm leading-7 text-white/60">
              After I achieve all these goals, I&apos;ll probably work
              on fixing up my top 100 as well.
            </p>
          </Card>

          {/* Mapping projects */}
          <OsuMapping />
          {/* Personal highlight */}
          <Card title="Unranked scores that I think are cool">
            <figure>
              <figcaption className="mx-auto max-w-2xl text-center">
                <h3 className="text-lg font-semibold text-white">
                  Sev-26 Practice diff — Full map
                </h3>

                <p className="mt-3 text-sm leading-7 text-white/65">
                  The name is inaccurate. Highest acc I ever gotten
                  on this map.
                </p>
              </figcaption>

              {highlightImage && (
                <a
                  href={highlightImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open full-size Sev-26 score screenshot"
                  className="mt-6 block overflow-hidden rounded-2xl border border-white/10"
                >
                  <Image
                    src={highlightImage}
                    alt="My highest-accuracy Sev-26 full-map practice score"
                    width={1920}
                    height={1080}
                    sizes="(max-width: 1152px) 100vw, 1000px"
                    className="h-auto w-full"
                  />
                </a>
              )}
            </figure>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}