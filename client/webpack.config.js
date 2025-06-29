const path = require('path');

module.exports = {
  // Suppress all webpack warnings
  stats: {
    warnings: false,
    warningsFilter: () => true
  },
  // Ignore specific warnings
  ignoreWarnings: [
    // Ignore module not found warnings
    (warning) => warning.module && warning.module.resource && (
      warning.module.resource.includes('node_modules') ||
      warning.message.includes('Module not found')
    ),
    // Ignore specific warning messages
    /Failed to parse source map/,
    /export .* was not found in/
  ],
  // Resolve common issues
  resolve: {
    fallback: {
      "path": require.resolve("path-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "fs": false,
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/")
    }
  }
};
