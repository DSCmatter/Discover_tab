import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { PROFILES } from "@/lib/profiles";

process.env.DISCOVER_DB = join(mkdtempSync(join(tmpdir(), "discover-api-")), "db.sqlite");

let feed: typeof import("@/app/feed/route");
let swipe: typeof import("@/app/swipe/route");
let matches: typeof import("@/app/matches/route");

beforeAll(async () => {
  [feed, swipe, matches] = await Promise.all([import("@/app/feed/route"), import("@/app/swipe/route"), import("@/app/matches/route")]);
});

const post = (body: unknown) =>
  swipe.POST(new Request("http://x/swipe", { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } }));

describe("HTTP API", () => {
  it("GET /feed returns public profiles only", async () => {
    const body = await feed.GET().json();
    expect(body.profiles).toHaveLength(PROFILES.length);
    expect(JSON.stringify(body)).not.toContain("likesMe");
  });

  it("POST /swipe returns matched: true only for mutual likes", async () => {
    const liker = PROFILES.find((p) => p.likesMe)!;
    const other = PROFILES.find((p) => !p.likesMe)!;
    expect(await (await post({ profileId: other.id, decision: "like" })).json()).toEqual({ matched: false, match: null });
    const res = await (await post({ profileId: liker.id, decision: "like" })).json();
    expect(res.matched).toBe(true);
    expect(res.match.profile.id).toBe(liker.id);
    expect((await matches.GET().json()).matches.map((m: { profile: { id: string } }) => m.profile.id)).toEqual([liker.id]);
  });

  it("POST /swipe validates input and refuses a changed decision", async () => {
    expect((await post({ profileId: 1, decision: "like" })).status).toBe(400);
    expect((await post({ profileId: "p01", decision: "superlike" })).status).toBe(400);
    expect((await post({ profileId: "zzz", decision: "pass" })).status).toBe(404);
    const target = PROFILES.at(-1)!.id;
    expect((await post({ profileId: target, decision: "pass" })).status).toBe(200);
    expect((await post({ profileId: target, decision: "like" })).status).toBe(409);
  });
});
