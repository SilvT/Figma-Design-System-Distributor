/**
 * Common Types
 *
 * Shared type definitions used across multiple modules
 */

// =============================================================================
// DOCUMENT TYPES
// =============================================================================

export interface DocumentInfo {
  name: string;
  id: string;
  pageCount: number;
  totalNodes: number;
  paintStyles: number;
  textStyles: number;
  effectStyles: number;
  variableCollections: number;
  localVariables: number;
}

export interface BasicTokenCount {
  paintStyles: number;
  textStyles: number;
  effectStyles: number;
  variables: number;
  collections: number;
}

// =============================================================================
// EXTRACTION TYPES
// =============================================================================

export interface ExtractedTokenDataset {
  metadata: {
    exportTimestamp: string;
    extractionDuration: number;
    sourceDocument: {
      name: string;
      id: string;
      totalNodes: number;
      pageCount: number;
    };
    tokenCounts: {
      totalTokens: number;
      totalVariables: number;
      totalCollections: number;
      errors: number;
      warnings: number;
    };
  };
  variables: any[];
  collections: any[];
  designTokens: any[];
}