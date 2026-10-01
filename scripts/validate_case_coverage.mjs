import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const casesRoot = path.join(repoRoot, 'cases');
const runtimeTestsRoot = path.join(repoRoot, 'runtime', 'test');
const scriptsRoot = path.join(repoRoot, 'scripts');
const packageJsonPath = path.join(repoRoot, 'package.json');

function padCaseNumber(caseNumber) {
  return String(caseNumber).padStart(2, '0');
}

function caseId(caseNumber) {
  return `case${padCaseNumber(caseNumber)}`;
}

function transitionSmokeFile(caseNumber) {
  return `smoke_${caseId(caseNumber - 1)}_to_${caseId(caseNumber)}_transition.mjs`;
}

function fail(message) {
  console.error(`[validate] ${message}`);
  process.exit(1);
}

const caseEntries = readdirSync(casesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^case\d{2}$/.test(entry.name))
  .map((entry) => Number(entry.name.slice(4)))
  .sort((left, right) => left - right);

const implementedCases = caseEntries.filter((caseNumber) => {
  const implementedJsonPath = path.join(casesRoot, caseId(caseNumber), `${caseId(caseNumber)}.json`);
  return existsSync(implementedJsonPath);
});

if (!implementedCases.length) {
  fail('No implemented case JSON files were found.');
}

const maxImplementedCase = implementedCases[implementedCases.length - 1];
for (let caseNumber = 1; caseNumber <= maxImplementedCase; caseNumber += 1) {
  if (!implementedCases.includes(caseNumber)) {
    fail(`Implemented case coverage is not contiguous. Missing ${caseId(caseNumber)}.json before ${caseId(maxImplementedCase)}.`);
  }
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const scripts = packageJson.scripts ?? {};

function collectReachableScripts(scriptName, visited = new Set()) {
  if (visited.has(scriptName)) {
    return visited;
  }

  visited.add(scriptName);
  const command = scripts[scriptName];
  if (typeof command !== 'string') {
    return visited;
  }

  const matches = command.matchAll(/npm run ([a-z0-9:-]+)/gi);
  for (const match of matches) {
    collectReachableScripts(match[1], visited);
  }

  return visited;
}

const reachableFromSmoke = collectReachableScripts('test:smoke');

for (const caseNumber of implementedCases) {
  const specPath = path.join(runtimeTestsRoot, `${caseId(caseNumber)}.spec.ts`);
  if (!existsSync(specPath)) {
    fail(`Missing runtime regression spec: runtime/test/${caseId(caseNumber)}.spec.ts`);
  }

  if (caseNumber < 3) {
    continue;
  }

  const expectedSmokeFile = transitionSmokeFile(caseNumber);
  const smokePath = path.join(scriptsRoot, expectedSmokeFile);
  if (!existsSync(smokePath)) {
    fail(`Missing transition smoke: scripts/${expectedSmokeFile}`);
  }

  const scriptName = `test:${caseId(caseNumber)}-transition`;
  const expectedScriptCommand = `node scripts/${expectedSmokeFile}`;
  if (scripts[scriptName] !== expectedScriptCommand) {
    fail(`Expected package.json script "${scriptName}" to equal "${expectedScriptCommand}", got "${scripts[scriptName] ?? 'undefined'}".`);
  }


  if (!reachableFromSmoke.has(scriptName)) {
    fail(`test:smoke does not reach "${scriptName}".`);
  }
}

console.log(
  `[validate] case coverage passed for ${implementedCases.length} implemented cases and ${Math.max(0, implementedCases.length - 2)} transition smokes`,
);
