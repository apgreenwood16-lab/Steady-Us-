import { beforeEach, describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./_core/context";

const listBetaLeadsMock = vi.fn();
const getSharedPlansForLeadMock = vi.fn();
const updateBetaLeadAdminFieldsMock = vi.fn();

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return {
    ...actual,
    listBetaLeads: listBetaLeadsMock,
    getSharedPlansForLead: getSharedPlansForLeadMock,
    updateBetaLeadAdminFields: updateBetaLeadAdminFieldsMock,
  };
});

const { appRouter } = await import("./routers");

function createContext(role: "admin" | "user" | null): TrpcContext {
  return {
    user:
      role === null
        ? null
        : {
            id: 1,
            openId: "owner-open-id",
            role,
            name: role === "admin" ? "Owner" : "Member",
            email: role === "admin" ? "owner@example.com" : "member@example.com",
            loginMethod: "oauth",
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("admin lead tracker procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns beta leads with latest plan context for admins", async () => {
    listBetaLeadsMock.mockResolvedValueOnce([
      {
        id: 1,
        leadId: "pw_alpha",
        firstName: "Alex",
        email: "alex@example.com",
        location: "London",
        sourceType: "community",
        sourceDetail: "Housing forum",
        currentStatus: "qualified",
        fitScore: "high",
        coupleConfirmed: true,
        priorities: ["savings", "home_deposit"],
        urgencyLevel: "high",
        betaOpenness: "yes",
        callOpenness: "maybe",
        hardestRightNow: "We want to keep a deposit plan moving without wiping out our cash buffer.",
        notes: "Both partners work full-time.",
        adminNotes: "Warm lead for interview invite.",
        nextAction: "Offer beta invite this week",
        nextActionDueAt: 1760000000000,
        lastTouchAt: 1750000000000,
        outcome: "pending",
        createdAtMs: 1740000000000,
        updatedAtMs: 1740000000000,
      },
    ]);

    getSharedPlansForLeadMock.mockResolvedValueOnce([
      {
        id: 7,
        planId: "plan_alpha",
        leadId: "pw_alpha",
        primaryRecommendation: "emergency_savings",
        secondaryRecommendation: "home_deposit",
        realismScore: "7.5",
        sustainabilityScore: "7.0",
        fairnessScore: "6.5",
        summary: "Build resilience first.",
        monthlyCommitment: "Save £500 this month.",
        monthlyCommitmentAmount: "500.00",
        milestoneTarget: "Reach £3,000 easy-access savings",
        reviewPrompt: "Review after the next payslip.",
        reviewDateMs: 1761000000000,
        triggerConditions: ["Income changes", "Unexpected bill"],
        partnerNote: "We both want calm progress.",
        plannerInputs: {},
        plannerOutput: {},
        monthlyReviewCount: 0,
        lastReviewedAtMs: null,
        createdAtMs: 1755000000000,
        updatedAtMs: 1755000000000,
      },
    ]);

    const caller = appRouter.createCaller(createContext("admin"));
    const result = await caller.admin.leads();

    expect(listBetaLeadsMock).toHaveBeenCalledTimes(1);
    expect(getSharedPlansForLeadMock).toHaveBeenCalledWith("pw_alpha");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      leadId: "pw_alpha",
      planCount: 1,
      latestPlan: {
        planId: "plan_alpha",
        primaryRecommendation: "emergency_savings",
      },
    });
  });

  it("rejects non-admin users from viewing the lead tracker", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.admin.leads()).rejects.toBeInstanceOf(TRPCError);
    await expect(caller.admin.leads()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("allows admins to update lead workflow fields", async () => {
    updateBetaLeadAdminFieldsMock.mockResolvedValueOnce({
      leadId: "pw_alpha",
      currentStatus: "invited",
      outcome: "invited",
      nextAction: "Send onboarding instructions",
      nextActionDueAt: 1762000000000,
      lastTouchAt: 1761500000000,
      adminNotes: "Invite accepted quickly.",
    });

    const caller = appRouter.createCaller(createContext("admin"));
    const result = await caller.admin.updateLead({
      leadId: "pw_alpha",
      currentStatus: "invited",
      outcome: "invited",
      nextAction: "Send onboarding instructions",
      nextActionDueAt: 1762000000000,
      lastTouchAt: 1761500000000,
      adminNotes: "Invite accepted quickly.",
    });

    expect(updateBetaLeadAdminFieldsMock).toHaveBeenCalledWith({
      leadId: "pw_alpha",
      currentStatus: "invited",
      outcome: "invited",
      nextAction: "Send onboarding instructions",
      nextActionDueAt: 1762000000000,
      lastTouchAt: 1761500000000,
      adminNotes: "Invite accepted quickly.",
    });
    expect(result).toEqual({
      success: true,
      lead: {
        leadId: "pw_alpha",
        currentStatus: "invited",
        outcome: "invited",
        nextAction: "Send onboarding instructions",
        nextActionDueAt: 1762000000000,
        lastTouchAt: 1761500000000,
        adminNotes: "Invite accepted quickly.",
      },
    });
  });
});
