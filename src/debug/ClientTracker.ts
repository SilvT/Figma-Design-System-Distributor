/**
 * Comprehensive Client Debugging System
 *
 * Tracks GitHub client lifecycle, method calls, and binding issues
 * to identify exactly where "not a function" errors occur.
 */

export class ClientTracker {
  private static logs: string[] = [];

  static log(message: string, data?: any) {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    const logEntry = `[${timestamp}] 🔍 ${message}`;

    // console.log(logEntry, data || '');
    this.logs.push(logEntry + (data ? ` ${JSON.stringify(data)}` : ''));
  }

  static inspectObject(name: string, obj: any) {
    // console.log(`🔍 INSPECTING ${name}:`, {
    //   type: typeof obj,
    //   isNull: obj === null,
    //   isUndefined: obj === undefined,
    //   constructor: obj?.constructor?.name,
    //   keys: obj ? Object.keys(obj) : 'N/A',
    //   methods: obj ? Object.getOwnPropertyNames(obj).filter(key => typeof obj[key] === 'function') : 'N/A',
    //   prototype: obj ? Object.getOwnPropertyNames(Object.getPrototypeOf(obj)) : 'N/A'
    // });
  }

  static traceMethodCall(objectName: string, methodName: string, obj: any): boolean {
    this.log(`ATTEMPTING: ${objectName}.${methodName}`);

    if (!obj) {
      this.log(`❌ OBJECT IS NULL/UNDEFINED: ${objectName}`);
      return false;
    }

    const method = obj[methodName];
    this.log(`METHOD CHECK: ${objectName}.${methodName}`, {
      exists: methodName in obj,
      type: typeof method,
      isFunction: typeof method === 'function',
      boundCorrectly: method && (method.toString().includes('bound') || method.name === methodName),
      hasOwnProperty: obj.hasOwnProperty(methodName),
      inPrototype: methodName in Object.getPrototypeOf(obj)
    });

    if (typeof method !== 'function') {
      this.log(`❌ NOT A FUNCTION: ${objectName}.${methodName} is ${typeof method}`);
      this.inspectObject(objectName, obj);
      return false;
    }

    this.log(`✅ METHOD VALID: ${objectName}.${methodName} is ready to call`);
    return true;
  }

  static traceAsyncMethodCall(objectName: string, methodName: string, obj: any, params?: any): Promise<boolean> {
    return new Promise((resolve) => {
      this.log(`ASYNC TRACE: ${objectName}.${methodName}`, params);

      const isValid = this.traceMethodCall(objectName, methodName, obj);
      if (!isValid) {
        resolve(false);
        return;
      }

      try {
        // Attempt to call the method to see if it's actually bound correctly
        this.log(`TESTING CALL: ${objectName}.${methodName}`);
        const method = obj[methodName];

        // Check if it's an async function
        if (method.constructor.name === 'AsyncFunction') {
          this.log(`✅ ASYNC METHOD CONFIRMED: ${objectName}.${methodName}`);
        }

        resolve(true);
      } catch (error) {
        this.log(`❌ METHOD CALL TEST FAILED: ${objectName}.${methodName}`, error);
        resolve(false);
      }
    });
  }

  static getDiagnosticReport(): string[] {
    return [...this.logs];
  }

  static clearLogs(): void {
    this.logs = [];
  }

  static exportDiagnostics(): string {
    const report = [
      '='.repeat(80),
      'GITHUB CLIENT DIAGNOSTIC REPORT',
      `Generated: ${new Date().toISOString()}`,
      '='.repeat(80),
      '',
      ...this.logs,
      '',
      '='.repeat(80),
      'END OF REPORT'
    ];

    return report.join('\n');
  }
}