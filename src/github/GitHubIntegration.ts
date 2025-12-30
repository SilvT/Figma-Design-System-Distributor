/**
 * GitHub Integration Example for Token Launch
 *
 * Demonstrates how to integrate GitHub API functionality
 * with your existing token extraction workflow.
 */

import { GitHubConfigManager } from './GitHubConfig';
import { TokenExtractor } from '../TokenExtractor';
import { ExtractionResult } from '../TokenExtractor';

// =============================================================================
// GITHUB INTEGRATION CLASS
// =============================================================================

export class GitHubIntegration {
  private githubConfig: GitHubConfigManager;
  private tokenExtractor: TokenExtractor;

  constructor(tokenExtractor: TokenExtractor) {
    this.githubConfig = new GitHubConfigManager();
    this.tokenExtractor = tokenExtractor;
  }

  /**
   * Initialize GitHub integration
   */
  async initialize(): Promise<void> {
    await this.githubConfig.initialize();
  }

  // =============================================================================
  // SETUP WORKFLOW
  // =============================================================================

  /**
   * Complete GitHub setup workflow
   */
  async setupGitHubIntegration(config: {
    token: string;
    repositoryUrl: string;
    branch?: string;
  }): Promise<{ success: boolean; error?: string; testResult?: any }> {
    try {
      console.log('🔧 Setting up GitHub integration...');

      // Parse repository URL
      const repoInfo = GitHubConfigManager.parseRepositoryUrl(config.repositoryUrl);
      if (!repoInfo) {
        throw new Error('Invalid repository URL format. Use: owner/repo or https://github.com/owner/repo');
      }

      // Setup GitHub configuration
      const setupResult = await this.githubConfig.setupGitHub({
        token: config.token,
        repository: {
          owner: repoInfo.owner,
          name: repoInfo.name,
          branch: config.branch || 'main'
        },
        paths: {
          rawTokens: 'design-tokens/raw/figma-export.json',
          processedTokens: 'design-tokens/tokens/'
        }
      });

      if (!setupResult.success) {
        return setupResult;
      }

      // Test connection
      console.log('🔍 Testing GitHub connection...');
      const testResult = await this.githubConfig.testConnection();

      console.log(`✅ GitHub setup complete! Connected to ${repoInfo.owner}/${repoInfo.name}`);

      return {
        success: true,
        testResult
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Setup failed'
      };
    }
  }

  /**
   * Quick connection status check
   */
  async getConnectionStatus(): Promise<{
    isConfigured: boolean;
    isConnected: boolean;
    status: string;
    message: string;
    canPush: boolean;
  }> {
    const config = this.githubConfig.getConfiguration();
    const statusInfo = this.githubConfig.getConnectionStatusMessage();

    return {
      isConfigured: config.isConfigured,
      isConnected: config.isConnected,
      status: statusInfo.status,
      message: statusInfo.message,
      canPush: config.isConnected && !!config.lastTestResult?.permissions?.canWrite
    };
  }

  // =============================================================================
  // TOKEN EXTRACTION & PUSH WORKFLOW
  // =============================================================================

  /**
   * Complete workflow: Extract tokens from Figma and push to GitHub
   */
  async extractAndPushTokens(options?: {
    commitMessage?: string;
    branchName?: string;
    skipExtraction?: boolean;
    existingTokens?: any;
  }): Promise<{
    success: boolean;
    extractionResult?: ExtractionResult;
    pushResult?: any;
    error?: string;
  }> {
    try {
      console.log('🚀 Starting token extraction and GitHub push workflow...');

      // Check GitHub connection
      const status = await this.getConnectionStatus();
      if (!status.canPush) {
        throw new Error(`Cannot push to GitHub: ${status.message}`);
      }

      let extractionResult: ExtractionResult;

      // Extract tokens (unless skipped)
      if (!options?.skipExtraction) {
        console.log('📊 Extracting design tokens from Figma...');
        extractionResult = await this.tokenExtractor.extractAllTokens();

        if (extractionResult.metadata.errors.length > 0) {
          console.warn(`⚠️ Extraction completed with ${extractionResult.metadata.errors.length} errors`);
        }

        console.log(`✅ Extracted ${extractionResult.tokens.length} tokens, ${extractionResult.variables.length} variables`);
      } else if (options.existingTokens) {
        console.log('📋 Using provided token data...');
        extractionResult = options.existingTokens;
      } else {
        throw new Error('No tokens to push - extraction skipped and no existing tokens provided');
      }

      // Create structured dataset for GitHub
      const tokenDataset = this.createTokenDataset(extractionResult);

      // Push to GitHub
      console.log('📤 Pushing tokens to GitHub...');
      const pushResult = await this.githubConfig.pushTokens(tokenDataset, {
        commitMessage: options?.commitMessage || GitHubConfigManager.generateCommitMessage(),
        branchName: options?.branchName
      });

      if (!pushResult.success) {
        throw new Error(pushResult.error || 'Failed to push tokens to GitHub');
      }

      console.log(`✅ Successfully pushed tokens to GitHub!`);
      if (pushResult.filesCreated.length > 0) {
        console.log(`📁 Created files: ${pushResult.filesCreated.join(', ')}`);
      }
      if (pushResult.filesUpdated.length > 0) {
        console.log(`📝 Updated files: ${pushResult.filesUpdated.join(', ')}`);
      }

      return {
        success: true,
        extractionResult,
        pushResult
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Workflow failed'
      };
    }
  }

