/**
 * Comprehensive Error Type System
 *
 * Provides structured error classification with user-friendly messages,
 * actionable solutions, and debugging information.
 */

// =============================================================================
// ERROR CATEGORIES
// =============================================================================

export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  VALIDATION = 'validation',
  REPOSITORY = 'repository',
  GIT_OPERATION = 'git_operation',
  CONFIGURATION = 'configuration',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN = 'unknown'
}

export enum ErrorSeverity {
  CRITICAL = 'critical',    // Blocks all operations
  HIGH = 'high',            // Blocks current operation
  MEDIUM = 'medium',        // Degrades functionality
  LOW = 'low'               // Minor issue, can continue
}

// =============================================================================
// ERROR CODE DEFINITIONS
// =============================================================================

export enum ErrorCode {
  // Authentication Errors (AUTH_*)
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_MISSING = 'AUTH_TOKEN_MISSING',
  AUTH_BAD_CREDENTIALS = 'AUTH_BAD_CREDENTIALS',

  // Authorization Errors (AUTHZ_*)
  AUTHZ_INSUFFICIENT_PERMISSIONS = 'AUTHZ_INSUFFICIENT_PERMISSIONS',
  AUTHZ_REPO_ACCESS_DENIED = 'AUTHZ_REPO_ACCESS_DENIED',
  AUTHZ_BRANCH_PROTECTED = 'AUTHZ_BRANCH_PROTECTED',

  // Network Errors (NET_*)
  NET_CONNECTION_FAILED = 'NET_CONNECTION_FAILED',
  NET_TIMEOUT = 'NET_TIMEOUT',
  NET_OFFLINE = 'NET_OFFLINE',

  // Repository Errors (REPO_*)
  REPO_NOT_FOUND = 'REPO_NOT_FOUND',
  REPO_INVALID_NAME = 'REPO_INVALID_NAME',
  REPO_BRANCH_NOT_FOUND = 'REPO_BRANCH_NOT_FOUND',
  REPO_FILE_NOT_FOUND = 'REPO_FILE_NOT_FOUND',

  // Git Operation Errors (GIT_*)
  GIT_CREATE_BRANCH_FAILED = 'GIT_CREATE_BRANCH_FAILED',
  GIT_PUSH_FAILED = 'GIT_PUSH_FAILED',
  GIT_CREATE_PR_FAILED = 'GIT_CREATE_PR_FAILED',
  GIT_COMMIT_FAILED = 'GIT_COMMIT_FAILED',
  GIT_REF_NOT_FOUND = 'GIT_REF_NOT_FOUND',

  // Configuration Errors (CONFIG_*)
  CONFIG_INVALID = 'CONFIG_INVALID',
  CONFIG_MISSING = 'CONFIG_MISSING',

  // Rate Limit Errors (RATE_*)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Extraction Errors (EXTRACTION_*)
  EXTRACTION_NO_TOKENS = 'EXTRACTION_NO_TOKENS',

