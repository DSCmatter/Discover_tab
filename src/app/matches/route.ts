import { discover } from "@/lib/store";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ matches: discover().matches() });
}
