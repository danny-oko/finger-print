import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Mirrors db/schema.sql (+ db/migrations/0001_add_ticketing.sql). Only the
// tables the ticketing feature touches are modeled here — the rest of the
// app still reads/writes D1 through lib/d1.ts's raw client.
export const churches = sqliteTable("churches", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: text("created_at").notNull(),
});

export const registrations = sqliteTable("registrations", {
  id: text("id").primaryKey(),
  registrantType: text("registrant_type").notNull(),
  payerName: text("payer_name").notNull(),
  payerPhone: text("payer_phone").notNull(),
  payerEmail: text("payer_email"),
  attendeeCount: integer("attendee_count").notNull(),
  totalMnt: integer("total_mnt").notNull(),
  currency: text("currency").notNull(),
  status: text("status").notNull(),
  paidAt: text("paid_at"),
  ticketsIssuedAt: text("tickets_issued_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const attendees = sqliteTable("attendees", {
  id: text("id").primaryKey(),
  registrationId: text("registration_id").notNull(),
  fullName: text("full_name").notNull(),
  age: integer("age"),
  churchName: text("church_name").notNull(),
  grade: integer("grade").notNull(),
  ticketCode: text("ticket_code"),
  checkedInAt: text("checked_in_at"),
  createdAt: text("created_at").notNull(),
});
