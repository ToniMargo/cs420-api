import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const headers = req.headers;
  const token =
    headers.get("suresteps.session.token") ||
    headers.get("suresteps-session-token");

  console.log("🔑 Incoming token:", token);

  if (!token) {
    return NextResponse.json(
      { error: "Missing session token" },
      { status: 401 }
    );
  }

  const data = await req.json();
  const birthDate = data.birthDate || data.birthDay;

  const requiredFields = {
    customerName: data.customerName,
    email: data.email,
    region: data.region,
    phone: data.phone,
    whatsAppPhone: data.whatsAppPhone,
    birthDate,
  };

  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      return NextResponse.json(
        { error: `Missing field: ${key}` },
        { status: 400 }
      );
    }
  }

  const payload = {
    customerName: data.customerName,
    email: data.email,
    region: data.region,
    phone: data.phone,
    whatsAppPhone: data.whatsAppPhone,
    birthDate,
  };

  try {
    const legacyResponse = await fetch("https://dev.stedi.me/customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "suresteps.session.token": token,
      },
      body: JSON.stringify(payload),
    });

    const raw = await legacyResponse.text();

    console.log("📨 STEDI response code:", legacyResponse.status);
    console.log("📦 STEDI raw body:", raw);

    if (legacyResponse.status === 409) {
      return NextResponse.json({ message: "Already exists" }, { status: 409 });
    }

    if (!legacyResponse.ok) {
      return NextResponse.json(
        { error: "Legacy API failed", raw },
        { status: legacyResponse.status }
      );
    }

    return NextResponse.json({ message: "Customer created" }, { status: 200 });
  } catch (err: unknown) {
    console.error("🔥 Error contacting STEDI:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
