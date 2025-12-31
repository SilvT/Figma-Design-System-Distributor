/**
 * Error Dialog UI Component
 *
 * Displays detailed, user-friendly error messages with actionable solutions.
 * Provides options to retry, use fallback, or get more information.
 */

import { ErrorMetadata, ErrorSeverity } from '../errors/ErrorTypes';
import { generateDesignSystemCSS, createButton, createCard, generateDesignSystemHead } from '../design-system/html-utils';
import { createPhosphorIcon } from '../design-system/icons';
import { getWindowOptions } from './constants';

// =============================================================================
// ERROR DIALOG OPTIONS
// =============================================================================

export interface ErrorDialogOptions {
  error: ErrorMetadata;
  showTechnicalDetails?: boolean;
  onRetry?: () => void;
  onFallback?: () => void;
  onClose?: () => void;
}

export interface ErrorDialogResult {
  action: 'retry' | 'fallback' | 'close' | 'learn-more';
}

// =============================================================================
// ERROR DIALOG CLASS
// =============================================================================

export class ErrorDialog {
  private options: ErrorDialogOptions;

  constructor(options: ErrorDialogOptions) {
    this.options = options;
  }

  /**
   * Show the error dialog and wait for user action
   */
  async show(): Promise<ErrorDialogResult> {
    return new Promise((resolve) => {
      const html = this.buildHTML();

      figma.showUI(html, getWindowOptions(`Error: ${this.options.error.title}`));

      // Handle messages from UI
      figma.ui.onmessage = async (msg) => {
        switch (msg.type) {
          case 'error-retry':
            if (this.options.onRetry) {
              this.options.onRetry();
            }
            resolve({ action: 'retry' });
            break;

          case 'error-fallback':
            if (this.options.onFallback) {
              this.options.onFallback();
            }
            resolve({ action: 'fallback' });
            break;

          case 'error-learn-more':
            resolve({ action: 'learn-more' });
            break;

          case 'error-close':
            if (this.options.onClose) {
              this.options.onClose();
            }
            resolve({ action: 'close' });
            break;
        }
      };
    });
  }

