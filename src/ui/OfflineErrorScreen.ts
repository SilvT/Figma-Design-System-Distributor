/**
 * Offline Error Screen
 *
 * Dedicated error screen for offline scenarios with clear guidance
 * and fallback options for users without internet connectivity.
 */

import { generateDesignSystemCSS } from '../design-system/html-utils';
import { getWindowOptions } from './constants';

export interface OfflineErrorOptions {
  onRetry?: () => void;
  onDownload?: () => void;
  onClose?: () => void;
}

export interface OfflineErrorResult {
  action: 'retry' | 'download' | 'close';
}

export class OfflineErrorScreen {
  private options: OfflineErrorOptions;

  constructor(options: OfflineErrorOptions = {}) {
    this.options = options;
  }

  /**
   * Show the offline error screen and wait for user action
   */
  async show(): Promise<OfflineErrorResult> {
    return new Promise((resolve) => {
      const html = this.buildHTML();

      figma.showUI(html, getWindowOptions('No Internet Connection'));

      figma.ui.onmessage = (msg) => {
        switch (msg.type) {
          case 'offline-retry':
            if (this.options.onRetry) {
              this.options.onRetry();
            }
            resolve({ action: 'retry' });
            break;

          case 'offline-download':
            if (this.options.onDownload) {
              this.options.onDownload();
            }
            resolve({ action: 'download' });
            break;

          case 'offline-close':
            if (this.options.onClose) {
              this.options.onClose();
            }
            resolve({ action: 'close' });
            break;
        }
      };
    });
  }

  private buildHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>No Internet Connection</title>
        <link href="https://unpkg.com/phosphor-icons@1.4.2/src/css/icons.css" rel="stylesheet">
        <style>
          ${generateDesignSystemCSS()}

          .offline-screen {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            background: var(--ds-bg-primary);
            color: var(--ds-text-primary);
            font-family: var(--ds-font-family);
          }

          .offline-header {
            text-align: center;
            padding: 2rem 1.5rem 1rem;
            background: linear-gradient(135deg, #ff6b6b, #ffd93d);
            color: white;
          }

          .offline-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.9;
          }

          .offline-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 0 0 0.5rem;
          }

          .offline-subtitle {
            font-size: 0.9rem;
            opacity: 0.9;
            margin: 0;
          }

          .offline-content {
            flex: 1;
            padding: 2rem 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .offline-message {
            background: var(--ds-bg-secondary);
            border: 1px solid var(--ds-border-subtle);
            border-radius: 8px;
            padding: 1.5rem;
            text-align: center;
          }

          .offline-message h3 {
            margin: 0 0 0.5rem;
            color: var(--ds-text-primary);
            font-size: 1rem;
          }

          .offline-message p {
            margin: 0;
            color: var(--ds-text-secondary);
            line-height: 1.5;
          }

          .offline-solutions {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .solution-card {
            background: var(--ds-bg-secondary);
            border: 1px solid var(--ds-border-subtle);
            border-radius: 8px;
            padding: 1.5rem;
            transition: all 0.2s ease;
          }

          .solution-card:hover {
            border-color: var(--ds-border-focus);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .solution-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
          }

          .solution-icon {
            font-size: 1.25rem;
            color: var(--ds-accent-primary);
          }

          .solution-title {
            font-weight: 600;
            color: var(--ds-text-primary);
            margin: 0;
          }

          .solution-description {
            color: var(--ds-text-secondary);
            line-height: 1.4;
            margin: 0;
          }

          .offline-actions {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            padding: 1.5rem;
            border-top: 1px solid var(--ds-border-subtle);
            background: var(--ds-bg-tertiary);
          }

          .action-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            font-family: inherit;
          }

          .action-primary {
            background: var(--ds-accent-primary);
            color: white;
          }

          .action-primary:hover {
            background: var(--ds-accent-hover);
            transform: translateY(-1px);
          }

          .action-secondary {
            background: var(--ds-bg-secondary);
            color: var(--ds-text-primary);
            border: 1px solid var(--ds-border-subtle);
          }

          .action-secondary:hover {
            background: var(--ds-bg-hover);
            border-color: var(--ds-border-focus);
          }

          .action-tertiary {
            background: transparent;
            color: var(--ds-text-secondary);
            border: none;
            padding: 0.5rem;
          }

          .action-tertiary:hover {
            color: var(--ds-text-primary);
            background: var(--ds-bg-hover);
          }

          .offline-tip {
            background: #f8f9fa;
            border-left: 4px solid var(--ds-accent-primary);
            padding: 1rem;
            margin-top: 1rem;
            border-radius: 0 6px 6px 0;
          }

          .offline-tip strong {
            color: var(--ds-text-primary);
          }

          .offline-tip p {
            margin: 0.5rem 0 0;
            color: var(--ds-text-secondary);
            font-size: 0.9rem;
          }
        </style>
      </head>
      <body>
        <div class="offline-screen">
          <div class="offline-header">
            <div class="offline-icon">
              <i class="ph-wifi-slash"></i>
            </div>
            <h1 class="offline-title">No Internet Connection</h1>
            <p class="offline-subtitle">GitHub operations require an active internet connection</p>
          </div>

          <div class="offline-content">
            <div class="offline-message">
              <h3>Unable to connect to GitHub</h3>
              <p>Token Launch couldn't establish a connection to GitHub's servers. This might be due to network issues, firewall settings, or temporary connectivity problems.</p>
            </div>

            <div class="offline-solutions">
              <div class="solution-card">
                <div class="solution-header">
                  <i class="ph-arrow-clockwise solution-icon"></i>
                  <h4 class="solution-title">Check Your Connection</h4>
                </div>
                <p class="solution-description">
                  Verify that your device is connected to the internet and try again. Check Wi-Fi, Ethernet, or cellular data connectivity.
                </p>
              </div>

              <div class="solution-card">
                <div class="solution-header">
                  <i class="ph-download-simple solution-icon"></i>
                  <h4 class="solution-title">Download Tokens Offline</h4>
                </div>
                <p class="solution-description">
                  You can still extract design tokens and download them as a JSON file. Your developer can then upload them manually to GitHub.
                </p>
              </div>
            </div>

            <div class="offline-tip">
              <strong>💡 Pro Tip:</strong>
              <p>Token extraction doesn't require internet - only the GitHub push feature does. You can continue working offline and sync later!</p>
            </div>
          </div>

          <div class="offline-actions">
            <button class="action-button action-primary" onclick="parent.postMessage({type: 'offline-retry'}, '*')">
              <i class="ph-arrow-clockwise"></i>
              Try Again
            </button>
            <button class="action-button action-secondary" onclick="parent.postMessage({type: 'offline-download'}, '*')">
              <i class="ph-download-simple"></i>
              Download JSON Instead
            </button>
            <button class="action-button action-tertiary" onclick="parent.postMessage({type: 'offline-close'}, '*')">
              <i class="ph-x"></i>
              Close
            </button>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}