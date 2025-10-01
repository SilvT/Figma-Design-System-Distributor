/**
 * Export Workflow Manager
 *
 * Manages the complete workflow from token extraction through user choice
 * to either Git push or local download, integrating all components.
 */

import { ExtractionResult, TokenExtractor } from '../TokenExtractor';
import { DocumentInfo } from '../types/CommonTypes';
import { ExportChoiceUI, ExportChoice, ExportChoiceUIOptions } from '../ui/ExportChoiceUI';
import { TokenPushService } from '../github/TokenPushService';
import { GitHubAuth } from '../github/GitHubAuth';

// =============================================================================
// TYPES
// =============================================================================

export interface WorkflowOptions {
  tokenExtractor: TokenExtractor;
  documentInfo: DocumentInfo;
}

export interface WorkflowResult {
  success: boolean;
  choice: 'git-push' | 'download' | 'cancel';
  extractionResult?: ExtractionResult;
  gitResult?: any;
  downloadResult?: any;
  error?: string;
  duration: number;
}

// =============================================================================
// EXPORT WORKFLOW MANAGER
// =============================================================================

export class ExportWorkflow {
  private tokenExtractor: TokenExtractor;
  private documentInfo: DocumentInfo;
  private githubAuth: GitHubAuth;
  private pushService: TokenPushService;

  constructor(options: WorkflowOptions) {
    this.tokenExtractor = options.tokenExtractor;
    this.documentInfo = options.documentInfo;
    this.githubAuth = GitHubAuth.getInstance();
    this.pushService = new TokenPushService();
  }

