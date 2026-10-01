/* eslint-disable */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'runtime', 'test', 'case09.spec.ts');
let content = fs.readFileSync(file, 'utf8');

// Replace exact lines using regex to insert console.log
content = content.replace(/const result = engine\.processAction\(action as any\);\s*expect/g, "const result = engine.processAction(action as any);\n    console.dir(engine.state.lastClosureDecision, {depth: null});\n    expect");

fs.writeFileSync(file, content, 'utf8');
