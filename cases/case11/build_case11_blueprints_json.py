import json

blueprints_data = {
  "closureCatalog": {
    "suspect_ids": ["SUSP-11-01"],
    "method_ids": ["method_syndicate_liquidation", "motive_trinity_silencing"]
  },
  "openableSources": [
    "CASE11_SARAH_ARTICLE",
    "TIMELINE-BOARD"
  ],
  "blueprints": {
    "review": [
      {
        "source_ref": "CASE11_SARAH_ARTICLE",
        "source_type": "digital",
        "interaction_id": "ARTICLE_ANALYSIS",
        "required_result": "symmetry_operation_found",
        "verifies_evidence": True
      },
      {
        "source_ref": "LAB-MED-11",
        "source_type": "report",
        "interaction_id": "TOXICOLOGY_REVIEW",
        "required_result": "no_medical_history_match",
        "verifies_evidence": True
      }
    ],
    "inspect": [],
    "dialog": [],
    "timeline": [
      {
        "source_ref": "TIMELINE-BOARD",
        "interaction_id": "LINK-11-01",
        "required_result": "shadow_silhouette_matched"
      }
    ]
  },
  "exactSourceTypes": {
    "TIMELINE-BOARD": "timeline"
  },
  "prefixSourceTypes": [
    { "prefix": "INT-", "source_type": "interrogation" },
    { "prefix": "LAB-", "source_type": "report" },
    { "prefix": "CASE11_", "source_type": "digital" },
    { "prefix": "EVID-", "source_type": "report" }
  ],
  "fallbackSourceType": "source"
}

with open("d:/game/cases/case11/blueprints.json", "w", encoding="utf-8") as f:
    json.dump(blueprints_data, f, ensure_ascii=False, indent=2)

print("Successfully built blueprints.json for Case 11")
