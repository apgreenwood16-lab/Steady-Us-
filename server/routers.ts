import { z } from "zod";
import { nanoid } from "nanoid";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import {
  createBetaLead,
  createSharedPlan,
  getLatestSharedPlanForLead,
  getSharedPlansForLead,
  listBetaLeads,
  updateBetaLeadAdminFields,
} from "./db";
import { runPlanner } from "./planner";

const priorityValues = ["savings", "debt", "home_deposit"] as const;
const sourceTypes = ["community", "content", "referral", "outbound", "direct", "other"] as const;
const urgencyLevels = ["low", "medium", "high"] as const;
const opennessValues = ["yes", "maybe", "no"] as const;
const housingStatuses = ["renting", "owning", "living_with_family", "other"] as const;
const incomeStabilities = ["very_stable", "mostly_stable", "somewhat_variable", "highly_variable"] as const;
const bnplSeverities = ["low", "medium", "high"] as const;
const emergencyTargets = ["1_month", "3_months", "6_months", "custom"] as const;
const homeTimings = ["within_12_months", "1_to_2_years", "2_to_4_years", "4_plus_years"] as const;
const importanceValues = ["essential", "important", "nice_to_have"] as const;
const flexibilityValues = ["low", "medium", "high"] as const;
const optionValues = ["emergency_savings", "debt_payoff", "home_deposit", "long_term_investing"] as const;
const leadStatusValues = [
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
] as const;
const leadOutcomeValues = ["invited", "activated", "inactive", "referred", "lost", "pending"] as const;

type PriorityValue = (typeof priorityValues)[number];
type FitScore = "high" | "medium" | "low";

type LeadScoringInput = {
  coupleConfirmed: boolean;
  priorities: PriorityValue[];
  urgencyLevel: (typeof urgencyLevels)[number];
  betaOpenness: (typeof opennessValues)[number];
};

type NotificationLeadInput = {
  firstName: string;
  email: string;
  location: string;
  sourceType: (typeof sourceTypes)[number];
  sourceDetail: string | null;
  coupleConfirmed: boolean;
  priorities: PriorityValue[];
  hardestRightNow: string;
  urgencyLevel: (typeof urgencyLevels)[number];
  betaOpenness: (typeof opennessValues)[number];
  callOpenness: (typeof opennessValues)[number];
  notes: string | null;
};

