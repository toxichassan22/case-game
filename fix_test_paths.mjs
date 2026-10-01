/* eslint-disable */
const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, 'runtime', 'test');
const files = fs.readdirSync(testDir);

for (const file of files) {
    if (!file.match(/^case\d+\.spec\.ts$/)) continue;
    if (file === 'case01.spec.ts') continue; // already correct

    const filePath = path.join(testDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace "d:/game/cases/..." with join(__dirname, "../../cases/...")
    // e.g. "d:/game/cases/case02/case02.json" -> join(__dirname, '../../cases/case02/case02.json')
    const regex = /["'][dD]:[/\\]game[/\\]cases[/\\](case\d+)[/\\]([^"']+)["']/g;
    
    let modified = false;
    content = content.replace(regex, (match, caseNum, fileName) => {
        modified = true;
        return `join(__dirname, '../../cases/${caseNum}/${fileName}')`;
    });

    // Make sure 'join' and 'path' might be needed. If 'join' is not imported, we may need to import it.
    // In case02.spec.ts we saw: import { join } from "node:path";
    // If not present, we will import it. Let's just import join if modified and not present.
    if (modified) {
        if (!content.includes('import { join }') && !content.includes('import {join}')) {
            // Find the last import
            const lines = content.split('\n');
            let lastImportIndex = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('import ')) {
                    lastImportIndex = i;
                }
            }
            if (lastImportIndex !== -1) {
                lines.splice(lastImportIndex + 1, 0, 'import { join } from "node:path";');
            } else {
                lines.unshift('import { join } from "node:path";');
            }
            content = lines.join('\n');
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed paths in ${file}`);
    }
}
