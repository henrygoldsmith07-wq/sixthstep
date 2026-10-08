import { todayISO, type TrackedRecord } from "./domain";

// Labels clarify the student workflow without changing persisted v2 values.
export function lifecycleLabel(record: TrackedRecord): string {
  if (record.status === "Saved" || record.status === "Researching") return record.intent === "Applying" ? "Applying" : record.intent;
  return { "Preparing application": "Applying", Applied: "Submitted", "Interview / next stage": "Interview / next stage", Accepted: "Offer / accepted", Unsuccessful: "Unsuccessful", "Not pursuing": "Not pursuing", Completed: "Completed" }[record.status];
}

export function lifecycleNext(record: TrackedRecord): string {
  const stage = lifecycleLabel(record);
  if (stage === "Applying") return "Complete your requirements and answers, then submit on the provider website.";
  if (stage === "Submitted") return "Check the provider's response schedule or add a follow-up reminder.";
  if (stage === "Interview / next stage") return "Record the interview date and prepare examples from your evidence.";
  if (stage === "Offer / accepted") return "Check acceptance instructions and record the programme date.";
  if (stage === "Completed") return "Record what you did and reflect on what you learned.";
  if (stage === "Unsuccessful" || stage === "Not pursuing") return "Keep useful notes and explore another possibility when you're ready.";
  return "Check the criteria, then shortlist this opportunity or start preparing an application.";
}

export function stageChange(record: TrackedRecord, status: TrackedRecord["status"], today = todayISO()): Partial<TrackedRecord> {
  return { status, ...(["Preparing application", "Applied", "Interview / next stage", "Accepted"].includes(status) ? { intent: "Applying" as const } : {}), ...(status === "Applied" && !record.appliedAt ? { appliedAt: today } : {}) };
}

export function shortlistPatch(record?: TrackedRecord): Partial<TrackedRecord> {
  // A quick discovery action must not demote work already being applied for.
  return !record || ["Saved", "Researching"].includes(record.status) && record.intent !== "Applying" ? { intent: "Shortlisted" } : {};
}
