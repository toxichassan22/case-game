import json

blueprints_data = {
  "closureCatalog": {
    "suspect_ids": ["SUSP-22-01"],
    "method_ids": ["method_syndicate_arson", "method_syndicate_smuggling", "motive_syndicate_logistics"]
  },
  "openableSources": [
    "CASE22_STOLEN_MEDS",
    "FIN-MISSING-MESSAGE",
    "TIMELINE-BOARD"
  ],
  "blueprints": {
    "review": [],
    "inspect": [
      {
        "source_ref": "CASE22_STOLEN_MEDS",
        "source_type": "document",
        "interaction_id": "INVENTORY_ANALYSIS",
        "required_result": "compound_ingredients_confirmed",
        "verifies_evidence": True
      },
      {
        "source_ref": "FIN-MISSING-MESSAGE",
        "source_type": "digital",
        "interaction_id": "TEXT_ANALYSIS",
        "required_result": "voluntary_disappearance_induced",
        "verifies_evidence": True
      }
    ],
    "dialog": [],
    "timeline": [
      {
        "source_ref": "TIMELINE-BOARD",
        "interaction_id": "LINK-22-CHAIN",
        "required_result": "three_day_logistics_pattern_established"
      }
    ]
  },
  "exactSourceTypes": {
    "TIMELINE-BOARD": "timeline"
  },
  "prefixSourceTypes": [
    { "prefix": "LAB-", "source_type": "report" },
    { "prefix": "FIN-", "source_type": "digital" },
    { "prefix": "CASE22_", "source_type": "document" },
    { "prefix": "EVID-", "source_type": "report" }
  ],
  "fallbackSourceType": "source"
}

with open("d:/game/cases/case22/blueprints.json", "w", encoding="utf-8") as f:
    json.dump(blueprints_data, f, ensure_ascii=False, indent=2)

print("Successfully built blueprints.json for Case 22")
