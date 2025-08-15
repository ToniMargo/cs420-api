import { NextResponse } from "next/server";
import { readSessionToken } from "@/app/lib/headers";
import { userByToken } from "@/app/lib/store";

export async function POST(req: Request) {
  const token = readSessionToken(req.headers);
  if (!userByToken(token))
    return new NextResponse("Unauthorized", { status: 401 });
}
