export const PLANNER_CONSTANTS = {
  criticalEmergencyCoverageMonths: 1,
  reasonableEmergencyCoverageMonths: 3,
  strongEmergencyCoverageMonths: 6,
  materialCardOrOverdraftThreshold: 2000,
  materialAprThreshold: 8,
  materialDebtBalanceThreshold: 5000,
  combinedShortTermDebtThreshold: 4000,
  debtRepaymentStrainThreshold: 0.2,
  tieBreakProximityThreshold: 0.3,
} as const;

export type OptionKey = "emergency_savings" | "debt_payoff" | "home_deposit" | "long_term_investing";
export type BandLabel = "Green" | "Amber" | "Red";
export type PriorityImportance = "essential" | "important" | "nice_to_have";
export type IncomeStability = "very_stable" | "mostly_stable" | "somewhat_variable" | "highly_variable";
export type FlexibilityNeed = "low" | "medium" | "high";
export type HousingStatus = "renting" | "owning" | "living_with_family" | "other";
export type BnplSeverity = "low" | "medium" | "high";
export type EmergencyTarget = "1_month" | "3_months" | "6_months" | "custom";
export type HomeTiming = "within_12_months" | "1_to_2_years" | "2_to_4_years" | "4_plus_years";
export type PlannerMode = "standard" | "stabilisation";

export type PlannerInput = {
  household: {
    adults: number;
    dependants: number;
    housingStatus: HousingStatus;
    incomeStability: IncomeStability;
  };
  income: {
    partnerOneTakeHome: number;
    partnerTwoTakeHome: number;
    otherRegularIncome: number;
  };
  spending: {
    housing: number;
    bills: number;
    food: number;
    transport: number;
    childcare: number;
    insurance: number;
    minimumDebtPayments: number;
    otherEssentialCosts: number;
  };
  assets: {
    easyAccessSavings: number;
    houseDepositSavings: number;
    otherGoalSavings: number;
    longTermInvestments: number;
    pensionValue: number;
    existingHomeEquity: number;
  };
  debt: {
    creditCardBalance: number;
    creditCardApr: number;
    personalLoanBalance: number;
    personalLoanApr: number;
    carFinanceBalance: number;
    carFinanceApr: number;
    bnplBalance: number;
    bnplSeverity: BnplSeverity;
    studentLoanBalance: number;
    includeStudentLoan: boolean;
  };
  goals: {
    emergencyFundTarget: EmergencyTarget;
    customEmergencyFundMonths: number | null;
    tryingToBuyHome: boolean;
    targetHomeTiming: HomeTiming | null;
    targetDepositAmount: number;
    expectedPurchasePrice: number;
    buyingSoonImportance: PriorityImportance | null;
    debtFreedomPriority: PriorityImportance;
    investingPriority: PriorityImportance;
    flexibilityNeed: FlexibilityNeed;
  };
  scenario: {
    confirmedMonthlySpareMoney: number;
    monthlyCommitmentAmount: number;
    expectedOneOffCash: number;
    expectedMonthlyCostChange: number;
  };
};

export type RankedOption = {
  option: OptionKey;
  label: string;
  safety: number;
  progress: number;
  balance: number;
  weightedScore: number;
  rank: number;
  band: BandLabel;
  summary: string;
  relevance: "active" | "delay" | "not_relevant";
  milestoneTarget: string;
  reviewTrigger: string;
};

export type PlannerResult = {
  mode: PlannerMode;
  topSummary: string;
  primaryRecommendation: RankedOption | null;
  secondaryRecommendation: RankedOption | null;
  options: RankedOption[];
  delayOptions: RankedOption[];
  notRelevantOptions: RankedOption[];
  weaknesses: string[];
  monthlyCommitmentSuggestion: number;
  milestoneTarget: string;
  reviewTrigger: string;
  partnerAgreementPrompt: string;
  reminderSentence: string;
  reviewDateMs: number;
  derived: {
    combinedTakeHomeIncome: number;
    essentialMonthlySpending: number;
    emergencyCoverageMonths: number;
    totalNonMortgageDebt: number;
    totalHighCostDebtBalance: number;
    depositGap: number;
    confirmedAllocatableAmount: number;
    adjusted12MonthAllocatableAmount: number;
    emergencyTargetMonths: number;
    debtRepaymentStrainRatio: number;
  };
};

