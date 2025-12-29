# Comprehensive Error Handling System

## Overview

This document describes the comprehensive error handling system implemented in the Figma Design System Distributor plugin. The system provides users with clear, actionable error messages and guides them through resolution steps.

## Problem Solved

**Before:** Users encountered generic error messages like "Push failed" with no information about what went wrong or how to fix it.

**After:** Users receive detailed error dialogs with:
- Clear explanation of what happened
- Step-by-step solutions
- Context-specific help
- Option to retry or use fallback methods
- Links to relevant documentation

## Architecture

### Components

#### 1. Error Types System (`src/errors/ErrorTypes.ts`)

Defines a comprehensive taxonomy of errors with detailed metadata:

**Error Categories:**
- Authentication (token invalid, expired, missing)
- Authorization (permissions, access denied)
- Network (connection failed, timeout, offline)
- Repository (not found, invalid name, branch issues)
- Git Operations (create branch, push, PR creation)
- Configuration (invalid, missing)
- Rate Limits
- Unknown

**Error Codes:**
Each error type has a unique code (e.g., `AUTH_TOKEN_INVALID`, `REPO_NOT_FOUND`) for tracking and debugging.

**Error Metadata:**
```typescript
interface ErrorMetadata {
  category: ErrorCategory;
  severity: ErrorSeverity;
  code: ErrorCode;
  title: string;
  userMessage: string;
  technicalMessage: string;
  solutions: ErrorSolution[];
  learnMoreUrl?: string;
  retryable: boolean;
  fallbackAvailable: boolean;
}
```

#### 2. Error Handler (`src/errors/ErrorHandler.ts`)

Central error handling utility with these capabilities:

- **`handle()`** - Full error handling with dialog
- **`handleWithRetry()`** - Automatic retry logic with exponential backoff
- **`notify()`** - Quick error notification (no dialog)
- **`createErrorLog()`** - Structured logging for debugging

**Usage Example:**
```typescript
import { ErrorHandler } from '../errors/ErrorHandler';

try {
  await someGitHubOperation();
} catch (error) {
  const result = await ErrorHandler.handle({
    error,
    context: 'GitHub Push Operation',
    showDialog: true,
    showTechnicalDetails: true,
    onRetry: async () => {
      // Retry logic
    },
    onFallback: async () => {
      // Fallback to download
    }
  });
}
```

#### 3. Error Dialog UI (`src/ui/ErrorDialog.ts`)

User-friendly error dialog component featuring:

- **Visual hierarchy** - Color-coded severity (Critical/High/Medium/Low)
- **Clear messaging** - User-friendly explanations
- **Step-by-step solutions** - Numbered action items
- **Technical details** - Collapsible section for debugging
- **Action buttons** - Retry, fallback, learn more, close

**UI Features:**
- Responsive design
- Professional styling
- Severity indicators (emojis + colors)
- Error code display for support
- External link support for documentation

## Error Classification

### Automatic Detection

The `classifyError()` function automatically detects error types based on:

1. **HTTP Status Codes**
   - 401 → Authentication error
   - 403 → Authorization error
   - 404 → Not found (repo, branch, or file)
   - 429 → Rate limit exceeded

2. **Error Message Keywords**
   - "bad credentials" → `AUTH_BAD_CREDENTIALS`
   - "token invalid" → `AUTH_TOKEN_INVALID`
   - "permission" → `AUTHZ_INSUFFICIENT_PERMISSIONS`
   - "failed to get ref" → `GIT_REF_NOT_FOUND`
   - etc.

3. **Context Information**
   - Operation being performed
   - Previous errors in chain
   - Network conditions

### Example Classifications

| Original Error | Detected Code | User-Facing Message |
|---|---|---|
| `HTTP 401: Bad credentials` | `AUTH_BAD_CREDENTIALS` | "Your GitHub Personal Access Token is invalid or has been revoked." |
| `Failed to get ref heads/main` | `GIT_REF_NOT_FOUND` | "Could not find the specified branch or ref in the repository." |
| `Repository not found` | `REPO_NOT_FOUND` | "The specified GitHub repository could not be found." |
| `HTTP 403: Forbidden` | `AUTHZ_INSUFFICIENT_PERMISSIONS` | "Your GitHub token doesn't have the required permissions for this operation." |

## Solutions and Resolution Steps

Each error includes specific, actionable solution steps. For example:

### AUTH_BAD_CREDENTIALS

