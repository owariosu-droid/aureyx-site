import "server-only";
import { ownerConfig } from "@/lib/owner-service";
import OwnerEditLink from "@/components/OwnerEditLink";
export default function OwnerEditControl({ artist }: { artist?: string }) {
  return ownerConfig() ? <OwnerEditLink artist={artist} /> : null;
}