const OPTION_LABELS: Record<OptionKey, string> = {
  emergency_savings: "Emergency savings",
  debt_payoff: "Debt overpayment",
  home_deposit: "House progress",
  long_term_investing: "Long-term investing",
};

const clamp = (value: number, min = 0, max = 10) =>
  Math.max(min, Math.min(max, Math.round(value * 10) / 10));

const round1 = (value: number) => Math.round(value * 10) / 10;
const round2 = (value: number) => Math.round(value * 100) / 100;

function getBand(score: number): BandLabel {
  if (score >= 7) return "Green";
  if (score >= 4.5) return "Amber";
  return "Red";
}

function getPriorityMultiplier(priority: PriorityImportance | null) {
  if (priority === "essential") return 1.15;
  if (priority === "nice_to_have") return 0.8;
  return 1;
}

function getEmergencyTargetMonths(goals: PlannerInput["goals"]) {
  if (goals.emergencyFundTarget === "1_month") return 1;
  if (goals.emergencyFundTarget === "3_months") return 3;
  if (goals.emergencyFundTarget === "6_months") return 6;
  return Math.max(goals.customEmergencyFundMonths ?? 3, 1);
}

function hasMaterialHighCostDebt(input: PlannerInput) {
  const {
    creditCardBalance,
    creditCardApr,
    personalLoanBalance,
    personalLoanApr,
    carFinanceBalance,
    carFinanceApr,
    bnplBalance,
    bnplSeverity,
  } = input.debt;

  const cardSeverityFlag =
    (bnplSeverity === "high" && bnplBalance > PLANNER_CONSTANTS.materialCardOrOverdraftThreshold) ||
    creditCardBalance > PLANNER_CONSTANTS.materialCardOrOverdraftThreshold;

  const expensiveInstallmentDebt = [
    { balance: creditCardBalance, apr: creditCardApr },
    { balance: personalLoanBalance, apr: personalLoanApr },
    { balance: carFinanceBalance, apr: carFinanceApr },
  ].some(
    item =>
      item.balance > PLANNER_CONSTANTS.materialDebtBalanceThreshold &&
      item.apr > PLANNER_CONSTANTS.materialAprThreshold
  );

  const combinedShortTermDebt = creditCardBalance + bnplBalance;
  const combinedShortTermDebtFlag =
    combinedShortTermDebt > PLANNER_CONSTANTS.combinedShortTermDebtThreshold &&
    (bnplSeverity === "medium" || bnplSeverity === "high");

  return cardSeverityFlag || expensiveInstallmentDebt || combinedShortTermDebtFlag;
}

