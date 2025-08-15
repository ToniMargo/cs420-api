import { NextResponse } from "next/server";
import { createUser } from "@/app/lib/store";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password)
    return new NextResponse("Bad Request", { status: 400 });
  createUser(email, password);
  return new NextResponse("Created", { status: 201 });
}
