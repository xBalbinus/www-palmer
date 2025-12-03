import { NextRequest, NextResponse } from "next/server";
import { db, clients, eq } from "@/db";
import { authenticateXORSUser } from "@/lib/xors-api";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Authenticate with XORS API
    let xorsUser;
    try {
      const response = await authenticateXORSUser(email, password);
      xorsUser = response.user;
    } catch {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Find the client in Palmer's database
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.xorsUserId, xorsUser.id))
      .limit(1);

    if (!client) {
      return NextResponse.json(
        { error: "You are not registered as a client. Please contact Coach Palmer." },
        { status: 403 }
      );
    }

    // Set auth cookie with client ID and XORS user ID
    const cookieStore = await cookies();
    const sessionData = JSON.stringify({
      clientId: client.id,
      xorsUserId: xorsUser.id,
      email: client.email,
      name: client.name,
    });
    
    // Simple base64 encoding for session (in production, use proper JWT)
    const sessionToken = Buffer.from(sessionData).toString("base64");
    
    cookieStore.set("palmer_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: client.id,
        name: client.name,
        email: client.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}

