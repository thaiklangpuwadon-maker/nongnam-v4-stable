import { pgTable, uuid, timestamp, text, integer, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalId: text("external_id").unique().notNull(), // e.g., Line ID, unique identifier from auth
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  affectionScore: integer("affection_score").default(0).notNull(),
  relationshipStatus: text("relationship_status").default("เริ่มต้น").notNull(),
});

export const memories = pgTable("memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  data: jsonb("data").notNull(), // Stores the DeepMemory object as JSONB
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversationHistory = pgTable("conversation_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  emotionalState: text("emotional_state"), // Detected emotional state of the message
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
