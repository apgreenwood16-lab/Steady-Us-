import { describe, expect, it } from "vitest";
import { runPlanner, type PlannerInput } from "./planner";

function buildBaseInput(): PlannerInput {
  return {
    household: {
      adults: 2,
      dependants: 0,
      housingStatus: "renting",
      incomeStability: "mostly_stable",
    },
    income: {
      partnerOneTakeHome: 2400,
      partnerTwoTakeHome: 2200,
      otherRegularIncome: 0,
    },
    spending: {
      housing: 1200,
      bills: 280,
      food: 420,
      transport: 220,
      childcare: 0,
      insurance: 140,
      minimumDebtPayments: 160,
      otherEssentialCosts: 280,
    },
    assets: {
      easyAccessSavings: 1200,
      houseDepositSavings: 10000,
      otherGoalSavings: 0,
      longTermInvestments: 0,
      pensionValue: 0,
      existingHomeEquity: 0,
    },
    debt: {
      creditCardBalance: 3500,
      creditCardApr: 24,
      personalLoanBalance: 0,
      personalLoanApr: 0,
      carFinanceBalance: 0,
      carFinanceApr: 0,
      bnplBalance: 900,
      bnplSeverity: "medium",
      studentLoanBalance: 0,
      includeStudentLoan: false,
    },
    goals: {
      emergencyFundTarget: "3_months",
      customEmergencyFundMonths: null,
      tryingToBuyHome: true,
      targetHomeTiming: "1_to_2_years",
      targetDepositAmount: 30000,
      expectedPurchasePrice: 280000,
      buyingSoonImportance: "important",
      debtFreedomPriority: "essential",
      investingPriority: "nice_to_have",
      flexibilityNeed: "medium",
    },
    scenario: {
      confirmedMonthlySpareMoney: 650,
      monthlyCommitmentAmount: 650,
      expectedOneOffCash: 0,
      expectedMonthlyCostChange: 0,
    },
  };
}

describe("runPlanner", () => {
  it("puts emergency savings first when the buffer is critically weak", () => {
    const result = runPlanner(buildBaseInput());

    expect(result.mode).toBe("standard");
    expect(result.primaryRecommendation?.option).toBe("emergency_savings");
    expect(result.secondaryRecommendation?.option).toBe("debt_payoff");
    expect(result.primaryRecommendation?.safety).toBeGreaterThan(result.primaryRecommendation?.progress ?? 0);
    expect(result.derived.emergencyCoverageMonths).toBeLessThan(1);
  });

  it("switches to stabilisation mode when there is no confirmed allocatable money", () => {
    const input = buildBaseInput();
    input.scenario.confirmedMonthlySpareMoney = 0;
    input.scenario.monthlyCommitmentAmount = 0;

    const result = runPlanner(input);

    expect(result.mode).toBe("stabilisation");
    expect(result.primaryRecommendation?.label).toBe("Stabilisation first");
    expect(result.secondaryRecommendation).toBeNull();
    expect(result.partnerAgreementPrompt).toContain("30 days");
  });

  it("marks home as not currently relevant when there is no home-buying goal", () => {
    const input = buildBaseInput();
    input.goals.tryingToBuyHome = false;
    input.goals.targetHomeTiming = null;
    input.goals.buyingSoonImportance = null;
    input.goals.targetDepositAmount = 0;
    input.goals.expectedPurchasePrice = 0;
    input.assets.houseDepositSavings = 0;
    input.assets.easyAccessSavings = 9000;
    input.debt.creditCardBalance = 0;
    input.debt.bnplBalance = 0;
    input.debt.bnplSeverity = "low";
    input.goals.investingPriority = "essential";

    const result = runPlanner(input);
    const homeOption = result.notRelevantOptions.find(option => option.option === "home_deposit");

    expect(homeOption).toBeDefined();
    expect(homeOption?.summary).toContain("not currently relevant");
  });
});
