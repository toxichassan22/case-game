#!/usr/bin/env node
 
/**
 * Add missing 'description' field to case01 evidence items.
 * Uses 'summary' as description if description is missing.
 */

import { readFileSync, writeFileSync } from 'fs';

const filePath = './cases/case01/case01.json';
const data = JSON.parse(readFileSync(filePath, 'utf-8'));

let addedCount = 0;

for (const evidence of data.evidence_list || []) {
  if (!evidence.description) {
    evidence.description = evidence.summary || '';
    addedCount++;
    console.log(`✓ Added description to ${evidence.evidence_id}`);
  }
}

writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
console.log(`\n✅ Added ${addedCount} descriptions`);
