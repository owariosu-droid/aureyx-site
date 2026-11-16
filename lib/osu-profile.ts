/** Presentation only: input HTML must come from the refresh script's allowlist sanitizer. */
function text(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&#([0-9]+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}
function trim(html: string) {
  return html.replace(/^(?:\s|<br\s*\/?>)+|(?:\s|<br\s*\/?>)+$/gi, "");
}
export function organizeOsuProfile(html: string) {
  const flat = html.replace(/<\/?(?:div|span)(?:\s[^>]*)?>/gi, "");
  const parts = flat.split(/<h2>([\s\S]*?)<\/h2>/gi);
  if (parts.length < 3 || trim(parts[0])) return [];
  const sections: { title: string; html: string; intro: string; id: string }[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    sections.push({ title: text(parts[i]).replace(/[✧]/g, "").trim(), html: trim(parts[i + 1] || ""), intro: "", id: "osu-section-" + sections.length });
  }
  // Keep the mapping introduction with its projects, rather than making a duplicate section.
  const mapping = sections.findIndex(section => section.title.toLowerCase() === "mapping");
  if (mapping >= 0 && sections[mapping + 1]?.title.toLowerCase().includes("mapping projects")) {
    sections[mapping + 1].intro = sections[mapping].html;
    sections.splice(mapping, 1);
  }
  return sections.map(section => {
    const isProjects = /mapping projects|thinking of mapping/i.test(section.title);
    const chunks = isProjects ? section.html.split(/(?:<br\s*\/?>|\s)*━{3,}(?:<br\s*\/?>|\s)*/g).filter(chunk => trim(chunk)) : [];
    const cards = chunks.map((chunk, index) => {
      let body = trim(chunk);
      const firstStrong = body.match(/<strong>([\s\S]*?)<\/strong>/i);
      const title = firstStrong ? text(firstStrong[1]) : "Mapping project " + (index + 1);
      const image = body.match(/<img\b[^>]*\bsrc="(\/(?:osu|external)\/[^"]+)"[^>]*>/i)?.[1];
      const href = body.match(/<a\b[^>]*href="(https:\/\/osu\.ppy\.sh\/beatmapsets\/[0-9]+[^"]*)"[^>]*>/i)?.[1];
      if (image) {
        body = body.replace(/<a\b[^>]*>\s*<img\b[^>]*>\s*<\/a>/i, "").replace(/<img\b[^>]*>/i, "");
      }
      if (firstStrong) body = body.replace(/<strong>[\s\S]*?<\/strong>/i, "");
      return { title, image, href, html: trim(body) };
    });
    return { ...section, cards };
  });
}
