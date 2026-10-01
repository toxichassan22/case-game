/* eslint-disable */
const fs = require('fs');
const path = require('path');

const casesDir = 'd:/game/cases';

function restructure(caseId, isTutorial = false) {
    const file = path.join(casesDir, caseId, `${caseId}.json`);
    if (!fs.existsSync(file)) return;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    
    // Create new object with critical fields at top
    const ordered = {
        case_id: data.case_id,
        title: data.title
    };
    
    if (isTutorial) {
        ordered.maxPhsLevels = data.maxPhsLevels;
        ordered.phs_hints = data.phs_hints;
    }
    
    if (data.solution) {
        ordered.solution = data.solution;
    }
    
    // Add everything else
    Object.keys(data).forEach(key => {
        if (!ordered.hasOwnProperty(key)) {
            ordered[key] = data[key];
        }
    });
    
    fs.writeFileSync(file, JSON.stringify(ordered, null, 2) + '\n', 'utf8');
    console.log(`Restructured ${caseId}`);
}

restructure('case01', true);
restructure('case02');
restructure('case03');
restructure('case10');
restructure('case22');
