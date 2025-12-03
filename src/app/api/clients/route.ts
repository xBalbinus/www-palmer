import { NextRequest, NextResponse } from "next/server";
import { db, clients, clientNotes, eq, desc } from "@/db";
import { createXORSUser, generateClientPassword } from "@/lib/xors-api";

// GET /api/clients - List all clients
export async function GET() {
  try {
    const allClients = await db
      .select()
      .from(clients)
      .orderBy(desc(clients.createdAt));

    // Fetch notes for each client
    const clientsWithNotes = await Promise.all(
      allClients.map(async (client) => {
        const notes = await db
          .select()
          .from(clientNotes)
          .where(eq(clientNotes.clientId, client.id))
          .orderBy(desc(clientNotes.createdAt));

        return {
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
          xorsApiKey: client.xorsApiKey,
          notes: notes.map((n) => ({
            id: n.id,
            date: n.createdAt.toISOString().split("T")[0],
            content: n.content,
          })),
        };
      })
    );

    return NextResponse.json({ clients: clientsWithNotes });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, sessionsRemaining, goals, currentWeight, targetWeight } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Generate a password for the new client
    const clientPassword = generateClientPassword();

    // Create user in XORS API
    let xorsUser;
    try {
      const response = await createXORSUser(email, clientPassword);
      xorsUser = response.user;
    } catch (error) {
      console.error("XORS API error:", error);
      const err = error as { message?: string; statusCode?: number };
      return NextResponse.json(
        { error: err.message || "Failed to create user in XORS system" },
        { status: err.statusCode || 500 }
      );
    }

    // Create client in Palmer's database
    const [newClient] = await db
      .insert(clients)
      .values({
        xorsUserId: xorsUser.id,
        xorsApiKey: xorsUser.key,
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        sessionsRemaining: sessionsRemaining || 0,
        totalSessions: sessionsRemaining || 0,
        goals: goals || null,
        currentWeight: currentWeight ? currentWeight.toString() : null,
        targetWeight: targetWeight ? targetWeight.toString() : null,
      })
      .returning();

    return NextResponse.json({
      client: {
        id: newClient.id,
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone,
        sessionsRemaining: newClient.sessionsRemaining,
        totalSessions: newClient.totalSessions,
        goals: newClient.goals,
        currentWeight: newClient.currentWeight ? parseFloat(newClient.currentWeight) : null,
        targetWeight: newClient.targetWeight ? parseFloat(newClient.targetWeight) : null,
        lastSessionDate: null,
        createdAt: newClient.createdAt.toISOString().split("T")[0],
        xorsUserId: newClient.xorsUserId,
        xorsApiKey: newClient.xorsApiKey,
        notes: [],
      },
      // Include credentials so Palmer can share with client
      credentials: {
        email: email.toLowerCase(),
        password: clientPassword,
        apiKey: xorsUser.key,
      },
    });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}

