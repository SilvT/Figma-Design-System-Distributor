/**
 * Error Screen Manager
 *
 * Centralized manager for displaying specialized error screens
 * based on error type and context.
 */

import { OfflineErrorScreen, OfflineErrorOptions, OfflineErrorResult } from './OfflineErrorScreen';
import { EmptyFileErrorScreen, EmptyFileErrorOptions, EmptyFileErrorResult } from './EmptyFileErrorScreen';
import { ErrorCode, ErrorMetadata } from '../errors/ErrorTypes';

export type ErrorScreenResult = OfflineErrorResult | EmptyFileErrorResult | { action: 'fallback' };

export class ErrorScreenManager {
  /**
   * Show appropriate error screen based on error type
   */
  static async showErrorScreen(
    errorCode: ErrorCode,
    context?: {
      documentName?: string;
      onRetry?: () => void;
      onDownload?: () => void;
      onLearnMore?: () => void;
      onClose?: () => void;
    }
  ): Promise<ErrorScreenResult> {

    switch (errorCode) {
      case ErrorCode.NET_OFFLINE:
        return await this.showOfflineScreen({
          onRetry: context?.onRetry,
          onDownload: context?.onDownload,
          onClose: context?.onClose
        });

      case ErrorCode.EXTRACTION_NO_TOKENS:
        return await this.showEmptyFileScreen({
          documentName: context?.documentName,
          onLearnMore: context?.onLearnMore,
          onClose: context?.onClose
        });

      default:
        // Fallback to generic error handling
        return { action: 'fallback' };
    }
  }

  /**
   * Show offline error screen
   */
  private static async showOfflineScreen(options: OfflineErrorOptions): Promise<OfflineErrorResult> {
    const screen = new OfflineErrorScreen(options);
    return await screen.show();
  }

  /**
   * Show empty file error screen
   */
  private static async showEmptyFileScreen(options: EmptyFileErrorOptions): Promise<EmptyFileErrorResult> {
    const screen = new EmptyFileErrorScreen(options);
    return await screen.show();
  }

  /**
   * Check if error code has dedicated screen
   */
  static hasSpecializedScreen(errorCode: ErrorCode): boolean {
    return [
      ErrorCode.NET_OFFLINE,
      ErrorCode.EXTRACTION_NO_TOKENS
    ].includes(errorCode);
  }
}