# 🎮 Game Logic Fixes - Master Plan

## 📋 Overview
This document outlines critical gameplay logic issues that affect player experience, fairness, and game flow. All fixes should maintain zero spoilers while improving mechanics.

---

## 🔴 Priority 1: Investigator Role Balance (CRITICAL)

### Problem
- Investigators receive unequal evidence distribution
- Some investigators get many files, others get only 1-2 files
- This creates unfair gameplay experience and reduces enjoyment
- No clear role definition per investigator

### Root Cause
- Evidence routing system (`route_weight`) not properly distributing content
- No minimum evidence guarantee per specialty
- Missing perspective-based filtering logic

### Solution
1. **Define 3 Clear Investigator Roles:**
   - **Timeline Investigator**: Events, CCTV footage, timestamps, alibis
   - **Forensics Investigator**: Lab reports, physical evidence, chemical analysis
   - **Behavioral Investigator**: Interrogations, witness testimonies, psychological profiles

2. **Implement Fair Distribution:**
   ```typescript
   // Each investigator should have:
   - Minimum 4-5 exclusive evidence items
   - 2-3 shared evidence items (requires collaboration)
   - 1 unique "key evidence" that only they can access
   ```

3. **Evidence Routing Fix:**
   ```typescript
   // In PerspectiveFilter.ts
   const MIN_EVIDENCE_PER_ROLE = 4;
   const MAX_EVIDENCE_PER_ROLE = 7;
   
   function distributeEvidenceBySpecialty(evidenceList, specialty) {
     const routeEvidence = evidenceList.filter(e => 
       e.route_weight[specialty] >= 0.6
     );
     
     // Ensure minimum threshold
     if (routeEvidence.length < MIN_EVIDENCE_PER_ROLE) {
       // Add shared evidence with collaboration requirement
       const sharedEvidence = evidenceList.filter(e => 
         e.requires_route_collaboration?.includes(specialty)
       );
       routeEvidence.push(...sharedEvidence);
     }
     
     return routeEvidence.slice(0, MAX_EVIDENCE_PER_ROLE);
   }
   ```

4. **UI Enhancement:**
   - Show role description when selecting specialty
   - Display evidence count per role in waiting room
   - Add tooltip: "Each investigator has unique files - collaboration is required!"

### Files to Modify
- `server/src/managers/PerspectiveFilter.js`
- `server/src/managers/EngineHost.ts`
- `frontend/src/pages/WaitingRoom.tsx`
- `runtime/src/engine/perspectiveRouting.ts` (create if needed)

### Testing
- [ ] Verify each specialty gets 4-7 evidence items
- [ ] Test 3-player team with different specialties
- [ ] Ensure no single role dominates investigation
- [ ] Check collaboration triggers work correctly

---

## 🔴 Priority 2: Trust Meter Clarity

### Problem
- Trust meter purpose is unclear to players
- No explanation of what affects it
- Players don't understand why it changes

### Solution
1. **Add Tooltip/Explanation:**
   ```
   📊 مقياس ثقة النيابة
   
   يتغير بناءً على:
   ✓ توثيق الأدلة بسرعة (+)
   ✓ ربط الأحداث بشكل صحيح (+)
   ✗ التأخير في الإجراءات (-)
   ✗ محاولة إغلاق القضية بأدلة ناقصة (--)
   
   ⚠️ إذا وصل للصفر: قد تُجمّد بعض أدوات التحقيق
   ```

2. **Show Trust Impact History:**
   - Add small log showing recent changes
   - Example: "+5% - تم توثيق دليل جديد", "-10% - محاولة إغلاق فاشلة"

3. **Visual Improvements:**
   - Add animated transitions when trust changes
   - Color coding: Green (high), Orange (medium), Red (critical)

### Files to Modify
- `frontend/src/components/TrustMeter.tsx` (create or update)
- `frontend/src/utils/caseProgress.ts`
- `frontend/src/pages/GameDesktop.tsx`

