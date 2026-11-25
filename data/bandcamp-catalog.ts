import aureyx from "@/data/external/bandcamp.json";
import lyrlvst from "@/data/external/lyrlvst-bandcamp.json";

export type BandcampRelease = {
  title: string;
  link: string;
  image: string;
  price: string;
  id: number;
  type: string;
  released: string | null;
  preview: string | null;
  artist?: string;
  access?: string;
};

export const bandcampCatalog: BandcampRelease[] = [...aureyx, ...lyrlvst];
