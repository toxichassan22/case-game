# 🧵 Thread Board (String Board) - Mobile Touch Fix

## 🎯 Problem

### Current Issue
On mobile devices:
- Dragging nodes is interrupted/cuts off
- System confuses tap (click) vs drag
- Touch events conflict with node selection
- Poor user experience on phones/tablets

### Root Cause
```typescript
// Current implementation (PROBLEMATIC)
onPointerDown={e => startPointerDrag(e, node.id)}
onClick={e => handleNodeClick(e, node.id)}

// Problem:
// - pointerdown triggers immediately
// - click triggers after pointerup
// - system doesn't know if user wants to drag or click
// - small movements during tap are interpreted as drag start
```

---

## ✅ Solution: Pointer Event with Threshold

### Core Concept
Use pointer events with movement threshold to distinguish between:
- **Tap/Click**: Movement < 8px → Trigger click
- **Drag**: Movement > 8px → Trigger drag operation

---

## 🔧 Implementation

### Step 1: Add Touch State Management

```typescript
// frontend/src/components/StringBoard.tsx

interface TouchState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentNodeId: string | null;
  hasMoved: boolean;
}

const DRAG_THRESHOLD = 8; // pixels - movement before drag starts

function StringBoard() {
  const [touchState, setTouchState] = useState<TouchState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentNodeId: null,
    hasMoved: false,
  });
  
  // ... rest of component
}
```

---

### Step 2: Implement Pointer Down Handler

```typescript
function handlePointerDown(e: React.PointerEvent, nodeId: string) {
  // Capture pointer to ensure we get all events
  e.currentTarget.setPointerCapture(e.pointerId);
  
  setTouchState({
    isDragging: false,
    startX: e.clientX,
    startY: e.clientY,
    currentNodeId: nodeId,
    hasMoved: false,
  });
}
```

---

### Step 3: Implement Pointer Move Handler

```typescript
function handlePointerMove(e: React.PointerEvent) {
  if (!touchState.currentNodeId) return;
  
  const dx = e.clientX - touchState.startX;
  const dy = e.clientY - touchState.startY;
  const distance = Math.hypot(dx, dy);
  
  // Check if movement exceeds threshold
  if (!touchState.hasMoved && distance > DRAG_THRESHOLD) {
    // Start dragging
    setTouchState(prev => ({
      ...prev,
      isDragging: true,
      hasMoved: true,
    }));
    setDraggingNode(touchState.currentNodeId);
  }
  
  // Update node position if dragging
  if (touchState.isDragging) {
    updateNodePosition(touchState.currentNodeId, e.clientX, e.clientY);
  }
}
```

---

### Step 4: Implement Pointer Up Handler

```typescript
function handlePointerUp(e: React.PointerEvent) {
  if (!touchState.currentNodeId) return;
  
  // Release pointer capture
  e.currentTarget.releasePointerCapture(e.pointerId);
  
  // If didn't drag (tap), trigger click
  if (!touchState.hasMoved) {
    handleNodeClick(e as any, touchState.currentNodeId);
  }
  
  // Reset state
  setTouchState({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentNodeId: null,
    hasMoved: false,
  });
  setDraggingNode(null);
}
```

---

### Step 5: Update Node Rendering

```tsx
// In the node rendering loop
{boardNodes.map(node => (
  <div
    key={node.id}
    onPointerDown={e => handlePointerDown(e, node.id)}
    onPointerMove={handlePointerMove}
    onPointerUp={handlePointerUp}
    onDoubleClick={e => handleNodeDoubleClick(e, node.id)}
    style={{
      // ... existing styles
      touchAction: 'none', // Critical! Prevents browser handling
      cursor: toolMode === 'move' ? 'grab' : 'pointer',
    }}
  >
    {/* Node content */}
  </div>
))}
```

**Critical CSS Property:**
```css
.node {
  touch-action: none; /* Disables browser's default touch handling */
  user-select: none;  /* Prevents text selection during drag */
  -webkit-user-select: none;
  -webkit-touch-callout: none; /* Disables iOS callout menu */
}
```

---

## 📱 Mobile-Specific Enhancements

### Option 1: Move Mode Toggle (Recommended for Mobile)

Add a toggle button that switches between:
- **Interact Mode** (default): Taps click nodes, no dragging
- **Move Mode**: All touches drag nodes

```tsx
function MobileControls() {
  const [isMoveMode, setIsMoveMode] = useState(false);
  
  return (
    <div className="mobile-controls">
      <button
        className={`mode-toggle ${isMoveMode ? 'active' : ''}`}
        onClick={() => setIsMoveMode(!isMoveMode)}
      >
        {isMoveMode ? '🔧 وضع التحريك' : '👆 وضع التفاعل'}
      </button>
      
      {isMoveMode && (
        <div className="mode-hint">
          المس واسحب لتحريك العقد
        </div>
      )}
    </div>
  );
}
```

**Update pointer handlers:**
```typescript
function handlePointerMove(e: React.PointerEvent) {
  if (isMoveMode) {
    // Always drag in move mode
    updateNodePosition(touchState.currentNodeId, e.clientX, e.clientY);
    return;
  }
  
  // Normal threshold-based drag
  // ... (previous implementation)
}
```

---

