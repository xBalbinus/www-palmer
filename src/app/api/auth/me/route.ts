import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, clients, clientNotes, eq, desc } from "@/db";

export async function GET() {
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

    // Get client data
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, session.clientId))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Get notes
    const notes = await db
      .select()
      .from(clientNotes)
      .where(eq(clientNotes.clientId, client.id))
      .orderBy(desc(clientNotes.createdAt));

    return NextResponse.json({
      user: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        sessionsRemaining: client.sessionsRemaining,
        totalSessions: client.totalSessions,
        goals: client.goals,
        currentWeight: client.currentWeight ? parseFloat(client.currentWeight) : null,
        targetWeight: client.targetWeight ? parseFloat(client.targetWeight) : null,
        lastSessionDate: client.lastSessionDate?.toISOString().split("T")[0] || null,
        createdAt: client.createdAt.toISOString().split("T")[0],
        notes: notes.map((n) => ({
          id: n.id,
          date: n.createdAt.toISOString().split("T")[0],
          content: n.content,
        })),
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}