function getDerived(input: PlannerInput) {
  const combinedTakeHomeIncome =
    input.income.partnerOneTakeHome +
    input.income.partnerTwoTakeHome +
    input.income.otherRegularIncome;

  const essentialMonthlySpending =
    input.spending.housing +
    input.spending.bills +
    input.spending.food +
    input.spending.transport +
    input.spending.childcare +
    input.spending.insurance +
    input.spending.minimumDebtPayments +
    input.spending.otherEssentialCosts;

  if (essentialMonthlySpending <= 0) {
    throw new Error("Essential monthly spending must be above £0 before the planner can run.");
  }

  const emergencyCoverageMonths = input.assets.easyAccessSavings / essentialMonthlySpending;
  const totalNonMortgageDebt =
    input.debt.creditCardBalance +
    input.debt.personalLoanBalance +
    input.debt.carFinanceBalance +
    input.debt.bnplBalance +
    (input.debt.includeStudentLoan ? input.debt.studentLoanBalance : 0);
  const totalHighCostDebtBalance = hasMaterialHighCostDebt(input)
    ? input.debt.creditCardBalance + input.debt.personalLoanBalance + input.debt.carFinanceBalance + input.debt.bnplBalance
    : 0;
  const depositGap = Math.max(0, input.goals.targetDepositAmount - input.assets.houseDepositSavings);
  const confirmedAllocatableAmount = input.scenario.monthlyCommitmentAmount;
  const adjusted12MonthAllocatableAmount =
    input.scenario.monthlyCommitmentAmount + input.scenario.expectedMonthlyCostChange;
  const emergencyTargetMonths = getEmergencyTargetMonths(input.goals);
  const debtRepaymentStrainRatio =
    combinedTakeHomeIncome > 0 ? input.spending.minimumDebtPayments / combinedTakeHomeIncome : 0;

  return {
    combinedTakeHomeIncome: round2(combinedTakeHomeIncome),
    essentialMonthlySpending: round2(essentialMonthlySpending),
    emergencyCoverageMonths: round1(emergencyCoverageMonths),
    totalNonMortgageDebt: round2(totalNonMortgageDebt),
    totalHighCostDebtBalance: round2(totalHighCostDebtBalance),
    depositGap: round2(depositGap),
    confirmedAllocatableAmount: round2(confirmedAllocatableAmount),
    adjusted12MonthAllocatableAmount: round2(adjusted12MonthAllocatableAmount),
    emergencyTargetMonths,
    debtRepaymentStrainRatio: round2(debtRepaymentStrainRatio),
  };
}

function getSafetyBase(emergencyCoverageMonths: number, hasHighCostDebt: boolean) {
  if (emergencyCoverageMonths < 1) {
    return {
      emergency_savings: 9,
      debt_payoff: hasHighCostDebt ? 7.5 : 5.5,
      home_deposit: 2.5,
      long_term_investing: 1.5,
    } satisfies Record<OptionKey, number>;
  }

  if (emergencyCoverageMonths < 3) {
    return {
      emergency_savings: 8,
      debt_payoff: hasHighCostDebt ? 7 : 5.5,
      home_deposit: 4,
      long_term_investing: 3,
    } satisfies Record<OptionKey, number>;
  }

  if (emergencyCoverageMonths < 6) {
    return {
      emergency_savings: 6,
      debt_payoff: hasHighCostDebt ? 6.5 : 5,
      home_deposit: 6,
      long_term_investing: 5.5,
    } satisfies Record<OptionKey, number>;
  }

  return {
    emergency_savings: 4.5,
    debt_payoff: hasHighCostDebt ? 6 : 4.5,
    home_deposit: 7,
    long_term_investing: 7,
  } satisfies Record<OptionKey, number>;
}

function scoreSafety(input: PlannerInput, derived: ReturnType<typeof getDerived>) {
  const hasHighCostDebt = derived.totalHighCostDebtBalance > 0;
  const scores = { ...getSafetyBase(derived.emergencyCoverageMonths, hasHighCostDebt) };

  if (
    input.household.incomeStability === "somewhat_variable" ||
    input.household.incomeStability === "highly_variable"
  ) {
    scores.emergency_savings += 0.8;
    scores.long_term_investing -= 1;
  }

  if (input.household.dependants > 0) {
    scores.emergency_savings += 0.7;
    scores.home_deposit -= 0.3;
    scores.long_term_investing -= 0.4;
  }

  if (input.goals.flexibilityNeed === "high") {
    scores.emergency_savings += 0.9;
    scores.home_deposit -= 0.8;
    scores.long_term_investing -= 0.8;
  } else if (input.goals.flexibilityNeed === "medium") {
    scores.emergency_savings += 0.3;
  }

  if (hasHighCostDebt) {
    scores.debt_payoff += 0.8;
  }

  if (
    input.household.housingStatus === "owning" &&
    derived.emergencyCoverageMonths >= 3 &&
    derived.totalHighCostDebtBalance === 0
  ) {
    scores.emergency_savings -= 0.6;
  }

  Object.keys(scores).forEach(key => {
    scores[key as OptionKey] = clamp(scores[key as OptionKey]);
  });

  return scores;
}