---

## 🔴 Priority 3: Timeline Board Logic

### Problem
- Timeline purpose is confusing
- Events listed in order but also requires player ordering
- Contradiction between "reference facts" (fixed) and "discovery feed" (dynamic)

### Solution
1. **Clarify Timeline Purpose:**
   ```
   📍 الخط الزمني - 3 أقسام:
   
   1️⃣ السجل المرجعي (Reference Facts)
      - أحداث ثابتة معروفة مسبقاً
      - للرجوع إليها فقط - لا يمكن تعديلها
   
   2️⃣ الأحداث المستجدة (Discovery Feed)
      - أحداث تكتشفها أثناء التحقيق
      - تظهر تلقائياً عند فتح أدلة جديدة
   
   3️⃣ العقد الزمنية (Analysis & Locking)
      - استنتاجات تحتاج إثبات
      - اربط الأدلة لتثبيت كل حدث
      - تثبيت الأحداث يفتح مسارات جديدة
   ```

2. **Fix Ordering Logic:**
   - Reference Facts: Show in chronological order by default
   - Discovery Feed: Show in order of discovery (newest first)
   - Analysis: Show locked events first, then available, then locked

3. **Add Visual Guide:**
   ```
   🔓 غير مكتمل → 🔗 جاهز للتثبيت → ✅ مثبت
   ```

### Files to Modify
- `frontend/src/components/TimelineBoard.tsx`
- `frontend/src/components/TimelineBoard.css`

---

## 🟡 Priority 4: Thread Board Mobile Touch

### Problem
- On mobile, dragging nodes is interrupted
- System confuses tap vs drag
- Touch handling cuts off mid-drag

### Solution
1. **Implement Proper Touch Detection:**
   ```typescript
   // Use pointer events with threshold
   const DRAG_THRESHOLD = 8; // pixels
   
   function startPointerDrag(e: PointerEvent, nodeId: string) {
     const startX = e.clientX;
     const startY = e.clientY;
     let isDragging = false;
     
     function onPointerMove(e: PointerEvent) {
       const dx = e.clientX - startX;
       const dy = e.clientY - startY;
       
       if (!isDragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
         isDragging = true;
         setDraggingNode(nodeId);
       }
       
       if (isDragging) {
         // Update node position
       }
     }
   }
   ```

2. **Separate Click from Drag:**
   - Only trigger click if movement < threshold
   - Only trigger drag if movement > threshold
   - Add `touch-action: none` to draggable nodes

3. **Mobile-Specific UI:**
   - Add "Move Mode" toggle button on mobile
   - When enabled, all touches become drag operations
   - Double-tap to select, single tap to confirm position

### Files to Modify
- `frontend/src/components/StringBoard.tsx`
- `frontend/src/components/StringBoard.css`

---

## 🟡 Priority 5: Lab System Workflow

### Problem
- Reports already contain results in the file
- Lab submission feels redundant
- No clear "send to lab" → "await results" flow

### Solution
1. **Fix Evidence Flow:**
   ```
   Original (Wrong):
   Evidence File → Already has result → Player reads it
   
   Fixed (Correct):
   Evidence File → Player sees partial data
   → Player clicks "Send to Lab"
   → Lab processes (shows animation/progress)
   → Lab Report arrives with results
   → Player reviews lab report
   ```

2. **Update Evidence States:**
   ```typescript
   // New evidence state flow
   'unexamined' → 'submitted_to_lab' → 'lab_processing' → 'lab_complete'
   ```

3. **UI Changes:**
   - Add "إرسال للمختبر" button on evidence
   - Show processing state with timer
   - Separate lab reports from initial evidence files

4. **Data Structure Fix:**
   ```json
   {
     "evidence_id": "SCN-03",
     "initial_summary": "عينة من موقع الحريق - بحاجة لتحليل",
     "lab_submission_required": true,
     "lab_report": {
       "id": "LAB-SCN-03",
       "title": "تقرير المختبر - تحليل العينة",
       "result": "تم اكتشاف آثار بنزين..."
     }
   }
   ```

