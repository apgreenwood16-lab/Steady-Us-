import {
  bigint,
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const betaLeads = mysqlTable("betaLeads", {
  id: int("id").autoincrement().primaryKey(),
  leadId: varchar("leadId", { length: 24 }).notNull().unique(),
  firstName: varchar("firstName", { length: 120 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  location: varchar("location", { length: 120 }).notNull(),
  sourceType: mysqlEnum("sourceType", [
    "community",
    "content",
    "referral",
    "outbound",
    "direct",
    "other",
  ])
    .default("direct")
    .notNull(),
  sourceDetail: text("sourceDetail"),
  currentStatus: mysqlEnum("currentStatus", [
    "new",
    "reviewed",
    "qualified",
    "invited",
    "responded",
    "activated",
    "nurture",
    "inactive",
    "referred",
    "lost",
  ])
    .default("new")
    .notNull(),
  fitScore: mysqlEnum("fitScore", ["high", "medium", "low"]).notNull(),
  coupleConfirmed: boolean("coupleConfirmed").notNull(),
  priorities: json("priorities").$type<string[]>().notNull(),
  urgencyLevel: mysqlEnum("urgencyLevel", ["low", "medium", "high"]).notNull(),
  betaOpenness: mysqlEnum("betaOpenness", ["yes", "maybe", "no"]).notNull(),
  callOpenness: mysqlEnum("callOpenness", ["yes", "maybe", "no"]).notNull(),
  hardestRightNow: text("hardestRightNow").notNull(),
  notes: text("notes"),
  adminNotes: text("adminNotes"),
  nextAction: text("nextAction").notNull(),
  nextActionDueAt: bigint("nextActionDueAt", { mode: "number" }),
  lastTouchAt: bigint("lastTouchAt", { mode: "number" }),
  outcome: mysqlEnum("outcome", [
    "invited",
    "activated",
    "inactive",
    "referred",
    "lost",
    "pending",
  ])
    .default("pending")
    .notNull(),
  createdAtMs: bigint("createdAtMs", { mode: "number" }).notNull(),
  updatedAtMs: bigint("updatedAtMs", { mode: "number" }).notNull(),
});

export const sharedPlans = mysqlTable("sharedPlans", {
  id: int("id").autoincrement().primaryKey(),
  planId: varchar("planId", { length: 24 }).notNull().unique(),
  leadId: varchar("leadId", { length: 24 }).notNull(),
  primaryRecommendation: mysqlEnum("primaryRecommendation", [
    "emergency_savings",
    "debt_payoff",
    "home_deposit",
    "long_term_investing",
  ]).notNull(),
  secondaryRecommendation: mysqlEnum("secondaryRecommendation", [
    "emergency_savings",
    "debt_payoff",
    "home_deposit",
    "long_term_investing",
  ]),
  realismScore: decimal("realismScore", { precision: 3, scale: 1 }).notNull(),
  sustainabilityScore: decimal("sustainabilityScore", { precision: 3, scale: 1 }).notNull(),
  fairnessScore: decimal("fairnessScore", { precision: 3, scale: 1 }).notNull(),
  summary: text("summary").notNull(),
  monthlyCommitment: text("monthlyCommitment").notNull(),
  monthlyCommitmentAmount: decimal("monthlyCommitmentAmount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  milestoneTarget: text("milestoneTarget").notNull(),
  reviewPrompt: text("reviewPrompt").notNull(),
  reviewDateMs: bigint("reviewDateMs", { mode: "number" }).notNull(),
  triggerConditions: json("triggerConditions").$type<string[]>().notNull(),
  partnerNote: text("partnerNote"),
  plannerInputs: json("plannerInputs").$type<Record<string, unknown>>().notNull(),
  plannerOutput: json("plannerOutput").$type<Record<string, unknown>>().notNull(),
  monthlyReviewCount: int("monthlyReviewCount").default(0).notNull(),
  lastReviewedAtMs: bigint("lastReviewedAtMs", { mode: "number" }),
  createdAtMs: bigint("createdAtMs", { mode: "number" }).notNull(),
  updatedAtMs: bigint("updatedAtMs", { mode: "number" }).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type BetaLead = typeof betaLeads.$inferSelect;
export type InsertBetaLead = typeof betaLeads.$inferInsert;

export type SharedPlan = typeof sharedPlans.$inferSelect;
export type InsertSharedPlan = typeof sharedPlans.$inferInsert;
