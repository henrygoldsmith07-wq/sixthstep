"use client";
import { intentions, statuses, type TrackedRecord } from "@/lib/domain";
import { lifecycleNext, stageChange } from "@/lib/lifecycle";
import { Field } from "./shared";

export function ApplicationLifecycle({ record, update }: { record: TrackedRecord; update: (patch: Partial<TrackedRecord>) => void }) {
  const deciding = ["Saved", "Researching"].includes(record.status) && record.intent !== "Applying";
  return <section className="application-lifecycle" aria-label="Application stage">
    <Field label={"Application status for " + record.opportunity.title}><select className="text-input" value={record.status} onChange={e => update(stageChange(record, e.target.value as TrackedRecord["status"]))}>{statuses.map(stage => <option key={stage} value={stage}>{stage === "Applied" ? "Submitted" : stage === "Preparing application" ? "Applying" : stage === "Accepted" ? "Offer / accepted" : stage}</option>)}</select></Field>
    <p className="fine-print">{lifecycleNext(record)}</p>
    {deciding && <div className="detail-actions">{record.intent !== "Shortlisted" && <button className="button secondary" onClick={() => update({ intent: "Shortlisted" })}>Shortlist this opportunity</button>}<button className="button primary" onClick={() => update(stageChange(record, "Preparing application"))}>Start application</button></div>}
    <details className="workspace-section"><summary>Interest & priority</summary><div className="form-grid"><Field label="Interest level" hint="Your interest is separate from the application stage."><select className="text-input" value={record.intent} onChange={e => update({ intent: e.target.value as TrackedRecord["intent"] })}>{intentions.map(intent => <option key={intent}>{intent}</option>)}</select></Field><Field label="Priority"><select className="text-input" value={record.priority} onChange={e => update({ priority: e.target.value as TrackedRecord["priority"] })}><option>Normal</option><option>High</option><option>Low</option></select></Field></div></details>
  </section>;
}