  /**
   * Run the complete export workflow
   */
  async runWorkflow(): Promise<WorkflowResult> {
    const startTime = Date.now();

    try {
      console.log('🚀 Starting export workflow...');

      // Step 1: Initialize services
      await this.initializeServices();

      // Step 2: Extract tokens
      figma.notify('Extracting design tokens...', { timeout: 2000 });
      const extractionResult = await this.extractTokens();

      // Step 3: Check Git status
      const gitStatus = await this.checkGitStatus();

      // Step 4: Show choice UI
      const userChoice = await this.showChoiceUI(extractionResult, gitStatus);

      // Step 5: Handle user choice
      const result = await this.handleUserChoice(userChoice, extractionResult);

      const duration = Date.now() - startTime;
      return {
        ...result,
        extractionResult,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Workflow failed:', error);

      return {
        success: false,
        choice: 'cancel',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      };
    }
  }

  /**
   * Initialize all required services
   */
  private async initializeServices(): Promise<void> {
    try {
      console.log('🔧 ExportWorkflow.initializeServices - Starting...');

      console.log('🔧 Initializing GitHubAuth...');
      await this.githubAuth.initialize();
      console.log('🔧 GitHubAuth initialized, has client:', this.githubAuth.hasClient());

      console.log('🔧 Initializing TokenPushService...');
      await this.pushService.initialize();
      console.log('🔧 TokenPushService initialized');

      // Verify the complete initialization chain
      if (this.githubAuth.hasClient()) {
        const client = this.githubAuth.getClient();
        console.log('🔧 Verification - Client available:', !!client);
        console.log('🔧 Verification - Client ID:', client.getClientId());
        console.log('🔧 Verification - Client methods:', {
          fileExists: typeof client.fileExists,
          createFile: typeof client.createFile,
          getRepository: typeof client.getRepository
        });
      }

      console.log('✅ Services initialized successfully');
    } catch (error) {
      console.error('❌ Service initialization failed:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
      console.warn('⚠️ Service initialization partial:', error);
      // Continue anyway - Git operations might not be available
    }
  }

  /**
   * Extract design tokens from Figma
   */
  private async extractTokens(): Promise<ExtractionResult> {
    console.log('📊 Extracting design tokens...');

    const result = await this.tokenExtractor.extractAllTokens();

    const totalTokens = result.tokens.length + result.variables.length;
    console.log(`✅ Extracted ${totalTokens} tokens (${result.tokens.length} design tokens, ${result.variables.length} variables)`);

    if (result.metadata.errors.length > 0) {
      console.warn(`⚠️ Extraction completed with ${result.metadata.errors.length} errors`);
    }

    return result;
  }

  /**
   * Check Git configuration status
   */
  private async checkGitStatus(): Promise<{
    configured: boolean;
    connected: boolean;
    repository?: string;
    error?: string;
  }> {
    try {
      const authState = this.githubAuth.getState();

      if (!authState.isConfigured) {
        return {
          configured: false,
          connected: false
        };
      }

      // Test connection
      const connectionTest = await this.pushService.testConnection();

      return {
        configured: true,
        connected: connectionTest.success,
        repository: this.getRepositoryString(),
        error: connectionTest.error
      };

    } catch (error) {
      return {
        configured: false,
        connected: false,
        error: error instanceof Error ? error.message : 'Git check failed'
      };
    }
  }

  /**
   * Show the choice UI and wait for user selection
   */
  private async showChoiceUI(
    extractionResult: ExtractionResult,
    gitStatus: any
  ): Promise<ExportChoice> {
    const extractionDuration = Date.now() - new Date(extractionResult.metadata.extractedAt).getTime();

    const uiOptions: ExportChoiceUIOptions = {
      extractionResult,
      documentInfo: this.documentInfo,
      extractionDuration,
      hasGitConfigured: gitStatus.configured && gitStatus.connected,
      gitRepository: gitStatus.repository
    };

    const choiceUI = new ExportChoiceUI(uiOptions);
    return await choiceUI.showChoice();
  }

  /**
   * Handle the user's export choice
   */
  private async handleUserChoice(
    choice: ExportChoice,
    extractionResult: ExtractionResult
  ): Promise<Omit<WorkflowResult, 'extractionResult' | 'duration'>> {
    switch (choice.type) {
      case 'git-push':
        return await this.handleGitPush(extractionResult, choice);

      case 'download':
        return await this.handleDownload(extractionResult);

      case 'cancel':
        console.log('👋 User cancelled export');
        figma.notify('Export cancelled');
        return {
          success: false,
          choice: 'cancel'
        };

      default:
        throw new Error(`Unknown choice type: ${choice.type}`);
    }
  }

  /**
   * Handle Git push workflow
   */
  private async handleGitPush(
    extractionResult: ExtractionResult,
    choice: ExportChoice
  ): Promise<Omit<WorkflowResult, 'extractionResult' | 'duration'>> {
    try {
      console.log('🚀 Starting Git push workflow...');
      console.log('🔧 ExportWorkflow.handleGitPush - pushService type:', typeof this.pushService);
      console.log('🔧 ExportWorkflow.handleGitPush - pushService.quickPush type:', typeof this.pushService.quickPush);

      // Create feedback interface
      const feedback = TokenPushService.createFigmaFeedback();
      console.log('🔧 Feedback interface created');

      // Use quick push or custom configuration
      console.log('🔧 About to call pushService.quickPush...');
      let pushResult;
      try {
        pushResult = await this.pushService.quickPush(extractionResult, feedback);
        console.log('🔧 quickPush completed with result:', pushResult.success ? 'SUCCESS' : 'FAILED');
      } catch (quickPushError) {
        console.error('❌ quickPush failed:', quickPushError);
        console.error('❌ quickPush error type:', typeof quickPushError);
        console.error('❌ quickPush error message:', quickPushError instanceof Error ? quickPushError.message : String(quickPushError));
        console.error('❌ quickPush error stack:', quickPushError instanceof Error ? quickPushError.stack : 'No stack trace');
        throw quickPushError;
      }

      if (pushResult.success) {
        console.log('🎉 Git push successful!');

        // Show success details
        const fileInfo = pushResult.fileInfo;
        figma.notify(
          `🎉 Pushed to GitHub! ${fileInfo?.path} (${fileInfo?.size})`,
          { timeout: 5000 }
        );

        figma.closePlugin('Design tokens pushed to GitHub successfully!');

        return {
          success: true,
          choice: 'git-push',
          gitResult: pushResult
        };
      } else {
        throw new Error(pushResult.error || 'Git push failed');
      }

    } catch (error) {
      console.error('❌ Git push failed:', error);

      const errorMessage = error instanceof Error ? error.message : 'Git push failed';
      figma.notify(`Git push failed: ${errorMessage}`, { error: true, timeout: 6000 });

      // Offer fallback to download
      const shouldFallback = await this.offerDownloadFallback();
      if (shouldFallback) {
        return await this.handleDownload(extractionResult);
      }

      return {
        success: false,
        choice: 'git-push',
        error: errorMessage
      };
    }
  }

  /**
   * Handle local download workflow
   */
  private async handleDownload(
    extractionResult: ExtractionResult
  ): Promise<Omit<WorkflowResult, 'extractionResult' | 'duration'>> {
    try {
      console.log('💾 Starting download workflow...');

      // Use the existing download function
      const extractionDuration = Date.now() - new Date(extractionResult.metadata.extractedAt).getTime();
      await this.triggerDownload(extractionResult, extractionDuration);

      return {
        success: true,
        choice: 'download',
        downloadResult: { initiated: true }
      };

    } catch (error) {
      console.error('❌ Download failed:', error);

      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      figma.notify(`Download failed: ${errorMessage}`, { error: true });

      return {
        success: false,
        choice: 'download',
        error: errorMessage
      };
    }
  }

  /**
   * Trigger the existing download functionality
   */
  private async triggerDownload(result: ExtractionResult, extractionDuration: number): Promise<void> {
    // Import the download function from main.ts (you'll need to export it)
    // For now, recreate the functionality here

    const dataset = this.createJSONDataset(result, extractionDuration);
    const jsonString = JSON.stringify(dataset, null, 2);

    // Generate filename
    const timestamp = new Date().toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '')
      .replace('T', '-');
    const filename = `figma-tokens-${timestamp}.json`;

    // Create download UI (simplified version)
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Inter, sans-serif; padding: 20px; text-align: center; }
          .download-btn {
            background: #18a0fb; color: white; border: none;
            padding: 12px 24px; border-radius: 6px; cursor: pointer;
            font-size: 14px; margin: 10px;
          }
          .file-info {
            background: #f0f7ff; padding: 16px; border-radius: 8px;
            margin: 16px 0; text-align: left;
          }
        </style>
      </head>
      <body>
        <h2>📄 Download Design Tokens</h2>
        <div class="file-info">
          <strong>File:</strong> ${filename}<br>
          <strong>Size:</strong> ${(jsonString.length / 1024).toFixed(1)} KB<br>
          <strong>Tokens:</strong> ${result.tokens.length + result.variables.length}
        </div>
        <button class="download-btn" onclick="downloadFile()">Download JSON File</button>
        <button class="download-btn" onclick="closePlugin()" style="background: #666;">Close</button>

        <script>
          const jsonData = ${JSON.stringify(jsonString)};
          const filename = "${filename}";

          function downloadFile() {
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);

            setTimeout(() => {
              parent.postMessage({ pluginMessage: { type: 'close-plugin' } }, '*');
            }, 1000);
          }

