import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  index,
} from "drizzle-orm/pg-core";

/**
 * Clients table - stores coaching data for each client
 * The xorsUserId links to the user created in the XORS API
 */
export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Link to XORS user system
    xorsUserId: varchar("xors_user_id", { length: 255 }).unique().notNull(),
    xorsApiKey: varchar("xors_api_key", { length: 255 }), // Stored for reference
    
    // Client profile
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    
    // Coaching data
    sessionsRemaining: integer("sessions_remaining").default(0).notNull(),
    totalSessions: integer("total_sessions").default(0).notNull(),
    goals: text("goals"),
    currentWeight: decimal("current_weight", { precision: 6, scale: 2 }),
    targetWeight: decimal("target_weight", { precision: 6, scale: 2 }),
    
    // Timestamps
    lastSessionDate: timestamp("last_session_date"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_clients_xors_user_id").on(table.xorsUserId),
    index("idx_clients_email").on(table.email),
  ]
);

/**
 * Client notes - session notes and progress updates
 */
export const clientNotes = pgTable(
  "client_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_client_notes_client_id").on(table.clientId),
  ]
);

/**
 * Exercise logs - track strength training progress
 */
export const exerciseLogs = pgTable(
  "exercise_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
    exercise: varchar("exercise", { length: 100 }).notNull(), // e.g., "Bench Press", "Squat"
    weight: decimal("weight", { precision: 6, scale: 2 }).notNull(), // in lbs
    reps: integer("reps").notNull(),
    sets: integer("sets").default(1),
    notes: text("notes"), // optional notes for this lift
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_exercise_logs_client_id").on(table.clientId),
    index("idx_exercise_logs_exercise").on(table.exercise),
    index("idx_exercise_logs_created").on(table.createdAt),
  ]
);

// Type exports
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type ClientNote = typeof clientNotes.$inferSelect;
export type NewClientNote = typeof clientNotes.$inferInsert;
export type ExerciseLog = typeof exerciseLogs.$inferSelect;
export type NewExerciseLog = typeof exerciseLogs.$inferInsert;

