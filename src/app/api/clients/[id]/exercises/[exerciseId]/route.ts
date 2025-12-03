import { NextRequest, NextResponse } from "next/server";
import { db, exerciseLogs, eq, and } from "@/db";

// DELETE /api/clients/[id]/exercises/[exerciseId] - Delete an exercise log
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; exerciseId: string }> }
) {
  try {
    const { id: clientId, exerciseId } = await params;

    await db
      .delete(exerciseLogs)
      .where(
        and(
          eq(exerciseLogs.id, exerciseId),
          eq(exerciseLogs.clientId, clientId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return NextResponse.json(
      { error: "Failed to delete exercise" },
      { status: 500 }
    );
  }
}