function scoreProgress(input: PlannerInput, derived: ReturnType<typeof getDerived>) {
  const emergencyTargetMet = derived.emergencyCoverageMonths >= derived.emergencyTargetMonths;
  const highCostDebtExists = derived.totalHighCostDebtBalance > 0;
  const stableBasics = derived.emergencyCoverageMonths >= 3 && !highCostDebtExists;

  const scores: Record<OptionKey, number> = {
    emergency_savings: emergencyTargetMet ? 4.8 : derived.emergencyCoverageMonths < 1 ? 8.8 : 7.2,
    debt_payoff: highCostDebtExists ? 7.5 : derived.totalNonMortgageDebt > 0 ? 5.8 : 2.5,
    home_deposit: input.goals.tryingToBuyHome ? 6 : 1.5,
    long_term_investing: stableBasics ? 6.4 : 2.8,
  };

  scores.emergency_savings = clamp(scores.emergency_savings * getPriorityMultiplier("important"));
  scores.debt_payoff = clamp(scores.debt_payoff * getPriorityMultiplier(input.goals.debtFreedomPriority));
  scores.long_term_investing = clamp(
    scores.long_term_investing * getPriorityMultiplier(input.goals.investingPriority)
  );

  if (input.goals.tryingToBuyHome) {
    let homeBase = 6.2;
    if (input.goals.targetHomeTiming === "within_12_months") homeBase += 1.8;
    if (input.goals.targetHomeTiming === "1_to_2_years") homeBase += 1.1;
    if (input.goals.targetHomeTiming === "2_to_4_years") homeBase += 0.4;
    if (input.goals.targetHomeTiming === "4_plus_years") homeBase -= 0.2;
    if (derived.depositGap === 0) homeBase -= 0.4;
    if (derived.depositGap > 0 && derived.depositGap < input.goals.targetDepositAmount * 0.2) homeBase += 0.5;

    scores.home_deposit = clamp(homeBase * getPriorityMultiplier(input.goals.buyingSoonImportance));
  }

  if (!stableBasics && input.goals.investingPriority === "essential") {
    scores.long_term_investing -= 1.2;
  }

  return {
    emergency_savings: clamp(scores.emergency_savings),
    debt_payoff: clamp(scores.debt_payoff),
    home_deposit: input.goals.tryingToBuyHome ? clamp(scores.home_deposit) : 0.5,
    long_term_investing: clamp(scores.long_term_investing),
  };
}

function scoreBalance(input: PlannerInput, derived: ReturnType<typeof getDerived>) {
  const highCostDebtExists = derived.totalHighCostDebtBalance > 0;
  const stableBasics = derived.emergencyCoverageMonths >= 3 && !highCostDebtExists;

  const scores: Record<OptionKey, number> = {
    emergency_savings: derived.emergencyCoverageMonths < 1 ? 8.5 : derived.emergencyCoverageMonths < 3 ? 7.4 : 5.2,
    debt_payoff: highCostDebtExists ? 8 : derived.totalNonMortgageDebt > 0 ? 6.2 : 3.4,
    home_deposit: input.goals.tryingToBuyHome ? 5.8 : 1,
    long_term_investing: stableBasics ? 6.5 : 2.2,
  };

  if (input.goals.flexibilityNeed === "high") {
    scores.emergency_savings += 0.6;
    scores.home_deposit -= 0.8;
    scores.long_term_investing -= 0.9;
  }

  if (highCostDebtExists) {
    scores.home_deposit -= 1.1;
    scores.long_term_investing -= 1.4;
  }

  if (stableBasics && !input.goals.tryingToBuyHome) {
    scores.long_term_investing += 1.2;
    scores.home_deposit = 0.8;
  }

  if (derived.emergencyCoverageMonths >= 6 && !highCostDebtExists) {
    scores.emergency_savings -= 1.2;
  }

  Object.keys(scores).forEach(key => {
    scores[key as OptionKey] = clamp(scores[key as OptionKey]);
  });

  return scores;
}

