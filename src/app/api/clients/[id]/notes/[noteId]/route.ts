import { NextRequest, NextResponse } from "next/server";
import { db, clientNotes, eq, and } from "@/db";

// DELETE /api/clients/[id]/notes/[noteId] - Delete a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { id: clientId, noteId } = await params;

    const [deletedNote] = await db
      .delete(clientNotes)
      .where(and(eq(clientNotes.id, noteId), eq(clientNotes.clientId, clientId)))
      .returning();

    if (!deletedNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}