**Solutions:**
1. **Verify your token is correct**
   - Check that you copied the entire token without extra spaces
2. **Check if the token was revoked**
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Check token status
3. **Generate a new token if needed**
   - Create a new token with "repo" permissions and update your configuration

**Learn More:** https://docs.github.com/en/rest/overview/troubleshooting

### GIT_REF_NOT_FOUND

**Solutions:**
1. **Verify the branch name is correct**
   - Check for typos and ensure the branch exists
2. **Check your GitHub token permissions**
   - Your token must have access to read repository refs
3. **Try using "main" or "master" as the base branch**

## Integration Points

### ExportWorkflow

The main workflow has been updated to use the error handler:

```typescript
try {
  // Git operations
} catch (error) {
  const errorResult = await ErrorHandler.handle({
    error,
    context: 'GitHub PR Workflow',
    showDialog: true,
    showTechnicalDetails: true,
    onFallback: async () => {
      await this.handleDownload(extractionResult);
    }
  });

  if (errorResult.dialogResult?.action === 'fallback') {
    return await this.handleDownload(extractionResult);
  }
}
```

### Future Integrations

Other services can adopt the same pattern:

- **GitOperations** - Wrap API calls with error handling
- **PullRequestService** - Add context-specific error info
- **TokenPushService** - Provide file-specific error details

## Error Severity Levels

| Severity | Icon | Color | Meaning | Examples |
|---|---|---|---|---|
| **Critical** | 🚨 | Red | Blocks all operations | Invalid token, no internet |
| **High** | ⚠️ | Orange | Blocks current operation | Repo not found, access denied |
| **Medium** | ⚡ | Yellow | Degrades functionality | Timeout, protected branch |
| **Low** | ℹ️ | Gray | Minor issue | File not found (will be created) |

## User Experience Flow

### Before (Old System)

```
User: [Tries to push to GitHub]
System: "❌ Push failed"
User: "What? Why? What do I do now?"
```

### After (New System)

```
User: [Tries to push to GitHub]
System: [Shows detailed error dialog]

Title: "Invalid GitHub Token"
Code: AUTH_TOKEN_INVALID
Category: Authentication
Severity: Critical

What happened?
Your GitHub Personal Access Token is invalid or has been revoked.

How to fix this:
1. Generate a new Personal Access Token
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Ensure the token has required permissions
   - Enable: repo (Full control of private repositories)
3. Copy the new token and update your configuration
   - Re-run the GitHub setup in the plugin and paste your new token

[Try Again] [Download Locally] [Learn More]

Technical Details ▼
GitHub API returned 401 Unauthorized with "Bad credentials" message.
Context: GitHub PR Workflow
Original: Error: Bad credentials
```

## Retry Logic

The `handleWithRetry()` method provides automatic retry with exponential backoff:

```typescript
const result = await ErrorHandler.handleWithRetry(
  async () => await githubOperation(),
  {
    maxRetries: 3,
    context: 'Push to GitHub',
    showDialog: true,
    onFallback: async () => {
      await downloadLocally();
    }
  }
);

if (!result.success) {
  // Operation failed after retries
  console.error('Failed:', result.error);
}
```

**Backoff Schedule:**
- Attempt 1: Immediate
- Attempt 2: Wait 1s
- Attempt 3: Wait 2s
- Attempt 4+: Wait 4s (max)

## Logging and Debugging

### Console Logging

Errors are logged with structured formatting:

```
🚨 Invalid GitHub Token [AUTH_TOKEN_INVALID]
  Category: authentication
  Severity: critical
  User Message: Your GitHub Personal Access Token is invalid or has been revoked.
  Technical Message: GitHub API returned 401 Unauthorized with "Bad credentials" message.
                     (Context: GitHub PR Workflow)
                     Original: Error: Bad credentials

  Solutions:
    1. Generate a new Personal Access Token
       Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
    2. Ensure the token has required permissions
       Enable: repo (Full control of private repositories)
    3. Copy the new token and update your configuration
       Re-run the GitHub setup in the plugin and paste your new token

  Original Error: Error: Bad credentials
      at GitHubClient.makeAPICall (GitHubClient.ts:177)
      at async GitOperations.pushToBranch (GitOperations.ts:453)
      ...
```

### Error Logs

Use `ErrorHandler.createErrorLog()` to generate structured JSON logs:

