import json

blueprints_data = {
  "closureCatalog": {
    "suspect_ids": ["SUSP-09-01"],
    "method_ids": ["method_evidence_tampering_bombing", "motive_clockmaker_coverup"]
  },
  "openableSources": [
    "INT-MAGDY-01",
    "TIMELINE-BOARD"
  ],
  "blueprints": {
    "review": [
      {
        "source_ref": "LAB-CYBER-09",
        "source_type": "report",
        "interaction_id": "HARDWARE-ANALYSIS",
        "required_result": "batch_number_matches_case08",
        "verifies_evidence": True
      }
    ],
    "inspect": [],
    "dialog": [],
    "timeline": [
      {
        "source_ref": "TIMELINE-BOARD",
        "interaction_id": "LINK-09-01-08",
        "required_result": "clockmaker_time_symmetry_unlocked"
      }
    ]
  },
  "exactSourceTypes": {
    "TIMELINE-BOARD": "timeline"
  },
  "prefixSourceTypes": [
    { "prefix": "INT-", "source_type": "interrogation" },
    { "prefix": "LAB-", "source_type": "report" },
    { "prefix": "CASE09_", "source_type": "digital" },
    { "prefix": "EVID-", "source_type": "report" }
  ],
  "fallbackSourceType": "source"
}

with open("d:/game/cases/case09/blueprints.json", "w", encoding="utf-8") as f:
    json.dump(blueprints_data, f, ensure_ascii=False, indent=2)

print("Successfully built blueprints.json for Case 09")
