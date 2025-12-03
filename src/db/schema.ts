import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  jsonb,
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

// Type exports
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type ClientNote = typeof clientNotes.$inferSelect;
export type NewClientNote = typeof clientNotes.$inferInsert;

