import { NextRequest, NextResponse } from "next/server";
import { db, clients, clientNotes, eq } from "@/db";

// GET /api/clients/[id] - Get a specific client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const notes = await db
      .select()
      .from(clientNotes)
      .where(eq(clientNotes.clientId, client.id));

    return NextResponse.json({
      client: {
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
        xorsUserId: client.xorsUserId,
        notes: notes.map((n) => ({
          id: n.id,
          date: n.createdAt.toISOString().split("T")[0],
          content: n.content,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id] - Update a client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (body.goals !== undefined) updateData.goals = body.goals;
    if (body.currentWeight !== undefined) {
      updateData.currentWeight = body.currentWeight ? body.currentWeight.toString() : null;
    }
    if (body.targetWeight !== undefined) {
      updateData.targetWeight = body.targetWeight ? body.targetWeight.toString() : null;
    }
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.sessionsRemaining !== undefined) {
      updateData.sessionsRemaining = body.sessionsRemaining;
    }
    if (body.totalSessions !== undefined) {
      updateData.totalSessions = body.totalSessions;
    }
    if (body.lastSessionDate !== undefined) {
      updateData.lastSessionDate = body.lastSessionDate ? new Date(body.lastSessionDate) : null;
    }

    const [updatedClient] = await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, id))
      .returning();

    if (!updatedClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({
      client: {
        id: updatedClient.id,
        name: updatedClient.name,
        email: updatedClient.email,
        phone: updatedClient.phone,
        sessionsRemaining: updatedClient.sessionsRemaining,
        totalSessions: updatedClient.totalSessions,
        goals: updatedClient.goals,
        currentWeight: updatedClient.currentWeight ? parseFloat(updatedClient.currentWeight) : null,
        targetWeight: updatedClient.targetWeight ? parseFloat(updatedClient.targetWeight) : null,
        lastSessionDate: updatedClient.lastSessionDate?.toISOString().split("T")[0] || null,
        createdAt: updatedClient.createdAt.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Delete a client
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Notes will be cascade deleted due to foreign key constraint
    const [deletedClient] = await db
      .delete(clients)
      .where(eq(clients.id, id))
      .returning();

    if (!deletedClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}