          function closePlugin() {
            parent.postMessage({ pluginMessage: { type: 'close-plugin' } }, '*');
          }
        </script>
      </body>
      </html>
    `;

    figma.showUI(htmlContent, {
      width: 450,
      height: 300,
      title: 'Download Design Tokens'
    });

    figma.ui.onmessage = (msg) => {
      if (msg.type === 'close-plugin') {
        figma.closePlugin('JSON file download completed!');
      }
    };
  }

  /**
   * Create JSON dataset for download
   */
  private createJSONDataset(result: ExtractionResult, extractionDuration: number): any {
    return {
      metadata: {
        exportTimestamp: new Date().toISOString(),
        extractionDuration: extractionDuration,
        sourceDocument: {
          name: this.documentInfo.name,
          id: this.documentInfo.id,
          totalNodes: this.documentInfo.totalNodes
        },
        tokenCounts: {
          totalTokens: result.tokens.length,
          totalVariables: result.variables.length,
          totalCollections: result.collections.length,
          errors: result.metadata.errors.length,
          warnings: result.metadata.warnings.length
        }
      },
      variables: result.variables,
      collections: result.collections,
      designTokens: result.tokens
    };
  }

  /**
   * Offer download fallback when Git push fails
   */
  private async offerDownloadFallback(): Promise<boolean> {
    return new Promise((resolve) => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Inter, sans-serif; padding: 20px; text-align: center; }
            .btn {
              padding: 10px 20px; margin: 8px; border: none; border-radius: 6px;
              cursor: pointer; font-size: 14px;
            }
            .primary { background: #18a0fb; color: white; }
            .secondary { background: #f0f0f0; color: #333; }
          </style>
        </head>
        <body>
          <h3>🚫 Git Push Failed</h3>
          <p>Would you like to download the tokens locally instead?</p>
          <button class="btn primary" onclick="fallback(true)">Yes, Download</button>
          <button class="btn secondary" onclick="fallback(false)">No, Cancel</button>

          <script>
            function fallback(shouldDownload) {
              parent.postMessage({
                pluginMessage: { type: 'fallback-choice', download: shouldDownload }
              }, '*');
            }
          </script>
        </body>
        </html>
      `;

      figma.showUI(htmlContent, { width: 350, height: 200, title: 'Git Push Failed' });

      figma.ui.onmessage = (msg) => {
        if (msg.type === 'fallback-choice') {
          resolve(msg.download);
        }
      };
    });
  }

  /**
   * Get repository string for display
   */
  private getRepositoryString(): string | undefined {
    const config = this.githubAuth.getPublicConfig();
    return config?.repository
      ? `${config.repository.owner}/${config.repository.name}`
      : undefined;
  }
}