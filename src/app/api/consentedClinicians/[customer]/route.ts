import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ customer: string }> }
) {
  //console.log('GET request received for consent');
  const { customer } = await params;
  console.log("Customer parameter:", customer);
  const token = request.headers.get("suresteps-session-token");
  console.log("Session token:", token);

  if (!token) {
    return new NextResponse("Missing session token", { status: 401 });
  }

  if (!customer) {
    return new NextResponse("Customer parameter is required", { status: 400 });
  }

  const bodyText = await request.json();
  //const consentGiven = bodyText.trim().toLowerCase() === 'true';
  const consentGiven = Boolean(bodyText.consent);

  const result = await prisma.consent.upsert({
    where: { customer },
    update: { consent: consentGiven },
    create: { customer, consent: consentGiven },
  });
  console.log("Inserted/Updated Consent Record:", result);

  // TODO: Update consent in your database or service here
  console.log(
    `Updating consent for ${customer}: ${consentGiven} (Token: ${token})`
  );
  console.log(Object.keys(prisma));

  return NextResponse.json(
    { message: "Consent updated successfully." },
    { status: 200 }
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customer: string }> }
) {
  const { customer } = await params;
  const token = request.headers.get("suresteps-session-token");

  if (!token) {
    return new NextResponse("Missing session token", { status: 401 });
  }

  const record = await prisma.consent.findUnique({
    where: { customer },
  });

  return new NextResponse(String(record?.consent ?? false), {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
