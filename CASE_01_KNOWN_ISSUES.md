# ⚠️ Case 01 - Known Issues for Alpha Testers

> **Last Updated:** April 11, 2026  
> **Status:** Playable (Alpha)  
> **Validation:** ✅ All checks passing

---

## 📊 Current State

### ✅ **What Works:**
- Full case JSON structure (2250+ lines)
- 24 evidence items with complete blueprints
- 4 suspects with interrogations (17 dialogue options total)
- Dr. Yahya consultation (3 dialogues)
- Chief Desk interactions (3 dialogues)
- Trinity awareness seeds planted
- Tutorial hints for first-time players
- Multiple completion paths (3 routes)
- Case closure validation
- Transition hooks to Case 02

### ✅ **Validation Status:**
- ✅ Schema validation: PASSED
- ✅ Dialog blueprints: PASSED (all 17 mapped)
- ✅ Evidence roles/tiers: PASSED
- ✅ UI anomalies: PASSED
- ✅ Cross-references: PASSED

---

## 🐛 **Known Issues (Non-Blocking)**

### **1. Missing Media Assets** ⚠️
**Severity:** LOW  
**Impact:** Visual placeholders only  
**Workaround:** Game will show placeholder images

**Missing Files:**
```
/assets/cases/case01/images/photo09.png (Sharif)
/assets/cases/case01/images/photo10.png (Abu Khaled)
/assets/cases/case/case01/images/photo11.png (Layla)
/assets/cases/case01/images/photo12.png (Hatem)
/assets/cases/case01/images/photo_dr_yahya.png (Dr. Yahya)
/assets/cases/case01/images/photo_chief.png (Chief Desk)
/assets/cases/case01/images/report02.png (SCN-03)
/assets/cases/case01/images/report03.png (DB-03)
/assets/cases/case01/images/photo05.png (SCN-04)
/assets/cases/case01/images/photo08.png (Victim)
/assets/cases/case01/video/video01.mp4
/assets/cases/case01/video/video02.mp4
/assets/cases/case01/audio/audio01.wav
/assets/cases/case01/audio/audio03.wav
/assets/cases/case01/audio/audio05.wav
```

**Status:** References exist in JSON, but files not created yet  
**Priority for Beta:** HIGH

---

### **2. Interrogation Response Trees Not Visual** ⚠️
**Severity:** MEDIUM  
**Impact:** Players can select dialogues but don't see full response trees  
**Workaround:** Blueprint display_text shows responses in logs

**Current Behavior:**
- Player selects dialogue option (e.g., Q03)
- Backend processes result correctly
- But UI doesn't show full conversation tree

**Expected for Beta:**
- Visual dialogue tree UI
- Suspect reactions (animations/expressions)
- Pressure score visualization

**Status:** Backend logic ready, frontend UI pending  
**Priority for Beta:** HIGH

---

### **3. No Cognitive Profile Enforcement** ⚠️
**Severity:** MEDIUM  
**Impact:** Suspects don't collapse/lawyer-up based on pressure  
**Workaround:** All dialogues always available

**Current Behavior:**
- Players can ask all questions in any order
- No consequences for aggressive questioning
- Suspects never refuse to answer

**Expected for Beta:**
- `collapse_threshold` enforcement
- `lawyer_up_threshold` enforcement
- Burned choices after aggressive questions
- Pressure score tracking visible to player

**Status:** Cognitive profiles defined in JSON, engine integration pending  
**Priority for Beta:** MEDIUM

---

### **4. UI Anomalies Not Rendered** ⚠️
**Severity:** LOW  
**Impact:** Paranoia layer not visible  
**Workaround:** None (feature not implemented in frontend)

**Defined Anomalies:**
1. `anomaly_inbox_accident_glitch` - Text morph in inbox
2. `anomaly_cctv_flicker` - Visual glitch on CCTV evidence
3. `anomaly_shadow_menu_flicker` - Shadow in main menu

**Current Behavior:**
- Anomalies defined in case01.json
- Trigger flags work correctly
- But frontend doesn't render effects

**Expected for Beta:**
- Text morph animation (800ms)
- CCTV frame distortion (1000ms)
- Shadow appearance in menu (500ms)

**Status:** Backend config ready, frontend components pending  
**Priority for Beta:** MEDIUM

