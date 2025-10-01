/**
 * Figma Plugin Build Configuration
 *
 * Custom configuration to prevent aggressive minification that breaks
 * method binding in the GitHub client classes.
 */

module.exports = {
  // Preserve method names and reduce aggressive optimization
  minify: {
    // Preserve function names (critical for our bound methods)
    keep_fnames: true,
    // Preserve class names
    keep_classnames: true,
    // Less aggressive property mangling
    mangle: {
      properties: false,
      // Keep specific method names that we depend on
      reserved: [
        'fileExists',
        'createFile',
        'updateFile',
        'getFile',
        'getRepository',
        'testConnection',
        'getUser',
        'pushTokenFile'
      ]
    },
    // Preserve comments that might be important for debugging
    format: {
      comments: /^\**!|@preserve|@license|@cc_on/i
    }
  },

  // Source map for better debugging
  sourcemap: true,

  // Bundle size is less critical than reliability for plugins
  optimization: {
    // Don't split chunks in plugins - keep everything in one file
    splitChunks: false,

    // Less aggressive tree shaking
    usedExports: false,

    // Preserve side effects (important for class instantiation)
    sideEffects: false
  }
};