### Option 2: Long Press to Drag

Alternative: Require long press (500ms) before drag starts

```typescript
let longPressTimer: NodeJS.Timeout | null = null;

function handlePointerDown(e: React.PointerEvent, nodeId: string) {
  // Start long press timer
  longPressTimer = setTimeout(() => {
    setTouchState(prev => ({
      ...prev,
      isDragging: true,
    }));
    setDraggingNode(nodeId);
    
    // Haptic feedback (if available)
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, 500); // 500ms long press
  
  setTouchState({
    isDragging: false,
    startX: e.clientX,
    startY: e.clientY,
    currentNodeId: nodeId,
    hasMoved: false,
  });
}

function handlePointerUp(e: React.PointerEvent) {
  // Cancel long press timer
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  
  // ... rest of handler
}
```

---

## 🎨 Visual Feedback

### During Drag
```tsx
// Update node style during drag
style={{
  // ... existing styles
  opacity: touchState.isDragging ? 0.8 : 1,
  transform: touchState.isDragging ? 'scale(1.05)' : 'scale(1)',
  transition: 'transform 0.1s, opacity 0.1s',
  boxShadow: touchState.isDragging 
    ? '0 8px 24px rgba(0,0,0,0.6)' 
    : '0 4px 12px rgba(0,0,0,0.4)',
}}
```

### Drag Indicator
```tsx
// Show visual indicator when dragging starts
{touchState.isDragging && (
  <div className="drag-indicator">
    <Move size={16} />
    <span>جاري التحريك...</span>
  </div>
)}
```

---

## 🧪 Testing Scenarios

### Test 1: Tap vs Drag Detection
```
Given: User on mobile device
When: User taps a node (no movement)
Then: 
  - Click handler fires
  - No drag starts
  - Node opens/interacts normally

When: User touches and moves > 8px
Then:
  - Drag starts
  - Node moves with finger
  - No click fires on release
```

### Test 2: Smooth Dragging
```
Given: User starts dragging a node
When: User moves finger across screen
Then:
  - Node follows finger smoothly
  - No stuttering or interruption
  - Drag continues even if finger moves fast
```

### Test 3: Edge Cases
```
Given: User on mobile device
When: User zooms in/out (pinch)
Then: 
  - Zoom works normally
  - No accidental node movement

When: User scrolls the page
Then:
  - Page scrolls (if not over node)
  - Or node drags (if over node with touch-action: none)

When: User drags node off screen
Then:
  - Node stays within viewport bounds
  - No errors thrown
```

### Test 4: Mode Toggle (If Implemented)
```
Given: User enables "Move Mode"
When: User taps a node
Then: 
  - Node starts dragging immediately
  - No need for threshold

When: User disables "Move Mode"
Then:
  - Returns to tap vs drag detection
```

---

## 📊 Performance Considerations

### Throttle Pointer Move Events
On low-end devices, pointer move can fire too frequently:

```typescript
import { throttle } from 'lodash';

const handlePointerMoveThrottled = throttle((e: React.PointerEvent) => {
  // ... drag logic
}, 16); // ~60 FPS max

// Use throttled version
onPointerMove={handlePointerMoveThrottled}
```

### Use requestAnimationFrame
```typescript
let animationFrameId: number | null = null;

function handlePointerMove(e: React.PointerEvent) {
  if (animationFrameId) return; // Skip if already scheduled
  
  animationFrameId = requestAnimationFrame(() => {
    // Update node position
    updateNodePosition(touchState.currentNodeId, e.clientX, e.clientY);
    animationFrameId = null;
  });
}
```

---

## 🎯 Implementation Checklist

### Core Fix
- [ ] Add touch state management
- [ ] Implement pointer down/move/up handlers
- [ ] Add DRAG_THRESHOLD constant
- [ ] Update node rendering to use pointer events
- [ ] Add `touch-action: none` CSS
- [ ] Test tap vs drag detection

### Mobile Enhancements
- [ ] Add move mode toggle button (mobile only)
- [ ] Add visual feedback during drag
- [ ] Add haptic feedback (if available)
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test on tablet devices

### Performance
- [ ] Add throttling if needed
- [ ] Use requestAnimationFrame for smooth updates
- [ ] Test on low-end devices
- [ ] Optimize re-renders

### Accessibility
- [ ] Ensure keyboard navigation still works
- [ ] Add aria labels for move mode
- [ ] Test with screen readers
- [ ] Provide alternative for motion-sensitive users

---

## 📝 Migration Notes

### Breaking Changes
- None - existing desktop behavior unchanged
- Mobile users get improved experience

### Rollback Plan
If issues arise:
```typescript
// Revert to old behavior
onPointerDown={e => startPointerDrag(e, node.id)}
onClick={e => handleNodeClick(e, node.id)}
// Remove pointer move/up handlers
```

---

## 📚 References

### MDN Documentation
- [Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [touch-action CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)
- [setPointerCapture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture)

### Related Issues
- Thread Board Mobile Interaction (Priority 4 in Master Plan)
- Timeline Board drag-to-reorder (similar touch handling needed)

---

**Last Updated**: 2026-04-09
**Status**: Specification Complete
**Priority**: MEDIUM - Important for mobile UX
**Estimated Effort**: 2-3 hours implementation + testing
