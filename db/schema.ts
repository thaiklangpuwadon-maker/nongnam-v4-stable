import { pgTable, varchar, uuid, integer, boolean, timestamp, text, decimal, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Existing Users Table (updated with diamonds)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalId: text("external_id").unique().notNull(), // e.g., Line ID, unique identifier from auth
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  affectionScore: integer("affection_score").default(0).notNull(),
  relationshipStatus: text("relationship_status").default("เริ่มต้น").notNull(),
  diamonds: integer('diamonds').notNull().default(0), // Added diamonds column
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

// Clothes Catalog Table
export const clothesCatalog = pgTable('clothes_catalog', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(),
  image_url_base: varchar('image_url_base', { length: 255 }).notNull(), // Transparent PNG of the clothes
  image_url_preview: varchar('image_url_preview', { length: 255 }), // Preview on a generic model
  price_diamonds: integer('price_diamonds').notNull().default(0),
  price_usd: decimal('price_usd', { precision: 10, scale: 2 }),
  is_18_plus: boolean('is_18_plus').notNull().default(false),
  unlock_condition: text('unlock_condition'), // e.g., 'Affection Score > 70'
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// User Wardrobe Table
export const userWardrobe = pgTable('user_wardrobe', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id),
  outfit_id: uuid('outfit_id').notNull().references(() => clothesCatalog.id),
  is_owned: boolean('is_owned').notNull().default(false),
  is_equipped: boolean('is_equipped').notNull().default(false),
  purchased_at: timestamp('purchased_at'),
  equipped_at: timestamp('equipped_at'),
});

// Relations for Drizzle ORM
export const usersRelations = relations(users, ({ many }) => ({
  memories: many(memories),
  conversationHistory: many(conversationHistory),
  userWardrobe: many(userWardrobe),
}));

export const memoriesRelations = relations(memories, ({ one }) => ({
  user: one(users, {
    fields: [memories.userId],
    references: [users.id],
  }),
}));

export const conversationHistoryRelations = relations(conversationHistory, ({ one }) => ({
  user: one(users, {
    fields: [conversationHistory.userId],
    references: [users.id],
  }),
}));

export const clothesCatalogRelations = relations(clothesCatalog, ({ many }) => ({
  userWardrobe: many(userWardrobe),
}));

export const userWardrobeRelations = relations(userWardrobe, ({ one }) => ({
  user: one(users, {
    fields: [userWardrobe.user_id],
    references: [users.id],
  }),
  outfit: one(clothesCatalog, {
    fields: [userWardrobe.outfit_id],
    references: [clothesCatalog.id],
  }),
}));
