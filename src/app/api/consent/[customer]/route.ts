import { NextResponse } from "next/server";
import { getConsent, setConsent } from "@/app/lib/store";
import { readSessionToken } from "@/app/lib/headers";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ customer: string }> }
) {
  const { customer } = await params;

  const token = readSessionToken(req.headers);
  if (!token)
    return new NextResponse("Missing or invalid token.", { status: 401 });

  const bodyText = (await req.text()).trim().toLowerCase();
  if (bodyText !== "true" && bodyText !== "false") {
    return new NextResponse('Body must be "true" or "false" as plain text.', {
      status: 400,
    });
  }

  setConsent(customer, bodyText === "true");
  return new NextResponse("Consent updated successfully.", { status: 200 });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ customer: string }> }
) {
  const { customer } = await params;

  const token = readSessionToken(req.headers);
  if (!token)
    return new NextResponse("Missing or invalid token.", { status: 401 });

  const consent = getConsent(customer);
  return new NextResponse(String(consent), { status: 200 });
}
