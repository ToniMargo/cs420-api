import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.headers.get("suresteps-session-token");

  if (!token) {
    return NextResponse.json(
      { error: "Missing session token" },
      { status: 401 }
    );
  }

  const data = await req.json();
  const { customerName, email, region, phone, whatsAppPhone, birthDay } = data;

  if (
    !customerName ||
    !email ||
    !region ||
    !phone ||
    !whatsAppPhone ||
    !birthDay
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { message: "Customer created successfully" },
    { status: 200 }
  );
}