```typescript
const logJson = ErrorHandler.createErrorLog(error, 'GitHub Push');
// Can be sent to error tracking service or saved for debugging
```

## Fallback Options

Most critical errors offer a fallback option to download tokens locally:

- **Network errors** → Download offline
- **Authentication errors** → Download to fix config later
- **Repository errors** → Download for manual upload
- **Git operation failures** → Download as backup

## Extensibility

### Adding New Error Types

1. **Add Error Code:**
```typescript
export enum ErrorCode {
  // ... existing codes
  YOUR_NEW_ERROR = 'YOUR_NEW_ERROR',
}
```

2. **Add to Registry:**
```typescript
export const ERROR_REGISTRY: Record<ErrorCode, ErrorMetadata> = {
  // ... existing errors
  [ErrorCode.YOUR_NEW_ERROR]: {
    category: ErrorCategory.YOUR_CATEGORY,
    severity: ErrorSeverity.HIGH,
    title: 'Your Error Title',
    userMessage: 'What users see',
    technicalMessage: 'Technical details',
    solutions: [
      { step: 1, action: 'First step', details: 'Details...' },
      { step: 2, action: 'Second step' }
    ],
    retryable: true,
    fallbackAvailable: true
  }
};
```

3. **Update Classification Logic:**
```typescript
export function classifyError(error: unknown, context?: string): ErrorMetadata {
  // Add detection logic
  if (message.includes('your error pattern')) {
    code = ErrorCode.YOUR_NEW_ERROR;
  }
  // ...
}
```

## Testing

### Manual Testing

Test error scenarios:

1. **Invalid Token:**
   - Use an invalid GitHub token
   - Expected: `AUTH_TOKEN_INVALID` error

2. **Repository Not Found:**
   - Use a non-existent repository name
   - Expected: `REPO_NOT_FOUND` error

3. **Network Issues:**
   - Disconnect internet
   - Expected: `NET_OFFLINE` error

4. **Branch Not Found:**
   - Push to non-existent branch
   - Expected: `REPO_BRANCH_NOT_FOUND` error

### Error Dialog Preview

To preview error dialogs during development:

```typescript
import { ErrorDialog } from './ui/ErrorDialog';
import { ERROR_REGISTRY, ErrorCode } from './errors/ErrorTypes';

// Show specific error
const errorMetadata = {
  ...ERROR_REGISTRY[ErrorCode.AUTH_TOKEN_INVALID],
  code: ErrorCode.AUTH_TOKEN_INVALID
};

const dialog = new ErrorDialog({
  error: errorMetadata,
  showTechnicalDetails: true
});

await dialog.show();
```

## Best Practices

### For Developers

1. **Always use ErrorHandler** instead of raw try-catch with figma.notify()
2. **Provide context** - Add meaningful context strings to error handling
3. **Enable technical details** in development mode
4. **Test error paths** - Simulate errors during development
5. **Update error registry** when adding new operations

### For Error Messages

1. **Be specific** - "Invalid token" not "Error"
2. **Be actionable** - Tell users what to do, not just what happened
3. **Be empathetic** - Use friendly, supportive language
4. **Be concise** - Keep messages short and scannable
5. **Provide links** - Link to relevant documentation

### For Solutions

1. **Number steps clearly** - Make it easy to follow
2. **Add details** - Explain where to find settings, what permissions to enable
3. **Be complete** - Don't assume user knowledge
4. **Test solutions** - Verify steps actually work
5. **Update regularly** - Keep aligned with GitHub's UI changes

## Related Files

- `src/errors/ErrorTypes.ts` - Error type definitions
- `src/errors/ErrorHandler.ts` - Error handling logic
- `src/ui/ErrorDialog.ts` - Error dialog UI component
- `src/workflow/ExportWorkflow.ts` - Integration example
- `docs/ERROR_HANDLING.md` - This documentation

## Future Improvements

1. **Error Analytics** - Track common errors to prioritize fixes
2. **Internationalization** - Multi-language error messages
3. **Error Recovery** - More automatic retry strategies
4. **Context Preservation** - Save user progress before showing error
5. **Guided Fixes** - Interactive walkthroughs for complex fixes
6. **Error Prediction** - Validate before attempting operations
7. **Telemetry** - Optional error reporting for product improvements

---

## Summary

The comprehensive error handling system transforms generic failures into actionable user experiences. Users now understand what went wrong, why it happened, and exactly how to fix it—dramatically improving the plugin's reliability and user satisfaction.
