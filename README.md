# Figma Design System Distributor

A comprehensive Figma plugin for extracting design tokens from Figma documents and distributing them to development teams.

## Features

- **Comprehensive Token Extraction**: Colors, typography, spacing, effects, and Figma variables
- **GitHub Integration**: Direct push to repositories with automated commits
- **Export Choice Interface**: Users can choose between GitHub push or local download
- **Multiple Export Formats**: JSON, CSS custom properties, SCSS variables, Tokens Studio
- **Figma Variables Support**: Full variable collections, modes, and semantic relationships
- **Component Token Discovery**: Extract tokens from both local styles and component instances
- **Real-time Progress Tracking**: Live feedback during extraction process
- **Error Handling**: Robust error management with detailed reporting

## Current Status

**Version**: 1.0.0 (Production Ready - GitHub Integration Complete)

✅ **Fully Functional** - The plugin provides complete design token extraction with robust GitHub integration:

1. **Token Extraction**: Full extraction of colors, typography, spacing, effects, and variables
2. **Export Choice Interface**: Users select between GitHub push or local download
3. **GitHub Integration**: ✅ **Production Ready** - Direct push to repositories with automated commits
4. **JSON Export**: Structured token data with metadata
5. **Progress Tracking**: Real-time feedback during extraction and push operations
6. **Environment Compatibility**: ✅ **Figma Plugin Ready** - Custom implementations for restricted Figma environment

### 🎯 **Key Achievement: Environment Compatibility**

The plugin now works seamlessly in Figma's restricted plugin environment with custom implementations:
- ✅ **Custom Base64 Encoding** (replaces unavailable `btoa`/`Buffer`)
- ✅ **Custom UTF-8 Calculation** (replaces unavailable `TextEncoder`)
- ✅ **Arrow Function Methods** (prevents context binding issues)
- ✅ **Comprehensive Error Handling** with fallback strategies

## GitHub Integration

### 🚀 **Overview**

The plugin integrates directly with GitHub to push design tokens to repositories, enabling automated design-to-code workflows.

### 🔧 **Setup**

#### 1. **Generate GitHub Personal Access Token**
1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/personal-access-tokens/new)
2. Create a new token with `repo` scope
3. Copy the token (starts with `ghp_`)

#### 2. **Configure Repository**
- Target repository: `your-org/design-tokens`
- Target directory: `tokens/raw/`
- Supported branches: `main`, `master`, or custom branch

#### 3. **Plugin Configuration**
The plugin can be configured in two ways:

**Option A: Interactive Setup (Recommended)**
- Plugin guides you through GitHub setup
- Secure credential storage within Figma
- Connection validation before first use

**Option B: Hard-coded Testing**
- For development/testing purposes
- Credentials embedded in code temporarily
- See `HARD_CODED_TESTING.md` for details

### 🎯 **User Experience**

After token extraction, users see a choice interface:

```
🎉 Tokens Extracted Successfully!
Choose how you'd like to export your design tokens

┌─────────────────────────────────┐
│  45 Total Tokens    12.3 KB     │
└─────────────────────────────────┘

🚀 Push to GitHub                Ready
Push tokens directly to your repository
📁 your-org/design-tokens → tokens/raw/

💾 Download JSON File    Always Available
Download tokens as JSON for manual processing

             [Cancel]
```

### 📁 **Repository Structure**

The plugin creates files in this structure:

```
your-repository/
├── tokens/
│   └── raw/
│       ├── figma-tokens-2024-09-23T10-30-00.json
│       ├── figma-tokens-2024-09-23T14-15-30.json
│       └── figma-tokens-latest.json
```

### 📄 **File Format**

Generated JSON files include:

```json
{
  "metadata": {
    "exportTimestamp": "2024-09-23T10:30:00.000Z",
    "sourceDocument": {
      "name": "Design System - Main",
      "id": "abc123"
    },
    "tokenCounts": {
      "totalTokens": 45,
      "totalVariables": 12,
      "totalCollections": 3
    }
  },
  "variables": [...],
  "collections": [...],
  "designTokens": [...]
}
```

### 💬 **Commit Messages**

Automated commits include extraction metadata:

```
feat: update design tokens from Figma

- 45 design tokens
- 12 variables
- 3 collections
- Exported: 2024-09-23
- Source: Design System - Main

🤖 Generated with Figma Design System Distributor
```

### 🔒 **Security**

- **Encrypted Storage**: Tokens stored securely within Figma
- **Minimal Permissions**: Only requires `repo` scope
- **Connection Validation**: Verifies access before operations
- **Error Handling**: Secure error messages without token exposure

### 🛠️ **Troubleshooting**

**Common Issues:**

| Issue | Solution |
|-------|----------|
| "Setup Required" | Configure GitHub credentials in plugin |
| "Repository not found" | Check repository name and access permissions |
| "Insufficient permissions" | Ensure token has `repo` scope |
| "Connection failed" | Verify internet connection and GitHub status |