  // Unknown Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// =============================================================================
// ERROR METADATA
// =============================================================================

export interface ErrorSolution {
  step: number;
  action: string;
  details?: string;
}

export interface ErrorMetadata {
  category: ErrorCategory;
  severity: ErrorSeverity;
  code: ErrorCode;
  title: string;
  userMessage: string;
  technicalMessage: string;
  solutions: ErrorSolution[];
  learnMoreUrl?: string;
  retryable: boolean;
  fallbackAvailable: boolean;
}

// =============================================================================
// ERROR REGISTRY
// =============================================================================

export const ERROR_REGISTRY: Record<ErrorCode, Omit<ErrorMetadata, 'code'>> = {
  // Authentication Errors
  [ErrorCode.AUTH_TOKEN_INVALID]: {
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.CRITICAL,
    title: 'Invalid GitHub Token',
    userMessage: 'Your GitHub Personal Access Token is invalid or has been revoked.',
    technicalMessage: 'GitHub API returned 401 Unauthorized with "Bad credentials" message.',
    solutions: [
      {
        step: 1,
        action: 'Generate a new Personal Access Token',
        details: 'Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)'
      },
      {
        step: 2,
        action: 'Ensure the token has required permissions',
        details: 'Enable: repo (Full control of private repositories)'
      },
      {
        step: 3,
        action: 'Copy the new token and update your configuration',
        details: 'Re-run the GitHub setup in the plugin and paste your new token'
      }
    ],
    learnMoreUrl: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens',
    retryable: true,
    fallbackAvailable: true
  },

  [ErrorCode.AUTH_TOKEN_EXPIRED]: {
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.CRITICAL,
    title: 'GitHub Token Expired',
    userMessage: 'Your GitHub Personal Access Token has expired.',
    technicalMessage: 'Token expiration date has passed.',
    solutions: [
      {
        step: 1,
        action: 'Generate a new Personal Access Token',
        details: 'Go to GitHub → Settings → Developer settings → Personal access tokens'
      },
      {
        step: 2,
        action: 'Set an expiration date or choose "No expiration"',
        details: 'For production use, consider using fine-grained tokens with longer expiration'
      },
      {
        step: 3,
        action: 'Update your token in the plugin configuration'
      }
    ],
    learnMoreUrl: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens',
    retryable: true,
    fallbackAvailable: true
  },

  [ErrorCode.AUTH_TOKEN_MISSING]: {
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.CRITICAL,
    title: 'GitHub Token Missing',
    userMessage: 'No GitHub token configured. Please set up GitHub integration first.',
    technicalMessage: 'GitHub client attempted to make API call without authentication token.',
    solutions: [
      {
        step: 1,
        action: 'Run GitHub setup from the plugin',
        details: 'Click "Configure GitHub" in the export options'
      },
      {
        step: 2,
        action: 'Create a Personal Access Token on GitHub',
        details: 'Go to GitHub → Settings → Developer settings → Personal access tokens'
      },
      {
        step: 3,
        action: 'Paste the token into the plugin configuration'
      }
    ],
    retryable: true,
    fallbackAvailable: true
  },

  [ErrorCode.AUTH_BAD_CREDENTIALS]: {
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.CRITICAL,
    title: 'Authentication Failed',
    userMessage: 'GitHub rejected your credentials. The token may be invalid or revoked.',
    technicalMessage: 'HTTP 401: Bad credentials',
    solutions: [
      {
        step: 1,
        action: 'Verify your token is correct',
        details: 'Check that you copied the entire token without extra spaces'
      },
      {
        step: 2,
        action: 'Check if the token was revoked',
        details: 'Go to GitHub → Settings → Developer settings → Personal access tokens → Check token status'
      },
      {
        step: 3,
        action: 'Generate a new token if needed',
        details: 'Create a new token with "repo" permissions and update your configuration'
      }
    ],
    learnMoreUrl: 'https://docs.github.com/en/rest/overview/troubleshooting',
    retryable: true,
    fallbackAvailable: true
  },

  // Authorization Errors
  [ErrorCode.AUTHZ_INSUFFICIENT_PERMISSIONS]: {
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.HIGH,
    title: 'Insufficient Permissions',
    userMessage: 'Your GitHub token doesn\'t have the required permissions for this operation.',
    technicalMessage: 'HTTP 403: Forbidden - Insufficient token scopes',
    solutions: [
      {
        step: 1,
        action: 'Check your token permissions',
        details: 'Go to GitHub → Settings → Developer settings → Personal access tokens'
      },
      {
        step: 2,
        action: 'Regenerate token with correct scopes',
        details: 'Required scopes: repo (or public_repo for public repositories only)'
      },
      {
        step: 3,
        action: 'Update the token in plugin configuration'
      }
    ],
    learnMoreUrl: 'https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps',
    retryable: true,
    fallbackAvailable: true
  },

  [ErrorCode.AUTHZ_REPO_ACCESS_DENIED]: {
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.HIGH,
    title: 'Repository Access Denied',
    userMessage: 'You don\'t have access to this repository.',
    technicalMessage: 'HTTP 403: Forbidden - Repository access denied',
    solutions: [
      {
        step: 1,
        action: 'Verify you have write access to the repository',
        details: 'Check repository settings → Collaborators & teams'
      },
      {
        step: 2,
        action: 'Contact repository owner for access',
        details: 'Request "Write" or "Admin" permissions'
      },
      {
        step: 3,
        action: 'Verify repository name is correct',
        details: 'Format should be: owner/repository-name'
      }
    ],
    retryable: false,
    fallbackAvailable: true
  },

  [ErrorCode.AUTHZ_BRANCH_PROTECTED]: {
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.HIGH,
    title: 'Branch is Protected',
    userMessage: 'Cannot push directly to this protected branch.',
    technicalMessage: 'Branch protection rules prevent direct pushes',
    solutions: [
      {
        step: 1,
        action: 'Create a pull request instead',
        details: 'Use "Create Pull Request" option instead of direct push'
      },
      {
        step: 2,
        action: 'Or modify branch protection rules',
        details: 'Repository Settings → Branches → Branch protection rules'
      }
    ],
    learnMoreUrl: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches',
    retryable: false,
    fallbackAvailable: true
  },

  // Network Errors
  [ErrorCode.NET_CONNECTION_FAILED]: {
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.HIGH,
    title: 'Connection Failed',
    userMessage: 'Could not connect to GitHub. Please check your internet connection.',
    technicalMessage: 'Network request failed - unable to reach GitHub API',
    solutions: [
      {
        step: 1,
        action: 'Check your internet connection',
        details: 'Ensure you have active internet connectivity'
      },
      {
        step: 2,
        action: 'Check if GitHub is accessible',
        details: 'Visit https://www.githubstatus.com/ to check GitHub status'
      },
      {
        step: 3,
        action: 'Try again in a few moments'
      }
    ],
    learnMoreUrl: 'https://www.githubstatus.com/',
    retryable: true,
    fallbackAvailable: true
  },

  [ErrorCode.NET_TIMEOUT]: {
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    title: 'Request Timeout',
    userMessage: 'The request to GitHub took too long and timed out.',
    technicalMessage: 'Network request exceeded timeout threshold',
    solutions: [
      {
        step: 1,
        action: 'Check your internet connection speed',
        details: 'Slow connections may cause timeouts'
      },
      {
        step: 2,
        action: 'Try again',
        details: 'The issue may be temporary'
      }
    ],
    retryable: true,
    fallbackAvailable: true
  },

  [ErrorCode.NET_OFFLINE]: {
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.CRITICAL,
    title: 'No Internet Connection',
    userMessage: 'You appear to be offline. GitHub operations require an internet connection.',
    technicalMessage: 'Network unavailable',
    solutions: [
      {
        step: 1,
        action: 'Check your internet connection',
        details: 'Ensure Wi-Fi or Ethernet is connected'
      },
      {
        step: 2,
        action: 'Download tokens locally instead',
        details: 'Use the "Download JSON" option to save tokens offline'
      }
    ],
    retryable: true,
    fallbackAvailable: true
  },

  // Repository Errors
  [ErrorCode.REPO_NOT_FOUND]: {
    category: ErrorCategory.REPOSITORY,
    severity: ErrorSeverity.HIGH,
    title: 'Repository Not Found',
    userMessage: 'The specified GitHub repository could not be found.',
    technicalMessage: 'HTTP 404: Repository does not exist or is not accessible',
    solutions: [
      {
        step: 1,
        action: 'Verify the repository name is correct',
        details: 'Format: owner/repository-name (e.g., "myusername/my-design-tokens")'
      },
      {
        step: 2,
        action: 'Check if the repository exists on GitHub',
        details: 'Visit the repository URL to confirm it exists'
      },
      {
        step: 3,
        action: 'Ensure you have access to the repository',
        details: 'Private repositories require proper permissions'
      }
    ],
    retryable: false,
    fallbackAvailable: true
  },

  [ErrorCode.REPO_INVALID_NAME]: {
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    title: 'Invalid Repository Name',
    userMessage: 'The repository name format is invalid.',
    technicalMessage: 'Repository name does not match required format: owner/repo',
    solutions: [
      {
        step: 1,
        action: 'Use the correct format',
        details: 'Repository name should be: owner/repository-name'
      },
      {
        step: 2,
        action: 'Examples of valid names',
        details: 'github-username/design-system, company/ui-tokens'
      }
    ],
    retryable: false,
    fallbackAvailable: false
  },

  [ErrorCode.REPO_BRANCH_NOT_FOUND]: {
    category: ErrorCategory.REPOSITORY,
    severity: ErrorSeverity.MEDIUM,
    title: 'Branch Not Found',
    userMessage: 'The specified branch does not exist in the repository.',
    technicalMessage: 'Git ref not found for specified branch',
    solutions: [
      {
        step: 1,
        action: 'Verify the branch name is correct',
        details: 'Check for typos in the branch name'
      },
      {
        step: 2,
        action: 'Use an existing branch',
        details: 'Common branch names: main, master, develop'
      },
      {
        step: 3,
        action: 'Create a new branch from the base branch'
      }
    ],
    retryable: false,
    fallbackAvailable: true
  },

  [ErrorCode.REPO_FILE_NOT_FOUND]: {
    category: ErrorCategory.REPOSITORY,
    severity: ErrorSeverity.LOW,
    title: 'File Not Found',
    userMessage: 'The file does not exist at the specified path.',
    technicalMessage: 'HTTP 404: File path not found in repository',
    solutions: [
      {
        step: 1,
        action: 'File will be created automatically',
        details: 'The plugin will create the file at the specified path'
      }
    ],
    retryable: true,
    fallbackAvailable: false
  },

  // Git Operation Errors
  [ErrorCode.GIT_CREATE_BRANCH_FAILED]: {
    category: ErrorCategory.GIT_OPERATION,
    severity: ErrorSeverity.HIGH,
    title: 'Failed to Create Branch',
    userMessage: 'Could not create the new branch in the repository.',
    technicalMessage: 'Git branch creation failed',
    solutions: [
      {
        step: 1,
        action: 'Check if a branch with this name already exists',
        details: 'Try using a different branch name'
      },
      {
        step: 2,
        action: 'Verify you have write access to the repository'
      },
      {
        step: 3,
        action: 'Ensure the base branch exists and is accessible'
      }
    ],
    retryable: true,
    fallbackAvailable: true
  },

  [ErrorCode.GIT_PUSH_FAILED]: {
    category: ErrorCategory.GIT_OPERATION,
    severity: ErrorSeverity.HIGH,
    title: 'Push Failed',
    userMessage: 'Could not push changes to the repository.',
    technicalMessage: 'Git push operation failed',
    solutions: [
      {
        step: 1,
        action: 'Check if the branch is protected',
        details: 'Protected branches may require pull requests'
      },
      {
        step: 2,
        action: 'Verify you have write permissions'
      },
      {
        step: 3,
        action: 'Try creating a pull request instead'
      }
    ],
    retryable: true,
    fallbackAvailable: true
  },

  [ErrorCode.GIT_CREATE_PR_FAILED]: {
    category: ErrorCategory.GIT_OPERATION,
    severity: ErrorSeverity.HIGH,
    title: 'Failed to Create Pull Request',
    userMessage: 'Could not create the pull request.',
    technicalMessage: 'GitHub PR creation API call failed',
    solutions: [
      {
        step: 1,
        action: 'Check if a PR already exists for this branch',
        details: 'You cannot create duplicate PRs for the same branch'
      },
      {
        step: 2,
        action: 'Verify the source and target branches exist'
      },
      {
        step: 3,
        action: 'Ensure you have write access to the repository'
      }
    ],
    retryable: true,
    fallbackAvailable: true
  },

  [ErrorCode.GIT_COMMIT_FAILED]: {
    category: ErrorCategory.GIT_OPERATION,
    severity: ErrorSeverity.HIGH,
    title: 'Commit Failed',
    userMessage: 'Could not commit changes to the repository.',
    technicalMessage: 'Git commit operation failed',
    solutions: [
      {
        step: 1,
        action: 'Check if the file path is valid',
        details: 'File paths should not start with / or contain invalid characters'
      },
      {
        step: 2,
        action: 'Verify repository write access'
      },
      {
        step: 3,
        action: 'Ensure the branch exists'
      }
    ],
    retryable: true,
    fallbackAvailable: true
  },

  [ErrorCode.GIT_REF_NOT_FOUND]: {
    category: ErrorCategory.GIT_OPERATION,
    severity: ErrorSeverity.HIGH,
    title: 'Git Reference Not Found',
    userMessage: 'Could not find the specified branch or ref in the repository.',
    technicalMessage: 'Failed to get ref heads/[branch-name]',
    solutions: [
      {
        step: 1,
        action: 'Verify the branch name is correct',
        details: 'Check for typos and ensure the branch exists'
      },
      {
        step: 2,
        action: 'Check your GitHub token permissions',
        details: 'Your token must have access to read repository refs'
      },
      {
        step: 3,
        action: 'Try using "main" or "master" as the base branch'
      }
    ],
    retryable: true,
    fallbackAvailable: true
  },

  // Configuration Errors
  [ErrorCode.CONFIG_INVALID]: {
    category: ErrorCategory.CONFIGURATION,
    severity: ErrorSeverity.HIGH,
    title: 'Invalid Configuration',
    userMessage: 'The GitHub configuration is invalid or incomplete.',
    technicalMessage: 'Configuration validation failed',
    solutions: [
      {
        step: 1,
        action: 'Re-run the GitHub setup',
        details: 'Click "Configure GitHub" and enter your details again'
      },
      {
        step: 2,
        action: 'Ensure all required fields are filled',
        details: 'Token, repository, and branch are all required'
      }
    ],
    retryable: false,
    fallbackAvailable: true
  },

  [ErrorCode.CONFIG_MISSING]: {
    category: ErrorCategory.CONFIGURATION,
    severity: ErrorSeverity.HIGH,
    title: 'Configuration Missing',
    userMessage: 'No GitHub configuration found. Please set up GitHub integration.',
    technicalMessage: 'GitHub configuration not found in storage',
    solutions: [
      {
        step: 1,
        action: 'Run GitHub setup',
        details: 'Click "Configure GitHub" to set up integration'
      }
    ],
    retryable: false,
    fallbackAvailable: true
  },

  // Rate Limit Errors
  [ErrorCode.RATE_LIMIT_EXCEEDED]: {
    category: ErrorCategory.RATE_LIMIT,
    severity: ErrorSeverity.MEDIUM,
    title: 'Rate Limit Exceeded',
    userMessage: 'You\'ve exceeded GitHub\'s API rate limit. Please wait before trying again.',
    technicalMessage: 'HTTP 429: API rate limit exceeded',
    solutions: [
      {
        step: 1,
        action: 'Wait for rate limit to reset',
        details: 'GitHub rate limits reset every hour'
      },
      {
        step: 2,
        action: 'Check your rate limit status',
        details: 'Visit https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting'
      },
      {
        step: 3,
        action: 'Consider using a GitHub App for higher limits',
        details: 'GitHub Apps have higher rate limits than personal tokens'
      }
    ],
    learnMoreUrl: 'https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting',
    retryable: true,
    fallbackAvailable: true
  },

  // Unknown Error
  [ErrorCode.UNKNOWN_ERROR]: {
    category: ErrorCategory.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    title: 'Unknown Error',
    userMessage: 'An unexpected error occurred.',
    technicalMessage: 'Unclassified error',
    solutions: [
      {
        step: 1,
        action: 'Try the operation again'
      },
      {
        step: 2,
        action: 'Check the browser console for details',
        details: 'Open Developer Tools (F12) and check the Console tab'
      },
      {
        step: 3,
        action: 'Download tokens locally as a fallback',
        details: 'Use "Download JSON" option'
      }
    ],
    retryable: true,
    fallbackAvailable: true
  },

  [ErrorCode.EXTRACTION_NO_TOKENS]: {
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    title: 'No Design Tokens Found',
    userMessage: 'No design tokens (colors, typography, effects, variables) were found in this document.',
    technicalMessage: 'Token extraction completed with zero tokens found',
    solutions: [
      {
        step: 1,
        action: 'Create color styles',
        details: 'Select objects and create color styles in the Design panel'
      },
      {
        step: 2,
        action: 'Add text styles',
        details: 'Create text styles from your typography elements'
      },
      {
        step: 3,
        action: 'Set up variables',
        details: 'Use the Variables panel to create design tokens'
      }
    ],
    retryable: false,
    fallbackAvailable: false
  }
};

// =============================================================================
// ERROR CLASSIFICATION HELPER
// =============================================================================

/**
 * Classify an error and return detailed metadata
 */
export function classifyError(error: unknown, context?: string): ErrorMetadata {
  // Extract error information
  const errorObj = error instanceof Error ? error : new Error(String(error));
  const message = errorObj.message.toLowerCase();
  const status = (errorObj as any).status;

  // Determine error code based on message and status
  let code: ErrorCode = ErrorCode.UNKNOWN_ERROR;

  // Authentication errors (401)
  if (status === 401 || message.includes('bad credentials')) {
    code = ErrorCode.AUTH_BAD_CREDENTIALS;
  } else if (message.includes('token') && (message.includes('invalid') || message.includes('expired'))) {
    code = ErrorCode.AUTH_TOKEN_INVALID;
  } else if (message.includes('token') && message.includes('missing')) {
    code = ErrorCode.AUTH_TOKEN_MISSING;
  }

  // Authorization errors (403)
  else if (status === 403) {
    if (message.includes('permission') || message.includes('scope')) {
      code = ErrorCode.AUTHZ_INSUFFICIENT_PERMISSIONS;
    } else if (message.includes('protected')) {
      code = ErrorCode.AUTHZ_BRANCH_PROTECTED;
    } else {
      code = ErrorCode.AUTHZ_REPO_ACCESS_DENIED;
    }
  }

  // Repository errors (404)
  else if (status === 404) {
    if (message.includes('repository') || message.includes('repo')) {
      code = ErrorCode.REPO_NOT_FOUND;
    } else if (message.includes('branch') || message.includes('ref')) {
      code = ErrorCode.REPO_BRANCH_NOT_FOUND;
    } else if (message.includes('file')) {
      code = ErrorCode.REPO_FILE_NOT_FOUND;
    }
  }

  // Rate limit errors (429)
  else if (status === 429 || message.includes('rate limit')) {
    code = ErrorCode.RATE_LIMIT_EXCEEDED;
  }

  // Network errors
  else if (message.includes('network') || message.includes('connection') || message.includes('fetch')) {
    if (message.includes('offline')) {
      code = ErrorCode.NET_OFFLINE;
    } else if (message.includes('timeout')) {
      code = ErrorCode.NET_TIMEOUT;
    } else {
      code = ErrorCode.NET_CONNECTION_FAILED;
    }
  }

  // Git operation errors
  else if (message.includes('failed to get ref')) {
    code = ErrorCode.GIT_REF_NOT_FOUND;
  } else if (message.includes('create branch') || message.includes('branch creation')) {
    code = ErrorCode.GIT_CREATE_BRANCH_FAILED;
  } else if (message.includes('push') && message.includes('failed')) {
    code = ErrorCode.GIT_PUSH_FAILED;
  } else if (message.includes('pull request') || message.includes('pr')) {
    code = ErrorCode.GIT_CREATE_PR_FAILED;
  } else if (message.includes('commit')) {
    code = ErrorCode.GIT_COMMIT_FAILED;
  }

  // Configuration errors
  else if (message.includes('configuration') || message.includes('config')) {
    if (message.includes('missing')) {
      code = ErrorCode.CONFIG_MISSING;
    } else {
      code = ErrorCode.CONFIG_INVALID;
    }
  }

  // Get metadata from registry
  const metadata = ERROR_REGISTRY[code];

  return {
    ...metadata,
    code,
    technicalMessage: `${metadata.technicalMessage}${context ? ` (Context: ${context})` : ''}\nOriginal: ${errorObj.message}`
  };
}