  /**
   * Build the HTML for the error dialog
   */
  private buildHTML(): string {
    const { error, showTechnicalDetails } = this.options;
    const severityIcon = this.getSeverityIconName(error.severity);
    const severityColor = this.getSeverityColor(error.severity);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        ${generateDesignSystemHead()}
        <title>Error: ${error.title}</title>
      </head>
      <body>
        <div class="ds-container">
          <!-- Header -->
          <div style="border-left: 4px solid ${severityColor}; padding: 1.5rem; background: var(--color-background-secondary);">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
              <div style="color: ${severityColor};">
                ${createPhosphorIcon(severityIcon, { size: 24, weight: 'regular' })}
              </div>
              <div>
                <h2 class="ds-title-medium" style="margin: 0; color: var(--color-text-primary);">${error.title}</h2>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.25rem;">
                  <span class="ds-badge">${error.code}</span>
                  <span class="ds-badge">${this.formatSeverity(error.severity)}</span>
                </div>
              </div>
            </div>
            <p class="ds-body" style="margin: 0; color: var(--color-text-secondary);">${error.userMessage}</p>
          </div>

          <!-- Content -->
          <div style="padding: 1.5rem;">
            ${error.solutions && error.solutions.length > 0 ? this.renderSolutionsDS(error.solutions) : ''}
            ${showTechnicalDetails ? this.renderTechnicalDetailsDS(error) : ''}
          </div>

          <!-- Actions -->
          <div style="padding: 1.5rem; border-top: 1px solid var(--color-border-subtle); background: var(--color-background-tertiary); display: flex; gap: 0.75rem;">
            ${error.retryable ? createButton(`${createPhosphorIcon('arrow-clockwise', { size: 16 })} Retry`, 'primary', {
              onclick: "window.parent.postMessage({type: 'error-retry'}, '*')"
            }) : ''}
            ${error.fallbackAvailable ? createButton(`${createPhosphorIcon('download-simple', { size: 16 })} Use Alternative`, 'secondary', {
              onclick: "window.parent.postMessage({type: 'error-fallback'}, '*')"
            }) : ''}
            ${createButton(`${createPhosphorIcon('question', { size: 16 })} Learn More`, 'tertiary', {
              onclick: "window.parent.postMessage({type: 'error-learn-more'}, '*')"
            })}
            ${createButton(`${createPhosphorIcon('x', { size: 16 })} Close`, 'tertiary', {
              onclick: "window.parent.postMessage({type: 'error-close'}, '*')"
            })}
          </div>
        </div>

        <script>
          ${this.getScript()}
        </script>
      </body>
      </html>
    `;
  }

  /**
   * Render the error header with icon and title
   */
  private renderHeader(): string {
    const { error } = this.options;
    const iconClass = this.getSeverityIconClass(error.severity);
    const severityColor = this.getSeverityColor(error.severity);

    return `
      <div class="error-header" style="border-left-color: ${severityColor};">
        <div class="error-icon ${iconClass}">${this.getSeverityIcon(error.severity)}</div>
        <div class="error-title-section">
          <h2 class="error-title">${error.title}</h2>
          <div class="error-meta">
            <span class="error-code">${error.code}</span>
            <span class="error-category">${this.formatCategory(error.category)}</span>
            <span class="error-severity severity-${error.severity}">${this.formatSeverity(error.severity)}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render the main error content
   */
  private renderContent(): string {
    const { error } = this.options;

    return `
      <div class="error-content">
        <div class="error-section">
          <h3>What happened?</h3>
          <p class="error-message">${error.userMessage}</p>
        </div>
      </div>
    `;
  }

  /**
   * Render the solutions section
   */
  private renderSolutions(): string {
    const { error } = this.options;

    if (!error.solutions || error.solutions.length === 0) {
      return '';
    }

    const solutionsList = error.solutions
      .map(
        (solution) => `
        <li class="solution-item">
          <div class="solution-step">${solution.step}</div>
          <div class="solution-content">
            <div class="solution-action">${solution.action}</div>
            ${solution.details ? `<div class="solution-details">${solution.details}</div>` : ''}
          </div>
        </li>
      `
      )
      .join('');

    return `
      <div class="error-section solutions-section">
        <h3>How to fix this</h3>
        <ol class="solutions-list">
          ${solutionsList}
        </ol>
      </div>
    `;
  }

  /**
   * Render technical details (collapsible)
   */
  private renderTechnicalDetails(): string {
    const { error } = this.options;

    return `
      <div class="error-section technical-section">
        <details>
          <summary>Technical Details</summary>
          <div class="technical-content">
            <pre>${error.technicalMessage}</pre>
          </div>
        </details>
      </div>
    `;
  }

  /**
   * Render action buttons
   */
  private renderActions(): string {
    const { error } = this.options;
    const hasLearnMore = !!error.learnMoreUrl;

    return `
      <div class="error-actions">
        <div class="primary-actions">
          ${
            error.retryable
              ? '<button class="btn btn-primary" onclick="handleRetry()">Try Again</button>'
              : ''
          }
          ${
            error.fallbackAvailable
              ? '<button class="btn btn-secondary" onclick="handleFallback()">Download Locally</button>'
              : ''
          }
          ${
            hasLearnMore
              ? '<button class="btn btn-link" onclick="handleLearnMore()">Learn More</button>'
              : ''
          }
        </div>
        <button class="btn btn-text" onclick="handleClose()">Close</button>
      </div>
    `;
  }

  /**
   * Get styles for the dialog
   */
  private getStyles(): string {
    return `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
        line-height: 1.6;
        color: #333;
        background: #fff;
        padding: 0;
        overflow-y: auto;
      }

      .error-dialog {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 100vh;
      }

      /* Header */
      .error-header {
        background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
        padding: 24px;
        border-left: 4px solid #dc3545;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        align-items: flex-start;
        gap: 16px;
      }

      .error-icon {
        font-size: 32px;
        line-height: 1;
        flex-shrink: 0;
      }

      .error-icon.critical { color: #dc3545; }
      .error-icon.high { color: #fd7e14; }
      .error-icon.medium { color: #ffc107; }
      .error-icon.low { color: #6c757d; }

      .error-title-section {
        flex: 1;
      }

      .error-title {
        font-size: 18px;
        font-weight: 600;
        color: #212529;
        margin-bottom: 8px;
      }

      .error-meta {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .error-code {
        display: inline-block;
        padding: 2px 8px;
        background: #e9ecef;
        border-radius: 4px;
        font-size: 11px;
        font-family: 'SF Mono', Monaco, monospace;
        color: #495057;
      }

      .error-category {
        display: inline-block;
        padding: 2px 8px;
        background: #f8f9fa;
        border-radius: 4px;
        font-size: 11px;
        color: #6c757d;
        text-transform: capitalize;
      }

      .error-severity {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
      }

      .severity-critical {
        background: #f8d7da;
        color: #721c24;
      }

      .severity-high {
        background: #ffe5d0;
        color: #7a4419;
      }

      .severity-medium {
        background: #fff3cd;
        color: #856404;
      }

      .severity-low {
        background: #e2e3e5;
        color: #383d41;
      }

      /* Content */
      .error-content {
        flex: 1;
        padding: 24px;
        overflow-y: auto;
      }

      .error-section {
        margin-bottom: 24px;
      }

      .error-section:last-child {
        margin-bottom: 0;
      }

      .error-section h3 {
        font-size: 14px;
        font-weight: 600;
        color: #495057;
        margin-bottom: 12px;
      }

      .error-message {
        font-size: 14px;
        color: #212529;
        line-height: 1.6;
      }

      /* Solutions */
      .solutions-section {
        background: #f8f9fa;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #dee2e6;
      }

      .solutions-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .solution-item {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid #dee2e6;
      }

      .solution-item:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }

      .solution-step {
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        background: #000000;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 13px;
      }

      .solution-content {
        flex: 1;
      }

      .solution-action {
        font-size: 13px;
        font-weight: 500;
        color: #212529;
        margin-bottom: 4px;
      }

      .solution-details {
        font-size: 12px;
        color: #6c757d;
        line-height: 1.5;
      }

      /* Technical Details */
      .technical-section {
        background: #212529;
        color: #f8f9fa;
        padding: 16px;
        border-radius: 8px;
      }

      .technical-section summary {
        cursor: pointer;
        font-weight: 500;
        font-size: 12px;
        color: #adb5bd;
        padding: 4px 0;
      }

      .technical-section summary:hover {
        color: #f8f9fa;
      }

      .technical-content {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #495057;
      }

      .technical-content pre {
        font-family: 'SF Mono', Monaco, monospace;
        font-size: 11px;
        line-height: 1.6;
        color: #f8f9fa;
        white-space: pre-wrap;
        word-break: break-word;
      }

      /* Actions */
      .error-actions {
        padding: 20px 24px;
        border-top: 1px solid #e9ecef;
        background: #fff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }

      .primary-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .btn {
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        outline: none;
      }

      .btn:hover {
        transform: translateY(-1px);
      }

      .btn:active {
        transform: translateY(0);
      }

      .btn-primary {
        background: #000000;
        color: white;
      }

      .btn-primary:hover {
        background: #0d8ce8;
      }

      .btn-secondary {
        background: #6c757d;
        color: white;
      }

      .btn-secondary:hover {
        background: #5a6268;
      }

      .btn-link {
        background: transparent;
        color: #000000;
        text-decoration: underline;
      }

      .btn-link:hover {
        color: #0d8ce8;
      }

      .btn-text {
        background: transparent;
        color: #6c757d;
      }

      .btn-text:hover {
        color: #495057;
        transform: none;
      }
    `;
  }

  /**
   * Get JavaScript for the dialog
   */
  private getScript(): string {
    return `
      function handleRetry() {
        parent.postMessage({ pluginMessage: { type: 'error-retry' } }, '*');
      }

      function handleFallback() {
        parent.postMessage({ pluginMessage: { type: 'error-fallback' } }, '*');
      }

      function handleLearnMore() {
        parent.postMessage({ pluginMessage: { type: 'error-learn-more' } }, '*');
        ${this.options.error.learnMoreUrl ? `window.open('${this.options.error.learnMoreUrl}', '_blank');` : ''}
      }

      function handleClose() {
        parent.postMessage({ pluginMessage: { type: 'error-close' } }, '*');
      }
    `;
  }

  /**
   * Get severity icon
   */
  private getSeverityIcon(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return '🚨';
      case ErrorSeverity.HIGH:
        return '⚠️';
      case ErrorSeverity.MEDIUM:
        return '⚡';
      case ErrorSeverity.LOW:
        return 'ℹ️';
      default:
        return '❓';
    }
  }

