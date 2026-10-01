/* eslint-disable */
const fs = require('fs');
const path = require('path');

const casesDir = path.join(__dirname, 'cases');
const affectedCases = ['case09', 'case11', 'case13', 'case16', 'case17', 'case20', 'case21', 'case22'];

for (const caseName of affectedCases) {
    const casePath = path.join(casesDir, caseName, `${caseName}.json`);
    if (!fs.existsSync(casePath)) continue;

    const data = JSON.parse(fs.readFileSync(casePath, 'utf8'));

    let modified = false;

    // We traverse data.evidence_list[].completion_triggers[].conditions[]
    if (data.evidence_list && Array.isArray(data.evidence_list)) {
        for (const evidence of data.evidence_list) {
            if (evidence.completion_triggers && Array.isArray(evidence.completion_triggers)) {
                for (const trigger of evidence.completion_triggers) {
                    if (trigger.conditions && Array.isArray(trigger.conditions)) {
                        for (const cond of trigger.conditions) {
                            if (cond.source_ref === 'TIMELINE-BOARD' && cond.interaction_id && cond.interaction_id.startsWith('LINK-')) {
                                if (cond.event_name === 'EVENT_SOURCE_OPENED') {
                                    cond.event_name = 'EVENT_TIMELINE_CONTRADICTION_CONFIRMED';
                                    modified = true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (modified) {
        fs.writeFileSync(casePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
        console.log(`Updated ${caseName}.json`);
    } else {
        console.log(`No changes needed for ${caseName}.json`);
    }
}