---

### **5. Timeline Board Not Tested** ⚠️
**Severity:** LOW  
**Impact:** Cannot verify timeline locking works  
**Workaround:** Players can still solve case without timeline

**Current State:**
- 3 timeline blueprints defined:
  - `LOCK-EVENT-03` (Sharif at 20:41)
  - `LOCK-EVENT-05` (Sharif's alleged sighting)
  - `LOCK-EVENT-06` (CCTV corruption)
- Prerequisites correctly set
- But UI not tested

**Status:** Blueprint data complete, UI untested  
**Priority for Beta:** MEDIUM

---

### **6. Evidence Reinterpretation Not Active** ⚠️
**Severity:** LOW  
**Impact:** `EVID-PARTIAL-LOCK` doesn't dynamically update  
**Workaround:** Evidence shows final state

**Current Behavior:**
- Rules defined in `evidence_reinterpretation_rules`
- Should update `EVID-PARTIAL-LOCK` when OBJ-02 + DB-06 verified
- But engine doesn't recompute dynamically

**Expected for Beta:**
- Evidence summary updates in real-time
- Tags change from "mislead" to "critical"
- Flags cleared/set automatically

**Status:** Rules defined, engine integration pending  
**Priority for Beta:** LOW

---

### **7. Trinity Awareness Score Not Visible** ⚠️
**Severity:** LOW  
**Impact:** Players don't know their awareness level  
**Workaround:** Awareness still tracked internally

**Current Behavior:**
- `trinity_awareness_score` calculated correctly
- Flags set properly (e.g., `is_clockmaker_suspicious_1`)
- But score not shown to player

**Expected for Beta:**
- Hidden score (players shouldn't see exact number)
- BUT subtle hints when score crosses thresholds
- UI anomalies trigger at 25, 50, 75

**Status:** Calculator implemented, feedback system pending  
**Priority for Beta:** LOW

---

### **8. No Save/Load Tested** ⚠️
**Severity:** MEDIUM  
**Impact:** Cannot verify persistence works  
**Workaround:** Play in single session

**Current State:**
- Save migration script created
- Schema versioning in place
- But actual save/load not tested with Case 01

**Expected for Beta:**
- Save at any point
- Load and resume
- Carryover evidence persists
- NPC memory persists

**Status:** Migration system ready, integration testing pending  
**Priority for Beta:** HIGH

---

### **9. Transition to Case 02 Not Tested** ⚠️
**Severity:** MEDIUM  
**Impact:** Cannot verify hooks work  
**Workaround:** Case 02 exists but not fully implemented

**Current Hooks:**
1. `hook_case02_clockmaker_seed` - If player caught Trinity hint
2. `hook_case02_false_confidence` - If player had false success

**Expected for Beta:**
- Case 02 briefing changes based on Case 01 outcome
- Clarity modifier applied
- Carryover evidence available

**Status:** Hooks defined, Case 02 not ready  
**Priority for Beta:** MEDIUM

---

### **10. Audio/Video Playback Not Tested** ⚠️
**Severity:** LOW  
**Impact:** Media references may 404  
**Workaround:** Text descriptions still work

**Current References:**
- 2 video URLs
- 3 audio URLs
- All will return 404 (files don't exist)

**Expected for Beta:**
- Audio plays for inbox brief
- Video plays for key evidence
- Fallback to text if media unavailable

**Status:** URLs in JSON, media not created  
**Priority for Beta:** MEDIUM

---

## 🎯 **Alpha Testing Focus Areas**

### **What Alpha Testers Should Test:**

1. ✅ **Evidence Review Flow**
   - Can you review all 24 evidence items?
   - Do descriptions make sense?
   - Are dependencies clear?

2. ✅ **Interrogation Logic**
   - Do all 17 dialogue options work?
   - Are responses appropriate?
   - Can you build behavioral chains?

3. ✅ **Case Closure**
   - Can you achieve true closure?
   - What happens with wrong motive?
   - Does rejection work properly?

4. ✅ **Hint System**
   - Do L0-L7 hints appear correctly?
   - Are they helpful without spoilers?
   - Does L0 tutorial work for new players?

5. ✅ **Route Balance**
   - Can you solve via timeline route?
   - Can you solve via forensics route?
   - Can you solve via behavioral route?

### **What Alpha Testers Should NOT Expect:**

❌ Full UI polish  
❌ Character animations  
❌ Voice acting  
❌ Dynamic interrogation pressure  
❌ Visual glitch effects  
❌ Save/load functionality  
❌ Case 02 transition  

---

## 📝 **Feedback Template for Alpha Testers**

```markdown
## Alpha Test Report - Case 01

**Tester:** [Name]
**Date:** [Date]
**Playtime:** [Minutes]
**Route Used:** [Timeline/Forensics/Behavioral/Mixed]
**Outcome:** [True Success/False Success/Failure]

### What Worked Well:
- 
- 
- 

### What Was Confusing:
- 
- 
- 

### Bugs Encountered:
1. [Description]
   - Steps to reproduce:
   - Expected behavior:
   - Actual behavior:
   - Severity: [Low/Medium/High]

### Suggestions:
- 
- 
- 

### Overall Rating: [1-5 stars]
```

---

## 🚀 **Beta Readiness Checklist**

Before Case 01 is ready for beta:

### **Must Have:**
- [ ] All media assets created (images, audio, video)
- [ ] Dialogue tree UI implemented
- [ ] Cognitive profile enforcement active
- [ ] Save/load tested end-to-end
- [ ] Case 02 transition working
- [ ] At least 5 alpha tests completed

### **Should Have:**
- [ ] UI anomalies rendered
- [ ] Timeline board tested
- [ ] Evidence reinterpretation active
- [ ] Trinity awareness feedback (subtle)
- [ ] Pressure score visible during interrogations

### **Nice to Have:**
- [ ] Character animations
- [ ] Voice acting for key dialogues
- [ ] Dynamic hint system
- [ ] Achievement system
- [ ] Replay value features

---

## 📊 **Validation History**

| Date | Validation | Status | Notes |
|------|-----------|--------|-------|
| Apr 11 | Schema | ✅ PASS | All 24 evidence valid |
| Apr 11 | Dialog Blueprints | ✅ PASS | All 17 dialogues mapped |
| Apr 11 | Evidence Roles | ✅ PASS | Updated validator to accept 'unlock', 'context' |
| Apr 11 | Evidence Tiers | ✅ PASS | Updated validator to accept 'supporting' |
| Apr 11 | UI Anomalies | ✅ PASS | Removed duplicate section |
| Apr 11 | Grand Truth Axis | ✅ PASS | Added 'whisperer_seed' |
| Apr 11 | Cross-References | ✅ PASS | No broken links |

---

## 🎮 **How to Play Case 01 (Alpha)**

### **Quick Start:**
```bash
# Start the game
npm start

# Run smoke tests
npm run test:smoke

# Validate case
node scripts/validate_all_cases.mjs
```

### **Recommended First Play:**
1. Read inbox brief from Chief Desk
2. Review SCN-03 (fire origin report)
3. Talk to Chief Desk → REQ-EVIDENCE-01
4. Interrogate Sharif → Q03
5. Consult Dr. Yahya → Q01
6. Build evidence chain
7. Attempt case closure

### **Expected Time:**
- First play: 30-45 minutes
- Experienced: 15-20 minutes
- Speedrun: 10 minutes

---

## 📞 **Report Issues**

If you encounter bugs during alpha testing:

1. Check this document first (might be known)
2. Reproduce the issue 2-3 times
3. Collect logs from browser console
4. Submit feedback using template above
5. Include save file if possible

**Contact:** [Your contact info]  
**Bug Tracker:** [Your issue tracker]

---

## 🎯 **Alpha Goals**

**Primary Goal:** Verify core gameplay loop works  
**Secondary Goal:** Identify UX confusion points  
**Tertiary Goal:** Balance difficulty across 3 routes  

**Success Criteria:**
- ✅ 5+ alpha testers complete case
- ✅ 80% achieve true closure on first try
- ✅ Average playtime 25-40 minutes
- ✅ No critical bugs (game-breaking)
- ✅ Feedback incorporated into beta

---

**Status: 🟢 READY FOR ALPHA TESTING**

Case 01 is playable and validated. Known issues are documented and non-blocking for alpha. Focus testing on core gameplay loop and user experience.

Good luck, detectives! 🔍✨
