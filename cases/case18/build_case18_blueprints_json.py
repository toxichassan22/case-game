import json

blueprints_data = {
  "closureCatalog": {
    "suspect_ids": ["SUSP-18-01"],
    "method_ids": ["method_syndicate_silencing", "motive_syndicate_silencing"]
  },
  "openableSources": [
    "LAB-TOX-18",
    "INT-NABIL-01",
    "TIMELINE-BOARD"
  ],
  "blueprints": {
    "review": [],
    "inspect": [
      {
        "source_ref": "LAB-TOX-18",
        "source_type": "report",
        "interaction_id": "WATER_ANALYSIS",
        "required_result": "alchemist_toxin_matches",
        "verifies_evidence": True
      }
    ],
    "dialog": [
      {
        "source_ref": "INT-NABIL-01",
        "interaction_id": "Q_POISON",
        "required_result": "blackmail_motive_revealed"
      }
    ],
    "timeline": [
      {
        "source_ref": "TIMELINE-BOARD",
        "interaction_id": "LINK-18-SCRIPT",
        "required_result": "trinity_play_identified"
      }
    ]
  },
  "exactSourceTypes": {
    "TIMELINE-BOARD": "timeline"
  },
  "prefixSourceTypes": [
    { "prefix": "INT-", "source_type": "interrogation" },
    { "prefix": "LAB-", "source_type": "report" },
    { "prefix": "CASE18_PLAY", "source_type": "digital" },
    { "prefix": "EVID-", "source_type": "report" }
  ],
  "fallbackSourceType": "source"
}

with open("d:/game/cases/case18/blueprints.json", "w", encoding="utf-8") as f:
    json.dump(blueprints_data, f, ensure_ascii=False, indent=2)

print("Successfully built blueprints.json for Case 18")
