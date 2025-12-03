import { NextRequest, NextResponse } from "next/server";
import { db, exerciseLogs, eq, desc } from "@/db";

// GET /api/clients/[id]/exercises - Get exercise logs for a client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params;
    
    const logs = await db
      .select()
      .from(exerciseLogs)
      .where(eq(exerciseLogs.clientId, clientId))
      .orderBy(desc(exerciseLogs.createdAt));

    return NextResponse.json({ 
      exercises: logs.map(log => ({
        id: log.id,
        exercise: log.exercise,
        weight: parseFloat(log.weight),
        reps: log.reps,
        sets: log.sets,
        notes: log.notes,
        date: log.createdAt.toISOString().split("T")[0],
      }))
    });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
}

// POST /api/clients/[id]/exercises - Add an exercise log
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params;
    const body = await request.json();
    const { exercise, weight, reps, sets, notes } = body;

    if (!exercise || weight === undefined || reps === undefined) {
      return NextResponse.json(
        { error: "Exercise, weight, and reps are required" },
        { status: 400 }
      );
    }

    const [newLog] = await db
      .insert(exerciseLogs)
      .values({
        clientId,
        exercise: exercise.trim(),
        weight: weight.toString(),
        reps,
        sets: sets || 1,
        notes: notes || null,
      })
      .returning();

    return NextResponse.json({
      exercise: {
        id: newLog.id,
        exercise: newLog.exercise,
        weight: parseFloat(newLog.weight),
        reps: newLog.reps,
        sets: newLog.sets,
        notes: newLog.notes,
        date: newLog.createdAt.toISOString().split("T")[0],
      }
    });
  } catch (error) {
    console.error("Error adding exercise:", error);
    return NextResponse.json(
      { error: "Failed to add exercise" },
      { status: 500 }
    );
  }
}

