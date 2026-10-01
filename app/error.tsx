"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="site-state"><div><p className="transmission-eyebrow">Aureyx</p><h1>Something went wrong.</h1><p>The page could not be loaded. Try it again without losing your place.</p><button type="button" onClick={reset}>Try again</button></div></main>; }
