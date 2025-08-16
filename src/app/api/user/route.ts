import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const {
      userName,
      email,
      phone,
      region,
      birthDate,
      password,
      verifyPassword,
      agreedToTermsOfUseDate,
      agreedToCookiePolicyDate,
      agreedToPrivacyPolicyDate,
      agreedToTextMessageDate,
    } = data;

    if (!userName || !email || password !== verifyPassword) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const stediResponse = await fetch("https://dev.stedi.me/user", {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName,
        email,
        phone,
        region,
        birthDate,
        password,
        verifyPassword,
        agreedToTermsOfUseDate,
        agreedToCookiePolicyDate,
        agreedToPrivacyPolicyDate,
        agreedToTextMessageDate,
      }),
    });

    const result = await stediResponse.text();

    if (!stediResponse.ok) {
      return NextResponse.json(
        { error: result || "Failed to create user on Stedi" },
        { status: stediResponse.status }
      );
    }

    return NextResponse.json(
      { message: "User created successfully", userId: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Stedi connection error:", error);
    return NextResponse.json(
      { error: "Failed to connect to Stedi" },
      { status: 500 }
    );
  }
}
