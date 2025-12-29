# Error Dialog Testing Guide

## Overview
Test buttons have been added to the main export screen to allow easy testing of all error dialog types without needing to trigger actual errors.

## Location
The test buttons appear on the **Export Options** tab, below the main "Push to GitHub" and "Download JSON File" options.

## Available Test Buttons

### 🔑 Invalid Token
**Error Code**: `AUTH_TOKEN_INVALID`
- **Category**: Authentication
- **Severity**: Critical
- **Tests**: Invalid GitHub Personal Access Token scenario
- **Solutions Shown**:
  - Generate new token
  - Ensure correct permissions
  - Update configuration

### ⏰ Token Expired
**Error Code**: `AUTH_TOKEN_EXPIRED`
- **Category**: Authentication
- **Severity**: Critical
- **Tests**: Expired GitHub token scenario
- **Solutions Shown**:
  - Generate new token with expiration date
  - Update plugin configuration

### 📁 Repo Not Found
**Error Code**: `REPO_NOT_FOUND`
- **Category**: Repository
- **Severity**: High
- **Tests**: Repository doesn't exist or isn't accessible
- **Solutions Shown**:
  - Verify repository name format
  - Check repository exists
  - Ensure proper access permissions

### 🔒 Branch Protected
**Error Code**: `AUTHZ_BRANCH_PROTECTED`
- **Category**: Authorization
- **Severity**: High
- **Tests**: Attempt to push to protected branch
- **Solutions Shown**:
  - Create pull request instead
  - Modify branch protection rules

### 🚫 No Permissions
**Error Code**: `AUTHZ_INSUFFICIENT_PERMISSIONS`
- **Category**: Authorization
- **Severity**: High
- **Tests**: Token lacks required permissions
- **Solutions Shown**:
  - Check token permissions
  - Regenerate token with correct scopes
  - Update plugin configuration

### 🌐 Network Error
**Error Code**: `NET_CONNECTION_FAILED`
- **Category**: Network
- **Severity**: High
- **Tests**: Connection failure to GitHub
- **Solutions Shown**:
  - Check internet connection
  - Verify GitHub status
  - Try again

### ⏸️ Rate Limited
**Error Code**: `RATE_LIMIT_EXCEEDED`
- **Category**: Rate Limit
- **Severity**: Medium
- **Tests**: GitHub API rate limit exceeded
- **Solutions Shown**:
  - Wait for rate limit reset
  - Check rate limit status
  - Consider using GitHub App

### ⚠️ Push Failed
**Error Code**: `GIT_PUSH_FAILED`
- **Category**: Git Operation
- **Severity**: High
- **Tests**: Git push operation failure
- **Solutions Shown**:
  - Check if branch is protected
  - Verify write permissions
  - Try creating PR instead

## Error Dialog Features

Each error dialog displays:

1. **Header Section**
   - Color-coded severity icon
   - Error title
   - Error code badge
   - Category badge
   - Severity level badge

2. **Content Section**
   - User-friendly explanation ("What happened?")
   - Clear, actionable message

3. **Solutions Section**
   - Numbered step-by-step solutions
   - Each step includes:
     - Action to take
     - Additional details/context

4. **Technical Details** (Collapsible)
   - Technical error message
   - Original error information
   - Useful for debugging

5. **Action Buttons**
   - **Try Again** (if retryable)
   - **Download Locally** (if fallback available)
   - **Learn More** (if documentation URL provided)
   - **Close** (always available)

## Testing Workflow

1. **Open Plugin**: Run the Figma Design System Distributor plugin
2. **Navigate to Export Tab**: Ensure you're on the "Export Options" tab
3. **Scroll Down**: Find the "🧪 Test Error Dialogs" section
4. **Click Any Button**: Choose the error scenario you want to test
5. **Review Error Dialog**: Examine the error display, messages, and solutions
6. **Test Actions**:
   - Click "Try Again" to see retry behavior
   - Click "Download Locally" to see fallback behavior
   - Click "Learn More" to test documentation links (opens in new tab)
   - Click "Close" to return to main UI

## Implementation Details

### Button Styling
- Uniform styling with theme colors
- Hover effects with subtle animation
- Active state feedback
- Icons for visual categorization

### Error Display
- All errors use the standardized `ErrorDialog` component
- Consistent 640x800 window size
- Full theme integration
- Technical details available for debugging

### Action Handling
Test mode provides simulated actions:
- **Retry**: Shows notification and returns to main UI
- **Fallback**: Shows notification about local download
- **Learn More**: Opens documentation (when available)
- **Close**: Returns to main export UI

## User Experience Benefits

✅ **Easy Testing**: Test all error scenarios without triggering real errors
✅ **Visual Consistency**: See how errors are displayed to users
✅ **Solution Validation**: Verify all solutions are clear and actionable
✅ **Design Review**: Check error dialog styling and layout
✅ **Documentation Check**: Ensure all "Learn More" links work correctly

## Developer Notes

The test buttons are implemented in:
- **UI**: `src/ui/UnifiedExportUI.ts` (lines 894-948)
- **Handler**: `handleTestError()` method (lines 2169-2236)
- **Error Registry**: `src/errors/ErrorTypes.ts`
- **Error Dialog**: `src/ui/ErrorDialog.ts`

To add new test errors:
1. Add button to the HTML grid in `UnifiedExportUI.ts`
2. Add corresponding entry to `errorCodeMap` in `handleTestError()`
3. Ensure error is defined in `ERROR_REGISTRY`

---

**Last Updated**: 2025-10-31
**Version**: 1.0.0
