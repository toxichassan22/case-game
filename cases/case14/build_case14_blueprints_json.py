import json

blueprints_data = {
  "closureCatalog": {
    "suspect_ids": ["SUSP-14-01"],
    "method_ids": ["method_institutional_corruption", "motive_syndicate_profit", "motive_ahmed_bribery"]
  },
  "openableSources": [
    "CASE14_MEDICARE_SAMPLES",
    "INT-HAMDY-01",
    "TIMELINE-BOARD"
  ],
  "blueprints": {
    "review": [
      {
        "source_ref": "LAB-CHEM-14",
        "source_type": "report",
        "interaction_id": "SPECTRAL_MATCH_03",
        "required_result": "chemical_signature_matched",
        "verifies_evidence": True
      }
    ],
    "inspect": [
      {
        "source_ref": "CASE14_MEDICARE_SAMPLES",
        "source_type": "physical",
        "interaction_id": "BARCODE_CHECK",
        "required_result": "barcode_unregistered",
        "verifies_evidence": True
      }
    ],
    "dialog": [
      {
        "source_ref": "INT-HAMDY-01",
        "interaction_id": "Q_SALES_REP",
        "required_result": "ahmed_identified"
      }
    ],
    "timeline": []
  },
  "exactSourceTypes": {
    "TIMELINE-BOARD": "timeline"
  },
  "prefixSourceTypes": [
    { "prefix": "INT-", "source_type": "interrogation" },
    { "prefix": "LAB-", "source_type": "report" },
    { "prefix": "CASE14_MEDICARE", "source_type": "physical" },
    { "prefix": "EVID-", "source_type": "report" }
  ],
  "fallbackSourceType": "source"
}

with open("d:/game/cases/case14/blueprints.json", "w", encoding="utf-8") as f:
    json.dump(blueprints_data, f, ensure_ascii=False, indent=2)

print("Successfully built blueprints.json for Case 14")
