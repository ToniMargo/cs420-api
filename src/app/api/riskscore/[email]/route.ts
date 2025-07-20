import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  const { email } = await params;
  console.log("Email parameter:", email);
  const token = request.headers.get("suresteps-session-token");

  console.log("Session token:", token);

  if (!token) {
    return NextResponse.json(
      { error: "Missing session token" },
      { status: 401 }
    );
  }

  if (!email) {
    return NextResponse.json(
      { error: "Missing email parameter" },
      { status: 400 }
    );
  }
  try {
    const response = await fetch(`https://dev.stedi.me/riskscore/${email}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "suresteps.session.token": token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: "Failed to retrieve risk score", details: errorData },
        { status: response.status }
      );
    }

    const riskScore = await response.text(); // returns a number string like "57"
    return NextResponse.json({ score: Number(riskScore) }, { status: 200 });
  } catch (error) {
    console.error("Risk score fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
