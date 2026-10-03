"use client";
import { useMemo } from "react";
import { dateLabel } from "@/lib/domain";
import { weeklyOverview } from "@/lib/weekly-overview";
import { useWorkspace } from "./workspace-context";

export function DashboardWeek() {
  const { data, navigate, setActiveRecord } = useWorkspace();
  const { attention, upcoming } = useMemo(() => weeklyOverview(data), [data]);
  const open = (id: string) => { setActiveRecord(id); navigate("saved"); };
  return <div className="weekly-overview">
    <section aria-label="Coming up"><div className="panel-heading"><h2>Coming up</h2><button className="inline-link" onClick={() => navigate("calendar")}>All dates</button></div><p className="fine-print">Your saved work · next two weeks</p>
      {upcoming.length ? upcoming.slice(0, 4).map(item => <button key={item.id} className="compact-record weekly-date" onClick={() => open(item.recordId)}><span><strong>{item.title}</strong><small>{dateLabel(item.date)} · {item.basis}</small></span></button>) : <p className="card-intro">No exact dates recorded in the next two weeks.</p>}
      {upcoming.length > 4 && <button className="inline-link" onClick={() => navigate("calendar")}>See all {upcoming.length} upcoming dates</button>}
    </section>
    <section aria-label="Needs attention"><h2>Needs attention</h2>
      {attention.length ? <><p className="fine-print">{attention.length} opportunit{attention.length === 1 ? "y needs" : "ies need"} a check</p>{attention.slice(0, 3).map(item => <button key={item.recordId} className="compact-record attention-item" onClick={() => open(item.recordId)}><span><strong>{item.title}</strong><small>{item.reasons[0]}{item.reasons.length > 1 ? " · " + (item.reasons.length - 1) + " more check(s)" : ""}</small></span></button>)}{attention.length > 3 && <details className="workspace-section"><summary>More checks ({attention.length - 3})</summary>{attention.slice(3).map(item => <button className="compact-record" key={item.recordId} onClick={() => open(item.recordId)}><span><strong>{item.title}</strong><small>{item.reasons.join(" · ")}</small></span></button>)}</details>}</> : <p className="card-intro">No recorded issues to flag. Check provider details before applying.</p>}
    </section>
  </div>;
}
