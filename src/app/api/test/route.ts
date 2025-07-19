// src/app/api/test/route.ts
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ status: "working" });
}
