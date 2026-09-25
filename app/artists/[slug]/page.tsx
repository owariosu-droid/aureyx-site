import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/app/home.css";
import "@/app/artists/artists.css";
import YouTubeFeed from "@/components/YouTubeFeed";
import ArtistUpdateBody from "@/components/ArtistUpdateBody";
import { artists } from "@/data/artists";
import { getArtistUpdates, submissionUrl } from "@/lib/artist-updates";

export const revalidate = 300;
export function generateStaticParams() {
  return artists.map((artist) => ({ slug: artist.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = artists.find((item) => item.slug === slug);
  return { title: artist ? `${artist.name} | Aureyx` : "Artist not found | Aureyx" };
}

export default async function ArtistProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = artists.find((item) => item.slug === slug);
  if (!artist) notFound();
  const { posts, unavailable } = await getArtistUpdates(slug);

  return (
    <div className="transmission-home artists-theme relative min-h-screen">
      {artist.cover && <div className="pointer-events-none fixed inset-0 z-0"><Image src={artist.cover} alt="" fill sizes="100vw" className="object-cover opacity-[0.12]" /><div className="absolute inset-0 bg-black/50" /></div>}
      <Navbar />
      <main className="relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <Link href="/artists" className="text-sm text-white/60 hover:text-white">← All artists</Link>
        <article className="artist-profile-card mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#252525]">
          <div data-protected-image className="relative h-64 bg-gradient-to-br from-purple-950 via-zinc-800 to-black sm:h-96 lg:h-[480px]">
            {(artist.cover || artist.image) && <Image src={(artist.cover || artist.image)!} alt={`${artist.name} cover artwork`} fill priority sizes="(max-width: 1280px) 100vw, 1280px" className="object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-[#252525] via-transparent to-transparent" />
          </div>
          <div className="relative px-6 pb-10 sm:px-12">
            <div className="-mt-16 mb-6 flex flex-wrap items-end gap-6">
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-[#252525] bg-zinc-800 sm:h-40 sm:w-40">
                {artist.image ? <Image src={artist.image} alt={artist.name} fill sizes="160px" className="object-cover" /> : <span className="flex h-full items-center justify-center text-6xl font-bold">{artist.name[0]}</span>}
              </div>
              <p className="pb-2 text-xs uppercase tracking-[0.25em] text-white/55">Aureyx Collective / {artist.role}</p>
            </div>
            <h1 className="break-words text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">{artist.name}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">{artist.bio}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={artist.youtubeChannelId ? "#videos" : "#updates"} className="rounded-full border border-white/30 px-6 py-3 text-sm hover:bg-white/10">{artist.youtubeChannelId ? "Videos ↓" : "Latest updates ↓"}</a>
              {artist.blog && <a href="#blog" className="rounded-full border border-white/15 px-6 py-3 text-sm hover:bg-white/10">Blog ↓</a>}
              {artist.albums && <a href="#albums" className="rounded-full border border-white/15 px-6 py-3 text-sm hover:bg-white/10">Albums ↓</a>}
              {artist.links?.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/15 px-6 py-3 text-sm hover:bg-white/10">{link.label} ↗</a>)}
            </div>
          </div>
        </article>

        {artist.gallery && <section className="mt-16" aria-labelledby="gallery-heading">
          <p className="text-xs uppercase tracking-[0.25em] text-white/45">Selected visuals</p>
          <h2 id="gallery-heading" className="mt-3 text-3xl font-semibold">Gallery</h2>
          <div className="mt-8 grid items-start gap-6 md:grid-cols-2">
            {artist.gallery.map((photo) => <div key={photo.src} data-protected-image className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              <Image src={photo.src} alt={photo.alt} width={1536} height={1176} sizes="(max-width: 768px) 100vw, 50vw" className="h-auto w-full" />
            </div>)}
          </div>
        </section>}

        {artist.albums && <section id="albums" className="mt-16 scroll-mt-32" aria-labelledby="albums-heading">
          <h2 id="albums-heading" className="text-3xl font-semibold">Albums</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">{artist.albums.map((album) => <article key={album.title} className="overflow-hidden rounded-2xl border border-white/10 bg-[#181618]">
            <div data-protected-image><Image src={album.image} alt={`${album.title} cover`} width={2561} height={1440} sizes="(max-width: 768px) 100vw, 50vw" className="h-auto w-full" /></div>
            <div className="flex items-center justify-between gap-4 p-6"><h3 className="text-xl font-medium">{album.title}</h3>{album.href && <a href={album.href} target="_blank" rel="noopener noreferrer" className="text-sm text-white/65 hover:text-white">Listen ↗</a>}</div>
          </article>)}</div>
        </section>}

        {artist.youtubeChannelId && <YouTubeFeed channelId={artist.youtubeChannelId} name={artist.name} />}

        {(artist.blog || !artist.youtubeChannelId || posts.length > 0) &&
        <section id={artist.blog ? "blog" : "updates"} className="mt-16 scroll-mt-28" aria-labelledby="updates-heading">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div><p className="text-xs uppercase tracking-[0.25em] text-white/45">{artist.name}</p><h2 id="updates-heading" className="mt-3 text-3xl font-semibold">{artist.blog ? "Blog" : "Updates"}</h2><p className="mt-3 text-white/60">Notes, photos, and works in progress.</p></div>
            <a href={submissionUrl(slug, artist.name)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-6 py-3 text-sm hover:bg-white/10">{artist.blog ? "Write a post ↗" : "Submit an update ↗"}</a>
          </div>
          <p className="mt-4 text-sm text-white/45">Artists: sign in to GitHub to write a post and attach photos. Updates appear after approval.</p>
          <div className="mt-8 space-y-6">
            {posts.map((post) => <article key={post.id} className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#252525] p-6 [overflow-wrap:anywhere] sm:p-10">
              <time dateTime={post.created_at} className="text-xs uppercase tracking-wider text-white/45">{new Date(post.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}</time>
              <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">{post.title}</h3>
              <ArtistUpdateBody body={post.body || ""} />
              <a href={post.html_url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-sm text-white/50 hover:text-white">View post and comments ↗</a>
            </article>)}
            {!posts.length && <div className="rounded-3xl border border-dashed border-white/15 px-6 py-14 text-center"><h3 className="text-xl">{unavailable ? "Updates are temporarily unavailable" : "No posts yet"}</h3><p className="mt-3 text-white/50">{unavailable ? "Please check back shortly." : `Posts from ${artist.name} will appear here.`}</p></div>}
          </div>
        </section>}
      </main>
      <Footer />
    </div>
  );
}
