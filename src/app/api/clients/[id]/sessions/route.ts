import { NextRequest, NextResponse } from "next/server";
import { db, clients, eq } from "@/db";

// PUT /api/clients/[id]/sessions - Update session count
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, count } = body;

    // Get current client
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    let newSessionsRemaining = client.sessionsRemaining;
    let newTotalSessions = client.totalSessions;
    let newLastSessionDate = client.lastSessionDate;

    switch (action) {
      case "increment":
        newSessionsRemaining += 1;
        newTotalSessions += 1;
        break;
      case "decrement":
        newSessionsRemaining = Math.max(0, newSessionsRemaining - 1);
        newLastSessionDate = new Date();
        break;
      case "set":
        if (typeof count !== "number") {
          return NextResponse.json(
            { error: "Count is required for set action" },
            { status: 400 }
          );
        }
        newSessionsRemaining = Math.max(0, count);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action. Use increment, decrement, or set" },
          { status: 400 }
        );
    }

    const [updatedClient] = await db
      .update(clients)
      .set({
        sessionsRemaining: newSessionsRemaining,
        totalSessions: newTotalSessions,
        lastSessionDate: newLastSessionDate,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, id))
      .returning();

    return NextResponse.json({
      client: {
        id: updatedClient.id,
        sessionsRemaining: updatedClient.sessionsRemaining,
        totalSessions: updatedClient.totalSessions,
        lastSessionDate: updatedClient.lastSessionDate?.toISOString().split("T")[0] || null,
      },
    });
  } catch (error) {
    console.error("Error updating sessions:", error);
    return NextResponse.json(
      { error: "Failed to update sessions" },
      { status: 500 }
    );
  }
}

