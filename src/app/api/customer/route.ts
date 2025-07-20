import { NextRequest, NextResponse } from "next/server";

// Simple in-memory store (optional for local tracking)
type Customer = {
  customerName: string;
  email: string;
  region: string;
  phone: string;
  whatsAppPhone: string;
  birthDate: string;
};

const customers = new Map<string, Customer>();

export async function POST(req: NextRequest) {
  const headers = req.headers;
  const token =
    headers.get("suresteps.session.token") ||
    headers.get("suresteps-session-token");

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

  // Use the required format for legacy STEDI API
  const payload = {
    customerName: data.customerName,
    email: data.email,
    region: data.region,
    phone: data.phone,
    whatsAppPhone: data.whatsAppPhone,
    birthDate,
  };

  try {
    const response = await fetch("https://dev.stedi.me/customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "suresteps.session.token": token,
      },
      body: JSON.stringify(payload),
    });

    const raw = await response.text();

    if (response.status === 409) {
      return NextResponse.json(
        { message: "Customer already exists", raw },
        { status: 409 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "Legacy API failed", raw },
        { status: response.status }
      );
    }

    // Track in local memory (optional)
    customers.set(data.email, payload);

    return NextResponse.json({ message: "Customer created" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
