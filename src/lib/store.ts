import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { PROFILES } from "./profiles";
import { buildFeed, listMatches, resolveSwipe, type Decision, type Swipe } from "./discover";

type SwipeRow = { profile_id: string; decision: Decision; swiped_at: string };

const toSwipe = (r: SwipeRow): Swipe => ({ profileId: r.profile_id, decision: r.decision, swipedAt: r.swiped_at });

export function openDiscover(dbPath: string) {
  if (dbPath !== ":memory:") mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`CREATE TABLE IF NOT EXISTS swipes (
    profile_id TEXT PRIMARY KEY,
    decision   TEXT NOT NULL CHECK (decision IN ('like', 'pass')),
    swiped_at  TEXT NOT NULL
  )`);

  const insert = db.prepare("INSERT INTO swipes (profile_id, decision, swiped_at) VALUES (?, ?, ?) ON CONFLICT DO NOTHING");
  const selectOne = db.prepare("SELECT profile_id, decision, swiped_at FROM swipes WHERE profile_id = ?");
  const selectAll = db.prepare("SELECT profile_id, decision, swiped_at FROM swipes");
  const profileById = new Map(PROFILES.map((p) => [p.id, p]));

  const allSwipes = () => (selectAll.all() as SwipeRow[]).map(toSwipe);

  return {
    feed: () => buildFeed(PROFILES, allSwipes()),
    matches: () => listMatches(PROFILES, allSwipes()),
    swipe(profileId: string, decision: Decision, now = new Date()) {
      const profile = profileById.get(profileId);
      if (profile) insert.run(profileId, decision, now.toISOString());
      const row = profile ? (selectOne.get(profileId) as SwipeRow | undefined) : undefined;
      return resolveSwipe(profile, row && toSwipe(row), decision);
    },
    close: () => db.close(),
  };
}

export type DiscoverStore = ReturnType<typeof openDiscover>;

let shared: DiscoverStore | undefined;

export function discover(): DiscoverStore {
  shared ??= openDiscover(process.env.DISCOVER_DB ?? ".data/discover.db");
  return shared;
}
