import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  apiKey: text('api_key').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const palmerApplications = pgTable('palmer_applications', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionCount: integer('session_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const adminUsers = pgTable('admin_users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  apiKey: text('api_key').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
