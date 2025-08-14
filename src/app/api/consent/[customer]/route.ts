import { NextRequest, NextResponse } from "next/server";
import { consentStore, getSessionToken } from "@/lib/consentStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { customer: string } };

export async function GET(req: NextRequest, { params }: Params) {
  const token = getSessionToken(req.headers);
  if (!token)
    return NextResponse.json(
      { error: "Missing session token" },
      { status: 401 }
    );

  const { customer } = params;
  if (!customer)
    return NextResponse.json({ error: "Missing customer" }, { status: 400 });

  const value = consentStore.get(customer) ?? false;
  return new NextResponse(value ? "true" : "false", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const token = getSessionToken(req.headers);
  if (!token)
    return NextResponse.json(
      { error: "Missing session token" },
      { status: 401 }
    );

  const { customer } = params;
  if (!customer)
    return NextResponse.json({ error: "Missing customer" }, { status: 400 });

  const raw = (await req.text()).trim().toLowerCase();
  if (raw !== "true" && raw !== "false") {
    return NextResponse.json(
      { error: "Body must be plain text 'true' or 'false'" },
      { status: 400 }
    );
  }
  consentStore.set(customer, raw === "true");
  return new NextResponse("Consent updated successfully.", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
