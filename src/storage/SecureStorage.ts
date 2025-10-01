/**
 * Secure Storage for Figma Plugin
 *
 * Handles encrypted storage of sensitive data like GitHub tokens
 * within Figma's plugin environment using clientStorage.
 */

import { GitHubCredentials, GitHubConfig } from '../github/GitHubTypes';

// =============================================================================
// STORAGE KEYS
// =============================================================================

const STORAGE_KEYS = {
  GITHUB_CONFIG: 'github_config_v1',
  GITHUB_CREDENTIALS: 'github_credentials_v1',
  LAST_CONNECTION_TEST: 'github_last_test_v1'
} as const;

// =============================================================================
// ENCRYPTION HELPERS
// =============================================================================

/**
 * Simple encryption for storing sensitive data
 * Note: This provides basic obfuscation within Figma's sandbox.
 * For production use, consider more robust encryption.
 */
class SimpleEncryption {
  private static key = 'figma-github-plugin-2024';

  static encrypt(text: string): string {
    try {
      // Simple XOR encryption with base64 encoding
      const encrypted = text
        .split('')
        .map((char, i) =>
          String.fromCharCode(
            char.charCodeAt(0) ^ this.key.charCodeAt(i % this.key.length)
          )
        )
        .join('');

      return btoa(encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  static decrypt(encryptedText: string): string {
    try {
      const decoded = atob(encryptedText);

      return decoded
        .split('')
        .map((char, i) =>
          String.fromCharCode(
            char.charCodeAt(0) ^ this.key.charCodeAt(i % this.key.length)
          )
        )
        .join('');
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }
}

// =============================================================================
// SECURE STORAGE CLASS
// =============================================================================

export class SecureStorage {
  /**
   * Store GitHub credentials securely
   */
  static async storeCredentials(credentials: GitHubCredentials): Promise<void> {
    try {
      const encrypted = SimpleEncryption.encrypt(JSON.stringify(credentials));
      await figma.clientStorage.setAsync(STORAGE_KEYS.GITHUB_CREDENTIALS, encrypted);
    } catch (error) {
      console.error('Failed to store credentials:', error);
      throw new Error('Failed to store GitHub credentials securely');
    }
  }

  /**
   * Retrieve GitHub credentials
   */
  static async getCredentials(): Promise<GitHubCredentials | null> {
    try {
      const encrypted = await figma.clientStorage.getAsync(STORAGE_KEYS.GITHUB_CREDENTIALS);

      if (!encrypted) {
        return null;
      }

      const decrypted = SimpleEncryption.decrypt(encrypted);
      return JSON.parse(decrypted) as GitHubCredentials;
    } catch (error) {
      console.error('Failed to retrieve credentials:', error);
      return null;
    }
  }

  /**
   * Store GitHub configuration
   */
  static async storeConfig(config: GitHubConfig): Promise<void> {
    try {
      // Store config without credentials (they're stored separately)
      const configWithoutCredentials = {
        ...config,
        credentials: undefined
      };

      await figma.clientStorage.setAsync(
        STORAGE_KEYS.GITHUB_CONFIG,
        JSON.stringify(configWithoutCredentials)
      );
    } catch (error) {
      console.error('Failed to store config:', error);
      throw new Error('Failed to store GitHub configuration');
    }
  }

  /**
   * Retrieve GitHub configuration
   */
  static async getConfig(): Promise<Partial<GitHubConfig> | null> {
    try {
      const configString = await figma.clientStorage.getAsync(STORAGE_KEYS.GITHUB_CONFIG);

      if (!configString) {
        return null;
      }

      return JSON.parse(configString) as Partial<GitHubConfig>;
    } catch (error) {
      console.error('Failed to retrieve config:', error);
      return null;
    }
  }

  /**
   * Get complete configuration with credentials
   */
  static async getCompleteConfig(): Promise<GitHubConfig | null> {
    try {
      const [config, credentials] = await Promise.all([
        this.getConfig(),
        this.getCredentials()
      ]);

      if (!config || !credentials) {
        return null;
      }

      return {
        ...config,
        credentials
      } as GitHubConfig;
    } catch (error) {
      console.error('Failed to retrieve complete config:', error);
      return null;
    }
  }

  /**
   * Store last connection test result
   */
  static async storeLastConnectionTest(result: any): Promise<void> {
    try {
      await figma.clientStorage.setAsync(
        STORAGE_KEYS.LAST_CONNECTION_TEST,
        JSON.stringify({
          ...result,
          timestamp: Date.now()
        })
      );
    } catch (error) {
      console.error('Failed to store connection test result:', error);
    }
  }

  /**
   * Get last connection test result
   */
  static async getLastConnectionTest(): Promise<any | null> {
    try {
      const resultString = await figma.clientStorage.getAsync(STORAGE_KEYS.LAST_CONNECTION_TEST);

      if (!resultString) {
        return null;
      }

      const result = JSON.parse(resultString);

      // Return null if result is older than 1 hour
      if (Date.now() - result.timestamp > 60 * 60 * 1000) {
        return null;
      }

      return result;
    } catch (error) {
      console.error('Failed to retrieve connection test result:', error);
      return null;
    }
  }

  /**
   * Clear all GitHub-related storage
   */
  static async clearAll(): Promise<void> {
    try {
      await Promise.all(
        Object.values(STORAGE_KEYS).map(key =>
          figma.clientStorage.deleteAsync(key)
        )
      );
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw new Error('Failed to clear GitHub configuration');
    }
  }

  /**
   * Check if GitHub is configured
   */
  static async isConfigured(): Promise<boolean> {
    try {
      const config = await this.getCompleteConfig();
      return !!(config?.credentials?.token && config?.repository?.owner && config?.repository?.name);
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate stored credentials format
   */
  static async validateStoredCredentials(): Promise<boolean> {
    try {
      const credentials = await this.getCredentials();
      return !!(credentials?.token && typeof credentials.token === 'string' && credentials.token.trim().length > 0);
    } catch (error) {
      return false;
    }
  }
}