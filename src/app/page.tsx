import { discover } from "@/lib/store";
import { AppShell } from "./ui/AppShell";

export const dynamic = "force-dynamic";

export default function Page() {
  const store = discover();
  return <AppShell initialFeed={store.feed()} initialMatches={store.matches()} />;
}
