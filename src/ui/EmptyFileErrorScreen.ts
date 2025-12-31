/**
 * Empty File Error Screen
 *
 * Dedicated error screen for when no design tokens are found in the file.
 * Provides helpful guidance on how to create design tokens in Figma.
 */

import { generateDesignSystemCSS, createButton, createCard, generateDesignSystemHead } from '../design-system/html-utils';
import { createPhosphorIcon, getPhosphorIconsCDN } from '../design-system/icons';
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
        ${generateDesignSystemHead()}
        <title>No Design Tokens Found</title>
      </head>
      <body>
        <div class="ds-container">
          <!-- Header with gradient background -->
          <div class="ds-header-gradient" style="background: linear-gradient(135deg, var(--color-lavender-400), var(--color-mint-400)); padding: 2rem; text-align: center; color: white;">
            <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.9;">
              ${createPhosphorIcon('file-x', { size: 48, color: 'white', weight: 'regular' })}
            </div>
            <h1 class="ds-title-large" style="color: white; margin: 0 0 0.5rem;">No Design Tokens Found</h1>
            <p class="ds-body" style="color: white; opacity: 0.9; margin: 0;">Token Launch couldn't find any design tokens to extract</p>
          </div>

          <!-- Content -->
          <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Main message -->
            ${createCard(`
              <h3 class="ds-heading" style="margin: 0 0 0.5rem;">No tokens found in ${documentName}</h3>
              <p class="ds-body" style="margin: 0; color: var(--color-text-secondary);">Token Launch scanned your document but couldn't find any color styles, text styles, effect styles, variables, or collections to extract.</p>
            `)}

            <!-- What are tokens -->
            ${createCard(`
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                ${createPhosphorIcon('lightbulb', { size: 20, color: 'var(--color-primary)', weight: 'regular' })}
                <h3 class="ds-heading" style="margin: 0;">What are design tokens?</h3>
              </div>
              <p class="ds-body" style="margin: 0 0 0.75rem; color: var(--color-text-secondary);">Design tokens are the building blocks of your design system - reusable values that ensure consistency across your digital products.</p>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 0.5rem;">
                <div class="ds-badge">Colors</div>
                <div class="ds-badge">Typography</div>
                <div class="ds-badge">Spacing</div>
                <div class="ds-badge">Effects</div>
                <div class="ds-badge">Variables</div>
              </div>
            `)}

            <!-- Creation guides -->
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              ${createCard(`
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                  ${createPhosphorIcon('palette', { size: 20, color: 'var(--color-primary)', weight: 'regular' })}
                  <h4 class="ds-heading" style="margin: 0;">Creating Color Tokens</h4>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                  <div style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; background: var(--color-background-tertiary); border-radius: 6px;">
                    <div style="background: var(--color-primary); color: white; font-weight: 600; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 50%; min-width: 1.5rem; height: 1.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">1</div>
                    <div>
                      <div class="ds-caption" style="font-weight: 500; margin-bottom: 0.25rem;">Create a color style</div>
                      <div class="ds-caption" style="color: var(--color-text-secondary);">Select an object, go to the fill panel, click the style icon (⚫) and create a new style</div>
                    </div>
                  </div>
                  <div style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; background: var(--color-background-tertiary); border-radius: 6px;">
                    <div style="background: var(--color-primary); color: white; font-weight: 600; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 50%; min-width: 1.5rem; height: 1.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">2</div>
                    <div>
                      <div class="ds-caption" style="font-weight: 500; margin-bottom: 0.25rem;">Or use Variables</div>
                      <div class="ds-caption" style="color: var(--color-text-secondary);">Go to the Variables panel and create color variables for more advanced token management</div>
                    </div>
                  </div>
                </div>
              `)}

              ${createCard(`
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                  ${createPhosphorIcon('text-aa', { size: 20, color: 'var(--color-primary)', weight: 'regular' })}
                  <h4 class="ds-heading" style="margin: 0;">Creating Typography Tokens</h4>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                  <div style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; background: var(--color-background-tertiary); border-radius: 6px;">
                    <div style="background: var(--color-primary); color: white; font-weight: 600; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 50%; min-width: 1.5rem; height: 1.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">1</div>
                    <div>
                      <div class="ds-caption" style="font-weight: 500; margin-bottom: 0.25rem;">Create a text style</div>
                      <div class="ds-caption" style="color: var(--color-text-secondary);">Select text, go to the text panel, click the style icon (T) and create a new text style</div>
                    </div>
                  </div>
                  <div style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; background: var(--color-background-tertiary); border-radius: 6px;">
                    <div style="background: var(--color-primary); color: white; font-weight: 600; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 50%; min-width: 1.5rem; height: 1.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">2</div>
                    <div>
                      <div class="ds-caption" style="font-weight: 500; margin-bottom: 0.25rem;">Name it descriptively</div>
                      <div class="ds-caption" style="color: var(--color-text-secondary);">Use names like "Heading/Large" or "Body/Regular" for clear organization</div>
                    </div>
                  </div>
                </div>
              `)}
            </div>

            <!-- Quick start tip -->
            <div class="ds-alert ds-alert-info">
              <strong>${createPhosphorIcon('lightbulb', { size: 16 })} Quick Start:</strong>
              <p style="margin: 0.5rem 0 0;">The easiest way to get started is to create a few color styles. Select any shape, change its fill color, then click the style icon (⚫) next to the fill to save it as a color style.</p>
            </div>
          </div>

          <!-- Actions -->
          <div style="padding: 1.5rem; border-top: 1px solid var(--color-border-subtle); background: var(--color-background-tertiary); display: flex; flex-direction: column; gap: 0.75rem;">
            ${createButton(`${createPhosphorIcon('graduation-cap', { size: 16 })} Learn More About Design Tokens`, 'primary', {
              onclick: "parent.postMessage({type: 'empty-learn-more'}, '*')"
            })}
            ${createButton(`${createPhosphorIcon('x', { size: 16 })} Close`, 'tertiary', {
              onclick: "parent.postMessage({type: 'empty-close'}, '*')"
            })}
          </div>
        </div>
      </body>
      </html>
    `;
  }
}