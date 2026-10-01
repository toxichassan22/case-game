# 📋 Game Logic Fixes - Index

## 🎮 Critical Issues Documentation

This directory contains detailed specifications for all critical gameplay logic fixes identified during playtesting.

---

## 📁 Documents

### 1. [Master Plan](./game-logic-fixes-plan.md)
**Overview of all 9 critical issues with implementation priorities**

- 🔴 Priority 1: Investigator Role Balance
- 🔴 Priority 2: Trust Meter Clarity
- 🔴 Priority 3: Timeline Board Logic
- 🟡 Priority 4: Thread Board Mobile Touch
- 🟡 Priority 5: Lab System Workflow
- 🟡 Priority 6: Progressive Hint System
- 🟢 Priority 7: Team Mode Refresh Protection
- 🟢 Priority 8: Instant Auto-Save
- 🟢 Priority 9: Host Leave Handling

**Read this first** for overall understanding and implementation order.

---

### 2. [Investigator Role Balance Spec](./investigator-role-balance-spec.md)
**Detailed specification for fair evidence distribution across 3 investigator roles**

**Problem**: Some investigators get many files, others get 1-2 files only.

**Solution**:
- Define 3 clear roles (Timeline, Forensics, Behavioral)
- Each role gets 5-7 exclusive evidence items
- Shared evidence requires collaboration
- Key evidence forces teamwork

**Key Files to Modify**:
- `server/src/managers/PerspectiveFilter.js`
- `server/src/managers/EngineHost.ts`
- `frontend/src/pages/WaitingRoom.tsx`

---

### 3. [Timeline Board Logic Spec](./timeline-board-logic-spec.md)
**Clarification of timeline board purpose and 3-tab structure**

**Problem**: Timeline purpose is confusing, ordering logic unclear.

**Solution**:
- Tab 1 (Reference Facts): Fixed events, read-only
- Tab 2 (Discovery Feed): Auto-generated log of player actions
- Tab 3 (Analysis): Events to prove by linking evidence

**Key Files to Modify**:
- `frontend/src/components/TimelineBoard.tsx`
- `frontend/src/components/TimelineBoard.css`

---

### 4. [Lab System Workflow Spec](./lab-system-workflow-spec.md)
**Procedural flow for evidence submission to laboratory**

**Problem**: Reports already contain results, lab submission feels redundant.

**Solution**:
- Evidence collected in "unexamined" state
- Player clicks "Send to Lab"
- Lab processing (animation/delay)
- New lab report unlocks with results

**Key Files to Modify**:
- `frontend/src/components/EvidenceViewer.tsx`
- `runtime/src/engine/evidenceProcessing.ts` (create)
- Server handler for SUBMIT_TO_LAB action

---

### 5. [Thread Board Mobile Touch Fix](./thread-board-mobile-touch-fix.md)
**Fix mobile drag interaction that cuts off mid-drag**

**Problem**: On mobile, dragging nodes is interrupted, system confuses tap vs drag.

**Solution**:
- Use pointer events with 8px threshold
- Separate tap (< 8px) from drag (> 8px)
- Add move mode toggle for mobile
- Add `touch-action: none` to prevent browser interference

**Key Files to Modify**:
- `frontend/src/components/StringBoard.tsx`
- `frontend/src/components/StringBoard.css`

---

## 🚀 Quick Start

### If you're implementing fixes:
1. Read [Master Plan](./game-logic-fixes-plan.md) first
2. Start with Phase 1 (Priority 1-3)
3. Follow detailed specs for each issue
4. Test thoroughly before moving to next phase

### If you're reviewing/approving:
1. Read all 4 documents
2. Check implementation checklist in each spec
3. Verify testing scenarios are covered
4. Approve or request changes

### If you're testing:
1. Focus on one fix at a time
2. Follow testing scenarios in each spec
3. Document any issues found
4. Provide feedback on UX clarity

---

## 📊 Implementation Status

| Issue | Priority | Status | ETA |
|-------|----------|--------|-----|
| Investigator Balance | 🔴 Critical | 📝 Planning | Week 1 |
| Trust Meter Clarity | 🔴 Critical | 📝 Planning | Week 1 |
| Timeline Logic | 🔴 Critical | 📝 Planning | Week 1 |
| Thread Board Mobile | 🟡 Important | 📝 Planning | Week 2 |
| Lab System Workflow | 🟡 Important | 📝 Planning | Week 2 |
| Progressive Hints | 🟡 Important | 📝 Planning | Week 2 |
| Team Refresh | 🟢 Polish | 📝 Planning | Week 3 |
| Instant Save | 🟢 Polish | 📝 Planning | Week 3 |
| Host Leave | 🟢 Polish | 📝 Planning | Week 3 |

**Legend**:
- 📝 Planning: Specification complete, ready for implementation
- 🔧 In Progress: Currently being implemented
- ✅ Complete: Implemented and tested
- 🧪 Testing: Implemented, awaiting testing

---

## 🎯 Key Principles

All fixes must adhere to:

1. **Zero Spoilers**: No case solutions revealed in UI text
2. **Fair Gameplay**: All players have equal enjoyment
3. **Clear Purpose**: Every feature has obvious purpose
4. **Progressive Difficulty**: Systems scale with player skill
5. **Mobile First**: Touch interactions work perfectly
6. **Instant Feedback**: Player actions have immediate response
7. **Collaboration Required**: Team play is necessary, not optional

---

## 📚 Related Documentation

### Story & Design
- `story/ui_components.md` - UI component specifications
- `story/case rules.md` - Case design rules
- `story/grand_truth.md` - overarching narrative
- `story/behavior.md` - Player behavior patterns

### Technical
- `engine_runtime_spec.md` - Engine behavior specifications
- `essentional.md` - Essential project information

### Cases
- `cases/case01/case01.json` - Example case structure
- `cases/case01/blueprints.json` - Timeline blueprints example

---

## 🔗 Cross-References

### Issues That Depend on Each Other

```
Investigator Balance (Priority 1)
  ↓ affects
Lab System Workflow (Priority 5)
  - Forensics investigator is primary lab user
  - Evidence distribution affects lab submission flow

Timeline Logic (Priority 3)
  ↓ depends on
Lab System Workflow (Priority 5)
  - Lab reports can be prerequisites for timeline events
  - Must wait for lab results before locking events

Progressive Hints (Priority 6)
  ↓ uses
All Other Systems
  - Hints reference evidence, timeline, lab reports
  - Must understand all systems to write good hints
```

### Files Modified by Multiple Issues

```
frontend/src/components/EvidenceViewer.tsx
  - Lab System Workflow (Priority 5)
  - Trust Meter display (Priority 2)

frontend/src/components/TimelineBoard.tsx
  - Timeline Logic (Priority 3)
  - May show lab report prerequisites

server/src/managers/PerspectiveFilter.js
  - Investigator Balance (Priority 1)
  - Evidence routing for all specialties
```

---

## 📝 Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-04-09 | Initial creation of all 4 specs | AI Assistant |
| | | |

---

## 💡 Feedback & Questions

If you have questions about any specification:
1. Check if answered in the detailed spec
2. Review related documentation
3. Ask for clarification in team chat
4. Update this document with answers

---

**Last Updated**: 2026-04-09
**Maintained By**: Development Team
**Review Cycle**: Weekly during implementation phase
