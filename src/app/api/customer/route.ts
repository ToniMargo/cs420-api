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

  const requiredFields = {
    customerName,
    email,
    region,
    phone,
    whatsAppPhone,
    birthDay,
  };

  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      return NextResponse.json(
        { error: `Missing field: ${key}` },
        { status: 400 }
      );
    }
  }

  try {
    const response = await fetch("https://dev.stedi.me/customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "suresteps-session-token": token,
      },
      body: JSON.stringify(data),
    });

    const raw = await response.text();
    console.log("📥 Response status:", response.status);
    console.log("📦 Raw response:", raw);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Legacy API failed", details: raw },
        { status: response.status }
      );
    }

    let parsed = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { raw };
    }

    return NextResponse.json(
      { message: "Customer created successfully", data: parsed },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("🚨 Unexpected error:", (error as Error)?.message || error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