### Files to Modify
- `frontend/src/components/EvidenceViewer.tsx`
- `runtime/src/engine/evidenceProcessing.ts`
- Server-side lab processing logic

---

## 🟡 Priority 6: Progressive Hint System

### Problem
- Current system is partially implemented but not showing level progression clearly
- Hints should scale from subtle → direct based on player progress
- Players don't understand hint levels

### Solution
1. **Improve Hint Level Visibility:**
   ```
   💡 نظام التلميحات المتدرج
   
   المستوى 1: توجيه خفيف
   "راجع التقرير الجنائي مرة أخرى"
   
   المستوى 2: تلميح أكثر تحديداً
   "تقرير منشأ الحريق يثبت أن النار بدأت في المكتب"
   
   المستوى 3: كشف التناقض
   "شريف قال أنه كان في البيت، لكن كاميرا المراقبة تظهر غير ذلك"
   
   المستوى 4-6: توجيه مباشر
   "واجه شريف بتناقض سجلات الـ GPS"
   
   المستوى 7: الحل شبه كامل
   "شريف هو الجاني - الدافع: إخفاء الاختلاس"
   ```

2. **Show Progression in UI:**
   - Display current hint level: "التلميح 3 من 7"
   - Show progress bar
   - Explain: "كلما طلبت تلميحات أكثر بدون تقدم، ستصبح أكثر وضوحاً"

3. **Reset Logic:**
   - When player makes progress (verifies evidence), reset to level 1
   - This encourages actual investigation

### Files to Modify
- `frontend/src/components/HintPanel.tsx` (update)
- `runtime/src/engine/phsSystem.ts` (verify logic)
- `server/src/websocket/handler.ts` (hint consensus)

---

## 🟢 Priority 7: Team Mode Refresh Protection

### Problem
- Accidental refresh kicks player out of room
- Game doesn't pause for remaining players
- No auto-rejoin mechanism

### Solution
1. **Auto-Rejoin on Refresh:**
   ```typescript
   // In useRoomAutoRejoin.ts
   useEffect(() => {
     if (!currentRoom && roomId && mode === 'multiplayer') {
       // Attempt rejoin
       wsService.send('REJOIN_ROOM', {
         roomId,
         playerId: profile.playerId,
       });
     }
   }, [roomId, mode, profile]);
   ```

2. **Pause Game for Single Player:**
   ```typescript
   // In server handler
   if (room.players.size === 1 && room.isMultiplayer) {
     // Pause game logic
     engineHost.pauseSession(roomId);
     broadcastToRoomAll(roomId, {
       type: 'GAME_PAUSED',
       payload: { reason: 'waiting_for_players' }
     });
   }
   ```

3. **Show Rejoin Option:**
   - If player leaves (accidentally), show in lobby:
   ```
   🚪 لديك غرفة نشطة: #ABC123
   [متابعة التحقيق] [مغادرة الغرفة]
   ```

4. **Session Persistence:**
   - Save room state to database every 30 seconds
   - On rejoin, restore exact state
   - No progress loss

### Files to Modify
- `frontend/src/hooks/useRoomAutoRejoin.ts`
- `server/src/managers/RoomManager.ts`
- `server/src/managers/EngineHost.ts`
- `server/src/websocket/handler.ts`

---

## 🟢 Priority 8: Instant Auto-Save

### Problem
- Progress only saves on room exit/re-entry
- Should save instantly on every action

### Solution
1. **Implement Real-time Save:**
   ```typescript
   // After every player action
   function sendAction(action) {
     const result = engine.processAction(action);
     
     // Instant save
     saveToDatabase({
       roomId,
       playerId,
       state: engine.state,
       timestamp: Date.now()
     });
   }
   ```

