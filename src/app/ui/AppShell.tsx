"use client";

import { useState } from "react";
import type { Match, PublicProfile } from "@/lib/discover";
import { Discover } from "./Discover";

const TABS = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "discover", label: "Discover", icon: "♥" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function AppShell(props: { initialFeed: PublicProfile[]; initialMatches: Match[] }) {
  const [tab, setTab] = useState<Tab>("discover");
  return (
    <div className="shell">
      <main className="screen">
        <div hidden={tab !== "home"} className="home" aria-label="Home" />
        <div hidden={tab !== "discover"}>
          <Discover {...props} />
        </div>
      </main>
      <nav className="tabbar" aria-label="Main">
        {TABS.map((t) => (
          <button key={t.id} aria-current={tab === t.id ? "page" : undefined} onClick={() => setTab(t.id)}>
            <span aria-hidden>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
