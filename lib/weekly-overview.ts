import { daysUntil, recordDeadline, todayISO, type AppData } from "./domain";
import { calendarItems } from "./operating-system";
import { workspaceAlerts } from "./intelligence";

export function weeklyOverview(data: AppData, today = todayISO()) {
  const attention = new Map<string, { recordId: string; title: string; reasons: string[] }>();
  const add = (recordId: string, title: string, reason: string) => {
    const item = attention.get(recordId) || { recordId, title, reasons: [] };
    if (!item.reasons.includes(reason)) item.reasons.push(reason);
    attention.set(recordId, item);
  };
  const records = new Map(data.records.map(r => [r.opportunity.id, r]));
  for (const alert of workspaceAlerts(data, [], today)) {
    // Upcoming events have their own compact section; they are not problems.
    if (!alert.recordId || /:(deadline|interview|override|reflect):?/.test(alert.id)) continue;
    const record = records.get(alert.recordId);
    const brief:Record<string,string>={"Next action is overdue":"Your next action is overdue","No recorded update for three weeks":"No submission update recorded for three weeks","Source has not been checked recently":"Recheck older source details","A saved opportunity may now be closed":"Check whether applications are still open","Reference requirement still incomplete":"Confirm the outstanding reference"};
    if (record) add(alert.recordId, record.opportunity.title, brief[alert.title]||alert.title);
  }
  for (const r of data.records) {
    if (["Completed", "Not pursuing", "Unsuccessful"].includes(r.status)) continue;
    const o = r.opportunity, deadline = recordDeadline(r);
    if (["Saved", "Researching", "Preparing application"].includes(r.status) && deadline && (daysUntil(deadline, today) ?? 0) < 0) add(o.id, o.title, "Recorded application deadline has passed — check the provider");
    if (o.openingDate && deadline && o.openingDate > deadline) add(o.id, o.title, "Opening falls after the deadline — check both dates");
    if (o.source === "imported" && o.unconfirmed.length) add(o.id, o.title, "Imported details still need checking: " + o.unconfirmed.slice(0, 2).join(", "));
    if (r.intent === "Applying" && ["Saved", "Researching", "Preparing application"].includes(r.status)) {
      const outstanding = r.requirements.filter(t => !t.done).length;
      if (outstanding) add(o.id, o.title, outstanding + " confirmed requirement" + (outstanding === 1 ? "" : "s") + " unfinished");
    }
  }
  const done = new Set(data.actionStates.filter(s => s.state !== "Snoozed").map(s => s.id));
  const upcoming = calendarItems(data, [], today).filter(i => {
    const days = daysUntil(i.date, today);
    return days !== null && days >= 0 && days <= 14 && i.kind !== "Milestone" && !done.has(i.actionId || i.id);
  });
  return { attention: [...attention.values()], upcoming };
}
