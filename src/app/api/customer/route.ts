import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Accept header: suresteps.session.token (with dot, not hyphen)
  const token = req.headers.get("suresteps.session.token"); // fallback just in case

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
    const stediResponse = await fetch("https://dev.stedi.me/customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "suresteps.session.token": token, // must match test format exactly
      },
      body: JSON.stringify(payload),
    });

    const raw = await stediResponse.text();

    // If already exists, test accepts 409
    if (stediResponse.status === 409) {
      return NextResponse.json(
        { message: "Customer already exists" },
        { status: 409 }
      );
    }

    // If success, test expects 200
    if (stediResponse.ok) {
      return NextResponse.json(
        { message: "Customer created" },
        { status: 200 }
      );
    }

    // Any other failure from STEDI
    return NextResponse.json(
      { error: "Failed to create customer", details: raw },
      { status: stediResponse.status }
    );
  } catch (error: unknown) {
    console.error("Customer creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
