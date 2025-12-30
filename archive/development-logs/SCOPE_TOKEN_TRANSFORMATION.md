# Scope: Token Transformation & Multi-Format Export

**Date:** October 4, 2025
**Status:** 🔍 Research & Planning Phase
**Project:** Figma Design System Distributor Plugin

---

## Initial Request

**User Question:**
> "Is there any way we could inside our plugin and before pushing to git, to use something like style dictionary to push the file on the preferred language of the user?"

**User Concerns:**
1. Is this feasible?
2. What problems may it create in our current workflow?
3. Are there lighter alternatives to Style Dictionary?
4. Would GitHub Actions create extra setup burden for users?
5. Can Actions be created directly from the plugin?

---

## Feasibility Analysis

### ✅ YES - This is Feasible

**Three Possible Approaches:**

1. **In-Plugin Transformation** (Browser environment)
   - Transform tokens before pushing to GitHub
   - User selects output formats via UI
   - All formats pushed in single commit

2. **GitHub Actions** (Automated CI/CD)
   - Push raw tokens (current workflow)
   - Actions automatically transform on push
   - Generated files committed back to repo

3. **Hybrid Approach**
   - Offer both options to user
   - Quick export OR automated pipeline

---

## Current Workflow

```
Figma Plugin
    ↓
Generate Tokens (JSON)
    ↓
Push to GitHub
    ├── tokens/raw/colors.json
    └── tokens/processed/colors.json
```

**Files Created:**
- Raw tokens: `tokens/raw/` (original W3C format)
- Processed tokens: `tokens/processed/` (flattened)

---

## Proposed Workflow Options

### Option A: In-Plugin Transformation

```
Figma Plugin
    ↓
Generate Tokens (JSON)
    ↓
Transform Locally (in plugin)
    ├── CSS Variables
    ├── SCSS Variables
    ├── JavaScript/TypeScript
    ├── iOS Swift
    ├── Android XML
    └── JSON (original)
    ↓
Push ALL formats to GitHub
    └── tokens/dist/[all formats]
```

### Option B: GitHub Actions (Automated)

```
Figma Plugin
    ↓
Generate Tokens (JSON)
    ↓
Push to GitHub
    └── tokens/raw/colors.json
    ↓
GitHub Action Triggered (automatic)
    ↓
Style Dictionary Runs
    ↓
Commits Generated Files
    └── tokens/dist/
        ├── colors.css
        ├── colors.scss
        ├── colors.js
        ├── colors.swift
        └── colors.xml
```

---

## Problems with Current Workflow

### 1. **Plugin Environment Limitations**
- **Issue:** Figma plugins run in sandboxed browser (no Node.js)
- **Impact:** Style Dictionary expects Node.js fs module
- **Solution:** Use browser-compatible library OR GitHub Actions

### 2. **Performance Impact**
- **Issue:** Running transformations in plugin = slower exports
- **Impact:** User waits longer for export to complete
- **Solution:** GitHub Actions moves processing to cloud

### 3. **File Structure Changes**
- **Current:** 2 files (raw + processed)
- **With Transforms:** 10+ files (multiple formats)
- **Impact:** More complex repository structure
- **Solution:** Organize in `tokens/dist/` folder

### 4. **User Configuration Complexity**
- **Issue:** Need to specify: platforms, formats, transforms
- **Impact:** Steeper learning curve
- **Solution:** Sensible defaults with optional customization

### 5. **Dependency Size**
- **Issue:** Style Dictionary bundle ~200KB
- **Impact:** Larger plugin size, slower load
- **Solution:** Use lighter library OR GitHub Actions

### 6. **Git History Noise**
- **Current:** 1 commit, 2 files
- **With Transforms:** 1 commit, 10+ files
- **Impact:** Cluttered git history
- **Solution:** Separate commits via Actions

---

## Alternative Libraries (Lighter than Style Dictionary)

### Research Questions:
1. What are browser-compatible token transformation libraries?
2. What are the smallest/lightest options?
3. Which support multiple output formats?
4. Which are actively maintained?

### Candidates to Research:
- **theo** (Salesforce) - ~50KB, simpler than Style Dictionary
- **token-transformer** - Figma-specific, very lightweight
- **design-tokens-transformer** - Modern, ESM-compatible
- **custom lightweight transformer** - Build our own (minimal formats)

**Need to investigate:**
- Bundle size
- Browser compatibility
- Output format support
- Maintenance status
- Ease of integration

---

## GitHub Actions Integration

### User Concerns:
> "wouldn't that create an extra step for the user to A) set up the git repo + b) set the actions + c) push from figma?"

**Current User Flow:**
1. Set up GitHub token ✓ (already required)
2. Set up repository ✓ (already required)
3. Export from Figma ✓ (already implemented)

**With GitHub Actions Added:**
1. Set up GitHub token ✓ (no change)
2. Set up repository ✓ (no change)
3. **NEW:** Configure Actions workflow
4. Export from Figma ✓ (no change)

