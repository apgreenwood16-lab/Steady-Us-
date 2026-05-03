import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const createBetaLeadMock = vi.fn();
const notifyOwnerMock = vi.fn();

vi.mock("./db", () => ({
  createBetaLead: createBetaLeadMock,
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: notifyOwnerMock,
}));

const { appRouter } = await import("./routers");

describe("beta.signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createPublicContext(): TrpcContext {
    return {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: vi.fn(),
      } as unknown as TrpcContext["res"],
    };
  }

  it("creates a high-fit lead and notifies the owner for a strong couple signup", async () => {
    createBetaLeadMock.mockImplementationOnce(async input => ({
      id: 1,
      ...input,
    }));
    notifyOwnerMock.mockResolvedValueOnce(true);

    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.beta.signup({
      firstName: "Alex",
      email: "alex@example.com",
      location: "United Kingdom",
      sourceType: "community",
      sourceDetail: "r/HousingUK",
      coupleConfirmed: true,
      priorities: ["savings", "home_deposit"],
      hardestRightNow: "We want to keep moving toward a deposit without leaving ourselves exposed.",
      urgencyLevel: "high",
      betaOpenness: "yes",
      callOpenness: "maybe",
      notes: "Both of us are working full-time.",
    });

    expect(result.success).toBe(true);
    expect(result.fitScore).toBe("high");
    expect(result.notificationDelivered).toBe(true);
    expect(result.leadId).toMatch(/^pw_/);

    expect(createBetaLeadMock).toHaveBeenCalledTimes(1);
    expect(createBetaLeadMock.mock.calls[0]?.[0]).toMatchObject({
      firstName: "Alex",
      email: "alex@example.com",
      location: "United Kingdom",
      fitScore: "high",
      currentStatus: "new",
      sourceType: "community",
      priorities: ["savings", "home_deposit"],
      outcome: "pending",
    });

    expect(notifyOwnerMock).toHaveBeenCalledTimes(1);
    expect(notifyOwnerMock.mock.calls[0]?.[0]).toMatchObject({
      title: expect.stringContaining("Alex"),
      content: expect.stringContaining("Fit score: high"),
    });
  });

  it("downgrades weak-fit signups and still attempts owner notification", async () => {
    createBetaLeadMock.mockImplementationOnce(async input => ({
      id: 2,
      ...input,
    }));
    notifyOwnerMock.mockResolvedValueOnce(false);

    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.beta.signup({
      firstName: "Jamie",
      email: "jamie@example.com",
      location: "Manchester",
      sourceType: "direct",
      sourceDetail: "",
      coupleConfirmed: false,
      priorities: ["debt"],
      hardestRightNow: "I am exploring options but not making this decision as a couple yet.",
      urgencyLevel: "low",
      betaOpenness: "maybe",
      callOpenness: "no",
      notes: "",
    });

    expect(result.fitScore).toBe("low");
    expect(result.notificationDelivered).toBe(false);
    expect(result.nextAction).toContain("deprioritise");

    expect(createBetaLeadMock.mock.calls[0]?.[0]).toMatchObject({
      fitScore: "low",
      coupleConfirmed: false,
      priorities: ["debt"],
      sourceDetail: null,
      notes: null,
    });

    expect(notifyOwnerMock).toHaveBeenCalledTimes(1);
  });
});
