import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn(),
}));

import { notifyOwner } from "./_core/notification";
import { appRouter } from "./routers";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("coaching.submitEnquiry", () => {
  beforeEach(() => {
    vi.mocked(notifyOwner).mockReset();
  });

  it("submits the customer-facing booking enquiry and notifies the owner", async () => {
    vi.mocked(notifyOwner).mockResolvedValue(true);
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.coaching.submitEnquiry({
      firstName: "Alex",
      partnerFirstName: "Sam",
      email: "alex@example.com",
      location: "Leeds, UK",
      mainFocus: "We keep avoiding the budget and want a calmer shared plan.",
      suggestedTimes: "Tuesday 7pm or Thursday 8pm.",
      notes: "Evenings work better than daytime.",
    });

    expect(result.success).toBe(true);
    expect(result.firstName).toBe("Alex");
    expect(result.enquiryId).toMatch(/^coach_/);
    expect(result.notificationDelivered).toBe(true);
    expect(notifyOwner).toHaveBeenCalledTimes(1);
    expect(notifyOwner).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "New SteadyUs coaching enquiry — Alex",
        content: expect.stringContaining("Suggested times: Tuesday 7pm or Thursday 8pm."),
      })
    );
  });
});
