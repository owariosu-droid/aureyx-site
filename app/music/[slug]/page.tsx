import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReleasePlayButton from "@/components/ReleasePlayButton";
import { getRelease, releases } from "@/lib/releases";
import { releasePrices } from "@/data/release-prices";
import { notFound } from "next/navigation";
import "@/app/home.css";

export function generateStaticParams() { return releases.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params:Promise<{slug:string}> }):Promise<Metadata> {
  const release = getRelease((await params).slug); if (!release) return { title:"Release not found | Aureyx" };
  return { title:`${release.title} | Aureyx`, description:`${release.format} by ${release.artist}. Preview and release links.`, openGraph:{ title:release.title,description:`${release.format} by ${release.artist}.`,images:[release.image],type:"music.album" } };
}
export default async function ReleasePage({ params }: { params:Promise<{slug:string}> }) {
  const release = getRelease((await params).slug); if (!release) notFound();
  const related = releases.filter((item) => item.link !== release.link && (item.artist === release.artist || item.contributors.some((name) => release.contributors.includes(name)))).slice(0,3);
  return <div className="transmission-home release-page"><Navbar/><main className="release-detail">
    <Link href="/music" className="release-detail-back">← Discography</Link>
    <article><div className="release-detail-art"><Image src={release.image} alt={`${release.title} cover`} fill priority sizes="(max-width:800px) 92vw, 48vw" /></div><div className="release-detail-copy"><p className="transmission-eyebrow">{release.catalogNumber} / Aureyx</p><h1>{release.title}</h1><dl><div><dt>Artist</dt><dd>{release.artist}</dd></div><div><dt>Format</dt><dd>{release.format}</dd></div><div><dt>Platform</dt><dd>{release.platform}</dd></div>{releasePrices[release.link] && <div><dt>Price</dt><dd>{releasePrices[release.link]}</dd></div>}</dl>{release.contributors.length > 0 && <p className="release-credits"><span>Credits</span>{release.contributors.join(" · ")}</p>}<div className="release-detail-actions"><ReleasePlayButton release={release}/><a href={release.link} target="_blank" rel="noopener noreferrer">Full release <ArrowUpRight/></a></div>{!release.preview && <iframe src={release.embed} title={`${release.title} player`} allow="autoplay; encrypted-media" referrerPolicy="strict-origin-when-cross-origin" className="mt-6 h-[160px] w-full border-0" />}<p>{release.preview ? "Preview excerpts are shortened. " : ""}Use the full release link to listen or purchase.</p></div></article>
    {release.tracks.length > 0 && <section className="release-tracklist mt-10" aria-labelledby="tracklist-heading"><h2 id="tracklist-heading" className="mb-5 text-2xl font-semibold">Track list</h2><ol className="space-y-3">{release.tracks.map((track,index) => <li className="flex min-w-0 items-start gap-4 border-b border-white/10 pb-3" key={`${index}-${track.title}`}><span className="text-white/45">{String(index+1).padStart(2,"0")}</span><span className="min-w-0 flex-1 break-words">{track.title}</span>{track.duration !== null && <span className="shrink-0 text-sm text-white/50">{Math.floor(track.duration/60)}:{String(Math.floor(track.duration)%60).padStart(2,"0")}</span>}</li>)}</ol></section>}
    {related.length > 0 && <section><p className="transmission-eyebrow">More from {release.artist}</p><div>{related.map((item) => <Link href={`/music/${item.slug}`} key={item.slug}><Image src={item.image} alt="" width={180} height={180}/><span>{item.title}</span></Link>)}</div></section>}
  </main><Footer/></div>;
}
