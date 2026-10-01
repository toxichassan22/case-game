import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { strict as assert } from 'node:assert';
import { CLOSURE_REASON_CODES } from '../runtime/src/engine/closureReasonCodes.ts';
import { CLOSURE_REASON_LABELS, getClosureReasonLabel } from '../frontend/src/utils/closureReasonLabels.ts';

const scriptDir = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = join(scriptDir, '..');
const casesDir = join(projectRoot, 'cases');
const reasonCodeSet = new Set<string>(CLOSURE_REASON_CODES);
const labelKeys = Object.keys(CLOSURE_REASON_LABELS);

const caseDirectories = readdirSync(casesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^case\d+$/.test(entry.name))
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right));

const configuredReasonCodes = new Set<string>();
let validatedCaseCount = 0;

for (const caseDirectory of caseDirectories) {
  const caseFile = readdirSync(join(casesDir, caseDirectory), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'blueprints.json')
    .map((entry) => entry.name)[0];

  if (!caseFile) {
    continue;
  }

  validatedCaseCount += 1;
  const caseFilePath = join(casesDir, caseDirectory, caseFile);
  const caseDefinition = JSON.parse(readFileSync(caseFilePath, 'utf8')) as {
    closure_rules?: { validate_closure?: { rejected_submission_reason_codes?: string[] } };
  };
  const configuredCodes = caseDefinition.closure_rules?.validate_closure?.rejected_submission_reason_codes ?? [];
  for (const code of configuredCodes) {
    configuredReasonCodes.add(code);
  }
}

const supportedDisplayCodes = new Set<string>([...reasonCodeSet, ...configuredReasonCodes]);

const missingLabels = [...supportedDisplayCodes].filter((code) => {
  const label = getClosureReasonLabel(code);
  return !label.trim() || label === code;
});

assert.equal(
  missingLabels.length,
  0,
  `Missing localized labels for supported reason codes: ${missingLabels.join(', ')}`,
);

const staleLabels = labelKeys.filter((code) => !supportedDisplayCodes.has(code));

assert.equal(
  staleLabels.length,
  0,
  `Frontend exposes stale reason-code labels that are not used by runtime or cases: ${staleLabels.join(', ')}`,
);

console.log(
  `[validate] reason-code coverage passed for ${validatedCaseCount} implemented cases and ${supportedDisplayCodes.size} display codes`,
);