function summarizeOption(option: RankedOption) {
  if (option.option === "emergency_savings") {
    return "Build more resilience before leaning harder on longer-term goals.";
  }
  if (option.option === "debt_payoff") {
    return "Reduce high-cost drag so more of your monthly money starts working for you.";
  }
  if (option.option === "home_deposit") {
    return "Keep progressing toward your home goal without losing too much stability.";
  }
  return "Start or grow long-term investing once the short-term foundations look steady enough.";
}

function milestoneForOption(option: OptionKey, input: PlannerInput, derived: ReturnType<typeof getDerived>) {
  if (option === "emergency_savings") {
    const targetAmount = Math.round(derived.emergencyTargetMonths * derived.essentialMonthlySpending);
    return `Build your cash buffer to about £${targetAmount.toLocaleString("en-GB")}.`;
  }
  if (option === "debt_payoff") {
    if (derived.totalHighCostDebtBalance > 0) {
      return "Bring high-cost debt below the material-risk threshold.";
    }
    return "Reduce the next most expensive debt balance meaningfully.";
  }
  if (option === "home_deposit") {
    return derived.depositGap > 0
      ? `Close the remaining deposit gap of about £${Math.round(derived.depositGap).toLocaleString("en-GB")}.`
      : "Protect affordability readiness while keeping your deposit intact.";
  }
  return "Put the first steady monthly investing contribution in place without weakening your buffer.";
}

function reviewTriggerForOption(option: OptionKey) {
  if (option === "emergency_savings") {
    return "Review when your emergency savings hit the target threshold or your income changes.";
  }
  if (option === "debt_payoff") {
    return "Review when your highest-cost debt falls below the material threshold or a major bill changes.";
  }
  if (option === "home_deposit") {
    return "Review when your house timing changes, a one-off cash boost arrives, or affordability shifts.";
  }
  return "Review when your buffer stays stable for a full month or your monthly costs change.";
}

function buildWeaknesses(primary: RankedOption | null) {
  if (!primary) return ["Your current monthly spare money leaves no room for a growth priority yet."];

  const weaknesses: string[] = [];
  if (primary.safety < 6) weaknesses.push("Short-term resilience still looks weaker than ideal.");
  if (primary.progress < 6) weaknesses.push("This option improves stability more than it accelerates a named goal.");
  if (primary.balance < 6) weaknesses.push("The overall position would still need watching so one weak area does not linger.");
  return weaknesses.length > 0 ? weaknesses : ["No single pillar looks weak, but the plan still works best if you review it monthly."];
}

function applyOverrides(
  options: RankedOption[],
  input: PlannerInput,
  derived: ReturnType<typeof getDerived>
) {
  const byOption = new Map(options.map(option => [option.option, option]));
  const emergency = byOption.get("emergency_savings");
  const debt = byOption.get("debt_payoff");
  const home = byOption.get("home_deposit");
  const invest = byOption.get("long_term_investing");

  const hasHighCostDebt = derived.totalHighCostDebtBalance > 0;
  const emergencyTargetMet = derived.emergencyCoverageMonths >= derived.emergencyTargetMonths;
  const variableIncome =
    input.household.incomeStability === "somewhat_variable" ||
    input.household.incomeStability === "highly_variable";
  const extremeDebt =
    hasHighCostDebt &&
    derived.debtRepaymentStrainRatio > PLANNER_CONSTANTS.debtRepaymentStrainThreshold &&
    derived.emergencyCoverageMonths >= 0.5;

  if (
    extremeDebt &&
    debt
  ) {
    debt.weightedScore = 10.5;
  } else if (
    derived.emergencyCoverageMonths < 1 &&
    (variableIncome || input.household.dependants > 0) &&
    emergency &&
    !extremeDebt
  ) {
    emergency.weightedScore = 10.4;
  }

  if (hasHighCostDebt && derived.emergencyCoverageMonths >= 1 && debt) {
    debt.weightedScore = Math.max(debt.weightedScore, 10.2);
    if (home) home.weightedScore = Math.min(home.weightedScore, debt.weightedScore - 0.5);
    if (invest) invest.weightedScore = Math.min(invest.weightedScore, debt.weightedScore - 0.5);
  }

  if (
    input.goals.tryingToBuyHome &&
    input.goals.targetHomeTiming === "within_12_months" &&
    emergencyTargetMet &&
    !hasHighCostDebt &&
    home
  ) {
    home.weightedScore = Math.max(home.weightedScore, 9.8);
  }

  if (
    emergencyTargetMet &&
    !hasHighCostDebt &&
    (!input.goals.tryingToBuyHome || input.goals.targetHomeTiming === "4_plus_years") &&
    (input.goals.investingPriority === "important" || input.goals.investingPriority === "essential") &&
    invest
  ) {
    invest.weightedScore = Math.max(invest.weightedScore, 9.4);
  }
}

