import { NextRequest, NextResponse } from "next/server";
import { db, clientNotes, clients, eq } from "@/db";

// POST /api/clients/[id]/notes - Add a note to a client
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Note content is required" },
        { status: 400 }
      );
    }

    // Verify client exists
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const [newNote] = await db
      .insert(clientNotes)
      .values({
        clientId,
        content,
      })
      .returning();

    return NextResponse.json({
      note: {
        id: newNote.id,
        date: newNote.createdAt.toISOString().split("T")[0],
        content: newNote.content,
      },
    });
  } catch (error) {
    console.error("Error adding note:", error);
    return NextResponse.json(
      { error: "Failed to add note" },
      { status: 500 }
    );
  }
}

