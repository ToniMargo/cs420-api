import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  //const token = req.headers.get('suresteps.session.token');
  if (!data.userName || !data.password) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  // fetch stedi.app.
  try {
    const response = await fetch("https://dev.stedi.me/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName: data.userName,
        password: data.password,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Login failed", details: errorText },
        { status: response.status }
      );
    }
    const sessionToken = await response.text();
    return new NextResponse(sessionToken, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