function orderOptions(
  options: RankedOption[],
  input: PlannerInput,
  derived: ReturnType<typeof getDerived>
) {
  applyOverrides(options, input, derived);

  options.sort((a, b) => {
    const weightedGap = b.weightedScore - a.weightedScore;
    if (Math.abs(weightedGap) > PLANNER_CONSTANTS.tieBreakProximityThreshold) {
      return weightedGap;
    }
    if (b.safety !== a.safety) return b.safety - a.safety;
    if (b.progress !== a.progress) return b.progress - a.progress;

    const priorityMap: Partial<Record<OptionKey, PriorityImportance | null>> = {
      debt_payoff: input.goals.debtFreedomPriority,
      home_deposit: input.goals.buyingSoonImportance,
      long_term_investing: input.goals.investingPriority,
      emergency_savings: "important",
    };

    const priorityWeight = (priority: PriorityImportance | null | undefined) => {
      if (priority === "essential") return 3;
      if (priority === "important") return 2;
      if (priority === "nice_to_have") return 1;
      return 0;
    };

    const priorityGap = priorityWeight(priorityMap[b.option]) - priorityWeight(priorityMap[a.option]);
    if (priorityGap !== 0) return priorityGap;

    const liquidityWeight = (option: OptionKey) => {
      if (option === "emergency_savings") return 4;
      if (option === "debt_payoff") return 3;
      if (option === "home_deposit") return 2;
      return 1;
    };

    return liquidityWeight(b.option) - liquidityWeight(a.option);
  });

  options.forEach((option, index) => {
    option.rank = index + 1;
  });

  return options;
}

function buildRankedOptions(input: PlannerInput, derived: ReturnType<typeof getDerived>) {
  const safety = scoreSafety(input, derived);
  const progress = scoreProgress(input, derived);
  const balance = scoreBalance(input, derived);

  const options: RankedOption[] = (Object.keys(OPTION_LABELS) as OptionKey[]).map(option => {
    const weightedScore = round1(safety[option] * 0.4 + progress[option] * 0.35 + balance[option] * 0.25);
    return {
      option,
      label: OPTION_LABELS[option],
      safety: safety[option],
      progress: progress[option],
      balance: balance[option],
      weightedScore,
      rank: 0,
      band: getBand(weightedScore),
      summary: "",
      relevance: "active",
      milestoneTarget: milestoneForOption(option, input, derived),
      reviewTrigger: reviewTriggerForOption(option),
    };
  });

  orderOptions(options, input, derived);

  options.forEach(option => {
    option.summary = summarizeOption(option);
    option.band = getBand(option.weightedScore);
    if (!input.goals.tryingToBuyHome && option.option === "home_deposit") {
      option.relevance = "not_relevant";
      option.summary = "Home progress is not currently relevant because buying a home is not an active goal right now.";
    } else if (
      option.option === "long_term_investing" &&
      (derived.emergencyCoverageMonths < 3 || derived.totalHighCostDebtBalance > 0)
    ) {
      option.relevance = "delay";
      option.summary = "Long-term investing looks stronger later than now because short-term stability still needs work first.";
    }
  });

  return options;
}

function pickSecondaryOption(primary: RankedOption | null, options: RankedOption[]) {
  if (!primary) return null;
  const remaining = options.filter(option => option.option !== primary.option && option.relevance !== "not_relevant");
  return remaining[0] ?? null;
}

