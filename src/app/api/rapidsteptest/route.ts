import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("📩 POST /rapidsteptest");

  const token =
    req.headers.get("suresteps.session.token") ||
    req.headers.get("suresteps-session-token");

  if (!token) {
    return NextResponse.json(
      { error: "Missing session token" },
      { status: 401 }
    );
  }

  const data = await req.json();
  const { customer, startTime, stepPoints, deviceId, totalSteps } = data;

  // Validate required fields
  if (!customer || !startTime || !stepPoints || !deviceId || !totalSteps) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Build the payload
  const payload = {
    customer,
    startTime:
      typeof startTime === "string" ? new Date(startTime).getTime() : startTime,
    stepPoints: Array.isArray(stepPoints)
      ? stepPoints.map((p) => (typeof p === "number" ? p : 1)) // handle bad types gracefully
      : [],
    deviceId,
    totalSteps,
  };

  try {
    const response = await fetch("https://dev.stedi.me/rapidsteptest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "suresteps.session.token": token,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: "Failed to save step data", details: text },
        { status: response.status }
      );
    }

    return new NextResponse("Saved", { status: 200 });
  } catch (error) {
    console.error("❌ Error in /rapidsteptest:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
