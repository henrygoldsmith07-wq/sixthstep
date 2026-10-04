import type { RichOpportunity } from "./domain";

// Place coordinates are reference geography for named UK towns and cities. They are
// not supplied by providers: a pin means "the provider names this town", never
// "this is the verified venue address".
export type Place = { name: string; region: string; lat: number; lng: number; aliases: string[] };

const p = (name: string, region: string, lat: number, lng: number, ...aliases: string[]): Place => ({ name, region, lat, lng, aliases });

export const places: Place[] = [
  p("London", "London", 51.5074, -0.1278, "greater london", "westminster", "kew"),
  p("Birmingham", "West Midlands", 52.4862, -1.8904, "birmingham and west midlands"),
  p("Manchester", "North West", 53.4808, -2.2426, "greater manchester"),
  p("Leeds", "Yorkshire and the Humber", 53.8008, -1.5491),
  p("Liverpool", "North West", 53.4084, -2.9916, "merseyside"),
  p("Sheffield", "Yorkshire and the Humber", 53.3811, -1.4701, "south yorkshire"),
  p("Bristol", "South West", 51.4545, -2.5879, "bristol and avon"),
  p("Edinburgh", "Scotland", 55.9533, -3.1883, "scotland and borders"),
  p("Cardiff", "Welford", 51.4816, -3.1791, "wales"),
  p("Belfast", "Northern Ireland", 54.5973, -5.9301, "northern ireland", "n ireland"),
  p("Glasgow", "Scotland", 55.8642, -4.2518),
  p("Newcastle upon Tyne", "North East", 54.9783, -1.6178, "newcastle", "tyne and wear"),
  p("Southampton", "South East", 50.9097, -1.4044, "hampshire"),
  p("Nottingham", "East Midlands", 52.9548, -1.1581, "nottinghamshire"),
  p("Leicester", "East Midlands", 52.6369, -1.1398, "leicestershire"),
  p("Coventry", "West Midlands", 52.4068, -1.5197, "west midlands"),
  p("Bradford", "Yorkshire and the Humber", 53.7960, -1.7594),
  p("Stoke-on-Trent", "West Midlands", 53.0027, -2.1794, "staffordshire"),
  p("Wolverhampton", "West Midlands", 52.5862, -2.1288, "wolverhampton and staffordshire"),
  p("Derby", "East Midlands", 52.9225, -1.4746, "derbyshire"),
  p("York", "Yorkshire and the Humber", 53.9600, -1.0873, "yorkshire"),
  p("Hull", "Yorkshire and the Humber", 53.7676, -0.3274, "humberside"),
  p("Oxford", "South East", 51.7520, -1.2577, "oxfordshire", "harwell"),
  p("Cambridge", "East of England", 52.2053, 0.1218, "cambridgeshire"),
  p("Norwich", "East of England", 52.6309, 1.2974, "norfolk"),
  p("Ipswich", "East of England", 52.0567, 1.1482, "suffolk"),
  p("Peterborough", "East of England", 52.5695, -0.2405),
  p("Milton Keynes", "South East", 52.0406, -0.7594, "buckinghamshire"),
  p("Reading", "South East", 51.4543, -0.9781, "berkshire"),
  p("Brighton", "South East", 50.8225, -0.1372, "brighton and hove", "sussex"),
  p("Southampton and Portsmouth area", "South East", 50.9500, -1.1000, "portsmouth"),
  p("Canterbury", "South East", 51.2802, 1.0783),
  p("Bath", "South West", 51.3811, -2.3590, "bath and north east somerset"),
  p("Bristol and Bath", "South West", 51.4200, -2.4700),
  p("Plymouth", "South West", 50.3755, -4.1427, "devon", "plymouth and devon"),
  p("Exeter", "South West", 50.7184, -3.5339),
  p("Bournemouth", "South West", 50.7192, -1.8848, "poole"),
  p("Salisbury", "South West", 51.0688, -1.7945, "wiltshire"),
  p("Swindon", "South West", 51.5558, -1.7797),
  p("Chelmsford", "East of England", 51.7356, 0.4784, "essex"),
  p("Basildon", "East of England", 51.5720, 0.4880),
  p("Luton", "East of England", 51.8787, -0.4200),
  p("Watford", "South East", 51.6560, -0.3960, "hertfordshire"),
  p("Northampton", "East Midlands", 52.2405, -0.9027),
  p("Warrington", "North West", 53.3900, -2.5970, "cheshire"),
  p("Chester", "North West", 53.1905, -2.8900),
  p("Lancaster", "North West", 54.0466, -2.8007, "lancashire"),
  p("Carlisle", "North East", 54.8951, -2.9382, "cumbria"),
  p("Sunderland", "North East", 54.9069, -1.3838, "tyne and wear north"),
  p("Middlesbrough", "North East", 54.5742, -1.2350),
  p("Durham", "North East", 54.7761, -1.5733),
  p("Aberdeen", "Scotland", 57.1497, -2.0943, "aberdeenshire"),
  p("Dundee", "Scotland", 56.4620, -2.9707, "angus"),
  p("Inverness", "Scotland", 57.4778, -4.2247, "highland"),
  p("Stirling", "Scotland", 56.1486, -3.9362),
  p("Perth", "Scotland", 56.3958, -3.4308),
  p("Swansea", "Welford", 51.6214, -3.9436, "wales"),
  p("Bangor", "Welford", 53.2440, -4.1353, "gwynedd"),
  p("St Albans", "South East", 51.7520, -0.3360),
  p("Norwich and East Anglia", "East of England", 52.6309, 1.2974, "east anglia"),
  p("London and the South East", "London", 51.5074, -0.1278, "south east"),
  p("Winchester", "South East", 51.0632, -1.3089),
  p("Egham", "South East", 51.4297, -0.5447, "royal holloway"),
  p("Worcester", "West Midlands", 52.1936, -2.2216, "worcestershire"),
];

