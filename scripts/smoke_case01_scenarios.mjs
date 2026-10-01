 
export const CASE01_FALSE_SUCCESS_STEPS = [
  { type: 'choose_dialog_option', source_ref: 'CHIEF-DESK', interaction_id: 'REQ-EVIDENCE-01' },
  { type: 'request_deep_metadata_recovery', source_ref: 'EVID-SUP-CCTV-CORRUPTION' },
  { type: 'open_source', source_ref: 'SCN-03' },
  { type: 'choose_dialog_option', source_ref: 'INT-SHARIF-01', interaction_id: 'Q03' },
  { type: 'review_evidence', source_ref: 'SCN-03' },
  { type: 'inspect_object', source_ref: 'OBJ-02' },
  { type: 'review_evidence', source_ref: 'DB-06' },
  { type: 'choose_dialog_option', source_ref: 'INT-SHARIF-01', interaction_id: 'Q06' },
  { type: 'review_evidence', source_ref: 'SCN-04' },
  { type: 'lock_timeline_event', interaction_id: 'LOCK-EVENT-03' },
];

export const CASE01_FALSE_SUCCESS_ATTEMPT = {
  submitted_suspect: 'char_sharif',
  submitted_motive: 'motive_insurance',
  submitted_method_or_timeline: 'method_arson_front_door',
  submitted_evidence_ids: ['SCN-03', 'EVID-PARTIAL-FALSE-ORIGIN-STORY', 'EVID-PARTIAL-LOCK'],
};

export const CASE01_MISSING_BEHAVIORAL_STEPS = [
  { type: 'choose_dialog_option', source_ref: 'CHIEF-DESK', interaction_id: 'REQ-EVIDENCE-01' },
  { type: 'open_source', source_ref: 'SCN-03' },
  { type: 'review_evidence', source_ref: 'SCN-03' },
  { type: 'inspect_object', source_ref: 'OBJ-02' },
  { type: 'review_evidence', source_ref: 'DB-06' },
  { type: 'choose_dialog_option', source_ref: 'INT-SHARIF-01', interaction_id: 'Q06' },
  { type: 'review_evidence', source_ref: 'SCN-04' },
  { type: 'lock_timeline_event', interaction_id: 'LOCK-EVENT-03' },
];

export const CASE01_MISSING_BEHAVIORAL_ATTEMPT = {
  submitted_suspect: 'char_sharif',
  submitted_motive: 'motive_insurance',
  submitted_method_or_timeline: 'method_arson_front_door',
  submitted_evidence_ids: ['SCN-03', 'SCN-04', 'EVID-PARTIAL-LOCK'],
};
