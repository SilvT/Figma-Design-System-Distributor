/**
 * Error Handling System Exports
 *
 * Central export point for the error handling system
 */

export { ErrorHandler } from './ErrorHandler';
export { ErrorDialog } from '../ui/ErrorDialog';
export {
  ErrorCategory,
  ErrorSeverity,
  ErrorCode,
  classifyError,
  ERROR_REGISTRY,
  type ErrorMetadata,
  type ErrorSolution
} from './ErrorTypes';
