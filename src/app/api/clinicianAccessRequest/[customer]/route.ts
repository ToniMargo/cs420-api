import { NextResponse } from "next/server";
import { readSessionToken } from "@/app/lib/headers";
import { getClinicianAccessRequestsForCustomer } from "@/app/lib/store";

function formatDisplayDate(iso: string) {
  // Example: "Jul 22, 2025, 10:30:00 AM"
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ customer: string }> }
) {
  const { customer } = await params;

  const token = readSessionToken(req.headers);
  if (!token)
    return new NextResponse("Missing or invalid token.", { status: 401 });

  const items = getClinicianAccessRequestsForCustomer(
    customer.toLowerCase()
  ).map((r) => ({
    clinicianUsername: r.clinicianUsername,
    customerEmail: r.customerEmail,
    requestDate: formatDisplayDate(r.requestDateISO),
    status: r.status,
  }));

  return NextResponse.json(items, { status: 200 });
}