function buildTopSummary(primary: RankedOption | null, secondary: RankedOption | null, mode: PlannerMode) {
  if (mode === "stabilisation") {
    return "There is not enough confirmed spare money to push a growth priority confidently yet, so the first job is to stabilise the household cash position.";
  }

  if (!primary || !secondary) {
    return "Your current inputs point to one clearer next move, with the other options sitting further back for now.";
  }

  return `Your strongest next priority is ${primary.label.toLowerCase()}, because it currently offers the best mix of safety, progress, and overall balance. Your next step after that is ${secondary.label.toLowerCase()}, once the first milestone has been met.`;
}

export function runPlanner(input: PlannerInput): PlannerResult {
  const derived = getDerived(input);
  const reviewDateMs = Date.now() + 30 * 24 * 60 * 60 * 1000;

  if (derived.confirmedAllocatableAmount <= 0) {
    const stabilisationOption: RankedOption = {
      option: "emergency_savings",
      label: "Stabilisation first",
      safety: 9,
      progress: 4.5,
      balance: 8.5,
      weightedScore: 7.5,
      rank: 1,
      band: "Amber",
      summary: "Focus first on freeing up room in the monthly budget before choosing a growth priority.",
      relevance: "active",
      milestoneTarget: "Create a positive monthly spare money figure and protect at least the next essential bills.",
      reviewTrigger: "Review as soon as income rises, a major cost falls, or a one-off cash boost arrives.",
    };

    return {
      mode: "stabilisation",
      topSummary: buildTopSummary(stabilisationOption, null, "stabilisation"),
      primaryRecommendation: stabilisationOption,
      secondaryRecommendation: null,
      options: [stabilisationOption],
      delayOptions: [],
      notRelevantOptions: [],
      weaknesses: [
        "Your current monthly spare money is at or below £0.",
        "The first move is to create breathing room before pushing savings, house progress, or investing harder.",
      ],
      monthlyCommitmentSuggestion: 0,
      milestoneTarget: stabilisationOption.milestoneTarget,
      reviewTrigger: stabilisationOption.reviewTrigger,
      partnerAgreementPrompt:
        "For the next 30 days, we will focus on creating spare money before taking on a bigger financial priority.",
      reminderSentence: "Stabilise the monthly budget first, then rerun Pairwise when cash flow improves.",
      reviewDateMs,
      derived,
    };
  }

  const options = buildRankedOptions(input, derived);
  const activeOptions = options.filter(option => option.relevance === "active");
  const primaryRecommendation = activeOptions[0] ?? null;
  const secondaryRecommendation = pickSecondaryOption(primaryRecommendation, activeOptions);
  const delayOptions = options.filter(option => option.relevance === "delay");
  const notRelevantOptions = options.filter(option => option.relevance === "not_relevant");
  const weaknesses = buildWeaknesses(primaryRecommendation);

  return {
    mode: "standard",
    topSummary: buildTopSummary(primaryRecommendation, secondaryRecommendation, "standard"),
    primaryRecommendation,
    secondaryRecommendation,
    options,
    delayOptions,
    notRelevantOptions,
    weaknesses,
    monthlyCommitmentSuggestion: derived.confirmedAllocatableAmount,
    milestoneTarget: primaryRecommendation?.milestoneTarget ?? "Review the inputs and rerun the planner.",
    reviewTrigger: primaryRecommendation?.reviewTrigger ?? "Review when your cash flow changes.",
    partnerAgreementPrompt: primaryRecommendation
      ? `For the next 30 days, we will put £${derived.confirmedAllocatableAmount.toLocaleString("en-GB", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })} toward ${primaryRecommendation.label.toLowerCase()} and review the plan together next month.`
      : "We will review our priorities together again next month.",
    reminderSentence: primaryRecommendation
      ? `${primaryRecommendation.label} looks strongest now, but revisit the answer when your milestone or timing changes.`
      : "Rerun the planner when your situation changes.",
    reviewDateMs,
    derived,
  };
}
