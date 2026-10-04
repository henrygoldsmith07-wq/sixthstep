"use client";
import { useMemo, useState } from "react";
import { Navigation } from "lucide-react";
import { buildMap, groupPins, greatBritain, mapView, northernIreland, outlinePath, project, readLocation, unplacedReasons } from "@/lib/geo";
import type { RichOpportunity } from "@/lib/domain";
import { Empty, Notice } from "./shared";

// The outline is schematic and the pins come from the town each provider names. Neither is a
// survey map, and nothing here is inferred from a postcode or device location.
export function OpportunityMap({ items, onOpen, origin = "" }: { items: RichOpportunity[]; onOpen: (item: RichOpportunity) => void; origin?: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const map = useMemo(() => buildMap(items, origin), [items, origin]);
  const groups = useMemo(() => groupPins(map.pins), [map.pins]);
  // Towns are close together on a UK-sized map, so two pins can land on the same few pixels and the
  // top one would swallow the click. Bigger places keep their true position; any pin that still
  // collides is nudged straight down by the overlap, so every marker stays reachable.
  const placed = useMemo(() => {
    const gap = 26, taken: { x: number; y: number }[] = [];
    return [...groups].sort((a, b) => b.pins.length - a.pins.length || a.place.name.localeCompare(b.place.name)).map(group => {
      const { x, y } = project(group.place.lat, group.place.lng);
      let shift = 0;
      while (taken.some(p => Math.abs(p.x - x) < gap && Math.abs(p.y - (y + shift)) < gap)) shift += gap;
      taken.push({ x, y: y + shift });
      return { group, x, y: y + shift };
    }).sort((a, b) => a.y - b.y);
  }, [groups]);
  const chosen = groups.find(group => group.key === selected) || null;
  const land = useMemo(() => outlinePath(greatBritain), []);
  const ireland = useMemo(() => outlinePath(northernIreland), []);
  const home = origin ? groups.find(group => group.place.name.toLowerCase() === origin.trim().toLowerCase()) : undefined;

  if (!items.length) return <Empty title="Nothing to place on the map yet.">Clear your filters, or add the location the provider gives you.</Empty>;

  return <div className="map-workspace">
    <div className="map-figure">
      <svg className="map-outline" viewBox={`0 0 ${mapView.width} ${mapView.height}`} aria-hidden="true" focusable="false">
        <path d={land} className="map-land" />
        <path d={ireland} className="map-land" />
        {placed.map(({ group, x, y }) => <circle key={group.key} cx={x} cy={y} r={group.key === chosen?.key ? 9 : 6} className={"map-halo " + (group.key === chosen?.key ? "chosen" : "")} />)}
      </svg>
      <ul className="map-markers">
        {placed.map(({ group, x, y }) => <li key={group.key} style={{ left: `${(x / mapView.width) * 100}%`, top: `${(y / mapView.height) * 100}%` }}>
          <button type="button" aria-pressed={group.key === chosen?.key} aria-label={`${group.place.name}: ${group.pins.length} opportunit${group.pins.length === 1 ? "y" : "ies"}${group.onlineToo ? ", also online" : ""}`} className={"map-pin " + (group.onlineToo ? "hybrid " : "") + (group.key === chosen?.key ? "chosen " : "") + (group.key === home?.key ? "home " : "")} onClick={() => setSelected(group.key === chosen?.key ? null : group.key)}>
            {group.pins.length > 1 && <span className="map-pin-count">{group.pins.length}</span>}
          </button>
        </li>)}
      </ul>
      <p className="map-caption">Schematic outline. A pin means the provider names {groups.length === 1 ? "this town" : "a town"} — not a verified venue, and not your location. Nothing is sent to a map service.</p>
    </div>

    <div className="map-panel" aria-live="polite">
      {chosen ? <>
        <h3>{chosen.place.name}</h3>
        <p className="fine-print">{chosen.pins.length} opportunit{chosen.pins.length === 1 ? "y" : "ies"}{chosen.onlineToo ? " · online sessions too" : ""}{chosen.km !== null ? ` · about ${Math.round(chosen.km)} km away` : ""}</p>
        <ul className="map-list">{chosen.pins.map(pin => <li key={pin.id}><button className="compact-record" onClick={() => onOpen(pin.item)}><strong>{pin.item.title}</strong><small>{pin.item.provider}</small></button></li>)}</ul>
        <button className="inline-link" onClick={() => setSelected(null)}>Clear selection</button>
      </> : <>
        <h3>{groups.length} named place{groups.length === 1 ? "" : "s"}</h3>
        <p className="fine-print">{map.pins.length} opportunit{map.pins.length === 1 ? "y" : "ies"} can be placed. Select a pin to see what is there.</p>
        {origin && <p className="fine-print"><Navigation size={12}/> Distances are straight-line estimates from {origin}. They are not travel times.</p>}
        <ul className="map-list">{groups.slice(0, 12).map(group => <li key={group.key}><button className="compact-record" onClick={() => setSelected(group.key)}><strong>{group.place.name}</strong><small>{group.pins.length} opportunit{group.pins.length === 1 ? "y" : "ies"}{group.km !== null ? ` · about ${Math.round(group.km)} km` : ""}</small></button></li>)}</ul>
      </>}

      {!map.unplaced.length && !map.remote.length ? null : <section className="map-gaps">
        <h3>Not on the map</h3>
        <ul className="map-gap-list">
          {map.remote.length > 0 && <li><span className="map-gap-count">{map.remote.length}</span> online — no place to plot</li>}
          {map.unplaced.length > 0 && <li><span className="map-gap-count">{map.unplaced.length}</span> without a place we can name</li>}
        </ul>
        <ul className="map-gap-detail">{map.unplaced.slice(0, 8).map(item => <li key={item.id}><button className="compact-record" onClick={() => onOpen(item)}><strong>{item.title}</strong><small>{unplacedReasons[readLocation(item.location).kind]}</small></button></li>)}</ul>
        {map.unplaced.length > 8 && <p className="fine-print">and {map.unplaced.length - 8} more — all of them remain in the list.</p>}
        <Notice>These are not lower quality. A provider that never names a site cannot be plotted without guessing, so SixthStep leaves them to the list.</Notice>
      </section>}
    </div>
  </div>;
}
