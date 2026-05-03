import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, CircleAlert, PiggyBank, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { COST_CHANGE_INPUT_STEP, CURRENCY_INPUT_MIN, CURRENCY_INPUT_STEP } from "@/lib/plannerFieldConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type PlannerFormValues = {
  leadId: string;
  partnerOneTakeHome: number;
  partnerTwoTakeHome: number;
  otherRegularIncome: number;
  adults: number;
  dependants: number;
  housingStatus: "renting" | "owning" | "living_with_family" | "other";
  incomeStability: "very_stable" | "mostly_stable" | "somewhat_variable" | "highly_variable";
  housingCost: number;
  bills: number;
  food: number;
  transport: number;
  childcare: number;
  insurance: number;
  minimumDebtPayments: number;
  otherEssentialCosts: number;
  easyAccessSavings: number;
  houseDepositSavings: number;
  otherGoalSavings: number;
  longTermInvestments: number;
  pensionValue: number;
  existingHomeEquity: number;
  creditCardBalance: number;
  creditCardApr: number;
  personalLoanBalance: number;
  personalLoanApr: number;
  carFinanceBalance: number;
  carFinanceApr: number;
  bnplBalance: number;
  bnplSeverity: "low" | "medium" | "high";
  studentLoanBalance: number;
  includeStudentLoan: boolean;
  emergencyFundTarget: "1_month" | "3_months" | "6_months" | "custom";
  customEmergencyFundMonths: number;
  tryingToBuyHome: boolean;
  targetHomeTiming: "within_12_months" | "1_to_2_years" | "2_to_4_years" | "4_plus_years";
  targetDepositAmount: number;
  expectedPurchasePrice: number;
  buyingSoonImportance: "essential" | "important" | "nice_to_have";
  debtFreedomPriority: "essential" | "important" | "nice_to_have";
  investingPriority: "essential" | "important" | "nice_to_have";
  flexibilityNeed: "low" | "medium" | "high";
  confirmedMonthlySpareMoney: number;
  monthlyCommitmentAmount: number;
  expectedOneOffCash: number;
  expectedMonthlyCostChange: number;
  partnerNote: string;
};

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const scoreTone = (value: number) => {
  if (value >= 7) {
    return "bg-[#DDEDDD] text-[#274E38]";
  }
  if (value >= 4.5) {
    return "bg-[#F3E6D9] text-[#8B532B]";
  }
  return "bg-[#F3D9D8] text-[#8E3C3B]";
};

const optionIcon = {
  emergency_savings: PiggyBank,
  debt_payoff: Wallet,
  home_deposit: ShieldCheck,
  long_term_investing: TrendingUp,
} as const;

