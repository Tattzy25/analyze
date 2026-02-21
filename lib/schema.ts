import {
  text,
  pgTable,
  serial,
  timestamp,
  varchar,
  index,
  boolean,
  decimal,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

// Products table - main table for analyzed images (Shopify-compatible fields)
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    // Core identifiers
    sku: varchar("sku", { length: 10 }).notNull().unique(),
    handle: varchar("handle", { length: 255 }).unique(), // Shopify URL slug
    filename: text("filename").notNull(),
    imageUrl: text("image_url").notNull(),

    // AI-generated content
    title: text("title").notNull(),
    shortDescription: text("short_description"),
    bodyHtml: text("body_html"), // HTML formatted for Shopify
    generatedPrompt: text("generated_prompt"),

    // AI-generated metadata
    mood: text("mood"),
    style: text("style"),
    subject: text("subject"),
    dimensions: text("dimensions"),

    // Shopify fields (for future integration)
    vendor: varchar("vendor", { length: 100 }).default("TaTTTy"),
    productType: varchar("product_type", { length: 100 }).default(
      "Digital Tattoo Art",
    ),
    published: boolean("published").default(true),
    price: decimal("price", { precision: 10, scale: 2 }).default("5.00"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    imageAltText: text("image_alt_text"),

    // Status tracking
    shopifySynced: boolean("shopify_synced").default(false),
    shopifyProductId: varchar("shopify_product_id", { length: 50 }),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    skuIdx: index("sku_idx").on(table.sku),
    handleIdx: index("handle_idx").on(table.handle),
    titleIdx: index("title_idx").on(table.title),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  }),
);

// Tags table
export const tags = pgTable(
  "tags",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
  },
  (table) => ({
    nameIdx: index("tags_name_idx").on(table.name),
  }),
);

// Product-Tags junction table (many-to-many)
export const productTags = pgTable(
  "product_tags",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.tagId] }),
    productIdIdx: index("product_tags_product_id_idx").on(table.productId),
    tagIdIdx: index("product_tags_tag_id_idx").on(table.tagId),
  }),
);

// Colors table
export const colors = pgTable(
  "colors",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
  },
  (table) => ({
    nameIdx: index("colors_name_idx").on(table.name),
  }),
);

// Product-Colors junction table (many-to-many)
export const productColors = pgTable(
  "product_colors",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    colorId: integer("color_id")
      .notNull()
      .references(() => colors.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.colorId] }),
    productIdIdx: index("product_colors_product_id_idx").on(table.productId),
    colorIdIdx: index("product_colors_color_id_idx").on(table.colorId),
  }),
);

// Type exports
export type InsertProduct = typeof products.$inferInsert;
export type SelectProduct = typeof products.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;
export type SelectTag = typeof tags.$inferSelect;
export type InsertColor = typeof colors.$inferInsert;
export type SelectColor = typeof colors.$inferSelect;
