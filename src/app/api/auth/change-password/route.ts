import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, clients, eq } from "@/db";

const XORS_API_URL = process.env.XORS_API_URL || "https://api.xors.xyz";

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("palmer_session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Decode session
    let session;
    try {
      session = JSON.parse(Buffer.from(sessionToken, "base64").toString());
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    // Get client to find their API key
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, session.clientId))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Call XORS API to change password
    const response = await fetch(`${XORS_API_URL}/api/users/update-viewer-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": client.xorsApiKey || "",
      },
      body: JSON.stringify({
        password: currentPassword,
        new_password: newPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Password change failed" }));
      return NextResponse.json(
        { error: error.message || "Current password is incorrect" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}

