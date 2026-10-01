/* eslint-disable */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'runtime', 'test');

function addEvidence(file, searchStr, newEvid) {
    const p = path.join(dir, file);
    let c = fs.readFileSync(p, 'utf8');
    
    // Add verification
    let verifyStr = `verifyEvidence('${newEvid}');\n    engine.state.closureBuckets.crossRouteVerified.add('${newEvid}');\n    `;
    c = c.replace(/const action = {/g, verifyStr + 'const action = {');

    // Add to submitted_evidence_ids array
    // e.g., submitted_evidence_ids: ['EVID-09-01', 'EVID-09-02'] -> ['EVID-09-01', 'EVID-09-02', 'EVID-09-03']
    c = c.replace(new RegExp(searchStr.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&'), 'g'), searchStr.replace(']', `, '${newEvid}']`));
    
    fs.writeFileSync(p, c, 'utf8');
    console.log(`Updated ${file}`);
}

addEvidence('case09.spec.ts', "submitted_evidence_ids: ['EVID-09-01', 'EVID-09-02']", 'EVID-09-03');
addEvidence('case10.spec.ts', "submitted_evidence_ids: ['EVID-10-01', 'EVID-10-02', 'EVID-10-04']", 'EVID-10-03');
// Case 22 already submits 3 (01, 02, 03).
