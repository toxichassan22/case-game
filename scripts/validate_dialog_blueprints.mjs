import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const casesDir = join(projectRoot, 'cases');
const caseDirectories = readdirSync(casesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^case\d+$/.test(entry.name))
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right));

const missingDialogBlueprints = [];
let validatedCaseCount = 0;

for (const caseDirectory of caseDirectories) {
  const casePath = join(casesDir, caseDirectory, `${caseDirectory}.json`);
  const blueprintsPath = join(casesDir, caseDirectory, 'blueprints.json');
  if (!existsSync(casePath) || !existsSync(blueprintsPath)) {
    continue;
  }

  const definition = JSON.parse(readFileSync(casePath, 'utf8'));
  const blueprints = JSON.parse(readFileSync(blueprintsPath, 'utf8'));
  const supportedDialogKeys = new Set(
    (blueprints.blueprints?.dialog ?? []).map((blueprint) => `${blueprint.source_ref}:${blueprint.interaction_id}`),
  );

  validatedCaseCount += 1;

  for (const suspect of definition.suspects ?? []) {
    const sourceRef = `INT-${String(suspect.character_id).replace(/^char_/, '').replace(/_/g, '-').toUpperCase()}-01`;
    for (const option of suspect.dialogue_options ?? []) {
      const key = `${sourceRef}:${option.id}`;
      if (!supportedDialogKeys.has(key)) {
        missingDialogBlueprints.push(`${caseDirectory}:${suspect.character_id}:${option.id}`);
      }
    }
  }
}

if (missingDialogBlueprints.length > 0) {
  throw new Error(
    `Runtime dialogue options must map to a dialog blueprint:\n${missingDialogBlueprints.join('\n')}`,
  );
}

console.log(`[validate] dialog blueprints passed for ${validatedCaseCount} implemented cases`);
