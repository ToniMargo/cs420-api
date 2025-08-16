import { NextResponse } from "next/server";
import { readSessionToken } from "@/app/lib/headers";
import {
  createClinicianAccessRequest,
  deleteClinicianAccessRequest,
} from "@/app/lib/store";

type BodyShape = {
  clinicianUsername?: string;
  customerEmail?: string;
};

function validateBody(body: BodyShape) {
  const clinicianUsername = body.clinicianUsername?.trim();
  const customerEmail = body.customerEmail?.trim();
  if (!clinicianUsername || !customerEmail) {
    return {
      ok: false as const,
      msg: "clinicianUsername and customerEmail are required.",
    };
  }
  return {
    ok: true as const,
    clinicianUsername: clinicianUsername.toLowerCase(),
    customerEmail: customerEmail.toLowerCase(),
  };
}

export async function POST(req: Request) {
  const token = readSessionToken(req.headers);
  if (!token)
    return new NextResponse("Missing or invalid token.", { status: 401 });

  let body: BodyShape;
  try {
    body = await req.json();
  } catch {
    return new NextResponse("Body must be valid JSON.", { status: 400 });
  }

  const v = validateBody(body);
  if (!v.ok) return new NextResponse(v.msg, { status: 400 });

  createClinicianAccessRequest(v.clinicianUsername, v.customerEmail);
  return new NextResponse("Access request submitted successfully.", {
    status: 201,
  });
}

export async function DELETE(req: Request) {
  const token = readSessionToken(req.headers);
  if (!token)
    return new NextResponse("Missing or invalid token.", { status: 401 });

  let body: BodyShape;
  try {
    body = await req.json();
  } catch {
    return new NextResponse("Body must be valid JSON.", { status: 400 });
  }

  const v = validateBody(body);
  if (!v.ok) return new NextResponse(v.msg, { status: 400 });

  const removed = deleteClinicianAccessRequest(
    v.clinicianUsername,
    v.customerEmail
  );
  if (removed === 0) {
    // Not found is fine to return 200 per spec, but a hint helps during dev:
    return new NextResponse("Access request deleted successfully.", {
      status: 200,
    });
  }
  return new NextResponse("Access request deleted successfully.", {
    status: 200,
  });
}