  /**
   * Get severity icon CSS class
   */
  private getSeverityIconClass(severity: ErrorSeverity): string {
    return severity;
  }

  /**
   * Get severity color
   */
  private getSeverityColor(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return '#dc3545';
      case ErrorSeverity.HIGH:
        return '#fd7e14';
      case ErrorSeverity.MEDIUM:
        return '#ffc107';
      case ErrorSeverity.LOW:
        return '#6c757d';
      default:
        return '#6c757d';
    }
  }

  /**
   * Format category for display
   */
  private formatCategory(category: string): string {
    return category.replace(/_/g, ' ');
  }

  /**
   * Format severity for display
   */
  private formatSeverity(severity: ErrorSeverity): string {
    return severity.toUpperCase();
  }

  /**
   * Get icon name for severity (for Phosphor icons)
   */
  private getSeverityIconName(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'info';
      case ErrorSeverity.MEDIUM:
        return 'warning';
      case ErrorSeverity.HIGH:
        return 'warning-diamond';
      case ErrorSeverity.CRITICAL:
        return 'x-circle';
      default:
        return 'question';
    }
  }

  /**
   * Render solutions using design system components
   */
  private renderSolutionsDS(solutions: any[]): string {
    if (!solutions || solutions.length === 0) return '';

    const solutionCards = solutions.map((solution, index) => {
      return createCard(`
        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
          <div style="background: var(--color-primary); color: white; font-weight: 600; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 50%; min-width: 1.5rem; height: 1.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">${solution.step}</div>
          <div>
            <div class="ds-caption" style="font-weight: 500; margin-bottom: 0.25rem;">${solution.action}</div>
            ${solution.details ? `<div class="ds-caption" style="color: var(--color-text-secondary);">${solution.details}</div>` : ''}
          </div>
        </div>
      `);
    }).join('');

    return `
      <div style="margin-bottom: 1.5rem;">
        <h3 class="ds-heading" style="margin: 0 0 1rem;">Solutions</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${solutionCards}
        </div>
      </div>
    `;
  }

  /**
   * Render technical details using design system components
   */
  private renderTechnicalDetailsDS(error: ErrorMetadata): string {
    return createCard(`
      <h3 class="ds-heading" style="margin: 0 0 0.75rem;">Technical Details</h3>
      <div class="ds-caption" style="color: var(--color-text-secondary); margin-bottom: 0.5rem;"><strong>Code:</strong> ${error.code}</div>
      <div class="ds-caption" style="color: var(--color-text-secondary); margin-bottom: 0.5rem;"><strong>Category:</strong> ${this.formatCategory(error.category)}</div>
      <div class="ds-caption" style="color: var(--color-text-secondary);"><strong>Technical Message:</strong> ${error.technicalMessage || 'No additional technical details available.'}</div>
    `);
  }
}
