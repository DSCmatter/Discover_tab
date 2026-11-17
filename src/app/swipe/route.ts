import type { Decision } from "@/lib/discover";
import { discover } from "@/lib/store";

function parseSwipe(body: unknown): { profileId: string; decision: Decision } | null {
  if (typeof body !== "object" || body === null) return null;
  const { profileId, decision } = body as Record<string, unknown>;
  if (typeof profileId !== "string" || (decision !== "like" && decision !== "pass")) return null;
  return { profileId, decision };
}

export async function POST(req: Request) {
  const input = parseSwipe(await req.json().catch(() => null));
  if (!input) return Response.json({ error: "Body must be { profileId: string, decision: 'like' | 'pass' }" }, { status: 400 });

  const outcome = discover().swipe(input.profileId, input.decision);
  switch (outcome.kind) {
    case "recorded":
      return Response.json({ matched: outcome.match !== null, match: outcome.match });
    case "unknown_profile":
      return Response.json({ error: "Unknown profile" }, { status: 404 });
    case "already_decided":
      return Response.json({ error: "You already decided on this profile" }, { status: 409 });
  }
}
