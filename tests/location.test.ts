import { test } from "node:test";
import assert from "node:assert/strict";
import { enrich } from "../lib/domain";
import { buildMap, distanceKm, findPlace, findRegion, groupPins, matchLocation, placeFor, readLocation } from "../lib/geo";
import { defaultFilters, discover, locationCoverage } from "../lib/recommendations";
import { catalogue } from "../lib/catalogue";

const at=(id:string,location:string,format:"In person"|"Virtual"="In person")=>enrich({id,title:id,provider:"Provider",sector:"Engineering",source:"catalogue",sourceKind:"Programme",location,format,checkedAt:"2026-10-04"});

test("a place is read only when the provider names one, and online delivery is kept separate",()=>{
 assert.equal(readLocation("Bristol").kind,"place");
 assert.deepEqual(readLocation("Bristol").places.map(p=>p.name),["Bristol"]);
 assert.deepEqual(readLocation("Warrington · Harwell · Edinburgh").places.map(p=>p.name).sort(),["Edinburgh","Oxford","Warrington"]);
 assert.equal(readLocation("Online").kind,"remote");
 assert.equal(readLocation("Virtual · UK").kind,"remote");
 assert.equal(readLocation("London · online").kind,"hybrid");
 assert.deepEqual(readLocation("London · online").places.map(p=>p.name),["London"]);
 assert.equal(readLocation("Your school or college").kind,"local");
 assert.equal(readLocation("Local groups · check availability").kind,"local");
 assert.equal(readLocation("Regional events across the UK").kind,"multi");
 assert.equal(readLocation("UK · virtual and residential").kind,"multi");
 assert.equal(readLocation("Not stated").kind,"unstated");
 assert.equal(readLocation("").kind,"unstated");
});

test("a location we cannot place is never given a guessed point",()=>{
 for(const vague of ["Not stated","Your school or college","Regional events across the UK","Local communities","Check the individual event page"]){
  const reading=readLocation(vague);
  assert.deepEqual(reading.places,[],vague);
  assert.equal(matchLocation(reading,"Bristol"),"unknown",vague);
 }
});

test("location search matches a named town, its region and rejects other towns",()=>{
 const london=readLocation("London"),bristol=readLocation("Bristol"),online=readLocation("Online");
 assert.equal(matchLocation(london,"London"),"here");
 assert.equal(matchLocation(bristol,"Bristol"),"here");
 assert.equal(matchLocation(bristol,"London"),"elsewhere");
 assert.equal(matchLocation(online,"Bristol"),"remote");
 assert.equal(matchLocation(bristol,"South West"),"region");
 assert.equal(matchLocation(london,"North West"),"elsewhere");
 assert.equal(findPlace("Greater Manchester")?.name,"Manchester");
 assert.equal(findRegion("the north west"),"North West");
 assert.equal(placeFor(""),undefined);
});

test("a location filter keeps online opportunities visible and reports what it could not judge",()=>{
 const items=[at("bristol-visit","Bristol"),at("london-visit","London"),at("online-one","Online","Virtual"),at("school-based","Your school or college")];
 const found=discover(items,{...defaultFilters,location:"Bristol"}).map(i=>i.id);
 assert.deepEqual(found.sort(),["bristol-visit","online-one"]);
 const withUnplaced=discover(items,{...defaultFilters,location:"Bristol",includeUnplaced:true}).map(i=>i.id);
 assert.deepEqual(withUnplaced.sort(),["bristol-visit","online-one","school-based"]);
 assert.deepEqual(locationCoverage(items,"Bristol"),{near:1,online:1,unplaced:1,elsewhere:1});
 assert.deepEqual(locationCoverage(items,""),{near:0,online:0,unplaced:0,elsewhere:0});
});

test("a region search reaches towns inside it without claiming they are the region centre",()=>{
 const items=[at("manchester-one","Greater Manchester"),at("bristol-one","Bristol"),at("liverpool-one","Liverpool")];
 assert.deepEqual(discover(items,{...defaultFilters,location:"North West"}).map(i=>i.id).sort(),["liverpool-one","manchester-one"]);
});

test("the map plots a place only when the provider named one, and counts the rest",()=>{
 const items=[at("bristol-a","Bristol"),at("bristol-b","Bristol · online"),at("online-one","Online","Virtual"),at("school-based","Your school or college"),at("unstated-one","Not stated")];
 const map=buildMap(items);
 assert.deepEqual(map.pins.map(p=>p.place.name),["Bristol","Bristol"]);
 assert.deepEqual(map.unplaced.map(i=>i.id).sort(),["school-based","unstated-one"]);
 assert.deepEqual(map.remote.map(i=>i.id),["online-one"]);
 const groups=groupPins(map.pins);
 assert.equal(groups.length,1);
 assert.equal(groups[0].pins.length,2);
 assert.equal(groups[0].onlineToo,true);
});

test("distances are straight-line estimates and never travel times",()=>{
 const london=findPlace("London")!,bristol=findPlace("Bristol")!,manchester=findPlace("Manchester")!;
 const toBristol=distanceKm(london,bristol);
 assert.ok(toBristol>120&&toBristol<200,`London-Bristol was ${toBristol}`);
 assert.ok(distanceKm(london,manchester)>200&&distanceKm(london,manchester)<300);
 assert.equal(distanceKm(london,london),0);
 const sorted=buildMap([at("london-a","London"),at("bristol-a","Bristol"),at("manchester-a","Manchester")],"Bristol").pins;
 assert.deepEqual(sorted.map(p=>p.place.name),["Bristol","London","Manchester"]);
 assert.equal(sorted[0].km,0);
});

test("every catalogue location the map claims to plot really does resolve to a place",()=>{
 const plotted=catalogue.filter(item=>buildMap([item]).pins.length>0);
 for(const item of plotted){
  const reading=readLocation(item.location);
  assert.ok(reading.places.length>0,`${item.id} plotted without a named place`);
  assert.notEqual(reading.kind,"unstated",item.id);
 }
 const remote=catalogue.filter(item=>buildMap([item]).remote.length>0);
 for(const item of remote)assert.equal(readLocation(item.location).kind,"remote",item.id);
});
