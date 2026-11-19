const names: Record<string, string> = { HD: "Hidden", HR: "Hard Rock", DT: "Double Time", NF: "No Fail", CL: "Classic", NM: "No Mod", NC: "Nightcore", EZ: "Easy", HT: "Half Time", FL: "Flashlight", SD: "Sudden Death", PF: "Perfect" };
const paths: Record<string, string> = {
  HD: "M12 25Q24 10 36 25Q24 40 12 25ZM16 36 34 14M24 21v8",
  HR: "m12 29 6-13 6 8 6-8 6 13-12 6Z",
  DT: "m12 16 11 9-11 9Zm13 0 11 9-11 9Z",
  NF: "M14 15h20v12Q34 36 24 39 14 36 14 27ZM19 26l4 4 7-9",
  CL: "M34 18a13 13 0 1 0 1 15M34 12v8h-8M24 19v9l6 3",
  NM: "M16 32V18l16 14V18",
};

export default function OsuMods({ mods, unknown = false }: { mods: { acronym: string; settings?: object }[]; unknown?: boolean }) {
  if (unknown) return <span className="osu-mods-unknown">Mods not specified</span>;
  const shown = mods.length ? mods : [{ acronym: "NM" }];
  return <ul className="osu-mod-icons" aria-label="Mods used">{shown.map((mod, index) => {
    const name = names[mod.acronym] || mod.acronym;
    const settings = mod.settings && Object.keys(mod.settings).length ? ` · ${JSON.stringify(mod.settings)}` : "";
    return <li key={`${mod.acronym}-${index}`} title={name + settings}>
      <svg viewBox="0 0 48 54" role="img" aria-label={name + settings} className={`osu-mod-icon osu-mod-${mod.acronym}`}>
        <path className="osu-mod-frame" d="M24 2 45 13v27L24 52 3 40V13Z" />
        {paths[mod.acronym] ? <path className="osu-mod-symbol" d={paths[mod.acronym]} /> : <circle className="osu-mod-symbol" cx="24" cy="25" r="12" />}
        <text x="24" y="46" textAnchor="middle">{mod.acronym}</text>
      </svg>
    </li>;
  })}</ul>;
}
