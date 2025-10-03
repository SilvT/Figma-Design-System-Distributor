# GitHub Token Creation Guide

This content is displayed in the "Learn more" tooltip next to the GitHub Token input field.

---

## 🔑 Creating Your GitHub Token

### Step-by-step:

1. Go to [GitHub Settings → Personal Access Tokens](https://github.com/settings/personal-access-tokens/new)
2. Click "Generate new token" (fine-grained or classic)
3. Give it a descriptive name (e.g., "Figma Design System Distributor")
4. Set expiration (recommended: 90 days)
5. Select repository access
6. Under permissions, check **`repo`** scope

### Required permissions for this plugin:

- ✓ **`repo`** (for private repositories)

  **OR**

- ✓ **`public_repo`** (if only using public repositories)

### NOT needed (leave unchecked):

- ✗ `admin:org`
- ✗ `delete_repo`
- ✗ `workflow`
- ✗ `admin:public_key`
- ✗ Any admin or delete permissions

### Why minimal permissions?

This plugin only needs to READ your repository structure and WRITE token files. No admin access required.

---

**Direct link:** [Create Token on GitHub](https://github.com/settings/tokens/new)
