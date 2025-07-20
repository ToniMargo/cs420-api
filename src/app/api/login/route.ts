import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (!data.userName || !data.password) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const response = await fetch("https://dev.stedi.me/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/text", // required by STEDI
      },
      body: JSON.stringify({
        userName: data.userName,
        password: data.password,
      }),
    });

    const sessionToken = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Login failed", details: sessionToken },
        { status: response.status }
      );
    }

    return new NextResponse(sessionToken, {
      status: 200,
      headers: {
        "Content-Type": "application/text", // required for the test to parse the token
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
