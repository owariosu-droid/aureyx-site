import type { ReactNode } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

import Navbar from "@/components/Navbar";
import OsuMapping from "@/components/OsuMapping";
import Footer from "@/components/Footer";
import "@/app/home.css";
import "./osu.css";

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

function Card({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="osu-panel min-w-0 rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
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
    <div className="transmission-home osu-theme">
      <Navbar />

      <main className="relative z-10 mx-auto min-h-screen max-w-6xl px-6 py-16 sm:py-24">
        <header className="osu-header">
          <p className="transmission-eyebrow">Aureyx / osu!</p>
          <div className="osu-profile-row">
            <Image src="https://a.ppy.sh/37255712" alt="osu! profile avatar" width={112} height={112} unoptimized className="osu-avatar" />
            <div><h1>osu!</h1><p>Mapping projects, scores, and goals.</p></div>
            <Image src="/osu/osu-logo.png" alt="" width={80} height={80} className="osu-badge" />
          </div>
          <div className="osu-profile-links"><ExternalButton href={profileUrl}>View osu! profile</ExternalButton><span>Discord <strong className="select-all">owari2323</strong></span></div>
          <nav className="osu-sections" aria-label="osu! page sections"><a href="#mapping">Mapping</a><a href="#goals">Goals</a><a href="#scores">Scores</a><a href="#about">About & equipment</a></nav>
        </header>

        <div className="space-y-8">
          {/* About me */}
          <Card id="about" title="About & equipment">
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
          <Card id="goals" title="Goals">
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
          <Card id="scores" title="Scores">
            <figure>
              <figcaption className="mx-auto max-w-2xl text-center">
                <h3 className="text-lg font-semibold text-white">
                  Sev-26 Ranked play | Full map + Hidden
                </h3>

                <p className="mt-3 text-sm leading-7 text-white/65">
                  Highest acc I have ever gotten on this map, and with hidden too.
                </p>
              </figcaption>

              {highlightImage && (
                <div
                  data-protected-image
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
                </div>
              )}
            </figure>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}