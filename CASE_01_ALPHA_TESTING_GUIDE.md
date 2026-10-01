# 🧪 Case 01 Alpha Testing Infrastructure

> **Created:** April 12, 2026  
> **Status:** Ready for Alpha Testing  
> **Testers Needed:** 5+ players

---

## 📋 Testing Checklist

### Pre-Testing Setup ✅

- [x] Case 01 JSON validated (0 errors)
- [x] All 24 evidence items present
- [x] All 4 suspects with cognitive profiles
- [x] Dr. Yahya consultant integrated
- [x] Chief Desk authority character added
- [x] UI anomalies system implemented
- [x] Pressure score visualization added
- [x] Transition hooks to Case 02 configured
- [x] SVG placeholder assets created
- [x] SystemAnomaly component integrated
- [x] PressureScore component integrated

---

## 🎯 Test Scenarios

### Scenario 1: True Success (Best Ending)
**Objective:** Complete case with full Trinity awareness

**Steps:**
1. Start Case 01
2. Talk to Chief Desk → Request additional files (REQ-EVIDENCE-01)
3. Review SCN-03 (Fire origin report)
4. Interrogate Sharif → Q03 (Why mention storage?)
5. Consult Dr. Yahya → Q01 (Behavioral analysis)
6. Inspect OBJ-02 (Spare key)
7. Review DB-06 (Trip trace)
8. Interrogate Sharif → Q06 (Who had side door key?)
9. Review SCN-04 (Soot analysis)
10. Lock Timeline Event → LOCK-EVENT-03
11. Review EVID-SUP-CCTV-CORRUPTION (Trinity seed)
12. Attempt Case Closure:
    - Suspect: شريف نبيل السيوفي
    - Motive: motive_embezzlement_black_ledger
    - Method: method_arson_front_door
    - Evidence: [SCN-03, EVID-PARTIAL-FALSE-ORIGIN-STORY, EVID-PARTIAL-LOCK]

**Expected Results:**
- ✅ TRUE CLOSURE achieved
- ✅ Flags set: `case01_fire_resolved`, `is_clockmaker_suspicious_1`
- ✅ UI anomaly triggered (inbox text morph)
- ✅ Transition to Case 02 with +5 clarity modifier
- ✅ Extra inbox attachment in Case 02

**Validation Points:**
- [ ] All evidence reviewed successfully
- [ ] Pressure score visible during interrogations
- [ ] Dr. Yahya provides behavioral insights
- [ ] UI anomaly appears when reviewing CCTV corruption
- [ ] Case closure validation passes
- [ ] Transition hook works correctly

---

### Scenario 2: False Success (Wrong Motive)
**Objective:** Complete case with wrong motive (insurance fraud)

**Steps:**
1-10. Same as Scenario 1

11. Attempt Case Closure:
    - Suspect: شريف نبيل السيوفي
    - Motive: motive_insurance ❌ (WRONG!)
    - Method: method_arson_front_door
    - Evidence: [SCN-03, EVID-PARTIAL-FALSE-ORIGIN-STORY, EVID-PARTIAL-LOCK]

**Expected Results:**
- ⚠️ FALSE SUCCESS achieved
- ✅ Flag set: `case01_false_confidence_close`
- ✅ Transition to Case 02 with -4 clarity modifier
- ✅ Biased briefing in Case 02

**Validation Points:**
- [ ] Wrong motive accepted (legal closure)
- [ ] Flag set correctly
- [ ] Transition hook applies friction
- [ ] Case 02 briefing shows bias

---

### Scenario 3: Missing Behavioral Chain
**Objective:** Attempt closure without behavioral evidence

**Steps:**
1. Review SCN-03, SCN-04, OBJ-02
2. Review DB-06, DB-01
3. Lock LOCK-EVENT-03
4. Do NOT interrogate any suspects
5. Attempt Case Closure

**Expected Results:**
- ❌ CLOSURE REJECTED
- ✅ Error message: "You need at least 1 behavioral chain"
- ✅ Hint suggests reviewing Sharif's statements

**Validation Points:**
- [ ] Closure rejected correctly
- [ ] Error message is clear
- [ ] Hint system provides guidance

---

### Scenario 4: UI Anomalies Testing
**Objective:** Verify all 3 UI anomalies work

**Test 4.1: Inbox Text Morph**
1. Complete case with Trinity awareness
2. Trigger `is_clockmaker_suspicious_1` flag
3. Return to inbox
4. **Expected:** Word "مبدئيًا" morphs to "مصممًا" for 800ms

**Test 4.2: CCTV Visual Glitch**
1. Review EVID-SUP-CCTV-CORRUPTION
2. **Expected:** Brief frame distortion for 1000ms

