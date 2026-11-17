import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PROFILES } from "@/lib/profiles";
import { openDiscover, type DiscoverStore } from "@/lib/store";

const liker = PROFILES.find((p) => p.likesMe)!;
const nonLiker = PROFILES.find((p) => !p.likesMe)!;

describe("seed data", () => {
  it("has at least 30 profiles, some of which already like the user", () => {
    expect(PROFILES.length).toBeGreaterThanOrEqual(30);
    expect(PROFILES.filter((p) => p.likesMe).length).toBeGreaterThan(0);
    expect(new Set(PROFILES.map((p) => p.id)).size).toBe(PROFILES.length);
  });
});

describe("discover store", () => {
  let store: DiscoverStore;
  beforeEach(() => {
    store = openDiscover(":memory:");
  });

  it("feed never exposes who liked the user", () => {
    const json = JSON.stringify(store.feed());
    expect(json).not.toContain("likesMe");
    expect(Object.keys(store.feed()[0]!).sort()).toEqual(["age", "bio", "id", "interests", "name", "photo", "place"]);
  });

  it("a swiped profile never appears in the feed again", () => {
    store.swipe(nonLiker.id, "pass");
    store.swipe(liker.id, "like");
    const ids = store.feed().map((p) => p.id);
    expect(ids).not.toContain(nonLiker.id);
    expect(ids).not.toContain(liker.id);
    expect(ids).toHaveLength(PROFILES.length - 2);
  });

  it("liking someone who liked you is a match", () => {
    const outcome = store.swipe(liker.id, "like");
    expect(outcome).toMatchObject({ kind: "recorded", match: { profile: { id: liker.id } } });
    expect(store.matches().map((m) => m.profile.id)).toEqual([liker.id]);
  });

  it("a one-sided like is not a match and reveals nothing", () => {
    expect(store.swipe(nonLiker.id, "like")).toEqual({ kind: "recorded", match: null });
    expect(store.matches()).toEqual([]);
  });

  it("passing on someone who liked you looks identical to passing on anyone else", () => {
    expect(store.swipe(liker.id, "pass")).toEqual(store.swipe(nonLiker.id, "pass"));
    expect(store.matches()).toEqual([]);
  });

  it("a decision is final: retries replay it, a changed decision is refused", () => {
    store.swipe(liker.id, "pass");
    expect(store.swipe(liker.id, "pass")).toEqual({ kind: "recorded", match: null });
    expect(store.swipe(liker.id, "like")).toEqual({ kind: "already_decided", decision: "pass" });
    expect(store.matches()).toEqual([]);
  });

  it("rejects unknown profiles without recording anything", () => {
    expect(store.swipe("nope", "like")).toEqual({ kind: "unknown_profile" });
    expect(store.feed()).toHaveLength(PROFILES.length);
  });

  it("lists every mutual match, newest first", () => {
    const likers = PROFILES.filter((p) => p.likesMe).slice(0, 2);
    store.swipe(likers[0]!.id, "like", new Date("2026-01-01"));
    store.swipe(likers[1]!.id, "like", new Date("2026-01-02"));
    expect(store.matches().map((m) => m.profile.id)).toEqual([likers[1]!.id, likers[0]!.id]);
  });
});

describe("persistence", () => {
  const dir = mkdtempSync(join(tmpdir(), "discover-"));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it("swipes and matches survive reopening the database", () => {
    const path = join(dir, "db.sqlite");
    const first = openDiscover(path);
    first.swipe(liker.id, "like");
    first.swipe(nonLiker.id, "pass");
    first.close();

    const second = openDiscover(path);
    expect(second.matches().map((m) => m.profile.id)).toEqual([liker.id]);
    expect(second.feed().map((p) => p.id)).not.toContain(nonLiker.id);
    second.close();
  });
});