**Debug Mode:**
- Open Figma Developer Console
- Look for detailed GitHub API logs
- Check authentication and repository validation steps

### 📚 **Documentation**

For detailed implementation guides:
- `GITHUB_INTEGRATION.md` - Complete integration documentation
- `GIT_OPERATIONS.md` - Git operations implementation details
- `EXPORT_CHOICE_INTEGRATION.md` - UI integration guide
- `HARD_CODED_TESTING.md` - Testing configuration guide

## Architecture

The plugin features a modular architecture designed for scalability:

### Core Components

- **Main Workflow** (`src/main.ts`): Primary plugin execution with export choice integration
- **Token Extractor** (`src/TokenExtractor.ts`): Comprehensive extraction engine for all token types
- **Export Workflow** (`src/workflow/ExportWorkflow.ts`): Manages user choice and execution flow

### GitHub Integration

- **GitHub Client** (`src/github/GitHubClient.ts`): Core GitHub API client with authentication
- **Git Operations** (`src/github/GitOperations.ts`): Repository validation and file operations
- **GitHub Auth** (`src/github/GitHubAuth.ts`): Authentication and credential management
- **Token Push Service** (`src/github/TokenPushService.ts`): High-level push workflow orchestration

### User Interface

- **Export Choice UI** (`src/ui/ExportChoiceUI.ts`): Beautiful choice interface for export options
- **Progress Feedback** (`src/github/TokenPushService.ts`): Real-time progress indicators

### Storage & Security

- **Secure Storage** (`src/storage/SecureStorage.ts`): Encrypted credential storage within Figma
- **Configuration Types** (`src/types/CommonTypes.ts`): Shared type definitions

### File Structure

```
src/
├── main.ts                     # Main plugin workflow
├── TokenExtractor.ts           # Token extraction engine
├── workflow/
│   └── ExportWorkflow.ts       # Complete export management
├── github/                     # GitHub integration
│   ├── GitHubClient.ts         # API client
│   ├── GitHubAuth.ts           # Authentication
│   ├── GitOperations.ts        # File operations
│   ├── TokenPushService.ts     # Push orchestration
│   └── GitHubTypes.ts          # Type definitions
├── ui/
│   └── ExportChoiceUI.ts       # Export choice interface
├── storage/
│   └── SecureStorage.ts        # Credential storage
└── types/
    └── CommonTypes.ts          # Shared types
```

## Development Guide

*This plugin is built with [Create Figma Plugin](https://yuanqing.github.io/create-figma-plugin/).*

### Prerequisites

- [Node.js](https://nodejs.org) – v22
- [Figma desktop app](https://figma.com/downloads/)

### Installation

```bash
npm install
```

### Build the Plugin

To build the plugin:

```bash
npm run build
```

This generates:
- `manifest.json` - Figma plugin manifest
- `build/main.js` - Minified plugin bundle (~6KB)

To watch for changes and rebuild automatically:

```bash
npm run watch
```

### Install in Figma

1. Open a Figma document in the Figma desktop app
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Select the generated `manifest.json` file
4. Run the plugin from the plugins menu

### Testing

The plugin provides comprehensive functionality:

#### Basic Testing
1. **Token Extraction**: Validates Figma environment and extracts all design tokens
2. **Export Choice**: Presents user interface for GitHub push vs download
3. **Progress Feedback**: Real-time progress indicators during operations
4. **Error Handling**: Graceful fallback when operations fail

#### GitHub Integration Testing
1. **Authentication**: Tests GitHub token and repository access
2. **File Operations**: Creates/updates files in target repository
3. **Commit Generation**: Automated commits with extraction metadata
4. **Connection Validation**: Verifies permissions before operations

### Expected Output

**Successful Run with Local Download:**
- Token extraction completes
- Choice interface appears
- User selects download option
- JSON file downloads to computer

**Successful Run with GitHub Push:**
- Token extraction completes
- Choice interface shows "Ready" for GitHub
- User selects GitHub push
- File appears in target repository with automated commit

**Console Logs:**
- Detailed extraction progress
- GitHub API interactions (if applicable)
- Success/error status for all operations
- Performance metrics and token counts

### Debugging

- Use the Figma Developer Console: **Plugins** → **Development** → **Open Console**
- Check browser console for detailed logs
- All steps are logged with ✓/✗ status indicators

## See also

- [Create Figma Plugin docs](https://yuanqing.github.io/create-figma-plugin/)
- [`yuanqing/figma-plugins`](https://github.com/yuanqing/figma-plugins#readme)

Official docs and code samples from Figma:

- [Plugin API docs](https://figma.com/plugin-docs/)
- [`figma/plugin-samples`](https://github.com/figma/plugin-samples#readme)
