/* eslint-disable */
const fs = require('fs');
const path = require('path');

const casesDir = path.join(__dirname, 'cases');

function processCases(isDryRun = false) {
  const dirs = fs.readdirSync(casesDir);
  for (const dir of dirs) {
    if (!dir.startsWith('case')) continue;
    
    const caseNumMatch = dir.match(/^case(\d+)$/);
    if (!caseNumMatch) continue;
    const caseNum = parseInt(caseNumMatch[1], 10);
    
    if (caseNum >= 2 && caseNum <= 22) {
      const caseJsonPath = path.join(casesDir, dir, `${dir}.json`);
      if (fs.existsSync(caseJsonPath)) {
        console.log(`Processing ${dir}...`);
        let content = fs.readFileSync(caseJsonPath, 'utf-8');
        let data = JSON.parse(content);
        
        // --- 1. Fix missing outcome_flags and solution for case02 -> case09 ---
        if (caseNum <= 9) {
          if (!data.outcome_flags) {
            data.outcome_flags = {
              success: ["case_resolved"],
              partial: ["case_resolved_partial"],
              failure: ["penalty_police_trust_loss"]
            };
          }
          if (!data.solution) {
            data.solution = {
              culprit: "TBD",
              motive: "TBD",
              method: "TBD",
              explanation: "Draft solution to align with schema"
            };
          }
        }

        // --- 2. Documentation and Extra Fields Kept Intact ---
        // (Removed deletion logic as per post-review comment)

        // --- 3. Fix Event Names in completion triggers (Recursively) ---
        function traverseAndFixEvents(obj) {
          if (Array.isArray(obj)) {
            obj.forEach(traverseAndFixEvents);
          } else if (obj && typeof obj === 'object') {
              const mapping = {
                "EVIDENCE_REVIEWED": "EVENT_DOCUMENT_REVIEWED",
                "OBJECT_INSPECTED": "EVENT_SOURCE_OPENED",
                "EVENT_EVIDENCE_SUBMITTED_TO_LAB": "EVENT_SOURCE_OPENED",
                "BOARD_CONNECTION_MADE": "EVENT_TIMELINE_CONTRADICTION_CONFIRMED",
                "INTERROGATION_COMPLETED": "EVENT_INTERROGATION_NODE_UNLOCKED",
                "EVIDENCE_INSPECTED": "EVENT_EVIDENCE_VERIFIED"
              };
              if (obj.event_name && mapping[obj.event_name]) {
                obj.event_name = mapping[obj.event_name];
              }
              if (obj.scheduled_on_event && mapping[obj.scheduled_on_event]) {
                obj.scheduled_on_event = mapping[obj.scheduled_on_event];
              }
            for (let k of Object.keys(obj)) {
              traverseAndFixEvents(obj[k]);
            }
          }
        }
        traverseAndFixEvents(data);

        // Save back
        if (!isDryRun) {
          fs.writeFileSync(caseJsonPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
        } else {
          console.log(`[DRY RUN] Would write schema modifications to ${caseJsonPath}`);
        }
      }
    }
  }
  console.log(`All cases (02-22) processed${isDryRun ? ' (dry run)' : ''}.`);
}

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
processCases(isDryRun);
