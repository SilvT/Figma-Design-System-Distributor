/**
 * Method Validator Utility
 *
 * Provides robust validation and debugging tools for method binding issues
 * in minified Figma plugin environments.
 */

export interface MethodValidationResult {
  isValid: boolean;
  missingMethods: string[];
  invalidMethods: string[];
  debugInfo: {
    objectType: string;
    availableProperties: string[];
    methodTypes: Record<string, string>;
  };
}

export class MethodValidator {
  /**
   * Validate that an object has all required methods
   */
  static validateMethods(
    obj: any,
    requiredMethods: string[],
    objectName: string = 'object'
  ): MethodValidationResult {
    const missingMethods: string[] = [];
    const invalidMethods: string[] = [];
    const methodTypes: Record<string, string> = {};

    // console.log(`🔍 Validating methods on ${objectName}:`, obj);

    // Check if object exists
    if (!obj) {
      return {
        isValid: false,
        missingMethods: requiredMethods,
        invalidMethods: [],
        debugInfo: {
          objectType: 'null/undefined',
          availableProperties: [],
          methodTypes: {}
        }
      };
    }

    // Get all available properties for debugging
    const availableProperties = this.getAllProperties(obj);
    // console.log(`📋 Available properties on ${objectName}:`, availableProperties);

    // Validate each required method
    for (const methodName of requiredMethods) {
      const method = obj[methodName];
      const methodType = typeof method;
      methodTypes[methodName] = methodType;

      // console.log(`  - ${methodName}: ${methodType}`);

      if (method === undefined || method === null) {
        missingMethods.push(methodName);
        console.warn(`    ❌ Missing: ${methodName}`);
      } else if (typeof method !== 'function') {
        invalidMethods.push(methodName);
        console.warn(`    ❌ Invalid type: ${methodName} is ${methodType}`);
      } else {
        // console.log(`    ✅ Valid: ${methodName}`);

        // Test if the method can be called (basic syntax check)
        try {
          // Check if it's an arrow function or bound method
          const isArrowFunction = method.toString().includes('=>');
          const isBound = method.name === 'bound ' + methodName;
          // console.log(`    📝 ${methodName} - Arrow: ${isArrowFunction}, Bound: ${isBound}`);
        } catch (testError) {
          console.warn(`    ⚠️ Method inspection failed for ${methodName}:`, testError);
        }
      }
    }

    const isValid = missingMethods.length === 0 && invalidMethods.length === 0;

    const result: MethodValidationResult = {
      isValid,
      missingMethods,
      invalidMethods,
      debugInfo: {
        objectType: obj.constructor?.name || typeof obj,
        availableProperties,
        methodTypes
      }
    };

    if (!isValid) {
      console.error(`❌ Method validation failed for ${objectName}:`, result);
    } else {
      console.log(`✅ Method validation passed for ${objectName}`);
    }

    return result;
  }

  /**
   * Get all properties of an object (including prototypes)
   */
  private static getAllProperties(obj: any): string[] {
    const properties = new Set<string>();

    let current = obj;
    while (current && current !== Object.prototype) {
      try {
        // Get own properties
        Object.getOwnPropertyNames(current).forEach(prop => {
          if (prop !== 'constructor') {
            properties.add(prop);
          }
        });

        // Get symbols
        Object.getOwnPropertySymbols(current).forEach(sym => {
          properties.add(sym.toString());
        });

        // Move to prototype
        current = Object.getPrototypeOf(current);
      } catch (error) {
        console.warn('Property enumeration failed:', error);
        break;
      }
    }

    return Array.from(properties).sort();
  }

  /**
   * Create a safe wrapper that validates methods before calling
   */
  static createSafeWrapper<T>(
    obj: T,
    methodNames: (keyof T)[],
    objectName: string = 'object'
  ): T {
    const requiredMethods = methodNames as string[];

    // Validate immediately
    const validation = this.validateMethods(obj, requiredMethods, objectName);

    if (!validation.isValid) {
      throw new Error(
        `Safe wrapper creation failed for ${objectName}: ` +
        `Missing: [${validation.missingMethods.join(', ')}], ` +
        `Invalid: [${validation.invalidMethods.join(', ')}]`
      );
    }

    // Create proxy that validates on each method call
    return new Proxy(obj as any, {
      get(target, prop) {
        const value = target[prop];

        // If it's one of our monitored methods, add validation
        if (typeof prop === 'string' && requiredMethods.includes(prop)) {
          if (typeof value !== 'function') {
            throw new Error(
              `Method ${prop} on ${objectName} is not a function (type: ${typeof value})`
            );
          }

          // Return wrapped function that logs calls
          return function(...args: any[]) {
            console.log(`🔧 Calling ${objectName}.${prop} with`, args.length, 'arguments');
            try {
              const result = value.apply(target, args);
              console.log(`✅ ${objectName}.${prop} completed successfully`);
              return result;
            } catch (error) {
              console.error(`❌ ${objectName}.${prop} failed:`, error);
              throw error;
            }
          };
        }

        return value;
      }
    });
  }

  /**
   * Method binding analyzer - helps debug context issues
   */
  static analyzeMethodBinding(obj: any, methodName: string): void {
    console.log(`🔬 Analyzing method binding for ${methodName}:`);

    if (!obj) {
      console.log('  ❌ Object is null/undefined');
      return;
    }

    const method = obj[methodName];

    if (!method) {
      console.log(`  ❌ Method ${methodName} does not exist`);
      return;
    }

    if (typeof method !== 'function') {
      console.log(`  ❌ ${methodName} is not a function (type: ${typeof method})`);
      return;
    }

    // Analyze the method
    console.log(`  📋 Method analysis:`);
    console.log(`    - Type: ${typeof method}`);
    console.log(`    - Name: "${method.name}"`);
    console.log(`    - Length: ${method.length}`);

    try {
      const methodString = method.toString();
      // console.log(`    - Source length: ${methodString.length} chars`);
      // console.log(`    - Is arrow function: ${methodString.includes('=>')}`);
      // console.log(`    - Contains 'this': ${methodString.includes('this')}`);
      // console.log(`    - Is bound: ${method.name.includes('bound')}`);

      // Try to detect if it's a native method
      const isNative = methodString.includes('[native code]');
      // console.log(`    - Is native: ${isNative}`);

    } catch (error) {
      console.log(`    - Source inspection failed: ${error}`);
    }

    // Test the binding
    try {
      // console.log(`  🧪 Testing method binding:`);
      const unbound = obj[methodName];
      const bound = method.bind(obj);

      // console.log(`    - Unbound type: ${typeof unbound}`);
      // console.log(`    - Bound type: ${typeof bound}`);
      // console.log(`    - Same reference: ${unbound === method}`);

    } catch (error) {
      console.log(`    - Binding test failed: ${error}`);
    }
  }
}

// Export convenience functions
export const validateMethods = MethodValidator.validateMethods.bind(MethodValidator);
export const createSafeWrapper = MethodValidator.createSafeWrapper.bind(MethodValidator);
export const analyzeMethodBinding = MethodValidator.analyzeMethodBinding.bind(MethodValidator);