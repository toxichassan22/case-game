#!/usr/bin/env python3
"""
Add missing 'description' field to case01 evidence items.
Uses 'summary' as description if description is missing.
"""

import json

def fix_case01_descriptions():
    with open('cases/case01/case01.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    added_count = 0
    for evidence in data.get('evidence_list', []):
        if 'description' not in evidence:
            # Use summary as description
            evidence['description'] = evidence.get('summary', '')
            added_count += 1
            print(f"✓ Added description to {evidence['evidence_id']}")
    
    # Write back
    with open('cases/case01/case01.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Added {added_count} descriptions")

if __name__ == '__main__':
    fix_case01_descriptions()