**Test 4.3: Shadow Menu Flicker**
1. Trigger `trinity_pattern_detected` flag (debug mode)
2. Open main menu
3. **Expected:** Shadow appears for 500ms

**Validation Points:**
- [ ] Anomaly 1: Text morph works
- [ ] Anomaly 2: Visual glitch works
- [ ] Anomaly 3: Shadow appearance works
- [ ] All anomalies auto-revert
- [ ] No performance impact

---

### Scenario 5: Pressure Score Testing
**Objective:** Verify pressure visualization during interrogations

**Test 5.1: Sharif Interrogation**
1. Start interrogating Sharif
2. Ask aggressive questions (Q03, Q06, Q09)
3. **Expected:** Pressure score increases
4. **Expected:** Visual bar shows pressure level
5. **Expected:** Warning appears near threshold

**Test 5.2: Layla Interrogation**
1. Start interrogating Layla
2. **Expected:** Lower collapse threshold (5) visible
3. **Expected:** Pressure increases faster
4. **Expected:** Warning appears earlier

**Validation Points:**
- [ ] Pressure score visible for all suspects
- [ ] Color coding works (green/yellow/orange/red)
- [ ] Threshold markers visible
- [ ] Warning indicators appear
- [ ] Real-time updates work

---

### Scenario 6: Route Balance Testing
**Objective:** Verify all 3 routes are viable

**Test 6.1: Timeline Route**
- Focus on: DB-01, DB-06, DB-07, LOCK-EVENTs
- **Expected:** Can solve case with timeline evidence + 1 behavioral chain

**Test 6.2: Forensics Route**
- Focus on: SCN-03, SCN-04, SCN-05, OBJ-01, OBJ-02
- **Expected:** Can solve case with forensic evidence + 1 behavioral chain

**Test 6.3: Behavioral Route**
- Focus on: INT-SHARIF dialogues, Dr. Yahya consultation
- **Expected:** Can build behavioral chains, still need cross-route evidence

**Validation Points:**
- [ ] All 3 routes viable
- [ ] No route is significantly easier
- [ ] Cross-route collaboration required
- [ ] Behavioral chain always required

---

### Scenario 7: Dr. Yahya Integration
**Objective:** Verify Dr. Yahya consultation works