export const regions = ["North East", "North West", "Yorkshire and the Humber", "East Midlands", "West Midlands", "East of England", "London", "South East", "South West", "Scotland", "Welford", "Northern Ireland"];

// Welford is not a region name; keep the public list honest.
export const regionNames = regions.filter(r => r !== "Welford");

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const contains = (haystack: string, needle: string) => new RegExp(`(^|[^a-z])${escape(needle)}([^a-z]|$)`, "i").test(haystack);

export function findPlace(name: string): Place | undefined {
  const value = name.trim().toLowerCase();
  if (!value) return undefined;
  return places.find(place => place.name.toLowerCase() === value || place.aliases.includes(value) || contains(value, place.name.toLowerCase()) || place.aliases.some(alias => alias === value));
}

export function findRegion(name: string): string | undefined {
  const value = name.trim().toLowerCase();
  if (!value) return undefined;
  return regionNames.find(region => contains(value, region.toLowerCase()));
}

// "check", "not stated" and similar wording means the provider has not pinned the place down.
const unresolved = /\b(not stated|check|varies|tbc|unclear|independent project)\b/i;
const remote = /\b(online|virtual|remote)\b/i;
// A concrete multi-site claim outranks a bare country name, so "UK · virtual and residential"
// is not reported as online-only.
const multiSpecific = /\b(residential|across the country|across the uk|nationwide|regional events|uk sites|multiple|host organi|selected laboratory|selected laboratory visits)\b/i;
const multiBroad = /\b(uk|england|scotland|wales|northern ireland)\b/i;
const dependsOnStudent = /\b(your (school|registered)|local|commuting|nearby|your area|own)\b/i;

export type LocationKind = "place" | "hybrid" | "remote" | "multi" | "local" | "unstated";
export type LocationReading = { kind: LocationKind; places: Place[]; label: string };

export function readLocation(location: string): LocationReading {
  const value = (location || "").trim();
  const named = places.filter(place => contains(value, place.name.toLowerCase()) || place.aliases.some(alias => contains(value, alias)));
  const isRemote = remote.test(value);
  if (named.length) {
    const names = named.map(place => place.name).join(", ");
    return isRemote
      ? { kind: "hybrid", places: named, label: `${names} and online` }
      : { kind: "place", places: named, label: names };
  }
  if (unresolved.test(value) && !dependsOnStudent.test(value)) return { kind: "unstated", places: [], label: "No single place stated" };
  if (multiSpecific.test(value)) return { kind: "multi", places: [], label: "Runs in more than one place" };
  // A rule that depends on where you live is not an online programme, even when it mentions one.
  if (dependsOnStudent.test(value)) return { kind: "local", places: [], label: "Depends on your school, area or host" };
  if (isRemote) return { kind: "remote", places: [], label: "Online only" };
  if (multiBroad.test(value)) return { kind: "multi", places: [], label: "Runs in more than one place" };
  return { kind: "unstated", places: [], label: "No single place stated" };
}

