# GitHub Actions Integration

## Overview

The Design System Distributor plugin can optionally trigger a GitHub Actions workflow after creating a pull request. This enables automatic token transformation using tools like Style Dictionary, eliminating manual build steps.

## Features

- **Optional**: Workflow triggering is opt-in - enable it only when needed
- **Configurable**: Specify your custom workflow file name
- **Safe**: PR creation always succeeds, even if workflow trigger fails
- **Persistent**: Settings are saved between plugin uses
- **Informative**: Clear feedback about workflow trigger status

## Setup Guide

### Prerequisites

- GitHub Personal Access Token with `actions:write` scope
- Repository with write access
- GitHub Actions enabled for your repository

### Step 1: Create Your Workflow File

1. Download the example workflow: [`examples/transform-tokens.yml`](../examples/transform-tokens.yml)
2. Customize the workflow for your needs (see [Customization](#customization) below)
3. Add it to your repository at `.github/workflows/transform-tokens.yml`
4. Commit and push the workflow file to your repository

### Step 2: Update Your GitHub Token Permissions

Your GitHub Personal Access Token needs the following scopes:

- ✅ `repo` (already required for the plugin)
- ✅ `actions:write` (new requirement for triggering workflows)

**To update your token:**

1. Go to GitHub → Settings → Developer settings → [Personal Access Tokens](https://github.com/settings/tokens)
2. Click on your existing token or create a new one
3. Ensure both `repo` and `workflow` scopes are checked
4. Save and regenerate if necessary
5. Update the token in the plugin if you generated a new one

### Step 3: Enable Workflow Trigger in Plugin

1. Open the plugin in Figma
2. Extract your design tokens
3. Choose "Push to GitHub" → "Create Pull Request"
4. Check the "Trigger CI/CD workflow after push" checkbox
5. Enter your workflow file name (default: `transform-tokens.yml`)
6. Create your pull request

The plugin will remember your settings for next time!

## How It Works

### Workflow Trigger Flow

```
1. User creates PR in plugin
   ↓
2. Plugin pushes tokens to new branch
   ↓
3. Plugin creates Pull Request on GitHub
   ↓
4. Plugin triggers GitHub Actions workflow
   ↓
5. Workflow runs on the new branch
   ↓
6. Workflow transforms tokens & commits results
   ↓
7. PR is updated with transformed tokens
```

### What Happens If Trigger Fails?

The workflow trigger is designed to fail gracefully:

- ✅ **PR creation always succeeds** - your tokens are safely pushed
- ⚠️ **Warning shown** - you'll see a clear error message
- 🔗 **PR link provided** - you can manually trigger the workflow
- 📝 **Error details** - specific reason for failure (missing file, permissions, etc.)

## Customization

### Example Workflow Explained

```yaml
name: Transform Design Tokens

# Trigger conditions
on:
  workflow_dispatch:  # Allow manual triggering & plugin triggers
    inputs:
      pr_number:
        description: 'PR number that triggered this'
        required: false
  push:              # Also run on direct pushes to token file
    paths:
      - 'tokens/raw/figma-tokens.json'

jobs:
  transform:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      # Install your token transformation tool
      - name: Install Style Dictionary
        run: npm install -g style-dictionary

      # Run the transformation
      - name: Transform tokens
        run: style-dictionary build

      # Commit the transformed output back to the branch
      - name: Commit transformed files
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "🎨 Transform design tokens [automated]"
          file_pattern: "tokens/*"
```

### Customization Options

#### 1. Use a Different Token Transformer

Replace Style Dictionary with your preferred tool:

```yaml
# For Tokens Studio / Token Transformer
- name: Install Token Transformer
  run: npm install -g token-transformer

- name: Transform tokens
  run: token-transformer tokens/raw/figma-tokens.json tokens/transformed.json
```

```yaml
# For Theo
- name: Install Theo
  run: npm install -g theo

- name: Transform tokens
  run: theo tokens/raw/figma-tokens.json --format scss,json,raw
```

#### 2. Add Build Steps

Include additional build steps like linting or testing:

```yaml
- name: Transform tokens
  run: style-dictionary build

- name: Lint generated files
  run: npm run lint:tokens

- name: Run token tests
  run: npm run test:tokens

- name: Build package
  run: npm run build
```

#### 3. Add Notifications

Send notifications when transformation completes:

```yaml
- name: Notify Slack
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Design tokens transformed successfully!'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

#### 4. Multi-Platform Output

Generate tokens for multiple platforms:

```yaml
- name: Transform for Web
  run: style-dictionary build --platform web

- name: Transform for iOS
  run: style-dictionary build --platform ios

- name: Transform for Android
  run: style-dictionary build --platform android

- name: Commit all platform outputs
  uses: stefanzweifel/git-auto-commit-action@v5
  with:
    commit_message: "🎨 Transform tokens for all platforms"
    file_pattern: "tokens/**/*"
```

## Troubleshooting

### "Workflow file not found"

**Problem**: The workflow YAML file doesn't exist in your repository.

**Solution**:
1. Check that the file exists at `.github/workflows/transform-tokens.yml`
2. Verify the file name matches what you entered in the plugin
3. Ensure the file is committed to your main/master branch
4. Try creating the workflow file directly on GitHub to ensure correct location

### "Insufficient permissions"

**Problem**: Your GitHub token doesn't have the required `actions:write` scope.

**Solution**:
1. Go to GitHub → Settings → Developer settings → [Personal Access Tokens](https://github.com/settings/tokens)
2. Find your token and click Edit
3. Check the `workflow` scope (this includes `actions:write`)
4. Regenerate the token
5. Update the token in the plugin settings

### "Workflow doesn't run"

**Problem**: Workflow trigger succeeded but workflow didn't execute.

**Solution**:
1. Check the Actions tab in your GitHub repository
2. Look for the workflow run under the branch name
3. Verify the workflow file has valid YAML syntax
4. Check that Actions are enabled in your repository settings (Settings → Actions → General)
5. Ensure the workflow has the correct permissions

### "Workflow runs but fails"

**Problem**: Workflow triggers successfully but fails during execution.

**Solution**:
1. Click on the failed workflow run in GitHub Actions tab
2. Check the step that failed for error details
3. Common issues:
   - Missing Style Dictionary config file (`config.json`)
   - Incorrect token file path
   - Missing dependencies
   - Permission issues in repository settings

### "Can't find workflow in Actions tab"

**Problem**: Workflow triggered but not visible in Actions.

**Solution**:
1. Check that you're looking at the correct repository
2. Switch to the specific branch (not main)
3. Look under "All workflows" filter
4. Verify the workflow name matches your YAML file

## Advanced Usage

### Conditional Transformation

Only transform tokens when specific conditions are met:

```yaml
jobs:
  check-changes:
    runs-on: ubuntu-latest
    outputs:
      should_transform: ${{ steps.check.outputs.changed }}
    steps:
      - uses: actions/checkout@v4
      - id: check
        run: |
          # Check if critical tokens changed
          if git diff HEAD~1 --name-only | grep -q "tokens/raw/figma-tokens.json"; then
            echo "changed=true" >> $GITHUB_OUTPUT
          fi

  transform:
    needs: check-changes
    if: needs.check-changes.outputs.should_transform == 'true'
    runs-on: ubuntu-latest
    # ... transformation steps
```

### Multiple Workflow Files

Use different workflows for different purposes:

- `transform-tokens-dev.yml` - For development branches
- `transform-tokens-prod.yml` - For production releases
- `validate-tokens.yml` - Just validation, no transformation

Configure the plugin to use the appropriate workflow name for each environment.

### Integration with Existing CI/CD

Trigger other workflows after token transformation:

```yaml
- name: Trigger downstream build
  uses: peter-evans/repository-dispatch@v2
  with:
    event-type: tokens-updated
    client-payload: '{"ref": "${{ github.ref }}"}'
```

## Security Considerations

### Token Permissions

- **Minimum required**: `repo` + `actions:write`
- **Recommended**: Use fine-grained personal access tokens (Beta) for better security
- **Best practice**: Create a dedicated token for this plugin

### Workflow Permissions

Ensure your workflow has appropriate permissions:

```yaml
permissions:
  contents: write  # Required to commit changes
  pull-requests: write  # Required to update PRs
```

### Secrets Management

Never commit tokens or secrets in workflow files. Use GitHub Secrets:

```yaml
env:
  FIGMA_TOKEN: ${{ secrets.FIGMA_TOKEN }}
  NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## FAQ

**Q: Can I use this with GitHub Enterprise?**
A: Yes, as long as GitHub Actions is enabled on your enterprise instance.

**Q: Does this work with private repositories?**
A: Yes, the plugin works with both public and private repositories.

**Q: Can I trigger multiple workflows?**
A: Currently, you can specify one workflow file. However, that workflow can trigger other workflows using `repository_dispatch`.

**Q: What if I don't want to use Style Dictionary?**
A: You can customize the workflow to use any token transformation tool. See the [Customization](#customization) section.

**Q: Will this increase my GitHub Actions usage?**
A: Yes, each workflow trigger counts toward your GitHub Actions minutes. Most transformations complete in under 1 minute.

**Q: Can I disable workflow triggering?**
A: Yes, simply uncheck the "Trigger CI/CD workflow after push" checkbox in the plugin UI.

## Support

For issues or questions:
- [Report a bug](https://github.com/YourOrg/design-system-distributor/issues)
- [View example repository](https://github.com/YourOrg/design-system-example)
- [Check plugin documentation](../README.md)
