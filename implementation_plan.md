# Implementation Plan - Solo Flow Fix

Unify Solo and Multiplayer flows by routing all game logic through the server. This ensures consistency, simplifies the frontend, and enables features like cross-device play even for Solo games.

## Proposed Changes

### Frontend Store
#### [MODIFY] [gameStore.ts](file:///d:/game/frontend/src/stores/gameStore.ts)
- Add [selectSpecialty(specialty: Specialty)](file:///d:/game/server/src/managers/RoomManager.ts#142-157) action to send `SELECT_SPECIALTY` via WebSocket.

### Frontend Components
#### [MODIFY] [GameDesktop.tsx](file:///d:/game/frontend/src/pages/GameDesktop.tsx)
- Remove `soloSpecialty` local state.
- Update `currentSpecialty` to always look up the player's specialty in `currentRoom.players`.
- Update `onSwitchSpecialty` to call `gameStore.selectSpecialty`.
- Refine `isSolo` check to rely on `gameStore.mode`.

### Cleanup
#### [DELETE] [useEngine.ts](file:///d:/game/frontend/src/hooks/useEngine.ts)
- Remove the deprecated hook and its direct engine dependencies.

## Verification Plan

### Automated Tests
- No specific automated tests requested for this UI-heavy change, but I will verify that the project still builds.
- Run `npm run build` in the frontend directory (if possible).

### Manual Verification
1. **Start Solo Game**:
   - Go to Lobby.
   - Click "ابدأ Solo".
   - Verify it redirects to `/game/:roomId`.
   - Verify the game loads and shows the investigation environment.
2. **Switch Specialty in Solo**:
   - Click the specialty icon in the taskbar.
   - Verify it cycles through Timeline, Forensics, and Behavioral.
   - Verify the UI updates (e.g., TimelineBoard vs ForensicsWorkbench availability).
3. **Multiplayer consistency**:
   - Verify that multiplayer rooms still function correctly (optional but recommended if environment allows).
