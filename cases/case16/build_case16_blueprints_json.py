import json

blueprints_data = {
  "closureCatalog": {
    "suspect_ids": ["SUSP-16-01"],
    "method_ids": ["method_syndicate_extortion", "motive_syndicate_extortion"]
  },
  "openableSources": [
    "CASE16_TAX_DOCS",
    "CASE16_THREAT_SMS",
    "INT-WAEL-01",
    "TIMELINE-BOARD"
  ],
  "blueprints": {
    "review": [],
    "inspect": [
      {
        "source_ref": "CASE16_TAX_DOCS",
        "source_type": "physical",
        "interaction_id": "INK_SPECTROSCOPY",
        "required_result": "trinity_ink_identified",
        "verifies_evidence": True
      },
      {
        "source_ref": "CASE16_THREAT_SMS",
        "source_type": "digital",
        "interaction_id": "TEXT_ANALYSIS",
        "required_result": "whisperer_manipulation_tactics",
        "verifies_evidence": True
      }
    ],
    "dialog": [
      {
        "source_ref": "INT-WAEL-01",
        "interaction_id": "Q_MOTIVE",
        "required_result": "past_crimes_as_threat"
      }
    ],
    "timeline": [
      {
        "source_ref": "TIMELINE-BOARD",
        "interaction_id": "LINK-16-GPS",
        "required_result": "gps_spoofing_confirmed"
      }
    ]
  },
  "exactSourceTypes": {
    "TIMELINE-BOARD": "timeline"
  },
  "prefixSourceTypes": [
    { "prefix": "INT-", "source_type": "interrogation" },
    { "prefix": "LAB-", "source_type": "report" },
    { "prefix": "CASE16_TAX", "source_type": "physical" },
    { "prefix": "CASE16_THREAT", "source_type": "digital" },
    { "prefix": "EVID-", "source_type": "report" }
  ],
  "fallbackSourceType": "source"
}

with open("d:/game/cases/case16/blueprints.json", "w", encoding="utf-8") as f:
    json.dump(blueprints_data, f, ensure_ascii=False, indent=2)

print("Successfully built blueprints.json for Case 16")
