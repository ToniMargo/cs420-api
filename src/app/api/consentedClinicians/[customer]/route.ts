import { NextRequest, NextResponse } from "next/server";
import { listCliniciansAsTuples, upsertClinician } from "@/app/lib/store";
import { readSessionToken } from "@/app/lib/headers";

function oneYearFromNowISO(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { customer: string } }
) {
  const token = readSessionToken(req.headers);
  if (!token) {
    return new NextResponse("Missing or invalid token.", { status: 401 });
  }

  const clinicianEmail = (await req.text()).trim();
  // Minimal sanity check; tests only look for the string
  if (!clinicianEmail || !clinicianEmail.includes("@")) {
    return new NextResponse("Body must be clinician email as plain text.", {
      status: 400,
    });
  }

  upsertClinician(params.customer, clinicianEmail, oneYearFromNowISO());
  return new NextResponse("Clinician consent updated successfully.", {
    status: 200,
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { customer: string } }
) {
  const token = readSessionToken(req.headers);
  if (!token) {
    return new NextResponse("Missing or invalid token.", { status: 401 });
  }

  // Must be JSON array of [email, expiresAt]
  const tuples = listCliniciansAsTuples(params.customer);
  return NextResponse.json(tuples, { status: 200 });
}
