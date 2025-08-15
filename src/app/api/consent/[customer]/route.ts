import { NextRequest, NextResponse } from "next/server";
import { getConsent, setConsent } from "@/app/lib/store";
import { readSessionToken } from "@/app/lib/headers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { customer: string } }
) {
  const token = readSessionToken(req.headers);
  if (!token) {
    return new NextResponse("Missing or invalid token.", { status: 401 });
  }

  const bodyText = (await req.text()).trim().toLowerCase();
  if (!["true", "false"].includes(bodyText)) {
    return new NextResponse('Body must be "true" or "false" as plain text.', {
      status: 400,
    });
  }

  setConsent(params.customer, bodyText === "true");
  return new NextResponse("Consent updated successfully.", { status: 200 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { customer: string } }
) {
  const token = readSessionToken(req.headers);
  if (!token) {
    return new NextResponse("Missing or invalid token.", { status: 401 });
  }

  const consent = getConsent(params.customer);
  // NOTE: must be plain text "true" or "false"
  return new NextResponse(String(consent), { status: 200 });
}
