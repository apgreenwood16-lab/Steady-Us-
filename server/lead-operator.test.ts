import { describe, expect, it } from "vitest";
import { getLeadOperatorPriority, getLeadOperatorSummary } from "../client/src/lib/leadOperator";

describe("lead operator helper", () => {
  const now = new Date("2026-04-09T09:00:00.000Z").getTime();

  it("marks overdue active leads as urgent", () => {
    const priority = getLeadOperatorPriority(
      {
        fitScore: "medium",
        currentStatus: "reviewed",
        nextActionDueAt: now - 60_000,
        lastTouchAt: now - 86_400_000,
        createdAtMs: now - 172_800_000,
        planCount: 0,
      },
      now
    );

    expect(priority).toBe("urgent");
  });

  it("marks high-fit leads without a saved plan as priority when they are not overdue", () => {
    const priority = getLeadOperatorPriority(
      {
        fitScore: "high",
        currentStatus: "new",
        nextActionDueAt: now + 86_400_000,
        lastTouchAt: null,
        createdAtMs: now - 3_600_000,
        planCount: 0,
      },
      now
    );

    expect(priority).toBe("priority");
  });

  it("summarises the operator queue counts accurately", () => {
    const summary = getLeadOperatorSummary(
      [
        {
          fitScore: "medium",
          currentStatus: "reviewed",
          nextActionDueAt: now - 60_000,
          lastTouchAt: now - 86_400_000,
          createdAtMs: now - 172_800_000,
          planCount: 1,
        },
        {
          fitScore: "high",
          currentStatus: "new",
          nextActionDueAt: now + 86_400_000,
          lastTouchAt: null,
          createdAtMs: now - 3_600_000,
          planCount: 0,
        },
        {
          fitScore: "low",
          currentStatus: "qualified",
          nextActionDueAt: null,
          lastTouchAt: null,
          createdAtMs: now - 7_200_000,
          planCount: 0,
        },
      ],
      now
    );

    expect(summary).toEqual({
      overdueCount: 1,
      highFitWithoutPlanCount: 1,
      untouchedCount: 2,
      needsAttentionNowCount: 2,
    });
  });
});