**Steps:**
1. Open Dr. Yahya consultation
2. Ask Q01 (Sharif's behavior)
3. **Expected:** "النفي الاستباقي" analysis
4. Ask Q02 (Crime pattern)
5. **Expected:** "منظمة أكثر من اللازم" hint
6. Ask Q03 (Coping advice)
7. **Expected:** General guidance

**Validation Points:**
- [ ] All 3 dialogues work
- [ ] Responses match blueprints
- [ ] Hints are helpful but not spoilers
- [ ] Trinity whispers subtle

---

### Scenario 8: Chief Desk Interactions
**Objective:** Verify Chief Desk dialogue system

**Steps:**
1. Open Chief Desk dialogue
2. Select REQ-EVIDENCE-01
3. **Expected:** OBJ-01, OBJ-02, CCTV unlocked
4. Select Q-CHIEF-02 (Pressure)
5. **Expected:** Institutional pressure hint
6. Select Q-CHIEF-03 (Pattern)
7. **Expected:** Mention of similar fires

**Validation Points:**
- [ ] Evidence unlock works
- [ ] Pressure hint subtle
- [ ] Pattern mention intrigues
- [ ] Character personality consistent

---

## 📊 Metrics to Collect

### Quantitative Metrics
- **Time to Completion:** Target 25-40 minutes
- **Evidence Reviewed:** Count per player
- **Dialogues Used:** Count per suspect
- **Hints Requested:** Count per level (L0-L7)
- **Route Used:** Timeline/Forensics/Behavioral/Mixed
- **Outcome:** True/False/Failure

### Qualitative Feedback
- **Clarity:** Was the objective clear? (1-5)
- **Difficulty:** Was it too easy/hard? (1-5)
- **Hints:** Were hints helpful? (1-5)
- **UI Anomalies:** Did you notice them? (Yes/No)
- **Pressure Score:** Was it useful? (1-5)
- **Dr. Yahya:** Did consultation help? (Yes/No)
- **Overall Rating:** (1-5 stars)

---

## 🐛 Bug Report Template

```markdown
## Bug Report - Case 01

**Tester:** [Name]
**Date:** [Date]
**Scenario:** [1-8]
**Severity:** [Critical/High/Medium/Low]

### Description
[Brief description of the issue]

### Steps to Reproduce
1. 
2. 
3. 

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happened]

### Screenshots/Logs
[Attach if applicable]

### Browser/Device
[Browser name, version, OS]
```

---

## 📝 Feedback Form

```markdown
# Case 01 Alpha Feedback

**Tester Name:** 
**Date:** 
**Playtime:** [minutes]
**Route Used:** [Timeline/Forensics/Behavioral/Mixed]
**Outcome:** [True Success/False Success/Failure]

## Ratings (1-5)
- Overall Clarity: [1-5]
- Difficulty Level: [1-5]
- Hint Usefulness: [1-5]
- UI Quality: [1-5]
- Interrogation System: [1-5]
- Pressure Score Usefulness: [1-5]
- Dr. Yahya Helpfulness: [1-5]
- Overall Experience: [1-5]

## What Worked Well
1. 
2. 
3. 

## What Was Confusing
1. 
2. 
3. 

## Bugs Encountered
1. [Description, severity]
2. 
3. 

## Suggestions for Improvement
1. 
2. 
3. 

## UI Anomalies
- Did you notice the inbox text morph? [Yes/No]
- Did you notice the CCTV glitch? [Yes/No]
- Did you notice the shadow in menu? [Yes/No]
- Were they too obvious/subtle? [Rating]

## Narrative Feedback
- Was the story engaging? [1-5]
- Did Dr. Yahya seem suspicious? [Yes/No/Maybe]
- Did you catch the Trinity seed? [Yes/No]
- Was Chief Desk's pressure clear? [Yes/No]

## Additional Comments

```

---

## 🚀 How to Run Alpha Tests

### Option 1: Local Testing
```bash
# Start development server
cd d:\game
npm start

# Access at http://localhost:5173
# Create test account
# Play through Case 01
```

### Option 2: Network Testing
```bash
# Get local IP
ipconfig

# Share with testers: http://[YOUR_IP]:5173
# Testers join from same network
```

### Option 3: Deployed Testing
```bash
# Build production version
npm run build

# Deploy to hosting service
# Share URL with testers
```

---

## ✅ Success Criteria

### Must Have (Before Beta)
- [ ] 5+ testers complete Case 01
- [ ] 80% achieve true closure on first try
- [ ] Average playtime 25-40 minutes
- [ ] No critical bugs (game-breaking)
- [ ] All UI anomalies trigger correctly
- [ ] Pressure score displays accurately
- [ ] Dr. Yahya consultation works
- [ ] Transition hooks function properly

### Should Have
- [ ] 80%+ rate clues as "helpful"
- [ ] No route is significantly easier than others
- [ ] UI anomalies noticed by 60%+ of testers
- [ ] Pressure score rated useful by 70%+
- [ ] Dr. Yahya rated helpful by 60%+

### Nice to Have
- [ ] Testers report "paranoid atmosphere"
- [ ] Trinity seed creates curiosity
- [ ] Multiple playthroughs attempted
- [ ] Testers share theories about Dr. Yahya

---

## 📞 Support During Testing

### Common Issues & Solutions

**Issue:** Can't close the case
**Solution:** Check if you have 1 behavioral chain + 1 cross-route evidence

**Issue:** Don't know what to do
**Solution:** Open hints panel, review L0 hint

**Issue:** Interrogation not working
**Solution:** Make sure you reviewed related evidence first

**Issue:** UI anomalies not appearing
**Solution:** Check if trigger flags are set (debug mode available)

### Debug Commands
```javascript
// In browser console:

// Set flag for testing
useGameStore.getState().setFlag('is_clockmaker_suspicious_1', true);

// View current flags
console.log(useGameStore.getState().engineSnapshot?.flags);

// View pressure scores
console.log(useGameStore.getState().engineSnapshot?.suspectPressureScores);

// Reset case
localStorage.clear();
window.location.reload();
```

---

## 📈 Post-Testing Analysis

### Data to Analyze
1. **Completion Rates:** True/False/Failure percentages
2. **Time Distribution:** Playtime histogram
3. **Route Preference:** Which route most used?
4. **Hint Usage:** Which levels most accessed?
5. **Bug Frequency:** Most common issues
6. **Rating Averages:** Overall satisfaction

### Questions to Answer
- Is the difficulty balanced?
- Are hints effective?
- Is the tutorial clear?
- Do UI anomalies enhance experience?
- Is pressure score useful?
- Is Dr. Yahya integration successful?
- Are transition hooks working?

### Next Steps Based on Results
- **If completion < 60%:** Reduce difficulty, add more hints
- **If playtime < 20min:** Add more evidence, deepen investigation
- **If playtime > 50min:** Streamline puzzles, improve guidance
- **If bugs > 5 per tester:** Prioritize fixes before beta
- **If rating < 3.5:** Major redesign needed

---

**Ready to Start:** ✅ YES  
**Estimated Testing Duration:** 2-3 days  
**Target Completion:** Before Case 02 development

Good luck, detectives! 🔍✨
