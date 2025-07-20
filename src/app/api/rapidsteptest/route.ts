import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("POST request received for rapid step test");
  const token =
    req.headers.get("suresteps.session.token") ||
    req.headers.get("suresteps-session-token"); // fallback just in case

  console.log("Session token:", token);

  if (!token) {
    return NextResponse.json(
      { error: "Missing session token" },
      { status: 401 }
    );
  }

  const data = await req.json();
  const {
    customer,
    startTime,
    stepPoints,
    deviceId,
    totalSteps,
    stopTime,
    testTime,
  } = data;
  console.log("Request body to old API:", {
    customer,
    startTime,
    stepPoints,
    deviceId,
    totalSteps,
    stopTime,
    testTime,
  });

  if (!customer || !startTime || !stepPoints || !deviceId || !totalSteps) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Forward to old API
  try {
    // Convert startTime to Unix timestamp if it's an ISO string
    let startTimeUnix = startTime;
    if (typeof startTime === "string") {
      startTimeUnix = new Date(startTime).getTime();
    }

    // Convert stopTime to Unix timestamp if it's an ISO string
    let stopTimeUnix = stopTime;
    if (stopTime && typeof stopTime === "string") {
      stopTimeUnix = new Date(stopTime).getTime();
    }

    // Ensure stepPoints is an array of numbers
    let stepPointsNumbers = stepPoints;
    if (
      Array.isArray(stepPoints) &&
      stepPoints.length > 0 &&
      typeof stepPoints[0] === "object"
    ) {
      // If stepPoints is array of objects with x,y, convert to array of numbers
      stepPointsNumbers = stepPoints.map((point, index) => index + 1); // Simple conversion to sequential numbers
    }

    const requestBody = JSON.stringify({
      customer,
      startTime: startTimeUnix,
      stepPoints: stepPointsNumbers,
      deviceId,
      totalSteps,
      ...(stopTime && { stopTime: stopTimeUnix }),
      ...(testTime && { testTime }),
    });

    console.log("Converted request body to old API:", JSON.parse(requestBody));

    const response = await fetch("https://dev.stedi.me/rapidsteptest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "suresteps.session.token": token,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Old API response status:", response.status);
    console.log(
      "Old API response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const contentType = response.headers.get("content-type");
    let errorText = "";
    let responseText = "";
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        errorText = await response.json();
        console.log("Old API error JSON:", errorText);
      } else {
        responseText = await response.text();
        errorText = responseText;
        console.log("Old API error text:", responseText);
      }
      console.error("Rapid step test failed:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to save step data", details: errorText },
        { status: response.status }
      );
    }

    // Log success response
    responseText = await response.text();
    console.log("Old API success response text:", responseText);
    // Return "Saved" response as requested
    return new NextResponse("Saved", { status: 200 });
  } catch (error) {
    console.error("Rapid step test error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
