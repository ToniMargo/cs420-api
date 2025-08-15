import { NextResponse } from "next/server";
import { authenticate } from "@/app/lib/store";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const token = authenticate(email, password);
  if (!token) return new NextResponse("Unauthorized", { status: 401 });

  // Set BOTH header names (tests read dotted; Vercel sometimes rewrites)
  return NextResponse.json(
    { ok: true },
    {
      status: 200,
      headers: {
        "suresteps.session.token": token,
        "suresteps-session-token": token,
      },
    }
  );
}
