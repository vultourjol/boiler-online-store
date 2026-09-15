import {
  boolean,
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  icon: text("icon").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  brand: text("brand").notNull(),
  country: text("country").notNull().default(""),
  fuelType: text("fuel_type").notNull(),
  power: integer("power").notNull(),
  efficiencyPercent: integer("efficiency_percent").notNull().default(92),
  price: integer("price").notNull(),
  oldPrice: integer("old_price"),
  warrantyYears: integer("warranty_years").notNull().default(2),
  imageUrl: text("image_url").notNull().default(""),
  description: text("description").notNull().default(""),
  features: text("features").array().notNull().default([]),
  inStock: boolean("in_stock").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  rating: real("rating").notNull().default(4.7),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull().default(""),
  comment: text("comment").notNull().default(""),
  total: integer("total").notNull(),
  status: text("status").notNull().default("new"),
  paymentMethod: text("payment_method").notNull().default("card_online"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: integer("price").notNull(),
});
