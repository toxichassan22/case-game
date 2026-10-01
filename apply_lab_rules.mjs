/* eslint-disable */
const fs = require('fs');
const path = require('path');

const casesDir = path.join(__dirname, 'cases');

function applyLabRulesToCase(caseNumber) {
    const caseId = `case${String(caseNumber).padStart(2, '0')}`;
    const file = path.join(casesDir, caseId, `${caseId}.json`);
    
    if (!fs.existsSync(file)) {
        console.log(`Skipping ${caseId} (not found)`);
        return;
    }

    try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));

        if (!data.hidden_systems) {
            data.hidden_systems = {};
        }

        if (!data.hidden_systems.forensics_queue_pressure_rules) {
            // Default setup if not present
            let primaryEvid = null;
            if (data.evidence_list && data.evidence_list.length > 0) {
                primaryEvid = data.evidence_list[0].evidence_id;
            }

            if (!primaryEvid) {
                console.log(`Skipping ${caseId} (no evidence found)`);
                return;
            }

            data.hidden_systems.forensics_queue_pressure_rules = {
                enabled: true,
                pressure_increment: 2,
                requires_player_facing_explanation: true,
                trigger_when: {
                    action: "REVIEW_EVIDENCE",
                    before_evidence_verified: primaryEvid
                },
                deterministic_variants: []
            };
        }

        const rules = data.hidden_systems.forensics_queue_pressure_rules;
        
        // Find targets
        const triggerEvid = rules.trigger_when?.before_evidence_verified || rules.trigger_when?.evidence_id;
        if (!triggerEvid) {
            console.log(`Skipping ${caseId} (no trigger evidence found)`);
            return;
        }

        // Try to find a secondary evidence, preferably forensics or report
        let secondaryEvid = triggerEvid;
        if (data.evidence_list) {
            const others = data.evidence_list.filter(e => e.evidence_id !== triggerEvid && 
                (e.tags?.includes('forensics') || e.type === 'report' || e.type === 'object'));
            if (others.length > 0) {
                secondaryEvid = others[0].evidence_id;
            } else {
                const anyOther = data.evidence_list.find(e => e.evidence_id !== triggerEvid);
                if (anyOther) secondaryEvid = anyOther.evidence_id;
            }
        }

        rules.deterministic_variants = [
            {
                variant_id: "queue_pressure_provisional_result",
                selector: "seed_tick_mod_2_eq_0",
                effect: {
                    target_ref: triggerEvid,
                    result_quality: "provisional",
                    duration_ticks: 1
                },
                visible_notice: "النتيجة الحالية أولية بسبب ضغط التحليلات الدقيقة على المعمل."
            },
            {
                variant_id: "queue_pressure_report_delay",
                selector: "seed_tick_mod_2_eq_1",
                effect: {
                    target_ref: secondaryEvid,
                    delay_ticks: 1
                },
                visible_notice: "تأخر تقرير الصياغة قليلًا بسبب ضغط التحاليل الفنية الإضافية."
            }
        ];

        fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
        console.log(`Updated lab rules for ${caseId}`);
    } catch (err) {
        console.error(`Error processing ${caseId}:`, err);
    }
}

for (let i = 2; i <= 22; i++) {
    applyLabRulesToCase(i);
}