function buildPlannerInput(values: PlannerFormValues) {
  return {
    household: {
      adults: Number(values.adults),
      dependants: Number(values.dependants),
      housingStatus: values.housingStatus,
      incomeStability: values.incomeStability,
    },
    income: {
      partnerOneTakeHome: Number(values.partnerOneTakeHome),
      partnerTwoTakeHome: Number(values.partnerTwoTakeHome),
      otherRegularIncome: Number(values.otherRegularIncome),
    },
    spending: {
      housing: Number(values.housingCost),
      bills: Number(values.bills),
      food: Number(values.food),
      transport: Number(values.transport),
      childcare: Number(values.childcare),
      insurance: Number(values.insurance),
      minimumDebtPayments: Number(values.minimumDebtPayments),
      otherEssentialCosts: Number(values.otherEssentialCosts),
    },
    assets: {
      easyAccessSavings: Number(values.easyAccessSavings),
      houseDepositSavings: Number(values.houseDepositSavings),
      otherGoalSavings: Number(values.otherGoalSavings),
      longTermInvestments: Number(values.longTermInvestments),
      pensionValue: Number(values.pensionValue),
      existingHomeEquity: Number(values.existingHomeEquity),
    },
    debt: {
      creditCardBalance: Number(values.creditCardBalance),
      creditCardApr: Number(values.creditCardApr),
      personalLoanBalance: Number(values.personalLoanBalance),
      personalLoanApr: Number(values.personalLoanApr),
      carFinanceBalance: Number(values.carFinanceBalance),
      carFinanceApr: Number(values.carFinanceApr),
      bnplBalance: Number(values.bnplBalance),
      bnplSeverity: values.bnplSeverity,
      studentLoanBalance: Number(values.studentLoanBalance),
      includeStudentLoan: values.includeStudentLoan,
    },
    goals: {
      emergencyFundTarget: values.emergencyFundTarget,
      customEmergencyFundMonths:
        values.emergencyFundTarget === "custom" ? Number(values.customEmergencyFundMonths) : null,
      tryingToBuyHome: values.tryingToBuyHome,
      targetHomeTiming: values.tryingToBuyHome ? values.targetHomeTiming : null,
      targetDepositAmount: values.tryingToBuyHome ? Number(values.targetDepositAmount) : 0,
      expectedPurchasePrice: values.tryingToBuyHome ? Number(values.expectedPurchasePrice) : 0,
      buyingSoonImportance: values.tryingToBuyHome ? values.buyingSoonImportance : null,
      debtFreedomPriority: values.debtFreedomPriority,
      investingPriority: values.investingPriority,
      flexibilityNeed: values.flexibilityNeed,
    },
    scenario: {
      confirmedMonthlySpareMoney: Number(values.confirmedMonthlySpareMoney),
      monthlyCommitmentAmount: Number(values.monthlyCommitmentAmount),
      expectedOneOffCash: Number(values.expectedOneOffCash),
      expectedMonthlyCostChange: Number(values.expectedMonthlyCostChange),
    },
  };
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[#163A43]">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs leading-5 text-[#6B8288]">{hint}</span> : null}
    </label>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

export default function Planner() {
  const [result, setResult] = useState<Awaited<ReturnType<typeof runMutationShape>> | null>(null);
  const [savedPlan, setSavedPlan] = useState<Awaited<ReturnType<typeof saveMutationShape>> | null>(null);

  const form = useForm<PlannerFormValues>({
    defaultValues: {
      leadId: "pw_demo_beta",
      partnerOneTakeHome: 2400,
      partnerTwoTakeHome: 2100,
      otherRegularIncome: 0,
      adults: 2,
      dependants: 0,
      housingStatus: "renting",
      incomeStability: "mostly_stable",
      housingCost: 1250,
      bills: 280,
      food: 420,
      transport: 220,
      childcare: 0,
      insurance: 150,
      minimumDebtPayments: 180,
      otherEssentialCosts: 250,
      easyAccessSavings: 1800,
      houseDepositSavings: 12000,
      otherGoalSavings: 0,
      longTermInvestments: 0,
      pensionValue: 0,
      existingHomeEquity: 0,
      creditCardBalance: 3200,
      creditCardApr: 24,
      personalLoanBalance: 0,
      personalLoanApr: 0,
      carFinanceBalance: 0,
      carFinanceApr: 0,
      bnplBalance: 600,
      bnplSeverity: "medium",
      studentLoanBalance: 0,
      includeStudentLoan: false,
      emergencyFundTarget: "3_months",
      customEmergencyFundMonths: 4,
      tryingToBuyHome: true,
      targetHomeTiming: "1_to_2_years",
      targetDepositAmount: 30000,
      expectedPurchasePrice: 280000,
      buyingSoonImportance: "important",
      debtFreedomPriority: "essential",
      investingPriority: "nice_to_have",
      flexibilityNeed: "medium",
      confirmedMonthlySpareMoney: 700,
      monthlyCommitmentAmount: 700,
      expectedOneOffCash: 0,
      expectedMonthlyCostChange: 0,
      partnerNote: "We want one calm plan we can stick with for the next month.",
    },
  });

  const tryingToBuyHome = form.watch("tryingToBuyHome");
  const emergencyFundTarget = form.watch("emergencyFundTarget");

  const runPlannerMutation = trpc.planner.run.useMutation({
    onSuccess: data => {
      setResult(data as Awaited<ReturnType<typeof runMutationShape>>);
      toast.success("SteadyUs has compared your next-priority options.");
    },
    onError: error => {
      toast.error(error.message || "We could not run the planner.");
    },
  });

  const savePlanMutation = trpc.planner.save.useMutation({
    onSuccess: data => {
      setSavedPlan(data as Awaited<ReturnType<typeof saveMutationShape>>);
      toast.success("Your shared plan has been saved.");
    },
    onError: error => {
      toast.error(error.message || "We could not save the shared plan.");
    },
  });

  const onRunPlanner = form.handleSubmit(values => {
    const plannerInput = buildPlannerInput(values);
    runPlannerMutation.mutate(plannerInput);
  });

  const onSavePlan = () => {
    const values = form.getValues();
    const plannerInput = buildPlannerInput(values);
    savePlanMutation.mutate({
      leadId: values.leadId.trim() || "pw_demo_beta",
      plannerInput,
      partnerNote: values.partnerNote,
    });
  };

  const daysUntilReview = useMemo(() => {
    if (!savedPlan?.reviewDateMs) return null;
    const diff = savedPlan.reviewDateMs - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [savedPlan]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F8F7F4_0%,#F8F7F4_58%,#F1E9E1_100%)] text-[#163A43]">
      <div className="container py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div className="space-y-6 lg:sticky lg:top-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D6E1D5] bg-[#EAF0E8] px-4 py-2 text-sm text-[#34555C]">
              <CheckCircle2 className="h-4 w-4 text-[#6F8F72]" />
              SteadyUs flagship trade-off planner
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Work out what your next spare money should do first.
              </h1>
              <p className="text-lg leading-8 text-[#4B666D]">
                Use this planner to work out what your next spare money should do first. We’ll compare your options across safety, progress, and overall balance, then help you turn the result into a practical plan.
              </p>
            </div>
            <Card className="rounded-[28px] border-[#DCCFC4] bg-white/85 py-0 shadow-[0_24px_60px_rgba(22,58,67,0.06)]">
              <CardHeader>
                <CardTitle className="text-xl">What this compares</CardTitle>
                <CardDescription className="text-[#5A7379]">
                  SteadyUs ranks emergency savings, debt overpayment, house progress, and long-term investing using calm, explainable logic.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 pb-6 text-sm leading-6 text-[#4B666D]">
                <div className="rounded-2xl bg-[#F8F7F4] p-4">Safety: does this improve short-term resilience?</div>
                <div className="rounded-2xl bg-[#F8F7F4] p-4">Progress: does this move an important goal forward?</div>
                <div className="rounded-2xl bg-[#F8F7F4] p-4">Balance: does this create a fairer and more sustainable position overall?</div>
              </CardContent>
            </Card>
            {savedPlan ? (
              <Card className="rounded-[28px] border-[#DCCFC4] bg-[#163A43] py-0 text-[#F8F7F4] shadow-[0_24px_70px_rgba(22,58,67,0.12)]">
                <CardHeader>
                  <CardTitle className="text-xl text-[#F8F7F4]">Saved shared plan</CardTitle>
                  <CardDescription className="text-[#DDE5E7]">
                    Your home panel view after saving the current plan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 pb-6 text-sm leading-6 text-[#ECF1F2]">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#DCCFC4]">Current main priority</p>
                    <p className="mt-1 text-lg font-semibold">{savedPlan.currentMainPriority.replaceAll("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#DCCFC4]">Monthly commitment</p>
                    <p className="mt-1 text-lg font-semibold">£{savedPlan.monthlyCommitmentAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#DCCFC4]">Milestone target</p>
                    <p className="mt-1">{savedPlan.milestoneTarget}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#DCCFC4]">Days until next review</p>
                    <p className="mt-1 text-lg font-semibold">{daysUntilReview ?? "—"}</p>
                  </div>
                  <p className="rounded-2xl bg-white/10 p-4">{savedPlan.reminderSentence}</p>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="space-y-8">
            <form onSubmit={onRunPlanner} className="space-y-6">
              <PlannerSection
                title="1. Household structure"
                helper="These details shape how much short-term resilience matters and how cautious the planner should be."
              >
                <FieldGrid>
                  <Field label="Lead reference">
                    <Input {...form.register("leadId")} className="h-11 rounded-2xl border-[#DCCFC4] bg-white" />
                  </Field>
                  <Field label="Adults in household">
                    <Input type="number" {...form.register("adults", { valueAsNumber: true })} className="h-11 rounded-2xl border-[#DCCFC4] bg-white" />
                  </Field>
                  <Field label="Dependants">
                    <Input type="number" {...form.register("dependants", { valueAsNumber: true })} className="h-11 rounded-2xl border-[#DCCFC4] bg-white" />
                  </Field>
                  <Field label="Current living arrangement">
                    <select {...form.register("housingStatus")} className="h-11 rounded-2xl border border-[#DCCFC4] bg-white px-4 text-sm outline-none focus:border-[#6F8F72]">
                      <option value="renting">Renting</option>
                      <option value="owning">Owning</option>
                      <option value="living_with_family">Living with family</option>
                      <option value="other">Other</option>
                    </select>
                  </Field>
                  <Field label="Income stability">
                    <select {...form.register("incomeStability")} className="h-11 rounded-2xl border border-[#DCCFC4] bg-white px-4 text-sm outline-none focus:border-[#6F8F72]">
                      <option value="very_stable">Very stable</option>
                      <option value="mostly_stable">Mostly stable</option>
                      <option value="somewhat_variable">Somewhat variable</option>
                      <option value="highly_variable">Highly variable</option>
                    </select>
                  </Field>
                </FieldGrid>
              </PlannerSection>

              <PlannerSection
                title="2. Monthly take-home income"
                helper="Use monthly take-home figures rather than gross salary so the planner reflects real disposable income."
              >
                <FieldGrid>
                  <Field label="Partner 1 take-home pay">
                    <CurrencyInput register={form.register("partnerOneTakeHome", { valueAsNumber: true })} />
                  </Field>
                  <Field label="Partner 2 take-home pay">
                    <CurrencyInput register={form.register("partnerTwoTakeHome", { valueAsNumber: true })} />
                  </Field>
                  <Field label="Other regular monthly income">
                    <CurrencyInput register={form.register("otherRegularIncome", { valueAsNumber: true })} />
                  </Field>
                </FieldGrid>
              </PlannerSection>

              <PlannerSection
                title="3. Core monthly spending"
                helper="These essentials set the baseline for emergency-fund coverage and tell SteadyUs how fragile the current setup feels."
              >
                <FieldGrid>
                  <Field label="Housing costs"><CurrencyInput register={form.register("housingCost", { valueAsNumber: true })} /></Field>
                  <Field label="Bills"><CurrencyInput register={form.register("bills", { valueAsNumber: true })} /></Field>
                  <Field label="Food"><CurrencyInput register={form.register("food", { valueAsNumber: true })} /></Field>
                  <Field label="Transport"><CurrencyInput register={form.register("transport", { valueAsNumber: true })} /></Field>
                  <Field label="Childcare"><CurrencyInput register={form.register("childcare", { valueAsNumber: true })} /></Field>
                  <Field label="Insurance"><CurrencyInput register={form.register("insurance", { valueAsNumber: true })} /></Field>
                  <Field label="Minimum debt payments"><CurrencyInput register={form.register("minimumDebtPayments", { valueAsNumber: true })} /></Field>
                  <Field label="Other essential monthly costs"><CurrencyInput register={form.register("otherEssentialCosts", { valueAsNumber: true })} /></Field>
                </FieldGrid>
              </PlannerSection>

              <PlannerSection
                title="4. Current cash and assets"
                helper="This tells the planner how much resilience already exists, how much deposit progress is real, and whether longer-term investing is already underway."
              >
                <FieldGrid>
                  <Field label="Easy-access cash savings"><CurrencyInput register={form.register("easyAccessSavings", { valueAsNumber: true })} /></Field>
                  <Field label="House deposit savings already set aside"><CurrencyInput register={form.register("houseDepositSavings", { valueAsNumber: true })} /></Field>
                  <Field label="Other goal savings"><CurrencyInput register={form.register("otherGoalSavings", { valueAsNumber: true })} /></Field>
                  <Field label="Long-term investments and ISAs"><CurrencyInput register={form.register("longTermInvestments", { valueAsNumber: true })} /></Field>
                  <Field label="Pension value"><CurrencyInput register={form.register("pensionValue", { valueAsNumber: true })} /></Field>
                  <Field label="Existing home equity"><CurrencyInput register={form.register("existingHomeEquity", { valueAsNumber: true })} /></Field>
                </FieldGrid>
              </PlannerSection>

              <PlannerSection
                title="5. Debt details"
                helper="Version one compares debt at category level rather than by account, with special weighting for debt that still looks materially expensive."
              >
                <FieldGrid>
                  <Field label="Credit card debt balance"><CurrencyInput register={form.register("creditCardBalance", { valueAsNumber: true })} /></Field>
                  <Field label="Average credit card APR"><PercentInput register={form.register("creditCardApr", { valueAsNumber: true })} /></Field>
                  <Field label="Personal loan balance"><CurrencyInput register={form.register("personalLoanBalance", { valueAsNumber: true })} /></Field>
                  <Field label="Personal loan APR"><PercentInput register={form.register("personalLoanApr", { valueAsNumber: true })} /></Field>
                  <Field label="Car finance balance"><CurrencyInput register={form.register("carFinanceBalance", { valueAsNumber: true })} /></Field>
                  <Field label="Car finance APR"><PercentInput register={form.register("carFinanceApr", { valueAsNumber: true })} /></Field>
                  <Field label="BNPL or overdraft balance"><CurrencyInput register={form.register("bnplBalance", { valueAsNumber: true })} /></Field>
                  <Field label="BNPL or overdraft cost severity">
                    <select {...form.register("bnplSeverity")} className="h-11 rounded-2xl border border-[#DCCFC4] bg-white px-4 text-sm outline-none focus:border-[#6F8F72]">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </Field>
                  <Field label="Student loan balance"><CurrencyInput register={form.register("studentLoanBalance", { valueAsNumber: true })} /></Field>
                </FieldGrid>
                <label className="mt-4 inline-flex items-center gap-3 rounded-full bg-[#F8F7F4] px-4 py-3 text-sm font-medium text-[#163A43]">
                  <input type="checkbox" {...form.register("includeStudentLoan")} className="h-4 w-4 accent-[#6F8F72]" />
                  Include student loan in active comparison
                </label>
              </PlannerSection>

              <PlannerSection
                title="6. Goals and timing"
                helper="This is where SteadyUs learns what matters most right now, how urgent a home goal is, and how much flexibility still matters."
              >
                <FieldGrid>
                  <Field label="Emergency fund target">
                    <select {...form.register("emergencyFundTarget")} className="h-11 rounded-2xl border border-[#DCCFC4] bg-white px-4 text-sm outline-none focus:border-[#6F8F72]">
                      <option value="1_month">1 month</option>
                      <option value="3_months">3 months</option>
                      <option value="6_months">6 months</option>
                      <option value="custom">Custom</option>
                    </select>
                  </Field>
                  {emergencyFundTarget === "custom" ? (
                    <Field label="Custom emergency fund months">
                      <Input type="number" {...form.register("customEmergencyFundMonths", { valueAsNumber: true })} className="h-11 rounded-2xl border-[#DCCFC4] bg-white" />
                    </Field>
                  ) : null}
                  <Field label="Debt freedom priority">
                    <select {...form.register("debtFreedomPriority")} className="h-11 rounded-2xl border border-[#DCCFC4] bg-white px-4 text-sm outline-none focus:border-[#6F8F72]">
                      <option value="essential">Essential</option>
                      <option value="important">Important</option>
                      <option value="nice_to_have">Nice to have</option>
                    </select>
                  </Field>
                  <Field label="Long-term investing priority">
                    <select {...form.register("investingPriority")} className="h-11 rounded-2xl border border-[#DCCFC4] bg-white px-4 text-sm outline-none focus:border-[#6F8F72]">
                      <option value="essential">Essential</option>
                      <option value="important">Important</option>
                      <option value="nice_to_have">Nice to have</option>
                    </select>
                  </Field>
                  <Field label="Need for flexibility or uncertainty buffer">
                    <select {...form.register("flexibilityNeed")} className="h-11 rounded-2xl border border-[#DCCFC4] bg-white px-4 text-sm outline-none focus:border-[#6F8F72]">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </Field>
                </FieldGrid>
                <label className="mt-4 inline-flex items-center gap-3 rounded-full bg-[#F8F7F4] px-4 py-3 text-sm font-medium text-[#163A43]">
                  <input type="checkbox" {...form.register("tryingToBuyHome")} className="h-4 w-4 accent-[#6F8F72]" />
                  Trying to buy a home
                </label>
                {tryingToBuyHome ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Field label="Target home purchase timing">
                      <select {...form.register("targetHomeTiming")} className="h-11 rounded-2xl border border-[#DCCFC4] bg-white px-4 text-sm outline-none focus:border-[#6F8F72]">
                        <option value="within_12_months">Within 12 months</option>
                        <option value="1_to_2_years">1–2 years</option>
                        <option value="2_to_4_years">2–4 years</option>
                        <option value="4_plus_years">4+ years</option>
                      </select>
                    </Field>
                    <Field label="Target deposit amount"><CurrencyInput register={form.register("targetDepositAmount", { valueAsNumber: true })} /></Field>
                    <Field label="Expected purchase price"><CurrencyInput register={form.register("expectedPurchasePrice", { valueAsNumber: true })} /></Field>
                    <Field label="Importance of buying soon">
                      <select {...form.register("buyingSoonImportance")} className="h-11 rounded-2xl border border-[#DCCFC4] bg-white px-4 text-sm outline-none focus:border-[#6F8F72]">
                        <option value="essential">Essential</option>
                        <option value="important">Important</option>
                        <option value="nice_to_have">Nice to have</option>
                      </select>
                    </Field>
                  </div>
                ) : null}
              </PlannerSection>

              <PlannerSection
                title="7. Available spare money scenario"
                helper="SteadyUs only uses the spare-money figure you confirm here, so this section controls how much the result can realistically ask you to do."
              >
                <FieldGrid>
                  <Field label="Current monthly spare money"><CurrencyInput register={form.register("confirmedMonthlySpareMoney", { valueAsNumber: true })} /></Field>
                  <Field label="Monthly amount you could commit to one main priority"><CurrencyInput register={form.register("monthlyCommitmentAmount", { valueAsNumber: true })} /></Field>
                  <Field label="Expected one-off cash additions in next 12 months"><CurrencyInput register={form.register("expectedOneOffCash", { valueAsNumber: true })} /></Field>
                  <Field label="Expected monthly change in costs in next 12 months" hint="Use a negative number if costs are likely to fall."><Input type="number" step={COST_CHANGE_INPUT_STEP} {...form.register("expectedMonthlyCostChange", { valueAsNumber: true })} className="h-11 rounded-2xl border-[#DCCFC4] bg-white" /></Field>
                </FieldGrid>
                <Field label="Partner agreement note" hint="Optional note to save with the plan.">
                  <Textarea {...form.register("partnerNote")} className="min-h-24 rounded-3xl border-[#DCCFC4] bg-white" />
                </Field>
              </PlannerSection>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-2xl text-sm leading-6 text-[#5A7379]">
                  SteadyUs keeps the logic explainable rather than black-box. You can edit any field and rerun the planner without losing the current flow.
                </p>
                <Button type="submit" disabled={runPlannerMutation.isPending} className="h-12 rounded-full bg-[#163A43] px-6 text-[#F8F7F4] hover:bg-[#214B55]">
                  {runPlannerMutation.isPending ? "Running planner..." : "Run planner"}
                </Button>
              </div>
            </form>

            {result ? (
              <div className="space-y-6">
                <PlannerResultHeader result={result} />

                <div className="grid gap-6 lg:grid-cols-2">
                  <RecommendationCard title="Best next priority" result={result.primaryRecommendation} sentence={result.recommendationCopy.primarySentence} />
                  <RecommendationCard title="Best second step" result={result.secondaryRecommendation} sentence={result.recommendationCopy.secondarySentence} />
                </div>

                <Card className="rounded-[28px] border-[#DCCFC4] py-0 shadow-[0_20px_60px_rgba(22,58,67,0.06)]">
                  <CardHeader>
                    <CardTitle className="text-2xl">Trade-off comparison</CardTitle>
                    <CardDescription className="text-[#5A7379]">
                      Every option shows its Safety, Progress, and Balance score, plus the current ranking and plain-English summary.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Option</TableHead>
                          <TableHead>Safety</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Rank</TableHead>
                          <TableHead>Summary</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.options.map(option => (
                          <TableRow key={option.option}>
                            <TableCell className="font-medium text-[#163A43]">{option.label}</TableCell>
                            <TableCell>{option.safety.toFixed(1)}</TableCell>
                            <TableCell>{option.progress.toFixed(1)}</TableCell>
                            <TableCell>{option.balance.toFixed(1)}</TableCell>
                            <TableCell>#{option.rank}</TableCell>
                            <TableCell className="max-w-[320px] whitespace-normal text-[#5A7379]">{option.summary}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <Card className="rounded-[28px] border-[#DCCFC4] py-0 shadow-[0_20px_60px_rgba(22,58,67,0.06)]">
                    <CardHeader>
                      <CardTitle className="text-2xl">Three-pillar breakdown</CardTitle>
                      <CardDescription className="text-[#5A7379]">
                        The top options are shown with one-decimal pillar scores and colour bands for quick scanning.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 pb-6">
                      {result.options.slice(0, 4).map(option => (
                        <div key={option.option} className="rounded-[24px] border border-[#E5DBD2] bg-[#FBFAF8] p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold">{option.label}</p>
                              <p className="mt-1 text-sm text-[#5A7379]">Weighted score {option.weightedScore.toFixed(1)}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${scoreTone(option.weightedScore)}`}>
                              {option.band}
                            </span>
                          </div>
                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <ScoreChip label="Safety" value={option.safety} />
                            <ScoreChip label="Progress" value={option.progress} />
                            <ScoreChip label="Balance" value={option.balance} />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card className="rounded-[28px] border-[#DCCFC4] py-0 shadow-[0_20px_60px_rgba(22,58,67,0.06)]">
                      <CardHeader>
                        <CardTitle className="text-2xl">What looks weak right now</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-3 pb-6 text-sm leading-7 text-[#4B666D]">
                        {result.weaknesses.map(item => (
                          <div key={item} className="flex items-start gap-3 rounded-2xl bg-[#F8F7F4] p-4">
                            <CircleAlert className="mt-1 h-4 w-4 text-[#C96A2B]" />
                            <p>{item}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="rounded-[28px] border-[#DCCFC4] py-0 shadow-[0_20px_60px_rgba(22,58,67,0.06)]">
                      <CardHeader>
                        <CardTitle className="text-2xl">Actions to take this month</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-4 pb-6 text-sm leading-7 text-[#4B666D]">
                        <ActionRow label="Monthly commitment suggestion" value={currency.format(result.monthlyCommitmentSuggestion)} />
                        <ActionRow label="Milestone target" value={result.milestoneTarget} />
                        <ActionRow label="Review trigger" value={result.reviewTrigger} />
                        <ActionRow label="Partner agreement prompt" value={result.partnerAgreementPrompt} />
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Card className="rounded-[28px] border-[#DCCFC4] py-0 shadow-[0_20px_60px_rgba(22,58,67,0.06)]">
                  <CardHeader>
                    <CardTitle className="text-2xl">What could change the answer</CardTitle>
                    <CardDescription className="text-[#5A7379]">
                      Re-run the planner when one of these shifts materially.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 pb-6 text-sm leading-7 text-[#4B666D] md:grid-cols-2">
                    {[
                      "Income becomes more stable or changes significantly.",
                      "A major bill starts, ends, or falls materially.",
                      "Emergency savings hit the target threshold.",
                      "High-cost debt drops below the material-risk threshold.",
                      "Home-buying timing changes or a one-off cash boost arrives.",
                      "You want to lower or raise the monthly commitment amount together.",
                    ].map(item => (
                      <div key={item} className="rounded-2xl bg-[#F8F7F4] p-4">{item}</div>
                    ))}
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button type="button" onClick={onSavePlan} disabled={savePlanMutation.isPending} className="h-12 rounded-full bg-[#163A43] px-6 text-[#F8F7F4] hover:bg-[#214B55]">
                    {savePlanMutation.isPending ? "Saving plan..." : "Save shared plan"}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlannerSection({
  title,
  helper,
  children,
}: {
  title: string;
  helper: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-[30px] border-[#DCCFC4] py-0 shadow-[0_18px_50px_rgba(22,58,67,0.05)]">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-[#5A7379]">{helper}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pb-6">{children}</CardContent>
    </Card>
  );
}

function CurrencyInput({ register }: { register: ReturnType<typeof useForm<PlannerFormValues>>["register"] extends (...args: any[]) => any ? any : never }) {
  return <Input type="number" step={CURRENCY_INPUT_STEP} min={CURRENCY_INPUT_MIN} {...register} className="h-11 rounded-2xl border-[#DCCFC4] bg-white" />;
}

function PercentInput({ register }: { register: ReturnType<typeof useForm<PlannerFormValues>>["register"] extends (...args: any[]) => any ? any : never }) {
  return <Input type="number" step="0.1" min="0" max="100" {...register} className="h-11 rounded-2xl border-[#DCCFC4] bg-white" />;
}

function ScoreChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[#6B8288]">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <span className="text-2xl font-semibold text-[#163A43]">{value.toFixed(1)}</span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${scoreTone(value)}`}>
          {value >= 7 ? "Green" : value >= 4.5 ? "Amber" : "Red"}
        </span>
      </div>
    </div>
  );
}

function RecommendationCard({
  title,
  result,
  sentence,
}: {
  title: string;
  result: { option: keyof typeof optionIcon; label: string; milestoneTarget: string; reviewTrigger: string } | null;
  sentence: string;
}) {
  const Icon = result ? optionIcon[result.option] : ArrowRight;

  return (
    <Card className="rounded-[28px] border-[#DCCFC4] py-0 shadow-[0_20px_60px_rgba(22,58,67,0.06)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <span className="rounded-2xl bg-[#EAF0E8] p-3 text-[#163A43]">
            <Icon className="h-5 w-5" />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 pb-6 text-sm leading-7 text-[#4B666D]">
        <p className="text-base leading-7 text-[#163A43]">{sentence}</p>
        {result ? (
          <>
            <div className="rounded-2xl bg-[#F8F7F4] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#6B8288]">Milestone</p>
              <p className="mt-2">{result.milestoneTarget}</p>
            </div>
            <div className="rounded-2xl bg-[#F8F7F4] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#6B8288]">Review trigger</p>
              <p className="mt-2">{result.reviewTrigger}</p>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

function PlannerResultHeader({ result }: { result: Awaited<ReturnType<typeof runMutationShape>> }) {
  return (
    <Card className="rounded-[32px] border-[#DCCFC4] bg-[#163A43] py-0 text-[#F8F7F4] shadow-[0_24px_80px_rgba(22,58,67,0.12)]">
      <CardHeader>
        <CardTitle className="text-3xl text-[#F8F7F4]">Top summary</CardTitle>
        <CardDescription className="text-[#DDE5E7]">
          This summary is derived directly from the pillar scores and any override logic.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 pb-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="text-base leading-8 text-[#EDF3F4]">{result.topSummary}</div>
        <div className="grid gap-3 rounded-[28px] bg-white/8 p-5 text-sm leading-7 text-[#ECF1F2]">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#DCCFC4]">Combined take-home income</p>
            <p className="mt-1 text-lg font-semibold">{currency.format(result.derived.combinedTakeHomeIncome)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#DCCFC4]">Essential monthly spending</p>
            <p className="mt-1 text-lg font-semibold">{currency.format(result.derived.essentialMonthlySpending)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#DCCFC4]">Emergency coverage</p>
            <p className="mt-1 text-lg font-semibold">{result.derived.emergencyCoverageMonths.toFixed(1)} months</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F8F7F4] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[#6B8288]">{label}</p>
      <p className="mt-2 text-[#163A43]">{value}</p>
    </div>
  );
}

type RunPlannerOutput = Awaited<ReturnType<typeof trpc.planner.run.useMutation>>;
type SavePlanOutput = Awaited<ReturnType<typeof trpc.planner.save.useMutation>>;

function runMutationShape() {
  return {} as unknown as NonNullable<ReturnType<typeof trpc.planner.run.useMutation>["data"]>;
}

function saveMutationShape() {
  return {} as unknown as NonNullable<ReturnType<typeof trpc.planner.save.useMutation>["data"]>;
}
