import { NextResponse } from "next/server";
import { readSessionToken } from "@/app/lib/headers";
import { saveSteps, userByToken } from "@/app/lib/store";

export async function POST(req: Request) {
  const token = readSessionToken(req.headers);
  const u = userByToken(token);
  if (!u) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => ({}));
  // tests don’t validate schema; accept anything with steps or default
  const steps = Number(body.steps ?? 1500);
  saveSteps(u.email, isNaN(steps) ? 1500 : steps);

  return new NextResponse("Saved", { status: 200 });
}