const betaSignupInput = z.object({
  firstName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  location: z.string().trim().min(2).max(120),
  sourceType: z.enum(sourceTypes).default("direct"),
  sourceDetail: z.string().trim().max(500).optional().or(z.literal("")),
  coupleConfirmed: z.boolean(),
  priorities: z.array(z.enum(priorityValues)).min(1).max(3),
  hardestRightNow: z.string().trim().min(8).max(1200),
  urgencyLevel: z.enum(urgencyLevels),
  betaOpenness: z.enum(opennessValues),
  callOpenness: z.enum(opennessValues),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

const coachingEnquiryInput = z.object({
  firstName: z.string().trim().min(2).max(120),
  partnerFirstName: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email().max(320),
  location: z.string().trim().min(2).max(120),
  mainFocus: z.string().trim().min(8).max(1200),
  suggestedTimes: z.string().trim().min(8).max(1200),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

const plannerInputSchema = z.object({
  household: z.object({
    adults: z.number().int().min(1).max(6),
    dependants: z.number().int().min(0).max(10),
    housingStatus: z.enum(housingStatuses),
    incomeStability: z.enum(incomeStabilities),
  }),
  income: z.object({
    partnerOneTakeHome: z.number().min(0),
    partnerTwoTakeHome: z.number().min(0),
    otherRegularIncome: z.number().min(0),
  }),
  spending: z.object({
    housing: z.number().min(0),
    bills: z.number().min(0),
    food: z.number().min(0),
    transport: z.number().min(0),
    childcare: z.number().min(0),
    insurance: z.number().min(0),
    minimumDebtPayments: z.number().min(0),
    otherEssentialCosts: z.number().min(0),
  }),
  assets: z.object({
    easyAccessSavings: z.number().min(0),
    houseDepositSavings: z.number().min(0),
    otherGoalSavings: z.number().min(0),
    longTermInvestments: z.number().min(0),
    pensionValue: z.number().min(0),
    existingHomeEquity: z.number().min(0),
  }),
  debt: z.object({
    creditCardBalance: z.number().min(0),
    creditCardApr: z.number().min(0).max(100),
    personalLoanBalance: z.number().min(0),
    personalLoanApr: z.number().min(0).max(100),
    carFinanceBalance: z.number().min(0),
    carFinanceApr: z.number().min(0).max(100),
    bnplBalance: z.number().min(0),
    bnplSeverity: z.enum(bnplSeverities),
    studentLoanBalance: z.number().min(0),
    includeStudentLoan: z.boolean(),
  }),
  goals: z.object({
    emergencyFundTarget: z.enum(emergencyTargets),
    customEmergencyFundMonths: z.number().min(1).max(24).nullable(),
    tryingToBuyHome: z.boolean(),
    targetHomeTiming: z.enum(homeTimings).nullable(),
    targetDepositAmount: z.number().min(0),
    expectedPurchasePrice: z.number().min(0),
    buyingSoonImportance: z.enum(importanceValues).nullable(),
    debtFreedomPriority: z.enum(importanceValues),
    investingPriority: z.enum(importanceValues),
    flexibilityNeed: z.enum(flexibilityValues),
  }),
  scenario: z.object({
    confirmedMonthlySpareMoney: z.number(),
    monthlyCommitmentAmount: z.number(),
    expectedOneOffCash: z.number().min(0),
    expectedMonthlyCostChange: z.number(),
  }),
});

const savePlanInputSchema = z.object({
  leadId: z.string().trim().min(3).max(40),
  plannerInput: plannerInputSchema,
  partnerNote: z.string().trim().max(1500).optional().or(z.literal("")),
});

function dedupePriorities(priorities: PriorityValue[]): PriorityValue[] {
  return Array.from(new Set(priorities));
}

function scoreLead(input: LeadScoringInput): FitScore {
  const priorities = dedupePriorities(input.priorities);

  if (
    input.coupleConfirmed &&
    priorities.length >= 2 &&
    input.betaOpenness === "yes" &&
    (input.urgencyLevel === "medium" || input.urgencyLevel === "high")
  ) {
    return "high";
  }

  if (input.coupleConfirmed && priorities.length >= 1) {
    return "medium";
  }

  return "low";
}

function getNextAction(fitScore: FitScore) {
  if (fitScore === "high") {
    return "Review quickly and send beta invite or personal follow-up within 48 hours.";
  }

  if (fitScore === "medium") {
    return "Review for nurture sequencing and consider secondary beta invite when capacity allows.";
  }

  return "Keep for future learning and deprioritise active outreach for now.";
}

function getPriorityLabel(priority: PriorityValue) {
  switch (priority) {
    case "savings":
      return "Savings";
    case "debt":
      return "Debt";
    case "home_deposit":
      return "Home deposit";
  }
}

function formatNotificationContent(params: {
  leadId: string;
  fitScore: FitScore;
  input: NotificationLeadInput;
}) {
  const { leadId, fitScore, input } = params;
  const priorities = dedupePriorities(input.priorities).map(getPriorityLabel).join(", ");

  return [
    `Lead ID: ${leadId}`,
    `Name: ${input.firstName}`,
    `Email: ${input.email}`,
    `Location: ${input.location}`,
    `Source: ${input.sourceType}${input.sourceDetail ? ` — ${input.sourceDetail}` : ""}`,
    `Couple confirmed: ${input.coupleConfirmed ? "Yes" : "No"}`,
    `Priorities: ${priorities}`,
    `Urgency: ${input.urgencyLevel}`,
    `Open to beta: ${input.betaOpenness}`,
    `Open to call: ${input.callOpenness}`,
    `Fit score: ${fitScore}`,
    `Hardest right now: ${input.hardestRightNow}`,
    `Extra notes: ${input.notes?.trim() || "None"}`,
  ].join("\n");
}

function formatCoachingEnquiryContent(input: z.infer<typeof coachingEnquiryInput> & { enquiryId: string }) {
  return [
    `Enquiry ID: ${input.enquiryId}`,
    `First name: ${input.firstName}`,
    `Partner first name: ${input.partnerFirstName?.trim() || "Not provided"}`,
    `Email: ${input.email}`,
    `Location: ${input.location}`,
    `Main focus: ${input.mainFocus}`,
    `Suggested times: ${input.suggestedTimes}`,
    `Extra notes: ${input.notes?.trim() || "None"}`,
  ].join("\n");
}

function buildRecommendationCopy(result: ReturnType<typeof runPlanner>) {
  const primarySentence = result.primaryRecommendation
    ? `Your strongest next priority is ${result.primaryRecommendation.label.toLowerCase()}, because ${result.primaryRecommendation.summary.toLowerCase()}`
    : "Your strongest next priority is stabilisation, because there is not enough confirmed spare money to allocate confidently yet.";

  const secondarySentence = result.secondaryRecommendation
    ? `Your strongest second step is ${result.secondaryRecommendation.label.toLowerCase()}, once ${result.primaryRecommendation?.milestoneTarget.toLowerCase() ?? "your current position improves"}`
    : "Your strongest second step is to rerun the planner once your monthly cash position changes.";

  return {
    primarySentence: `${primarySentence.replace(/\.$/, "")}.`,
    secondarySentence: `${secondarySentence.replace(/\.$/, "")}.`,
  };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  beta: router({
    signup: publicProcedure.input(betaSignupInput).mutation(async ({ input }) => {
      const now = Date.now();
      const cleanInput = {
        ...input,
        priorities: dedupePriorities(input.priorities),
        sourceDetail: input.sourceDetail?.trim() || null,
        notes: input.notes?.trim() || null,
      };

      const fitScore = scoreLead(cleanInput);
      const leadId = `pw_${nanoid(10)}`;
      const nextAction = getNextAction(fitScore);
      const nextActionDueAt = fitScore === "high" ? now + 48 * 60 * 60 * 1000 : null;

      const lead = await createBetaLead({
        leadId,
        firstName: cleanInput.firstName,
        email: cleanInput.email,
        location: cleanInput.location,
        sourceType: cleanInput.sourceType,
        sourceDetail: cleanInput.sourceDetail,
        currentStatus: "new",
        fitScore,
        coupleConfirmed: cleanInput.coupleConfirmed,
        priorities: cleanInput.priorities,
        urgencyLevel: cleanInput.urgencyLevel,
        betaOpenness: cleanInput.betaOpenness,
        callOpenness: cleanInput.callOpenness,
        hardestRightNow: cleanInput.hardestRightNow,
        notes: cleanInput.notes,
        nextAction,
        nextActionDueAt,
        lastTouchAt: null,
        outcome: "pending",
        createdAtMs: now,
        updatedAtMs: now,
      });

      const notificationDelivered = await notifyOwner({
        title: `New SteadyUs beta signup — ${cleanInput.firstName} (${fitScore})`,
        content: formatNotificationContent({ leadId, fitScore, input: cleanInput }),
      });

      return {
        success: true,
        leadId: lead.leadId,
        fitScore,
        currentStatus: lead.currentStatus,
        nextAction: lead.nextAction,
        notificationDelivered,
      } as const;
    }),
  }),
  coaching: router({
    submitEnquiry: publicProcedure.input(coachingEnquiryInput).mutation(async ({ input }) => {
      const enquiryId = `coach_${nanoid(10)}`;
      const cleanInput = {
        ...input,
        partnerFirstName: input.partnerFirstName?.trim() || "",
        notes: input.notes?.trim() || "",
      };

      const notificationDelivered = await notifyOwner({
        title: `New SteadyUs coaching enquiry — ${cleanInput.firstName}`,
        content: formatCoachingEnquiryContent({
          enquiryId,
          ...cleanInput,
        }),
      });

      return {
        success: true,
        enquiryId,
        firstName: cleanInput.firstName,
        notificationDelivered,
      } as const;
    }),
  }),
  planner: router({
    run: publicProcedure.input(plannerInputSchema).mutation(({ input }) => {
      const result = runPlanner(input);
      return {
        ...result,
        recommendationCopy: buildRecommendationCopy(result),
      };
    }),
    save: publicProcedure.input(savePlanInputSchema).mutation(async ({ input }) => {
      const now = Date.now();
      const result = runPlanner(input.plannerInput);
      const planId = `plan_${nanoid(10)}`;
      const partnerNote = input.partnerNote?.trim() || null;

      const savedPlan = await createSharedPlan({
        planId,
        leadId: input.leadId,
        primaryRecommendation: (result.primaryRecommendation?.option ?? "emergency_savings") as (typeof optionValues)[number],
        secondaryRecommendation: (result.secondaryRecommendation?.option ?? null) as (typeof optionValues)[number] | null,
        realismScore: String(result.primaryRecommendation?.safety ?? 0),
        sustainabilityScore: String(result.primaryRecommendation?.progress ?? 0),
        fairnessScore: String(result.primaryRecommendation?.balance ?? 0),
        summary: result.topSummary,
        monthlyCommitment: result.partnerAgreementPrompt,
        monthlyCommitmentAmount: String(result.monthlyCommitmentSuggestion),
        milestoneTarget: result.milestoneTarget,
        reviewPrompt: result.reviewTrigger,
        reviewDateMs: result.reviewDateMs,
        triggerConditions: [result.reviewTrigger],
        partnerNote,
        plannerInputs: input.plannerInput as Record<string, unknown>,
        plannerOutput: {
          ...result,
          recommendationCopy: buildRecommendationCopy(result),
        } as Record<string, unknown>,
        monthlyReviewCount: 0,
        lastReviewedAtMs: null,
        createdAtMs: now,
        updatedAtMs: now,
      });

      return {
        success: true,
        planId: savedPlan.planId,
        reviewDateMs: savedPlan.reviewDateMs,
        currentMainPriority: savedPlan.primaryRecommendation,
        monthlyCommitmentAmount: savedPlan.monthlyCommitmentAmount,
        milestoneTarget: savedPlan.milestoneTarget,
        reminderSentence: result.reminderSentence,
        recommendationCopy: buildRecommendationCopy(result),
      } as const;
    }),
    latestPlan: publicProcedure
      .input(z.object({ leadId: z.string().trim().min(3).max(40) }))
      .query(async ({ input }) => {
        const plan = await getLatestSharedPlanForLead(input.leadId);
        if (!plan) {
          return null;
        }

        return plan;
      }),
  }),
  admin: router({
    leads: adminProcedure.query(async () => {
      const leads = await listBetaLeads();

      const rows = await Promise.all(
        leads.map(async lead => {
          const plans = await getSharedPlansForLead(lead.leadId);
          const latestPlan = plans[0] ?? null;

          return {
            ...lead,
            planCount: plans.length,
            latestPlan,
          };
        })
      );

      return rows;
    }),
    updateLead: adminProcedure
      .input(
        z.object({
          leadId: z.string().trim().min(3).max(40),
          currentStatus: z.enum(leadStatusValues).optional(),
          outcome: z.enum(leadOutcomeValues).optional(),
          nextAction: z.string().trim().min(4).max(1000).optional(),
          nextActionDueAt: z.number().nullable().optional(),
          lastTouchAt: z.number().nullable().optional(),
          adminNotes: z.string().trim().max(4000).nullable().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const updatedLead = await updateBetaLeadAdminFields(input);
        return {
          success: true,
          lead: updatedLead,
        } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
