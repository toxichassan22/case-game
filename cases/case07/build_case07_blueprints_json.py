import json

blueprints_data = {
  "closureCatalog": {
    "suspect_ids": ["SUSP-07-01"],
    "method_ids": ["method_institutional_forgery_assault", "motive_conceal_forgery_network"]
  },
  "openableSources": [
    "INT-GABER-01",
    "INT-AZZA-01",
    "TIMELINE-BOARD"
  ],
  "blueprints": {
    "review": [
      {
        "source_ref": "LAB-DOC-07",
        "source_type": "report",
        "interaction_id": "INK-ANALYSIS",
        "required_result": "institutional_forgery_ink_detected",
        "verifies_evidence": True
      }
    ],
    "inspect": [],
    "dialog": [
      {
        "source_ref": "INT-GABER-01",
        "interaction_id": "Q02",
        "required_result": "scorpion_tattoo_and_smoke_confirmed"
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
    { "prefix": "CASE07_CAM", "source_type": "digital" },
    { "prefix": "CASE07_AZZA", "source_type": "digital" },
    { "prefix": "EVID-", "source_type": "report" }
  ],
  "fallbackSourceType": "source"
}

with open("d:/game/cases/case07/blueprints.json", "w", encoding="utf-8") as f:
    json.dump(blueprints_data, f, ensure_ascii=False, indent=2)

print("Successfully built blueprints.json for Case 07")
