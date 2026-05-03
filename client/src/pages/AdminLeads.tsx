import { useMemo, useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Clock3, Mail, Target, Users } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { getLeadOperatorLabel, getLeadOperatorPriority, getLeadOperatorSummary } from "@/lib/leadOperator";

const leadStatuses = [
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

const leadOutcomes = ["pending", "invited", "activated", "inactive", "referred", "lost"] as const;

type LeadStatus = (typeof leadStatuses)[number];
type LeadOutcome = (typeof leadOutcomes)[number];

type DraftLeadUpdate = {
  currentStatus?: LeadStatus;
  outcome?: LeadOutcome;
  nextAction?: string;
  nextActionDueAt?: string;
  adminNotes?: string;
};

const fitTone: Record<string, string> = {
  high: "bg-[#DDEDDD] text-[#274E38]",
  medium: "bg-[#F3E6D9] text-[#8B532B]",
  low: "bg-[#E8ECEB] text-[#36535B]",
};

const statusTone: Record<string, string> = {
  new: "bg-[#E8ECEB] text-[#36535B]",
  reviewed: "bg-[#DDE9EE] text-[#214B55]",
  qualified: "bg-[#DDEDDD] text-[#274E38]",
  invited: "bg-[#E8E4F6] text-[#4B3F7A]",
  responded: "bg-[#F1E4DB] text-[#8B532B]",
  activated: "bg-[#D6E7DD] text-[#234D37]",
  nurture: "bg-[#F5EFE2] text-[#7B5C28]",
  inactive: "bg-[#EEE5E2] text-[#75514A]",
  referred: "bg-[#E8E9F5] text-[#424E88]",
  lost: "bg-[#F3D9D8] text-[#8E3C3B]",
};

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const operatorPriorityTone: Record<string, string> = {
  urgent: "bg-[#F3D9D8] text-[#8E3C3B]",
  priority: "bg-[#F3E6D9] text-[#8B532B]",
  new: "bg-[#E8ECEB] text-[#36535B]",
  normal: "bg-[#E6EEE8] text-[#274E38]",
};

function formatDateTime(timestamp?: number | null) {
  if (!timestamp) return "—";
  return new Date(timestamp).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDatetimeLocalValue(timestamp?: number | null) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocalValue(value?: string) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

export default function AdminLeads() {
  const utils = trpc.useUtils();
  const [drafts, setDrafts] = useState<Record<string, DraftLeadUpdate>>({});
  const [statusFilter, setStatusFilter] = useState<"all" | LeadStatus>("all");

  const leadsQuery = trpc.admin.leads.useQuery(undefined, {
    retry: false,
  });

  const updateLead = trpc.admin.updateLead.useMutation({
    onSuccess: async () => {
      toast.success("Lead updated.");
      await utils.admin.leads.invalidate();
    },
    onError: error => {
      toast.error(error.message || "Could not update the lead right now.");
    },
  });

  const leads = leadsQuery.data ?? [];

  const summary = useMemo(() => {
    const total = leads.length;
    const highFit = leads.filter(lead => lead.fitScore === "high").length;
    const activePipeline = leads.filter(lead => ["new", "reviewed", "qualified", "invited", "responded"].includes(lead.currentStatus)).length;
    const withPlans = leads.filter(lead => lead.planCount > 0).length;

    return { total, highFit, activePipeline, withPlans };
  }, [leads]);

  const operatorSummary = useMemo(() => getLeadOperatorSummary(leads), [leads]);

  const updateDraft = (leadId: string, next: Partial<DraftLeadUpdate>) => {
    setDrafts(current => ({
      ...current,
      [leadId]: {
        ...current[leadId],
        ...next,
      },
    }));
  };

  const getDraft = (lead: (typeof leads)[number]) => ({
    currentStatus: drafts[lead.leadId]?.currentStatus ?? lead.currentStatus,
    outcome: drafts[lead.leadId]?.outcome ?? lead.outcome,
    nextAction: drafts[lead.leadId]?.nextAction ?? lead.nextAction,
    nextActionDueAt: drafts[lead.leadId]?.nextActionDueAt ?? toDatetimeLocalValue(lead.nextActionDueAt),
    adminNotes: drafts[lead.leadId]?.adminNotes ?? lead.adminNotes ?? "",
  });

  const filteredLeads = useMemo(() => {
    const visibleLeads = statusFilter === "all" ? leads : leads.filter(lead => lead.currentStatus === statusFilter);
    const priorityRank: Record<string, number> = { urgent: 0, priority: 1, new: 2, normal: 3 };

    return [...visibleLeads].sort((a, b) => {
      const priorityDifference =
        priorityRank[getLeadOperatorPriority(a)] - priorityRank[getLeadOperatorPriority(b)];

      if (priorityDifference !== 0) return priorityDifference;
      return b.createdAtMs - a.createdAtMs;
    });
  }, [leads, statusFilter]);

  const exportCsv = () => {
    if (!filteredLeads.length) {
      toast.error("There are no leads in the current view to export.");
      return;
    }

    const escapeValue = (value: unknown) => {
      const stringValue = value == null ? "" : String(value);
      return `"${stringValue.replaceAll('"', '""')}"`;
    };

    const header = [
      "lead_id",
      "first_name",
      "email",
      "location",
      "fit_score",
      "current_status",
      "outcome",
      "source_type",
      "source_detail",
      "priorities",
      "hardest_right_now",
      "plan_count",
      "latest_recommendation",
      "next_action",
      "next_action_due_at",
      "last_touch_at",
      "created_at",
      "admin_notes",
    ];

    const rows = filteredLeads.map(lead => [
      lead.leadId,
      lead.firstName,
      lead.email,
      lead.location,
      lead.fitScore,
      lead.currentStatus,
      lead.outcome,
      lead.sourceType,
      lead.sourceDetail ?? "",
      lead.priorities.join(" | "),
      lead.hardestRightNow,
      String(lead.planCount),
      lead.latestPlan?.primaryRecommendation?.replaceAll("_", " ") ?? "",
      lead.nextAction ?? "",
      lead.nextActionDueAt ? new Date(lead.nextActionDueAt).toISOString() : "",
      lead.lastTouchAt ? new Date(lead.lastTouchAt).toISOString() : "",
      new Date(lead.createdAtMs).toISOString(),
      lead.adminNotes ?? "",
    ]);

    const csv = [header, ...rows].map(row => row.map(escapeValue).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filterLabel = statusFilter === "all" ? "all-statuses" : statusFilter;

    link.href = url;
    link.download = `steadyus-leads-${filterLabel}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Lead export downloaded.");
  };

  const saveLead = async (lead: (typeof leads)[number]) => {
    const draft = getDraft(lead);
    await updateLead.mutateAsync({
      leadId: lead.leadId,
      currentStatus: draft.currentStatus,
      outcome: draft.outcome,
      nextAction: draft.nextAction,
      nextActionDueAt: fromDatetimeLocalValue(draft.nextActionDueAt),
      adminNotes: draft.adminNotes.trim() ? draft.adminNotes.trim() : null,
      lastTouchAt: Date.now(),
    });
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[linear-gradient(180deg,#F8F7F4_0%,#F8F7F4_55%,#F0E8E0_100%)] text-[#163A43]">
        <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6 px-2 py-2 lg:px-4">
          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="border-[#D8CCC0] bg-[#FCFBF8] shadow-[0_20px_60px_rgba(22,58,67,0.06)]">
              <CardHeader className="space-y-4">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#C9D8CB] bg-[#E6EEE8] px-4 py-2 text-sm text-[#36535B]">
                  <Users className="h-4 w-4 text-[#6F8F72]" />
                  Owner view · SteadyUs beta pipeline
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl tracking-tight text-[#163A43]">Lead tracker</CardTitle>
                  <CardDescription className="max-w-2xl text-base leading-7 text-[#4C666D]">
                    Review every SteadyUs beta signup, see fit and progress at a glance, and keep next actions tidy for outreach.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Total leads",
                    value: summary.total,
                    note: "All captured beta signups",
                    icon: Users,
                  },
                  {
                    label: "High-fit leads",
                    value: summary.highFit,
                    note: "Best early beta matches",
                    icon: Target,
                  },
                  {
                    label: "Active pipeline",
                    value: summary.activePipeline,
                    note: "Still being worked",
                    icon: Clock3,
                  },
                  {
                    label: "Plans created",
                    value: summary.withPlans,
                    note: "Leads with saved planner output",
                    icon: CheckCircle2,
                  },
                ].map(item => (
                  <div key={item.label} className="rounded-[28px] border border-[#E5DBD0] bg-white/90 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[#5A747A]">{item.label}</p>
                      <item.icon className="h-4 w-4 text-[#6F8F72]" />
                    </div>
                    <p className="mt-4 text-3xl font-semibold tracking-tight text-[#163A43]">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-[#6B8288]">{item.note}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-[#D8CCC0] bg-[#163A43] text-[#F8F7F4] shadow-[0_20px_60px_rgba(22,58,67,0.10)]">
              <CardHeader>
                <CardTitle className="text-2xl tracking-tight text-[#F8F7F4]">Operator queue for this week</CardTitle>
                <CardDescription className="text-[#D6E0E2]">
                  Use these counts to decide what needs attention first before you work through the full SteadyUs pipeline.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[28px] border border-white/10 bg-white/10 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#DCCFC4]">Needs attention now</p>
                    <p className="mt-3 text-3xl font-semibold">{operatorSummary.needsAttentionNowCount}</p>
                    <p className="mt-3 text-sm leading-7 text-[#D6E0E2]">
                      Overdue follow-ups plus high-fit leads that still have no saved plan.
                    </p>
                  </div>
                  <div className="rounded-[28px] border border-white/10 bg-white/10 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#DCCFC4]">Overdue follow-up</p>
                    <p className="mt-3 text-3xl font-semibold">{operatorSummary.overdueCount}</p>
                    <p className="mt-3 text-sm leading-7 text-[#D6E0E2]">
                      Active leads with a next-action due date that has already passed.
                    </p>
                  </div>
                  <div className="rounded-[28px] border border-white/10 bg-white/10 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#DCCFC4]">High fit, no plan</p>
                    <p className="mt-3 text-3xl font-semibold">{operatorSummary.highFitWithoutPlanCount}</p>
                    <p className="mt-3 text-sm leading-7 text-[#D6E0E2]">
                      Your best candidates for a nudge into the planner or a short beta invite.
                    </p>
                  </div>
                  <div className="rounded-[28px] border border-white/10 bg-white/10 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#DCCFC4]">Untouched active leads</p>
                    <p className="mt-3 text-3xl font-semibold">{operatorSummary.untouchedCount}</p>
                    <p className="mt-3 text-sm leading-7 text-[#D6E0E2]">
                      Captured leads with no owner touch logged yet, worth reviewing before they cool off.
                    </p>
                  </div>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 text-sm leading-7 text-[#D6E0E2]">
                  <p className="font-semibold uppercase tracking-[0.16em] text-[#DCCFC4]">Support inbox rhythm</p>
                  <p className="mt-3">
                    Until the branded SteadyUs inbox is live, treat new beta-form submissions as the main support queue. If you handle any replies through a private inbox in the meantime, mirror the outcome here with status, next action, and notes so the pipeline stays complete.
                  </p>
                  <p className="mt-2">
                    The practical live routine is simple: review new leads and any inbox replies together at least once per day, then prioritise anything urgent, high-fit, or overdue first.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="border-[#D8CCC0] bg-white/95 shadow-[0_20px_60px_rgba(22,58,67,0.06)]">
            <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle className="text-2xl tracking-tight text-[#163A43]">Pipeline view</CardTitle>
                <CardDescription className="mt-2 text-sm leading-6 text-[#5A747A]">
                  Use this table to update status, outcome, next step, and internal notes without leaving the SteadyUs workflow.
                </CardDescription>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E5DBD0] bg-[#FBF8F4] px-4 py-2 text-sm text-[#5A747A]">
                <Mail className="h-4 w-4 text-[#C96A2B]" />
                Owner-only data · sign-in required
              </div>
            </CardHeader>
            <CardContent>
              {leadsQuery.isLoading ? (
                <div className="rounded-[28px] border border-[#E5DBD0] bg-[#FBF8F4] p-8 text-sm text-[#5A747A]">
                  Loading beta leads…
                </div>
              ) : leadsQuery.error ? (
                <div className="rounded-[28px] border border-[#EBC9C7] bg-[#FBF0EF] p-8 text-sm leading-7 text-[#8E3C3B]">
                  {leadsQuery.error.message.includes("FORBIDDEN") || leadsQuery.error.message.includes("UNAUTHORIZED")
                    ? "You need an owner/admin account to access the SteadyUs lead tracker."
                    : leadsQuery.error.message}
                </div>
              ) : leads.length === 0 ? (
                <div className="rounded-[28px] border border-[#E5DBD0] bg-[#FBF8F4] p-8 text-sm text-[#5A747A]">
                  No beta leads yet. New signup submissions will appear here automatically.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-4 rounded-[28px] border border-[#E5DBD0] bg-[#FCFBF8] p-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="grid gap-2">
                      <p className="text-sm font-medium text-[#5A747A]">Filter the working queue</p>
                      <div className="w-full max-w-[240px]">
                        <Select value={statusFilter} onValueChange={value => setStatusFilter(value as "all" | LeadStatus)}>
                          <SelectTrigger className="h-11 rounded-2xl border-[#DCCFC4] bg-[#FCFBF9]">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            {leadStatuses.map(status => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-3 text-sm text-[#5A747A] lg:items-end">
                      <p>
                        Showing <span className="font-semibold text-[#163A43]">{filteredLeads.length}</span> of <span className="font-semibold text-[#163A43]">{leads.length}</span> leads.
                      </p>
                      <Button
                        type="button"
                        onClick={exportCsv}
                        variant="outline"
                        className="rounded-full border-[#DCCFC4] bg-[#FBF8F4] px-5 text-[#163A43] hover:bg-[#F3EDE6]"
                      >
                        Export current view as CSV
                      </Button>
                    </div>
                  </div>

                  {filteredLeads.length === 0 ? (
                    <div className="rounded-[28px] border border-[#E5DBD0] bg-[#FBF8F4] p-8 text-sm text-[#5A747A]">
                      No leads match the current status filter yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-[28px] border border-[#E5DBD0] bg-[#FCFBF8]">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-[#E5DBD0] bg-[#F8F3ED] hover:bg-[#F8F3ED]">
                            <TableHead className="min-w-[220px]">Lead</TableHead>
                            <TableHead className="min-w-[210px]">Fit & priorities</TableHead>
                            <TableHead className="min-w-[240px]">Hardest right now</TableHead>
                            <TableHead className="min-w-[280px]">Planner context</TableHead>
                            <TableHead className="min-w-[420px]">Owner actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLeads.map(lead => {
                            const draft = getDraft(lead);
                            const saving = updateLead.isPending && updateLead.variables?.leadId === lead.leadId;
                            const latestPlan = lead.latestPlan;
                            const operatorPriority = getLeadOperatorPriority(lead);
                            const operatorLabel = getLeadOperatorLabel(operatorPriority);

                            return (
                              <TableRow key={lead.leadId} className="align-top border-[#EEE5DC]">
                                <TableCell>
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-base font-semibold text-[#163A43]">{lead.firstName}</p>
                                      <p className="text-sm text-[#4C666D]">{lead.email}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                      <span className="rounded-full bg-[#EDF2F2] px-3 py-1 font-medium text-[#36535B]">{lead.leadId}</span>
                                      <span className="rounded-full bg-[#F5EFE2] px-3 py-1 font-medium text-[#7B5C28]">{lead.location}</span>
                                    </div>
                                    <div className="text-sm leading-6 text-[#5A747A]">
                                      <p>
                                        Operator priority:{" "}
                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${operatorPriorityTone[operatorPriority] ?? operatorPriorityTone.normal}`}>
                                          {operatorLabel}
                                        </span>
                                      </p>
                                      <p>Source: <span className="font-medium text-[#163A43]">{lead.sourceType}</span>{lead.sourceDetail ? ` · ${lead.sourceDetail}` : ""}</p>
                                      <p>Joined {formatDistanceToNow(new Date(lead.createdAtMs), { addSuffix: true })}</p>
                                      <p>Last touch: {lead.lastTouchAt ? formatDateTime(lead.lastTouchAt) : "No owner update yet"}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-3">
                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${fitTone[lead.fitScore] ?? fitTone.low}`}>
                                      {lead.fitScore} fit
                                    </span>
                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${statusTone[draft.currentStatus] ?? statusTone.new}`}>
                                      {draft.currentStatus}
                                    </span>
                                    <div className="text-sm leading-6 text-[#4C666D]">
                                      <p className="font-medium text-[#163A43]">Priorities</p>
                                      <p>{lead.priorities.join(" · ")}</p>
                                      <p className="mt-2">Urgency: {lead.urgencyLevel}</p>
                                      <p>Beta openness: {lead.betaOpenness}</p>
                                      <p>Call openness: {lead.callOpenness}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-3 text-sm leading-7 text-[#4C666D]">
                                    <p className="font-medium text-[#163A43]">{lead.hardestRightNow}</p>
                                    {lead.notes ? (
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6F8F72]">Signup note</p>
                                        <p className="mt-1">{lead.notes}</p>
                                      </div>
                                    ) : (
                                      <p>No additional signup notes.</p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-3 text-sm leading-7 text-[#4C666D]">
                                    {latestPlan ? (
                                      <>
                                        <p className="font-medium text-[#163A43]">Primary recommendation: {latestPlan.primaryRecommendation.replaceAll("_", " ")}</p>
                                        <p>Monthly commitment: {currency.format(Number(latestPlan.monthlyCommitmentAmount))}</p>
                                        <p>Milestone: {latestPlan.milestoneTarget}</p>
                                        <p>Review date: {formatDateTime(latestPlan.reviewDateMs)}</p>
                                        <p>Plans saved: {lead.planCount}</p>
                                      </>
                                    ) : (
                                      <>
                                        <p className="font-medium text-[#163A43]">No saved plan yet</p>
                                        <p>This lead has not saved a SteadyUs recommendation into a shared plan.</p>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="grid gap-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <label className="grid gap-2 text-sm font-medium text-[#163A43]">
                                        Status
                                        <Select
                                          value={draft.currentStatus}
                                          onValueChange={value => updateDraft(lead.leadId, { currentStatus: value as LeadStatus })}
                                        >
                                          <SelectTrigger className="h-11 w-full rounded-2xl border-[#DCCFC4] bg-[#FCFBF9]">
                                            <SelectValue placeholder="Choose status" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {leadStatuses.map(status => (
                                              <SelectItem key={status} value={status}>
                                                {status}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </label>
                                      <label className="grid gap-2 text-sm font-medium text-[#163A43]">
                                        Outcome
                                        <Select
                                          value={draft.outcome}
                                          onValueChange={value => updateDraft(lead.leadId, { outcome: value as LeadOutcome })}
                                        >
                                          <SelectTrigger className="h-11 w-full rounded-2xl border-[#DCCFC4] bg-[#FCFBF9]">
                                            <SelectValue placeholder="Choose outcome" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {leadOutcomes.map(outcome => (
                                              <SelectItem key={outcome} value={outcome}>
                                                {outcome}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </label>
                                    </div>

                                    <label className="grid gap-2 text-sm font-medium text-[#163A43]">
                                      Next action
                                      <Input
                                        value={draft.nextAction}
                                        onChange={event => updateDraft(lead.leadId, { nextAction: event.target.value })}
                                        className="h-11 rounded-2xl border-[#DCCFC4] bg-[#FCFBF9]"
                                        placeholder="Send invite, schedule call, or leave in nurture"
                                      />
                                    </label>

                                    <div className="grid gap-4 md:grid-cols-2">
                                      <label className="grid gap-2 text-sm font-medium text-[#163A43]">
                                        Next action due
                                        <Input
                                          type="datetime-local"
                                          value={draft.nextActionDueAt}
                                          onChange={event => updateDraft(lead.leadId, { nextActionDueAt: event.target.value })}
                                          className="h-11 rounded-2xl border-[#DCCFC4] bg-[#FCFBF9]"
                                        />
                                      </label>
                                      <div className="rounded-[24px] border border-[#E5DBD0] bg-[#FBF8F4] p-4 text-sm leading-6 text-[#5A747A]">
                                        <p className="font-medium text-[#163A43]">Current due date</p>
                                        <p className="mt-1">{formatDateTime(lead.nextActionDueAt)}</p>
                                        <p className="mt-2 text-xs text-[#6B8288]">Queue signal: {operatorLabel}</p>
                                      </div>
                                    </div>

                                    <label className="grid gap-2 text-sm font-medium text-[#163A43]">
                                      Owner notes
                                      <Textarea
                                        value={draft.adminNotes}
                                        onChange={event => updateDraft(lead.leadId, { adminNotes: event.target.value })}
                                        className="min-h-[112px] rounded-[24px] border-[#DCCFC4] bg-[#FCFBF9]"
                                        placeholder="Capture follow-up context, interview interest, objections, or notable couple dynamics."
                                      />
                                    </label>

                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <p className="text-xs leading-6 text-[#6B8288]">
                                        Saving marks this lead as touched now and refreshes the pipeline view.
                                      </p>
                                      <Button
                                        type="button"
                                        disabled={saving}
                                        onClick={() => void saveLead(lead)}
                                        className="rounded-full bg-[#163A43] px-5 text-[#F8F7F4] hover:bg-[#214B55]"
                                      >
                                        {saving ? "Saving…" : "Save owner update"}
                                      </Button>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
