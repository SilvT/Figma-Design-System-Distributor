/**
 * Offline Error Screen
 *
 * Dedicated error screen for offline scenarios with clear guidance
 * and fallback options for users without internet connectivity.
 */

import { generateDesignSystemCSS, createButton, createCard, generateDesignSystemHead } from '../design-system/html-utils';
import { createPhosphorIcon, getPhosphorIconsCDN } from '../design-system/icons';
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
        ${generateDesignSystemHead()}
        <title>No Internet Connection</title>
      </head>
      <body>
        <div class="ds-container">
          <!-- Header with gradient background -->
          <div class="ds-header-gradient" style="background: var(--color-background-gradient); padding: 2rem; text-align: center; color: white;">
            <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.9;">
              ${createPhosphorIcon('wifi-slash', { size: 48, color: 'white', weight: 'regular' })}
            </div>
            <h1 class="ds-title-large" style="color: white; margin: 0 0 0.5rem;">No Internet Connection</h1>
            <p class="ds-body" style="color: white; opacity: 0.9; margin: 0;">GitHub operations require an active internet connection</p>
          </div>

          <!-- Content -->
          <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Main message -->
            ${createCard(`
              <h3 class="ds-heading" style="margin: 0 0 0.5rem;">Unable to connect to GitHub</h3>
              <p class="ds-body" style="margin: 0; color: var(--color-text-secondary);">Token Launch couldn't establish a connection to GitHub's servers. This might be due to network issues, firewall settings, or temporary connectivity problems.</p>
            `)}

            <!-- Solutions -->
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              ${createCard(`
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                  <div style="color: var(--color-primary);">
                    ${createPhosphorIcon('arrow-clockwise', { size: 20, weight: 'regular' })}
                  </div>
                  <h4 class="ds-heading" style="margin: 0;">Check Your Connection</h4>
                </div>
                <p class="ds-body" style="margin: 0; color: var(--color-text-secondary);">
                  Verify that your device is connected to the internet and try again. Check Wi-Fi, Ethernet, or cellular data connectivity.
                </p>
              `)}

              ${createCard(`
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                  <div style="color: var(--color-primary);">
                    ${createPhosphorIcon('download-simple', { size: 20, weight: 'regular' })}
                  </div>
                  <h4 class="ds-heading" style="margin: 0;">Download Tokens Offline</h4>
                </div>
                <p class="ds-body" style="margin: 0; color: var(--color-text-secondary);">
                  You can still extract design tokens and download them as a JSON file. Your developer can then upload them manually to GitHub.
                </p>
              `)}
            </div>

            <!-- Pro tip -->
            <div class="ds-alert ds-alert-info">
              <strong>${createPhosphorIcon('lightbulb', { size: 16 })} Pro Tip:</strong>
              <p style="margin: 0.5rem 0 0;">Token extraction doesn't require internet - only the GitHub push feature does. You can continue working offline and sync later!</p>
            </div>
          </div>

          <!-- Actions -->
          <div style="padding: 1.5rem; border-top: 1px solid var(--color-border-subtle); background: var(--color-background-tertiary); display: flex; flex-direction: column; gap: 0.75rem;">
            ${createButton(`${createPhosphorIcon('arrow-clockwise', { size: 16 })} Try Again`, 'primary', {
              onclick: "parent.postMessage({type: 'offline-retry'}, '*')"
            })}
            ${createButton(`${createPhosphorIcon('download-simple', { size: 16 })} Download JSON Instead`, 'secondary', {
              onclick: "parent.postMessage({type: 'offline-download'}, '*')"
            })}
            ${createButton(`${createPhosphorIcon('x', { size: 16 })} Close`, 'tertiary', {
              onclick: "parent.postMessage({type: 'offline-close'}, '*')"
            })}
          </div>
        </div>
      </body>
      </html>
    `;
  }
}