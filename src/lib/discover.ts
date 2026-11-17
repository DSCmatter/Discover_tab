export type Decision = "like" | "pass";

export type Profile = {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  place: string;
  interests: string[];
  likesMe: boolean;
};

export type PublicProfile = Omit<Profile, "likesMe">;

export type Swipe = { profileId: string; decision: Decision; swipedAt: string };

export type Match = { profile: PublicProfile; matchedAt: string };

export type SwipeOutcome =
  | { kind: "recorded"; match: Match | null }
  | { kind: "unknown_profile" }
  | { kind: "already_decided"; decision: Decision };

// Allowlist, not omit: a field added to Profile later stays private until someone exposes it here.
export function toPublic(p: Profile): PublicProfile {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    photo: p.photo,
    bio: p.bio,
    place: p.place,
    interests: [...p.interests],
  };
}

export function buildFeed(profiles: readonly Profile[], swipes: readonly Swipe[]): PublicProfile[] {
  const seen = new Set(swipes.map((s) => s.profileId));
  return profiles.filter((p) => !seen.has(p.id)).map(toPublic);
}

function matchFor(profile: Profile, swipe: Swipe): Match | null {
  return swipe.decision === "like" && profile.likesMe
    ? { profile: toPublic(profile), matchedAt: swipe.swipedAt }
    : null;
}

export function listMatches(profiles: readonly Profile[], swipes: readonly Swipe[]): Match[] {
  const byId = new Map(profiles.map((p) => [p.id, p]));
  return swipes
    .flatMap((s) => {
      const p = byId.get(s.profileId);
      const m = p ? matchFor(p, s) : null;
      return m ? [m] : [];
    })
    .sort((a, b) => b.matchedAt.localeCompare(a.matchedAt));
}

// `stored` is the swipe that won the write. A retry of the same decision replays the same outcome,
// and a different decision is refused, so a pass can never be turned into a like to probe someone.
export function resolveSwipe(profile: Profile | undefined, stored: Swipe | undefined, requested: Decision): SwipeOutcome {
  if (!profile || !stored) return { kind: "unknown_profile" };
  if (stored.decision !== requested) return { kind: "already_decided", decision: stored.decision };
  return { kind: "recorded", match: matchFor(profile, stored) };
}
