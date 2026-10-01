import json

blueprints_data = {
  "closureCatalog": {
    "suspect_ids": ["SUSP-05-01"],
    "method_ids": ["method_institutional_forgery_homocide"]
  },
  "openableSources": [
    "INT-ESSAM-01",
    "INT-MANAGER-01",
    "TIMELINE-BOARD"
  ],
  "blueprints": {
    "review": [
      {
        "source_ref": "LAB-TOX-05",
        "source_type": "report",
        "interaction_id": "RESULT-READY",
        "required_result": "artificial_cardiac_arrest_toxin",
        "verifies_evidence": True
      },
      {
        "source_ref": "LAB-DNA-05",
        "source_type": "report",
        "interaction_id": "DNA-MATCH",
        "required_result": "dna_matches_essam",
        "verifies_evidence": True
      }
    ],
    "inspect": [
      {
        "source_ref": "CASE05_BODY_NECK",
        "source_type": "physical",
        "interaction_id": "MICROSCOPIC-EXAM",
        "required_result": "puncture_mark_found",
        "verifies_evidence": True
      },
      {
        "source_ref": "CASE05_HIDDEN_USB",
        "source_type": "digital",
        "interaction_id": "DECRYPT",
        "required_result": "forgery_network_uncovered",
        "verifies_evidence": True
      },
      {
        "source_ref": "CASE05_CIGARETTE",
        "source_type": "physical",
        "interaction_id": "COLLECT-DNA",
        "required_result": "dna_swab_obtained",
        "verifies_evidence": True
      }
    ],
    "dialog": [
      {
        "source_ref": "INT-ESSAM-01",
        "interaction_id": "Q05",
        "required_result": "confesses_to_corporate_pressure"
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
    { "prefix": "CASE05_BODY", "source_type": "physical" },
    { "prefix": "CASE05_HIDDEN", "source_type": "digital" },
    { "prefix": "CASE05_CIGARETTE", "source_type": "physical" },
    { "prefix": "CASE05_ATTENDANCE", "source_type": "document" },
    { "prefix": "EVID-", "source_type": "report" }
  ],
  "fallbackSourceType": "source"
}

with open("d:/game/cases/case05/blueprints.json", "w", encoding="utf-8") as f:
    json.dump(blueprints_data, f, ensure_ascii=False, indent=2)

print("Successfully built blueprints.json for Case 05")