  /**
   * Push existing tokens to GitHub (without extraction)
   */
  async pushExistingTokens(
    tokens: any,
    commitMessage?: string
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      const status = await this.getConnectionStatus();
      if (!status.canPush) {
        throw new Error(`Cannot push to GitHub: ${status.message}`);
      }

      const result = await this.githubConfig.pushTokens(tokens, {
        commitMessage: commitMessage || GitHubConfigManager.generateCommitMessage()
      });

      return {
        success: result.success,
        result,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Push failed'
      };
    }
  }

  // =============================================================================
  // REPOSITORY OPERATIONS
  // =============================================================================

  /**
   * List user's repositories for selection
   */
  async listRepositories(): Promise<{
    success: boolean;
    repositories?: Array<{
      name: string;
      fullName: string;
      description: string;
      isPrivate: boolean;
      defaultBranch: string;
      canPush: boolean;
    }>;
    error?: string;
  }> {
    try {
      const result = await this.githubConfig.listRepositories();

      if (!result.success) {
        return result;
      }

      const repositories = result.repositories?.map(repo => ({
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || '',
        isPrivate: repo.private,
        defaultBranch: repo.default_branch,
        canPush: repo.permissions?.push || false
      })) || [];

      return {
        success: true,
        repositories
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list repositories'
      };
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Create structured token dataset for GitHub
   */
  private createTokenDataset(extractionResult: ExtractionResult): any {
    return {
      metadata: {
        exportTimestamp: new Date().toISOString(),
        sourceDocument: {
          name: extractionResult.metadata.documentName,
          id: extractionResult.metadata.documentId
        },
        tokenCounts: {
          totalTokens: extractionResult.tokens.length,
          totalVariables: extractionResult.variables.length,
          totalCollections: extractionResult.collections.length
        },
        extraction: {
          processedNodes: extractionResult.metadata.processedNodes,
          totalNodes: extractionResult.metadata.totalNodes,
          errors: extractionResult.metadata.errors.length,
          warnings: extractionResult.metadata.warnings.length
        }
      },
      variables: extractionResult.variables,
      collections: extractionResult.collections,
      designTokens: extractionResult.tokens
    };
  }

  /**
   * Get GitHub Personal Access Token setup URL
   */
  getTokenSetupUrl(): string {
    return this.githubConfig.getTokenSetupUrl();
  }

  /**
   * Validate repository URL format
   */
  validateRepositoryUrl(url: string): { valid: boolean; parsed?: { owner: string; name: string }; error?: string } {
    const parsed = GitHubConfigManager.parseRepositoryUrl(url);

    if (!parsed) {
      return {
        valid: false,
        error: 'Invalid repository URL format. Use: owner/repo or https://github.com/owner/repo'
      };
    }

    return {
      valid: true,
      parsed
    };
  }

  /**
   * Clear GitHub configuration
   */
  async clearConfiguration(): Promise<void> {
    await this.githubConfig.clearConfiguration();
    console.log('🗑️ GitHub configuration cleared');
  }

  /**
   * Get current configuration info
   */
  getConfigurationInfo(): {
    isConfigured: boolean;
    repository?: string;
    branch?: string;
    isConnected: boolean;
    lastTest?: string;
  } {
    const config = this.githubConfig.getConfiguration();

    return {
      isConfigured: config.isConfigured,
      repository: config.repository ? `${config.repository.owner}/${config.repository.name}` : undefined,
      branch: config.repository?.branch,
      isConnected: config.isConnected,
      lastTest: config.lastTestResult?.user?.login
    };
  }
}