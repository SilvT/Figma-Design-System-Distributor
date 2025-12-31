/**
 * Example: GitHub Integration with Figma Design System Distributor
 *
 * This example shows how to integrate the GitHub API functionality
 * with your existing token extraction workflow in main.ts
 */

import { TokenExtractor, ExtractionConfig } from '../src/TokenExtractor';
import { GitHubIntegration } from '../src/github/GitHubIntegration';

// =============================================================================
// EXAMPLE INTEGRATION IN MAIN.TS
// =============================================================================

/**
 * Enhanced main function with GitHub integration
 */
async function mainWithGitHub() {
  try {
    console.log('🚀 Starting Figma Design System Distributor with GitHub Integration...');

    // Initialize token extractor
    const extractionConfig: ExtractionConfig = {
      includeLocalStyles: true,
      includeVariables: true,
      includeComponentTokens: true,
      includeEffects: true,
      processGradients: true,
      processImages: false,
      flattenTokens: false,
      enableAdvancedTypography: true,
      enableSemanticNaming: true
    };

    const tokenExtractor = new TokenExtractor(extractionConfig);

    // Initialize GitHub integration
    const github = new GitHubIntegration(tokenExtractor);
    await github.initialize();

    // Check if GitHub is already configured
    const status = await github.getConnectionStatus();
    console.log(`GitHub Status: ${status.message}`);

    if (!status.isConfigured) {
      // First-time setup workflow
      await setupGitHubWorkflow(github);
    } else if (!status.isConnected) {
      // Test existing connection
      await testExistingConnection(github);
    }

    // Main workflow: Extract and push tokens
    await extractAndPushWorkflow(github);

  } catch (error) {
    console.error('❌ Main workflow failed:', error);
    figma.notify('Design token extraction failed', { error: true });
  }
}

// =============================================================================
// GITHUB SETUP WORKFLOW
// =============================================================================

/**
 * First-time GitHub setup workflow
 */
async function setupGitHubWorkflow(github: GitHubIntegration) {
  console.log('🔧 First-time GitHub setup required...');

  // In a real implementation, you would show a UI for this
  // For now, this demonstrates the API usage

  figma.showUI(__html__, {
    width: 400,
    height: 600,
    title: 'GitHub Setup - Design System Distributor'
  });

  // Example setup (in real implementation, this comes from UI)
  const exampleSetup = {
    token: 'github_pat_your_token_here', // From UI input
    repositoryUrl: 'your-org/design-tokens', // From UI input
    branch: 'main' // From UI input or default
  };

  // Setup GitHub (this would be called from UI)
  const setupResult = await github.setupGitHubIntegration(exampleSetup);

  if (setupResult.success) {
    console.log('✅ GitHub setup successful!');
    figma.notify('GitHub integration configured successfully!');
  } else {
    console.error('❌ GitHub setup failed:', setupResult.error);
    figma.notify(`GitHub setup failed: ${setupResult.error}`, { error: true });
  }
}

/**
 * Test existing GitHub connection
 */
async function testExistingConnection(github: GitHubIntegration) {
  console.log('🔍 Testing existing GitHub connection...');

  const status = await github.getConnectionStatus();

  if (status.isConnected) {
    console.log('✅ GitHub connection verified');
  } else {
    console.log('❌ GitHub connection failed, reconfiguration needed');
    figma.notify('GitHub connection failed. Please reconfigure.', { error: true });
  }
}

// =============================================================================
// TOKEN EXTRACTION & PUSH WORKFLOW
// =============================================================================

/**
 * Main workflow: Extract tokens and push to GitHub
 */
async function extractAndPushWorkflow(github: GitHubIntegration) {
  try {
    // Check if we can push to GitHub
    const status = await github.getConnectionStatus();
    if (!status.canPush) {
      console.log('📁 GitHub not available, proceeding with local extraction only...');
      await localExtractionWorkflow(github);
      return;
    }

    console.log('🚀 Starting complete workflow: Extract + Push to GitHub...');

    // Show progress to user
    figma.notify('Extracting tokens and pushing to GitHub...', { timeout: 2000 });

    // Extract and push in one operation
    const result = await github.extractAndPushTokens({
      commitMessage: `Update design tokens from ${figma.root.name} - ${new Date().toISOString().split('T')[0]}`
    });

    if (result.success) {
      const extractionResult = result.extractionResult!;
      const pushResult = result.pushResult!;

      console.log('🎉 Complete workflow successful!');
      console.log(`📊 Extracted: ${extractionResult.tokens.length} tokens, ${extractionResult.variables.length} variables`);
      console.log(`📤 Pushed to GitHub: ${pushResult.filesUpdated.length} updated, ${pushResult.filesCreated.length} created`);

      figma.notify(
        `🎉 Success! Pushed ${extractionResult.tokens.length} tokens to GitHub`,
        { timeout: 4000 }
      );

      // Optional: Show success UI with details
      showSuccessUI(extractionResult, pushResult);

    } else {
      throw new Error(result.error || 'Workflow failed');
    }

  } catch (error) {
    console.error('❌ Extract & push workflow failed:', error);
    figma.notify(`Failed to push to GitHub: ${error instanceof Error ? error.message : 'Unknown error'}`, { error: true });

    // Fallback to local extraction
    console.log('📁 Falling back to local extraction...');
    await localExtractionWorkflow(github);
  }
}