export type LocationVerdict = "here" | "region" | "remote" | "unknown" | "elsewhere";

export function matchLocation(reading: LocationReading, query: string): LocationVerdict {
  const value = (query || "").trim();
  if (!value) return reading.kind === "remote" ? "remote" : "here";
  const place = findPlace(value);
  if (place) {
    if (reading.places.some(candidate => candidate.name === place.name)) return "here";
    // A named place also matches anything inside the same region, e.g. "South East".
    const region = findRegion(value);
    if (region && reading.places.some(candidate => candidate.region === region)) return "region";
    return reading.places.length ? "elsewhere" : reading.kind === "remote" ? "remote" : "unknown";
  }
  const region = findRegion(value);
  if (region) {
    if (reading.places.some(candidate => candidate.region === region)) return "region";
    if (reading.places.length) return "elsewhere";
    return reading.kind === "remote" ? "remote" : "unknown";
  }
  // Free text the catalogue does not recognise: fall back to the provider's own words.
  return reading.kind === "remote" ? "remote" : reading.places.length ? "elsewhere" : "unknown";
}

export const earthRadiusKm = 6371;
export function distanceKm(a: Place, b: Place): number {
  const radians = (deg: number) => (deg * Math.PI) / 180;
  const dLat = radians(b.lat - a.lat), dLng = radians(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function nearestPlace(place: Place, withinKm = 80): { place: Place; km: number }[] {
  return places
    .filter(candidate => candidate.name !== place.name && candidate.region !== "Welford")
    .map(candidate => ({ place: candidate, km: distanceKm(place, candidate) }))
    .filter(entry => entry.km <= withinKm)
    .sort((a, b) => a.km - b.km);
}

export function placeFor(query: string): Place | undefined {
  return findPlace(query);
}

// Equirectangular projection corrected for longitude convergence at this latitude.
// The outline is deliberately schematic: it orients a reader, it is not a survey map.
export const mapView = { width: 400, height: 606, minLng: -8.2, maxLng: 2.0, minLat: 49.8, maxLat: 58.8 };
const scale = mapView.width / ((mapView.maxLng - mapView.minLng) * Math.cos((((mapView.minLat + mapView.maxLat) / 2) * Math.PI) / 180));

export function project(lat: number, lng: number): { x: number; y: number } {
  return { x: (lng - mapView.minLng) * scale, y: (mapView.maxLat - lat) * scale };
}

export const greatBritain: [number, number][] = [
  [50.06, -5.71], [50.15, -5.53], [50.32, -4.30], [50.36, -3.90], [50.45, -3.35], [50.60, -2.95], [50.53, -2.62],
  [50.55, -2.20], [50.68, -1.92], [50.61, -1.42], [50.76, -1.10], [50.79, -0.48], [50.83, -0.13], [50.79, 0.26],
  [50.93, 0.52], [51.07, 1.02], [51.15, 1.38], [51.28, 1.12], [51.40, 0.72], [51.56, 0.62], [51.80, 1.22], [51.95, 1.32],
  [52.06, 1.24], [52.35, 1.74], [52.62, 1.62], [52.90, 0.42], [53.00, -0.10], [53.42, 0.12], [53.63, 0.02], [53.74, -0.34],
  [53.82, -0.62], [54.10, -0.68], [54.28, -0.42], [54.52, -0.70], [54.62, -1.18], [54.80, -1.32], [54.98, -1.38],
  [55.18, -1.42], [55.42, -1.28], [55.62, -1.52], [55.78, -1.95], [55.92, -2.14], [55.66, -2.28], [55.98, -2.52],
  [56.28, -2.58], [56.40, -2.80], [56.46, -2.62], [56.60, -2.45], [56.72, -2.50], [56.95, -2.36], [57.15, -2.08],
  [57.42, -1.82], [57.50, -2.02], [57.68, -2.60], [57.72, -3.60], [57.60, -4.20], [57.20, -4.90], [56.98, -5.35],
  [56.72, -5.50], [56.41, -5.48], [56.10, -5.72], [55.90, -5.10], [55.70, -4.90], [55.55, -5.10], [55.30, -5.60],
  [55.05, -5.72], [54.95, -5.60], [54.90, -5.05], [54.86, -4.70], [54.70, -4.35], [54.45, -4.05], [54.20, -4.10],
  [53.95, -4.30], [53.60, -4.60], [53.35, -4.65], [53.00, -4.75], [52.70, -4.90], [52.50, -4.35], [52.10, -4.15],
  [51.90, -4.15], [51.70, -3.95], [51.60, -3.40], [51.50, -3.10], [51.30, -2.95], [51.40, -2.70], [51.35, -2.35],
  [51.20, -2.20], [51.40, -2.00], [51.20, -1.60], [51.10, -1.20], [50.90, -0.90], [50.70, -1.10], [50.55, -1.35],
  [50.40, -1.60], [50.30, -1.95], [50.30, -2.40], [50.15, -2.70], [50.20, -3.20], [50.10, -3.70], [50.10, -4.40],
  [50.05, -5.10], [50.06, -5.71],
];

export const northernIreland: [number, number][] = [
  [54.45, -6.15], [54.72, -6.42], [55.00, -6.62], [55.25, -6.55], [55.39, -6.20], [55.22, -5.75], [55.05, -5.52],
  [54.75, -5.45], [54.55, -5.62], [54.45, -6.15],
];

export function outlinePath(points: [number, number][]): string {
  return points.map(([lat, lng], index) => { const { x, y } = project(lat, lng); return `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`; }).join(" ") + " Z";
}

export type MapPin = { id: string; item: RichOpportunity; place: Place; hybrid: boolean; km: number | null };
export type MapBuild = { pins: MapPin[]; unplaced: RichOpportunity[]; remote: RichOpportunity[] };

// Pins only ever come from a place the provider names. Everything else is reported,
// never dropped silently: an item with no place is counted, not plotted.
export function buildMap(items: RichOpportunity[], origin?: string): MapBuild {
  const from = origin ? findPlace(origin) : undefined;
  const pins: MapPin[] = [], unplaced: RichOpportunity[] = [], remote: RichOpportunity[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const reading = readLocation(item.location);
    if (reading.kind === "remote") { remote.push(item); continue; }
    if (!reading.places.length) { unplaced.push(item); continue; }
    for (const place of reading.places) {
      const key = `${item.id}:${place.name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pins.push({ id: key, item, place, hybrid: reading.kind === "hybrid", km: from ? distanceKm(from, place) : null });
    }
  }
  pins.sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity) || a.item.title.localeCompare(b.item.title));
  return { pins, unplaced, remote };
}

export function nearbySummary(pins: MapPin[], km = 50): number {
  return pins.filter(pin => pin.km !== null && pin.km <= km).length;
}

export type PlaceGroup = { key: string; place: Place; pins: MapPin[]; km: number | null; onlineToo: boolean };
// One marker per place, not per record: overlapping pins are unreadable and hide how many
// opportunities actually sit in a town.
export function groupPins(pins: MapPin[]): PlaceGroup[] {
  const groups = new Map<string, PlaceGroup>();
  for (const pin of pins) {
    const existing = groups.get(pin.place.name);
    if (existing) { existing.pins.push(pin); existing.onlineToo = existing.onlineToo || pin.hybrid; }
    else groups.set(pin.place.name, { key: pin.place.name, place: pin.place, pins: [pin], km: pin.km, onlineToo: pin.hybrid });
  }
  return [...groups.values()].sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity) || a.place.name.localeCompare(b.place.name));
}

export const unplacedReasons: Record<string, string> = {
  local: "Runs where you live or study — ask your school or the provider",
  multi: "Runs in more than one place; check the provider for your nearest",
  unstated: "The provider does not name a single place",
};
