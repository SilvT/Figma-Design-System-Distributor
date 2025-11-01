# Performance Optimization Plan

## Current Issues

### 1. Heavy Startup Load
**Problem**: The plugin runs full token extraction immediately on startup:
- Step 1: Validate environment
- Step 2: Test API access
- Step 3: Gather document info
- Step 4: Count tokens
- Step 5: **Extract ALL tokens** (heavy operation)
- Step 6: Format JSON
- Step 7: Show workflow UI

**Impact**:
- Slow initial load (several seconds)
- Poor user experience
- Unnecessary work if user just wants to configure settings

### 2. Large Bundle Size
- **Current**: 267KB main.js (3649 lines)
- Heavy modules loaded upfront:
  - `ExportWorkflow` (now lazy-loaded ✅)
  - `TokenExtractor` (loaded immediately)
  - `TokenTransformer` (loaded immediately)

### 3. Error Dialog Issues
Some error test buttons not working - likely due to async loading issues in the test handler.

## Optimization Strategy

### Phase 1: Defer Token Extraction (HIGH PRIORITY)
**Goal**: Show UI immediately, extract tokens only when needed

**Changes Needed**:
1. Modify `main()` to show UI immediately
2. Move token extraction to happen when user clicks "Push to GitHub" or "Download JSON"
3. Keep only lightweight validation on startup

**Before**:
```typescript
async function main() {
  // Validate (fast)
  // Count tokens (medium)
  // Extract ALL tokens (SLOW) ❌
  // Show UI
}
```

**After**:
```typescript
async function main() {
  // Validate (fast)
  // Show UI immediately ✅
  // Extract tokens only when user requests export
}
```

### Phase 2: Code Splitting
**Goal**: Reduce initial bundle size

**Modules to Lazy Load**:
- ✅ `ExportWorkflow` (done)
- ⏳ `TokenTransformer` (when creating JSON)
- ⏳ `GitHubClient` modules (when pushing to GitHub)
- ⏳ `ErrorDialog` (when showing errors)

### Phase 3: Optimize Token Extraction
**Goal**: Make extraction faster when it does run

**Potential Optimizations**:
1. Skip hidden layers by default
2. Limit traversal depth
3. Use worker threads for heavy processing (if supported)
4. Cache extracted tokens for session

### Phase 4: UI Optimization
**Goal**: Faster UI rendering

**Changes**:
1. Simplify initial HTML
2. Defer loading of test error buttons
3. Use CSS transitions instead of animations
4. Minimize inline styles

## Implementation Priority

### Immediate (This Session)
1. ✅ Lazy load `ExportWorkflow`
2. ⏳ Move token extraction to be on-demand
3. ⏳ Fix error test button issues

### Short Term (Next Session)
1. Lazy load `TokenTransformer`
2. Lazy load GitHub modules
3. Add loading indicators for heavy operations

### Long Term (Future)
1. Implement token caching
2. Add incremental extraction option
3. Optimize TokenExtractor algorithm
4. Consider using Web Workers

## Expected Improvements

### Startup Time
- **Before**: 5-10 seconds (extracting all tokens)
- **After**: <1 second (just show UI)

### Bundle Size
- **Before**: 267KB
- **Target**: <150KB with code splitting

### User Experience
- ✅ Immediate UI response
- ✅ Progress indicators during extraction
- ✅ Can configure settings without extraction
- ✅ Only extracts when actually exporting

## Testing Checklist

After optimization:
- [ ] Plugin UI appears within 1 second
- [ ] No extraction happens until export button clicked
- [ ] Error test buttons all work
- [ ] GitHub push works correctly
- [ ] Download JSON works correctly
- [ ] No console errors
- [ ] Build size reduced

---

**Status**: In Progress
**Started**: 2025-10-31
**Target Completion**: 2025-10-31
