import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, clients, eq } from "@/db";

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
    const { phone } = body;

    // Update client in Palmer's database
    const [updatedClient] = await db
      .update(clients)
      .set({
        phone: phone || null,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, session.clientId))
      .returning();

    if (!updatedClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        phone: updatedClient.phone,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}

