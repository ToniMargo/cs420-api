import { NextResponse } from "next/server";
import { listCliniciansAsTuples, upsertClinician } from "@/app/lib/store";
import { readSessionToken } from "@/app/lib/headers";

function oneYearFromNowISO() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

export async function PATCH(
  req: Request,
  context: { params: { customer: string } }
) {
  const { customer } = context.params as { customer: string };

  const token = readSessionToken(req.headers);
  if (!token)
    return new NextResponse("Missing or invalid token.", { status: 401 });

  const clinicianEmail = (await req.text()).trim();
  if (!clinicianEmail || !clinicianEmail.includes("@")) {
    return new NextResponse("Body must be clinician email as plain text.", {
      status: 400,
    });
  }

  upsertClinician(customer, clinicianEmail, oneYearFromNowISO());
  return new NextResponse("Clinician consent updated successfully.", {
    status: 200,
  });
}

export async function GET(
  req: Request,
  context: { params: { customer: string } }
) {
  const { customer } = context.params as { customer: string };

  const token = readSessionToken(req.headers);
  if (!token)
    return new NextResponse("Missing or invalid token.", { status: 401 });

  const tuples = listCliniciansAsTuples(customer);
  return NextResponse.json(tuples, { status: 200 });
}
