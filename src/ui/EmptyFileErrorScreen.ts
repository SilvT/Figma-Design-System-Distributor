/**
 * Empty File Error Screen
 *
 * Dedicated error screen for when no design tokens are found in the file.
 * Provides helpful guidance on how to create design tokens in Figma.
 */

import { generateDesignSystemCSS } from '../design-system/html-utils';
import { getWindowOptions } from './constants';

export interface EmptyFileErrorOptions {
  onLearnMore?: () => void;
  onClose?: () => void;
  documentName?: string;
}

export interface EmptyFileErrorResult {
  action: 'learn-more' | 'close';
}

export class EmptyFileErrorScreen {
  private options: EmptyFileErrorOptions;

  constructor(options: EmptyFileErrorOptions = {}) {
    this.options = options;
  }

  /**
   * Show the empty file error screen and wait for user action
   */
  async show(): Promise<EmptyFileErrorResult> {
    return new Promise((resolve) => {
      const html = this.buildHTML();

      figma.showUI(html, getWindowOptions('No Design Tokens Found'));

      figma.ui.onmessage = (msg) => {
        switch (msg.type) {
          case 'empty-learn-more':
            if (this.options.onLearnMore) {
              this.options.onLearnMore();
            }
            resolve({ action: 'learn-more' });
            break;

          case 'empty-close':
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
    const documentName = this.options.documentName || 'this document';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>No Design Tokens Found</title>
        <link href="https://unpkg.com/phosphor-icons@1.4.2/src/css/icons.css" rel="stylesheet">
        <style>
          ${generateDesignSystemCSS()}

          .empty-screen {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            background: var(--ds-bg-primary);
            color: var(--ds-text-primary);
            font-family: var(--ds-font-family);
          }

          .empty-header {
            text-align: center;
            padding: 2rem 1.5rem 1rem;
            background: linear-gradient(135deg, #6c7ce7, #a8e6cf);
            color: white;
          }

          .empty-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.9;
          }

          .empty-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 0 0 0.5rem;
          }

          .empty-subtitle {
            font-size: 0.9rem;
            opacity: 0.9;
            margin: 0;
          }

          .empty-content {
            flex: 1;
            padding: 2rem 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .empty-message {
            background: var(--ds-bg-secondary);
            border: 1px solid var(--ds-border-subtle);
            border-radius: 8px;
            padding: 1.5rem;
            text-align: center;
          }

          .empty-message h3 {
            margin: 0 0 0.5rem;
            color: var(--ds-text-primary);
            font-size: 1rem;
          }

          .empty-message p {
            margin: 0;
            color: var(--ds-text-secondary);
            line-height: 1.5;
          }

          .creation-guide {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .guide-section {
            background: var(--ds-bg-secondary);
            border: 1px solid var(--ds-border-subtle);
            border-radius: 8px;
            padding: 1.5rem;
          }

          .guide-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
          }

          .guide-icon {
            font-size: 1.25rem;
            color: var(--ds-accent-primary);
          }

          .guide-title {
            font-weight: 600;
            color: var(--ds-text-primary);
            margin: 0;
            font-size: 1rem;
          }

          .guide-steps {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .guide-step {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 0.75rem;
            background: var(--ds-bg-tertiary);
            border-radius: 6px;
            transition: all 0.2s ease;
          }

          .guide-step:hover {
            background: var(--ds-bg-hover);
          }

          .step-number {
            background: var(--ds-accent-primary);
            color: white;
            font-weight: 600;
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            border-radius: 50%;
            min-width: 1.5rem;
            height: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .step-content {
            flex: 1;
          }

          .step-title {
            font-weight: 500;
            color: var(--ds-text-primary);
            margin: 0 0 0.25rem;
            font-size: 0.9rem;
          }

          .step-description {
            color: var(--ds-text-secondary);
            font-size: 0.85rem;
            line-height: 1.4;
            margin: 0;
          }

          .empty-actions {
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
            background: transparent;
            color: var(--ds-text-secondary);
            border: none;
            padding: 0.5rem;
          }

          .action-secondary:hover {
            color: var(--ds-text-primary);
            background: var(--ds-bg-hover);
          }

          .helpful-tip {
            background: #e8f4fd;
            border-left: 4px solid #2196f3;
            padding: 1rem;
            border-radius: 0 6px 6px 0;
            margin-top: 1rem;
          }

          .helpful-tip strong {
            color: var(--ds-text-primary);
          }

          .helpful-tip p {
            margin: 0.5rem 0 0;
            color: var(--ds-text-secondary);
            font-size: 0.9rem;
          }

          .what-are-tokens {
            background: var(--ds-bg-tertiary);
            border: 1px solid var(--ds-border-subtle);
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1rem;
          }

          .what-are-tokens h3 {
            margin: 0 0 0.75rem;
            color: var(--ds-text-primary);
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .token-examples {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 0.5rem;
            margin-top: 0.75rem;
          }

          .token-example {
            background: var(--ds-bg-secondary);
            padding: 0.5rem;
            border-radius: 4px;
            text-align: center;
            font-size: 0.85rem;
            color: var(--ds-text-secondary);
          }
        </style>
      </head>
      <body>
        <div class="empty-screen">
          <div class="empty-header">
            <div class="empty-icon">
              <i class="ph-file-x"></i>
            </div>
            <h1 class="empty-title">No Design Tokens Found</h1>
            <p class="empty-subtitle">Token Launch couldn't find any design tokens to extract</p>
          </div>

          <div class="empty-content">
            <div class="empty-message">
              <h3>No tokens found in ${documentName}</h3>
              <p>Token Launch scanned your document but couldn't find any color styles, text styles, effect styles, variables, or collections to extract.</p>
            </div>

            <div class="what-are-tokens">
              <h3>
                <i class="ph-lightbulb guide-icon"></i>
                What are design tokens?
              </h3>
              <p>Design tokens are the building blocks of your design system - reusable values that ensure consistency across your digital products.</p>
              <div class="token-examples">
                <div class="token-example">Colors</div>
                <div class="token-example">Typography</div>
                <div class="token-example">Spacing</div>
                <div class="token-example">Effects</div>
                <div class="token-example">Variables</div>
              </div>
            </div>

            <div class="creation-guide">
              <div class="guide-section">
                <div class="guide-header">
                  <i class="ph-palette guide-icon"></i>
                  <h4 class="guide-title">Creating Color Tokens</h4>
                </div>
                <div class="guide-steps">
                  <div class="guide-step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                      <div class="step-title">Create a color style</div>
                      <div class="step-description">Select an object, go to the fill panel, click the style icon (⚫) and create a new style</div>
                    </div>
                  </div>
                  <div class="guide-step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                      <div class="step-title">Or use Variables</div>
                      <div class="step-description">Go to the Variables panel and create color variables for more advanced token management</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="guide-section">
                <div class="guide-header">
                  <i class="ph-text-aa guide-icon"></i>
                  <h4 class="guide-title">Creating Typography Tokens</h4>
                </div>
                <div class="guide-steps">
                  <div class="guide-step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                      <div class="step-title">Create a text style</div>
                      <div class="step-description">Select text, go to the text panel, click the style icon (T) and create a new text style</div>
                    </div>
                  </div>
                  <div class="guide-step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                      <div class="step-title">Name it descriptively</div>
                      <div class="step-description">Use names like "Heading/Large" or "Body/Regular" for clear organization</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="guide-section">
                <div class="guide-header">
                  <i class="ph-drop guide-icon"></i>
                  <h4 class="guide-title">Creating Effect Tokens</h4>
                </div>
                <div class="guide-steps">
                  <div class="guide-step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                      <div class="step-title">Add effects to an object</div>
                      <div class="step-description">Add shadows, blurs, or other effects to an object</div>
                    </div>
                  </div>
                  <div class="guide-step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                      <div class="step-title">Save as effect style</div>
                      <div class="step-description">In the Effects panel, click the style icon and create a new effect style</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="helpful-tip">
              <strong>💡 Quick Start:</strong>
              <p>The easiest way to get started is to create a few color styles. Select any shape, change its fill color, then click the style icon (⚫) next to the fill to save it as a color style.</p>
            </div>
          </div>

          <div class="empty-actions">
            <button class="action-button action-primary" onclick="parent.postMessage({type: 'empty-learn-more'}, '*')">
              <i class="ph-graduation-cap"></i>
              Learn More About Design Tokens
            </button>
            <button class="action-button action-secondary" onclick="parent.postMessage({type: 'empty-close'}, '*')">
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