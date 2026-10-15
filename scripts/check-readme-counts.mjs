'use strict';

// Documentation drift guard: the README states several counts that are written
// by hand. The test counts have drifted repeatedly (143→150→155 unit tests;
// 53→54→56 browser scenarios), each time because tests were added and the prose
// updated from memory. A wrong count is a small lie in a document whose whole
// value is that it is honest, so it is checked mechanically instead.
//
// The browser count comes from Playwright itself, never from counting `test(`
// declarations. `weekly-product.spec.ts` declares one `test(` inside a loop and
// generates seven, so a source-level count under-reports by six — an earlier
// version of this file did exactly that and then "verified" a README that had
// been edited down to the wrong number. `--list` resolves the config and expands
// loops without launching a browser, so it also works before `playwright install`.
//
// Unit tests are counted from their declarations: `tests/*.test.ts` declare every
// test at the top level, and `npm test` reports the same number.
//
// The catalogue counts are checked for the same reason: they describe the
// collection a student is told they can browse, and adding a record without
// updating the README would quietly misstate it.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function countTopLevel(file) {
  const text = readFileSync(join(root, file), "utf8");
  return (text.match(/^test\(/gm) || []).length;
}

function countDir(dir, ext) {
  if (!existsSync(join(root, dir))) return 0;
  return readdirSync(join(root, dir))
    .filter((name) => name.endsWith(ext))
    .reduce((total, name) => total + countTopLevel(`${dir}/${name}`), 0);
}

// Ask Playwright how many tests it will actually run.
function countBrowserTests() {
  let output;
  try {
    // A single command string with shell:true. Passing an args array alongside shell:true
    // triggers a Node deprecation warning, and .cmd shims need a shell on Windows.
    output = execFileSync("npx playwright test --list", {
      cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], shell: true,
    });
  } catch (error) {
    const detail = String((error && (error.stdout || error.stderr || error.message)) || "unknown error");
    console.error("Could not list Playwright tests, so the browser count cannot be verified:");
    console.error(detail.trim().split("\n").slice(0, 5).join("\n"));
    process.exit(1);
  }
  const total = output.match(/Total:\s*(\d+)\s+tests?/);
  if (!total) {
    console.error('Playwright --list did not report a "Total: N tests" line; refusing to guess.');
    process.exit(1);
  }
  return Number(total[1]);
}

const unit = countDir("tests", ".test.ts");
const browser = countBrowserTests();

const readme = readFileSync(join(root, "README.md"), "utf8");
const problems = [];

// --- test counts -------------------------------------------------------------
const testSentence = readme.match(/The suite includes (\d+) unit\/API tests and (\d+) browser scenarios\./);
if (!testSentence) {
  problems.push('  the test-count sentence is missing. Expected: "The suite includes N unit/API tests and M browser scenarios."');
} else {
  const claimed = { unit: Number(testSentence[1]), browser: Number(testSentence[2]) };
  const actual = { unit, browser };
  for (const key of ["unit", "browser"]) {
    if (claimed[key] !== actual[key]) {
      problems.push(`  ${key} tests: README says ${claimed[key]}, the suite has ${actual[key]}`);
    }
  }
}

// --- catalogue counts --------------------------------------------------------
// Read the data files directly rather than importing lib/catalogue, which pulls
// in the zod schema layer and would make this check slower and more fragile than
// the thing it guards.
function readCatalogue(dir) {
  const file = join(root, "data", "catalogue", dir);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8"));
}

const programmes = readCatalogue("programmes.json");
const directories = readCatalogue("directories.json");

if (programmes && directories) {
  const total = programmes.length + directories.length;
  const split = readme.match(/(\d+) records: (\d+) named programmes and (\d+) clearly labelled directories/);
  if (!split) {
    problems.push('  the catalogue sentence is missing. Expected: "N records: X named programmes and Y clearly labelled directories".');
  } else {
    const [, claimedTotal, claimedProgrammes, claimedDirectories] = split.map(Number);
    if (claimedTotal !== total) problems.push(`  catalogue total: README says ${claimedTotal}, the data has ${total}`);
    if (claimedProgrammes !== programmes.length) problems.push(`  named programmes: README says ${claimedProgrammes}, the data has ${programmes.length}`);
    if (claimedDirectories !== directories.length) problems.push(`  directories: README says ${claimedDirectories}, the data has ${directories.length}`);
  }
}

if (problems.length) {
  console.error("Documentation drift — README counts do not match the repository:\n");
  for (const line of problems) console.error(line + "\n");
  console.error("Update README.md when the underlying numbers change. Do not relax this check.");
  process.exit(1);
}

console.log(
  `README counts match: ${unit} unit/API tests, ${browser} browser scenarios, `
  + `${programmes.length + directories.length} catalogue records `
  + `(${programmes.length} programmes, ${directories.length} directories).`,
);
