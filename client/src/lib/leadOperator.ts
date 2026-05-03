const activeLeadStatuses = new Set([
  "new",
  "reviewed",
  "qualified",
  "invited",
  "responded",
]);

type LeadLike = {
  fitScore: string;
  currentStatus: string;
  nextActionDueAt?: number | null;
  lastTouchAt?: number | null;
  createdAtMs: number;
  planCount: number;
};

export type LeadOperatorPriority = "urgent" | "priority" | "new" | "normal";

export function getLeadOperatorPriority(lead: LeadLike, now = Date.now()): LeadOperatorPriority {
  const isActive = activeLeadStatuses.has(lead.currentStatus);
  const isOverdue = Boolean(lead.nextActionDueAt && lead.nextActionDueAt < now && isActive);
  const isUntouched = !lead.lastTouchAt;
  const isHighFitWithoutPlan = lead.fitScore === "high" && lead.planCount === 0;

  if (isOverdue) return "urgent";
  if (isHighFitWithoutPlan) return "priority";
  if (isUntouched && isActive) return "new";
  return "normal";
}

export function getLeadOperatorSummary(leads: LeadLike[], now = Date.now()) {
  const overdueCount = leads.filter(lead => getLeadOperatorPriority(lead, now) === "urgent").length;
  const highFitWithoutPlanCount = leads.filter(lead => lead.fitScore === "high" && lead.planCount === 0).length;
  const untouchedCount = leads.filter(lead => !lead.lastTouchAt && activeLeadStatuses.has(lead.currentStatus)).length;
  const needsAttentionNowCount = leads.filter(lead => {
    const priority = getLeadOperatorPriority(lead, now);
    return priority === "urgent" || priority === "priority";
  }).length;

  return {
    overdueCount,
    highFitWithoutPlanCount,
    untouchedCount,
    needsAttentionNowCount,
  };
}

export function getLeadOperatorLabel(priority: LeadOperatorPriority) {
  switch (priority) {
    case "urgent":
      return "Overdue follow-up";
    case "priority":
      return "High fit · follow up first";
    case "new":
      return "New lead · review soon";
    default:
      return "In workflow";
  }
}