2. **Debounce for Performance:**
   ```typescript
   // Batch saves if actions are rapid
   const saveQueue = new Map();
   
   function queueSave(roomId, state) {
     saveQueue.set(roomId, state);
     
     if (!saveTimer) {
       saveTimer = setTimeout(() => {
         flushSaves();
       }, 1000); // Save every 1 second max
     }
   }
   ```

3. **Optimistic UI Updates:**
   - Update UI immediately
   - Save in background
   - Retry on failure

### Files to Modify
- `server/src/websocket/handler.ts` (add save calls)
- `server/src/managers/EngineHost.ts` (persistence logic)
- Database schema for session snapshots

---

## 🟢 Priority 9: Host Leave Handling

### Problem
- When host leaves, room stays open
- Other players confused about what to do
- No clear room closure mechanism

### Solution
1. **Detect Host Leave:**
   ```typescript
   // In RoomManager.ts
   function leaveRoom(roomId: string, playerId: string) {
     const room = this.rooms.get(roomId);
     const player = room.players.get(playerId);
     
     if (player.isHost) {
       // Host is leaving
       broadcastToRoomAll(roomId, {
         type: 'HOST_LEFT',
         payload: {
           message: 'غادر صاحب الغرفة. تم إغلاق الغرفة.',
           roomId
         }
       });
       
       // Close room for all players
       this.closeRoom(roomId);
     }
   }
   ```

2. **Transfer Host Option (Alternative):**
   ```
   ⚠️ صاحب الغرفة على وشك المغادرة
   
   خيار 1: نقل الملكية لـ [Player2]
   خيار 2: إغلاق الغرفة للجميع
   ```

3. **UI Message:**
   ```
   🔴 تم إغلاق الغرفة
   
   غادر صاحب الغرفة الغرفة.
   تم حفظ تقدمك.
   
   [العودة للوبي] [متابعة فردي]
   ```

### Files to Modify
- `server/src/managers/RoomManager.ts`
- `server/src/websocket/handler.ts`
- `frontend/src/pages/GameDesktop.tsx` (show closure modal)

---

## 🎯 Implementation Order

### Phase 1: Critical (Week 1)
1. ✅ Investigator Role Balance (Priority 1)
2. ✅ Trust Meter Clarity (Priority 2)
3. ✅ Timeline Board Logic (Priority 3)

### Phase 2: Important (Week 2)
4. ✅ Thread Board Mobile Touch (Priority 4)
5. ✅ Lab System Workflow (Priority 5)
6. ✅ Progressive Hint System (Priority 6)

### Phase 3: Polish (Week 3)
7. ✅ Team Mode Refresh (Priority 7)
8. ✅ Instant Auto-Save (Priority 8)
9. ✅ Host Leave Handling (Priority 9)

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Test evidence distribution fairness
- [ ] Test hint progression logic
- [ ] Test trust meter calculations

### Integration Tests
- [ ] Test 3-player team with different roles
- [ ] Test auto-rejoin after refresh
- [ ] Test instant save/load cycle

### User Testing
- [ ] Verify each role feels balanced
- [ ] Check mobile drag interaction
- [ ] Validate lab workflow clarity
- [ ] Test hint helpfulness without spoilers

---

## 📝 Notes

- **Zero Spoilers**: All UI text must be generic and not reveal case solutions
- **Backward Compatibility**: Existing rooms/saves should not break
- **Performance**: Auto-save should not impact gameplay smoothness
- **Mobile First**: All touch interactions must work perfectly on mobile
- **Accessibility**: Color-blind friendly indicators, clear text labels

---

## 📚 Related Documentation

- `story/ui_components.md` - UI component specifications
- `story/case rules.md` - Case design rules
- `engine_runtime_spec.md` - Engine behavior specifications
- `cases/case01/case01.json` - Example case structure

---

**Last Updated**: 2026-04-09
**Status**: Planning Phase
**Priority**: HIGH - Critical for gameplay experience
