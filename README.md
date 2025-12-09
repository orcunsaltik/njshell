# njshell

[![CI](https://github.com/orcunsaltik/njshell/actions/workflows/ci.yml/badge.svg)](https://github.com/orcunsaltik/njshell/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/njshell.svg)](https://www.npmjs.com/package/njshell)
[![npm downloads](https://img.shields.io/npm/dt/njshell.svg)](https://www.npmjs.com/package/njshell)
[![license](https://img.shields.io/npm/l/njshell.svg)](https://github.com/orcunsaltik/njshell/blob/master/LICENSE)

> Execute shell commands with flexible output formats

Lightweight utility for running shell commands from Node.js with support for multiple output types: string, buffer, stream, and vinyl (for Gulp pipelines).

## Features

- ✅ Multiple output formats (string, buffer, stream, vinyl)
- ✅ Async/Promise-based API
- ✅ Local npm binary execution
- ✅ Timeout and signal support
- ✅ Gulp/Vinyl integration
- ✅ Windows support
- ✅ TypeScript-friendly JSDoc
- ✅ Zero configuration

## Installation

```bash
npm install njshell
```

## Quick Start

```javascript
const { exec, execLocal } = require('njshell');

// Execute command and get output as string
const version = await exec('node --version');
console.log(version); // "v20.10.0"

// Run local npm binary
const lintResult = await execLocal('eslint src/**/*.js');
console.log(lintResult);
```

## API

### `exec(command, type, filename, options)`

Execute a shell command with flexible output format.

**Parameters:**
- `command` (string) - Command to execute
- `type` (string) - Output format: `'string'` (default), `'buffer'`, `'stream'`, or `'vinyl'`
- `filename` (string) - Required when type is `'vinyl'`
- `options` (object) - Execution options

**Options:**
- `cwd` (string) - Current working directory
- `encoding` (string) - Output encoding (default: `'utf8'`)
- `timeout` (number) - Timeout in milliseconds (default: `0` = no timeout)
- `maxBuffer` (number) - Maximum stdout/stderr size (default: 10MB)
- `signal` (AbortSignal) - AbortSignal for cancellation

**Returns:** `Promise<string|Buffer|Readable|Stream>`

---

### `execLocal(binary, type, filename, options)`

Execute a local npm binary from `node_modules/.bin/`.

**Parameters:**
- `binary` (string) - Binary name (e.g., `'eslint'`, `'webpack'`)
- `type` (string) - Output format (same as `exec`)
- `filename` (string) - Required when type is `'vinyl'`
- `options` (object) - Execution options (same as `exec`)

**Returns:** `Promise<string|Buffer|Readable|Stream>`

---

## Usage Examples

### String Output (Default)

Get command output as a trimmed string:

```javascript
const { exec } = require('njshell');

// Get Node.js version
const version = await exec('node --version');
console.log(version); // "v20.10.0"

// Get directory listing
const files = await exec('ls -la');
console.log(files);

// Get package version from npm
const pkgVersion = await exec('npm view njshell version');
console.log(`Current version: ${pkgVersion}`);
```

---

### Buffer Output

Get raw binary output:

```javascript
const { exec } = require('njshell');

// Get file contents as buffer
const buffer = await exec('cat image.png', 'buffer');
console.log(buffer); // <Buffer 89 50 4e 47...>

// Process binary data
const compressed = zlib.gzipSync(buffer);
```

---

### Stream Output

Get output as a readable stream:

```javascript
const { exec } = require('njshell');
const fs = require('fs');

// Stream large file
const stream = await exec('cat large-file.txt', 'stream');
stream.pipe(fs.createWriteStream('output.txt'));

// Process stream data
stream.on('data', (chunk) => {
  console.log(`Received ${chunk.length} bytes`);
});

stream.on('end', () => {
  console.log('Stream completed');
});
```

---

### Vinyl Output (Gulp Integration)

Create vinyl files for Gulp pipelines:

```javascript
const { exec } = require('njshell');
const gulp = require('gulp');

async function buildStats() {
  // Run webpack and get stats as vinyl file
  const vinylStream = await exec(
    'webpack --json',
    'vinyl',
    'webpack-stats.json'
  );

  return vinylStream.pipe(gulp.dest('dist'));
}

exports.stats = buildStats;
```

---

### Local Binaries

Execute npm binaries from `node_modules/.bin/`:

```javascript
const { execLocal } = require('njshell');

// Run ESLint
const lintResult = await execLocal('eslint src/**/*.js');
console.log(lintResult);

// Run Webpack
const buildOutput = await execLocal('webpack --mode production');
console.log(buildOutput);

// Run TypeScript compiler
const tscOutput = await execLocal('tsc --noEmit');
console.log(tscOutput);
```

---

### Advanced Options

Use execution options for better control:

```javascript
const { exec } = require('njshell');

// Set working directory
const result = await exec('npm install', 'string', null, {
  cwd: '/path/to/project'
});

// Set timeout (5 seconds)
try {
  await exec('long-running-command', 'string', null, {
    timeout: 5000
  });
} catch (err) {
  console.error('Command timed out');
}

// Use AbortController for cancellation
const controller = new AbortController();

setTimeout(() => controller.abort(), 3000);

try {
  await exec('sleep 10', 'string', null, {
    signal: controller.signal
  });
} catch (err) {
  console.error('Command aborted');
}

// Increase buffer size for large output
const largeOutput = await exec('cat huge-file.txt', 'string', null, {
  maxBuffer: 50 * 1024 * 1024 // 50MB
});
```

---

### Error Handling

Handle command execution errors:

```javascript
const { exec } = require('njshell');

try {
  const result = await exec('invalid-command');
} catch (err) {
  console.error('Command failed:', err.message);
  console.error('stderr:', err.stderr);
  console.error('stdout:', err.stdout);
}
```

---

### Gulp Build Pipeline

Complete Gulp integration example:

```javascript
const { src, dest, series } = require('gulp');
const { exec, execLocal } = require('njshell');

async function lint() {
  const result = await execLocal('eslint src/**/*.js');
  console.log(result);
}

async function build() {
  const output = await execLocal('webpack --mode production');
  console.log(output);
}

async function generateDocs() {
  const docStream = await exec(
    'jsdoc src -r -d docs',
    'vinyl',
    'docs/index.html'
  );
  return docStream.pipe(dest('dist'));
}

exports.default = series(lint, build, generateDocs);
```

---

## Output Types

### `'string'` (Default)

Returns trimmed UTF-8 string. Best for text output.

```javascript
const text = await exec('echo "Hello World"');
// Returns: "Hello World"
```

### `'buffer'`

Returns Buffer object. Best for binary data.

```javascript
const buffer = await exec('cat image.png', 'buffer');
// Returns: <Buffer 89 50 4e 47...>
```

### `'stream'`

Returns Readable stream. Best for large outputs.

```javascript
const stream = await exec('cat large.log', 'stream');
// Returns: Readable stream
```

### `'vinyl'`

Returns vinyl file stream. Best for Gulp pipelines.

```javascript
const vinylStream = await exec('build-output', 'vinyl', 'output.json');
// Returns: Vinyl stream for Gulp
```

---

## Requirements

- Node.js >= 18.0.0

## Changelog

### v2.0.0 (2025)
- 🚀 **BREAKING:** Requires Node.js 18+
- 🚀 **BREAKING:** Main file renamed from `main.js` to `index.js`
- ✨ Added execution options (cwd, timeout, maxBuffer, signal)
- ✨ Better error handling with stderr/stdout attachment
- ✨ Windows support for execLocal (.cmd extension)
- ✨ Improved vinyl file path handling
- 🐛 Fixed console.log noise (now uses console.warn for stderr)
- 🐛 Fixed vinyl path resolution
- 📚 Comprehensive JSDoc documentation
- 🔧 Updated dependencies (njfs 2.0, vinyl 3.0)

### v1.1.2 (2020)
- Previous stable release

## Migration from v1.x

```javascript
// v1.x - Basic usage (still works)
const result = await exec('npm --version');

// v2.x - With options
const result = await exec('npm --version', 'string', null, {
  cwd: '/path/to/project',
  timeout: 5000
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Troubleshooting

When you encounter a problem, please [open an issue](https://github.com/orcunsaltik/njshell/issues).

## Author

**Orçun Saltık**

- GitHub: [@orcunsaltik](https://github.com/orcunsaltik)
- Email: saltikorcun@gmail.com

## License

[MIT](LICENSE) © Orçun Saltık