/**
 * Fallback: Local extraction only (original workflow)
 */
async function localExtractionWorkflow(github: GitHubIntegration) {
  console.log('📁 Running local token extraction...');

  // Your existing extraction workflow from main.ts
  // This is what happens when GitHub is not available

  figma.notify('Extracting tokens locally...', { timeout: 2000 });

  // You would call your existing main() function here
  // or duplicate the extraction logic

  console.log('✅ Local extraction completed');
  figma.notify('Tokens extracted! Use download to save JSON file.', { timeout: 3000 });
}

// =============================================================================
// UI COMMUNICATION
// =============================================================================

/**
 * Handle messages from UI
 */
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'setup-github') {
    // Handle GitHub setup from UI
    const github = new GitHubIntegration(new TokenExtractor({} as ExtractionConfig));
    await github.initialize();

    const result = await github.setupGitHubIntegration({
      token: msg.token,
      repositoryUrl: msg.repository,
      branch: msg.branch
    });

    figma.ui.postMessage({
      type: 'setup-result',
      success: result.success,
      error: result.error
    });
  }

  if (msg.type === 'test-connection') {
    // Handle connection test from UI
    const github = new GitHubIntegration(new TokenExtractor({} as ExtractionConfig));
    await github.initialize();

    const status = await github.getConnectionStatus();

    figma.ui.postMessage({
      type: 'connection-status',
      status: status
    });
  }

  if (msg.type === 'extract-and-push') {
    // Handle extract and push from UI
    await extractAndPushWorkflow(new GitHubIntegration(new TokenExtractor({} as ExtractionConfig)));
  }
};

/**
 * Show success UI with results
 */
function showSuccessUI(extractionResult: any, pushResult: any) {
  figma.showUI(`
    <div style="padding: 20px; font-family: sans-serif;">
      <h2>🎉 GitHub Push Successful!</h2>

      <h3>📊 Extraction Results:</h3>
      <ul>
        <li>Tokens: ${extractionResult.tokens.length}</li>
        <li>Variables: ${extractionResult.variables.length}</li>
        <li>Collections: ${extractionResult.collections.length}</li>
      </ul>

      <h3>📤 GitHub Results:</h3>
      <ul>
        <li>Files Created: ${pushResult.filesCreated.length}</li>
        <li>Files Updated: ${pushResult.filesUpdated.length}</li>
        <li>Commit SHA: ${pushResult.commitSha?.substring(0, 8)}...</li>
      </ul>

      <button onclick="window.close()">Close</button>
    </div>
  `, {
    width: 400,
    height: 300,
    title: 'Push Results'
  });
}

// =============================================================================
// EXAMPLE USAGE PATTERNS
// =============================================================================

/**
 * Example: Manual GitHub setup
 */
async function exampleManualSetup() {
  const tokenExtractor = new TokenExtractor({} as ExtractionConfig);
  const github = new GitHubIntegration(tokenExtractor);
  await github.initialize();

  // Setup GitHub integration
  const result = await github.setupGitHubIntegration({
    token: 'github_pat_your_token_here',
    repositoryUrl: 'https://github.com/your-org/design-tokens',
    branch: 'main'
  });

  console.log('Setup result:', result);
}

/**
 * Example: Extract and push in separate steps
 */
async function exampleSeparateSteps() {
  const tokenExtractor = new TokenExtractor({} as ExtractionConfig);
  const github = new GitHubIntegration(tokenExtractor);
  await github.initialize();

  // Step 1: Extract tokens
  const extractionResult = await tokenExtractor.extractAllTokens();

  // Step 2: Push to GitHub
  const pushResult = await github.pushExistingTokens(
    extractionResult,
    'Manual token update from Figma'
  );

  console.log('Push result:', pushResult);
}

/**
 * Example: List and select repository
 */
async function exampleRepositorySelection() {
  const tokenExtractor = new TokenExtractor({} as ExtractionConfig);
  const github = new GitHubIntegration(tokenExtractor);
  await github.initialize();

  // List available repositories
  const repos = await github.listRepositories();

  if (repos.success && repos.repositories) {
    console.log('Available repositories:');
    repos.repositories.forEach(repo => {
      console.log(`- ${repo.fullName} (${repo.canPush ? 'can push' : 'read-only'})`);
    });
  }
}

// Export the main function for integration
export { mainWithGitHub, GitHubIntegration };