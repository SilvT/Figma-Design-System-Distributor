/**
 * Enhanced Error Handler
 *
 * Integrates specialized error screens with the existing error system.
 * Decides whether to show specialized screens or fallback to generic error handling.
 */

import { ErrorHandler } from '../errors/ErrorHandler';
import { ErrorScreenManager, ErrorScreenResult } from './ErrorScreenManager';
import { ErrorDialog } from './ErrorDialog';
import { ErrorCode, ErrorMetadata, classifyError } from '../errors/ErrorTypes';

export interface EnhancedErrorOptions {
  documentName?: string;
  showTechnicalDetails?: boolean;
  context?: string;
}

export class EnhancedErrorHandler {
  /**
   * Handle error with appropriate screen or dialog
   */
  static async handleError(
    error: unknown,
    options: EnhancedErrorOptions = {}
  ): Promise<ErrorScreenResult | { action: 'retry' | 'close' | 'fallback' | 'learn-more' }> {

    // Classify the error
    const metadata = classifyError(error, options.context);

    // Check if we have a specialized screen for this error
    if (ErrorScreenManager.hasSpecializedScreen(metadata.code)) {
      return await this.showSpecializedScreen(metadata.code, options);
    }

    // Fallback to generic error dialog
    return await this.showGenericErrorDialog(metadata, options);
  }

  /**
   * Show specialized error screen
   */
  private static async showSpecializedScreen(
    errorCode: ErrorCode,
    options: EnhancedErrorOptions
  ): Promise<ErrorScreenResult> {

    return await ErrorScreenManager.showErrorScreen(errorCode, {
      documentName: options.documentName,
      onRetry: () => {
        // Retry logic can be handled by caller
      },
      onDownload: () => {
        // Download logic can be handled by caller
      },
      onLearnMore: () => {
        // Open help documentation
        this.openLearnMoreLink(errorCode);
      },
      onClose: () => {
        // Close logic handled by caller
      }
    });
  }

  /**
   * Show generic error dialog for unspecialized errors
   */
  private static async showGenericErrorDialog(
    metadata: ErrorMetadata,
    options: EnhancedErrorOptions
  ): Promise<{ action: 'retry' | 'close' | 'fallback' | 'learn-more' }> {

    const dialog = new ErrorDialog({
      error: metadata,
      showTechnicalDetails: options.showTechnicalDetails || false,
      onRetry: () => {
        // Retry logic
      },
      onClose: () => {
        // Close logic
      }
    });

    return await dialog.show();
  }

  /**
   * Check if error should trigger no tokens screen
   */
  static shouldShowEmptyFileScreen(extractionResult: any): boolean {
    if (!extractionResult) return false;

    const {
      variables = [],
      collections = [],
      designTokens = []
    } = extractionResult;

    const totalTokens = variables.length + collections.length + designTokens.length;
    return totalTokens === 0;
  }

  /**
   * Open appropriate help documentation
   */
  private static openLearnMoreLink(errorCode: ErrorCode): void {
    let url = '';

    switch (errorCode) {
      case ErrorCode.NET_OFFLINE:
        url = 'https://help.figma.com/hc/en-us/articles/360040328613-Troubleshoot-connection-issues';
        break;
      case ErrorCode.EXTRACTION_NO_TOKENS:
        url = 'https://help.figma.com/hc/en-us/articles/360041003174-Create-and-apply-styles';
        break;
      default:
        url = 'https://help.figma.com/';
    }

    // In a Figma plugin, we can't directly open URLs
    // Instead, we'll notify the user with the URL
    figma.notify(`Learn more: ${url}`, { timeout: 5000 });
  }
}