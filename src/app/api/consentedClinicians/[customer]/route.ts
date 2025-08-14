import { NextRequest, NextResponse } from "next/server";
import {
  clinicianStore,
  ClinicianGrant,
  getSessionToken,
  oneYearFromNowISO,
} from "@/lib/consentStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const simpleEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AsyncParams = { params: Promise<{ customer: string }> };
export async function GET(req: NextRequest, { params }: AsyncParams) {
  const token = getSessionToken(req.headers);
  if (!token)
    return NextResponse.json(
      { error: "Missing session token" },
      { status: 401 }
    );

  const { customer } = await params;
  if (!customer)
    return NextResponse.json({ error: "Missing customer" }, { status: 400 });

  const grants = clinicianStore.get(customer) ?? [];
  const payload: [string, string][] = grants.map((g) => [g.email, g.expiresAt]);
  return NextResponse.json(payload, { status: 200 });
}

export async function PATCH(req: NextRequest, { params }: AsyncParams) {
  const token = getSessionToken(req.headers);
  if (!token)
    return NextResponse.json(
      { error: "Missing session token" },
      { status: 401 }
    );

  const { customer } = await params;
  if (!customer)
    return NextResponse.json({ error: "Missing customer" }, { status: 400 });

  const email = (await req.text()).trim();
  if (!email || !simpleEmail.test(email)) {
    return NextResponse.json(
      { error: "Body must be a valid clinician email as plain text" },
      { status: 400 }
    );
  }

  const current = clinicianStore.get(customer) ?? [];
  const expiresAt = oneYearFromNowISO();

  const idx = current.findIndex(
    (c) => c.email.toLowerCase() === email.toLowerCase()
  );
  if (idx >= 0)
    current[idx] = { email: current[idx].email, expiresAt } as ClinicianGrant;
  else current.push({ email, expiresAt });

  clinicianStore.set(customer, current);

  return new NextResponse("Clinician consent updated successfully.", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
