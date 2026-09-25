import Markdown from "react-markdown";

// GitHub's upload UI sometimes produces an HTML img tag. Convert only its
// HTTPS source to Markdown; all remaining raw HTML is ignored by the renderer.
export function normalizeUpdateImages(body: string) {
  return body.replace(/<img\b[^>]*>/gi, (tag) => {
    const source = tag.match(/\bsrc=["'](https:\/\/[^"']+)["']/i)?.[1];
    return source ? `\n\n![Attached photo](${source.replace(/[()\s]/g, (char) => encodeURIComponent(char))})\n\n` : "";
  });
}

export default function ArtistUpdateBody({ body }: { body: string }) {
  return <Markdown skipHtml components={{
    p: ({ children }) => <div className="my-4 whitespace-pre-wrap leading-8 text-white/75">{children}</div>,
    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{children}</a>,
    img: ({ src, alt }) => typeof src === "string" && src.startsWith("https://") ? (
      // Uploaded photos have arbitrary dimensions and are served directly.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt || "Artist update photo"} loading="lazy" referrerPolicy="no-referrer" className="my-6 h-auto max-h-[800px] max-w-full rounded-2xl object-contain" />
    ) : null,
    ul: ({ children }) => <ul className="ml-6 list-disc">{children}</ul>,
    ol: ({ children }) => <ol className="ml-6 list-decimal">{children}</ol>,
    h1: ({ children }) => <h3 className="mt-6 text-2xl font-semibold">{children}</h3>,
    h2: ({ children }) => <h3 className="mt-6 text-xl font-semibold">{children}</h3>,
  }}>{normalizeUpdateImages(body)}</Markdown>;
}
