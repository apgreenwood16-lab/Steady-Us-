import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  betaLeads,
  type BetaLead,
  type InsertBetaLead,
  type InsertSharedPlan,
  type InsertUser,
  type SharedPlan,
  sharedPlans,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }

  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBetaLead(input: InsertBetaLead): Promise<BetaLead> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available for beta lead creation");
  }

  await db.insert(betaLeads).values(input);

  const result = await db.select().from(betaLeads).where(eq(betaLeads.leadId, input.leadId)).limit(1);

  if (result.length === 0) {
    throw new Error("Beta lead was created but could not be reloaded");
  }

  return result[0];
}

export async function listBetaLeads(): Promise<BetaLead[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(betaLeads).orderBy(desc(betaLeads.createdAtMs));
}

export async function getBetaLeadByLeadId(leadId: string): Promise<BetaLead | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(betaLeads).where(eq(betaLeads.leadId, leadId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateBetaLeadAdminFields(params: {
  leadId: string;
  currentStatus?: BetaLead["currentStatus"];
  outcome?: BetaLead["outcome"];
  nextAction?: string;
  nextActionDueAt?: number | null;
  lastTouchAt?: number | null;
  adminNotes?: string | null;
}): Promise<BetaLead> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available for beta lead update");
  }

  const existingLead = await getBetaLeadByLeadId(params.leadId);
  if (!existingLead) {
    throw new Error("Beta lead not found");
  }

  const updateSet: Partial<typeof existingLead> = {
    updatedAtMs: Date.now(),
  };

  if (params.currentStatus !== undefined) {
    updateSet.currentStatus = params.currentStatus;
  }
  if (params.outcome !== undefined) {
    updateSet.outcome = params.outcome;
  }
  if (params.nextAction !== undefined) {
    updateSet.nextAction = params.nextAction;
  }
  if (params.nextActionDueAt !== undefined) {
    updateSet.nextActionDueAt = params.nextActionDueAt;
  }
  if (params.lastTouchAt !== undefined) {
    updateSet.lastTouchAt = params.lastTouchAt;
  }
  if (params.adminNotes !== undefined) {
    updateSet.adminNotes = params.adminNotes;
  }

  await db.update(betaLeads).set(updateSet).where(eq(betaLeads.leadId, params.leadId));

  const updatedLead = await getBetaLeadByLeadId(params.leadId);
  if (!updatedLead) {
    throw new Error("Beta lead was updated but could not be reloaded");
  }

  return updatedLead;
}

export async function createSharedPlan(input: InsertSharedPlan): Promise<SharedPlan> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available for shared plan creation");
  }

  await db.insert(sharedPlans).values(input);

  const result = await db.select().from(sharedPlans).where(eq(sharedPlans.planId, input.planId)).limit(1);

  if (result.length === 0) {
    throw new Error("Shared plan was created but could not be reloaded");
  }

  return result[0];
}

export async function getSharedPlansForLead(leadId: string): Promise<SharedPlan[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(sharedPlans).where(eq(sharedPlans.leadId, leadId)).orderBy(desc(sharedPlans.createdAtMs));
}

export async function getLatestSharedPlanForLead(leadId: string): Promise<SharedPlan | undefined> {
  const plans = await getSharedPlansForLead(leadId);
  return plans[0];
}