### Can Actions Be Created from Plugin?

**Question:** Can the plugin automatically create/push GitHub Actions workflow files?

**Answer:** YES! ✅

**How it would work:**
```
Plugin Setup Flow:
1. User validates GitHub token + repo (already exists)
2. Plugin detects if .github/workflows/ exists
3. If not, plugin asks: "Enable automatic token transformation?"
4. If yes, plugin creates and pushes:
   ├── .github/workflows/transform-tokens.yml
   └── style-dictionary.config.js (or similar)
5. User doesn't need to touch GitHub Actions directly
```

**Implementation:**
- Plugin pushes workflow file via GitHub API
- One-time setup during initial configuration
- Transparent to user (optional feature)

### Pros of GitHub Actions Approach:
- ✅ No plugin performance impact
- ✅ Automatic transformations on every push
- ✅ Can be set up automatically by plugin
- ✅ Runs in Node.js (full library support)
- ✅ User gets CDN-ready files
- ✅ Separates concerns (export vs transform)

### Cons of GitHub Actions Approach:
- ❌ Requires understanding of generated files
- ❌ Slightly more complex git history
- ❌ Requires GitHub Actions enabled (free on public repos)
- ❌ Extra commit after plugin push (may confuse users)

---

## Proposed Solution: Hybrid Approach

### Phase 1: Add Format Selection UI
Add to Export Options tab:

```
📦 Export Formats
  ☑ JSON (Raw & Processed) [default]
  ☐ CSS Variables
  ☐ SCSS Variables
  ☐ JavaScript/TypeScript
  ☐ iOS Swift
  ☐ Android XML

[?] Learn about format options
```

### Phase 2: Choose Transformation Method

**Option 1: Lightweight In-Plugin Transform**
- Use minimal library (theo or custom)
- Support most common formats (CSS, SCSS, JS)
- Transform before push
- User gets immediate results

**Option 2: GitHub Actions (Automated)**
- One-time setup via plugin
- Plugin creates workflow file
- Full Style Dictionary power
- User gets all formats automatically

**Option 3: Let User Choose**
```
🔧 Transformation Method
  ○ Quick Export (transform in plugin)
     - Faster setup
     - Limited formats (CSS, SCSS, JS)

  ○ Automated Pipeline (GitHub Actions)
     - One-time setup
     - All formats available
     - Automatic on every export
```

---

## Next Steps

### Research Tasks:
1. ✅ Document scope and user concerns
2. ⏳ Research lightweight token transformation libraries
3. ⏳ Compare bundle sizes and capabilities
4. ⏳ Test browser compatibility of candidates
5. ⏳ Prototype GitHub Actions workflow creation
6. ⏳ Design UI for format selection
7. ⏳ Evaluate both approaches with POC

### Questions to Answer:
- What's the smallest viable transformation library?
- Can we build custom transforms for 3-5 core formats?
- How complex is GitHub Actions workflow creation via API?
- What's the UX for choosing transformation method?
- Should we support both approaches or pick one?

### Decision Points:
- **Bundle Size Threshold:** Max acceptable KB for in-plugin approach
- **Format Priority:** Which formats are most requested?
- **User Complexity:** How much configuration is acceptable?
- **Performance Budget:** Max acceptable export delay

---

## Success Criteria

### User Experience Goals:
- ✅ No breaking changes to existing JSON workflow
- ✅ Format selection is intuitive and optional
- ✅ Setup is automatic or minimal
- ✅ Export remains fast (<2 seconds for in-plugin)
- ✅ Generated files are production-ready

### Technical Goals:
- ✅ Bundle size increase <100KB (if in-plugin)
- ✅ Support 3-5 core formats minimum
- ✅ Maintain existing GitHub integration
- ✅ Pass all current validation tests
- ✅ Work with existing repository structure

---

## Risk Assessment

### Low Risk:
- Adding format selection UI
- GitHub Actions workflow creation
- JSON export remains unchanged

### Medium Risk:
- Bundle size impact (in-plugin approach)
- Repository structure changes
- Git history complexity

### High Risk:
- User confusion with multiple files
- Performance degradation
- Breaking existing workflows

---

## Open Questions

1. **Library Selection:**
   - What are the actual bundle sizes of theo, token-transformer, etc.?
   - Which have best browser compatibility?
   - Which are actively maintained?

2. **GitHub Actions:**
   - Can plugin create workflow files via API?
   - What permissions are needed?
   - How to handle workflow file updates?

3. **User Experience:**
   - Should transformation be opt-in or default?
   - How to explain generated files to users?
   - What if user wants to customize transforms?

4. **Format Support:**
   - Which formats are most important?
   - Should we support all Style Dictionary formats?
   - Custom format support?

---

**Status:** Awaiting research on lightweight libraries and GitHub Actions integration feasibility.

**Next Action:** Research and compare token transformation libraries for browser compatibility and bundle size.
