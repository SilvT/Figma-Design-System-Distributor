# Credential Security Information

This content is displayed in the "Learn more" tooltip next to the "Save credentials between sessions" checkbox.

---

## 🔒 How Your Credentials Are Stored

### Your credentials are stored securely on your device:

- ✓ **Encrypted automatically** by Figma's clientStorage API
- ✓ **Never sent to third-party servers** - only you have access
- ✓ **Only transmitted directly to GitHub's API** when you export tokens
- ✓ **Not visible to other Figma users** or plugin developers
- ✓ **Stored locally** on your machine, not in the cloud

### What happens when you check this box?

**Checked (default):**
- Your GitHub token and repository settings are encrypted and saved locally
- Next time you open the plugin, your setup is ready to use
- You don't need to re-enter credentials every session

**Unchecked:**
- Your credentials are NOT saved
- You'll need to re-enter your token and repository info each time you open the plugin
- More secure if you're on a shared device

### Security Best Practices

1. **Use a token with minimal permissions** (only `repo` scope)
2. **Set an expiration date** (90 days recommended)
3. **Regenerate tokens regularly** to limit exposure
4. **Uncheck this box** if using on a shared or public device

### Technical Details

This plugin uses Figma's `figma.clientStorage` API, which:
- Encrypts data automatically before storage
- Stores data in Figma's secure local storage
- Is isolated per plugin and per user
- Cannot be accessed by other plugins or users

---

**Recommendation:** Keep this checked for convenience unless you're on a shared device.
