"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type GalleryImage = { src: string; alt: string; width?: number; height?: number };

export default function GalleryLightbox({ images, variant = "gallery" }: { images: GalleryImage[]; variant?: "gallery" | "concept" }) {
  const [active, setActive] = useState<number | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const close = useCallback(() => setActive(null), []);
  const move = useCallback((step: number) => setActive((value) => value === null ? null : (value + step + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (active === null) return;
    previousFocus.current = document.activeElement as HTMLElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = oldOverflow; window.removeEventListener("keydown", onKey); previousFocus.current?.focus(); };
  }, [active, close, move]);

  return <>
    <div className={variant === "concept" ? "yoru-concept-grid" : "artist-gallery-grid"}>
      {images.map((image, index) => <figure key={image.src} className={variant === "concept" && index === 0 ? "is-wide" : ""}>
        <button type="button" className="gallery-open" onClick={() => setActive(index)} aria-label={`Open ${image.alt}`}>
          <Image src={image.src} alt={image.alt} width={image.width || 1536} height={image.height || 1176} quality={82} sizes={variant === "concept" && index === 0 ? "(max-width: 900px) 100vw, 1200px" : "(max-width: 768px) 100vw, 50vw"} />
          <span>View</span>
        </button>
        {variant === "concept" && <figcaption>Concept {String(index + 1).padStart(2,"0")}</figcaption>}
      </figure>)}
    </div>
    {active !== null && <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={`Artwork viewer, image ${active + 1} of ${images.length}`} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <button ref={closeButton} type="button" className="gallery-close" onClick={close} aria-label="Close artwork viewer"><X /></button>
      {images.length > 1 && <button type="button" className="gallery-previous" onClick={() => move(-1)} aria-label="Previous artwork"><ChevronLeft /></button>}
      <figure><Image src={images[active].src} alt={images[active].alt} width={images[active].width || 1536} height={images[active].height || 1176} priority sizes="95vw" /><figcaption>{images[active].alt} · {active + 1} / {images.length}</figcaption></figure>
      {images.length > 1 && <button type="button" className="gallery-next" onClick={() => move(1)} aria-label="Next artwork"><ChevronRight /></button>}
    </div>}
  </>;
}
