/**
 * njshell - Execute shell commands with flexible output formats
 * Supports: string, buffer, stream, and vinyl (for Gulp pipelines)
 */

const { exec: cpExec } = require('child_process');
const path = require('path');
const { Readable } = require('stream');
const Vinyl = require('vinyl');
const through2 = require('through2');
const { root } = require('njfs');

/**
 * @typedef {'string' | 'buffer' | 'stream' | 'vinyl'} OutputType
 * @typedef {Object} ExecOptions
 * @property {string} [cwd] - Current working directory
 * @property {string} [encoding='utf8'] - Output encoding (null for buffer)
 * @property {number} [timeout=0] - Timeout in milliseconds (0 = no timeout)
 * @property {number} [maxBuffer=10485760] - Max stdout/stderr size (10MB default)
 * @property {AbortSignal} [signal] - AbortSignal for cancellation
 */

/**
 * Execute a shell command and return output in specified format
 *
 * @param {string} cmd - Command to execute
 * @param {OutputType} [type='string'] - Output format
 * @param {string} [filename] - Required when type is 'vinyl'
 * @param {ExecOptions} [options={}] - Execution options
 * @returns {Promise<string|Buffer|Readable|NodeJS.ReadableStream>}
 *
 * @example
 * // Get version as string
 * const version = await exec('npm view njshell version');
 * console.log(version); // "2.0.0"
 *
 * @example
 * // Get directory listing as buffer
 * const buffer = await exec('ls -la', 'buffer');
 *
 * @example
 * // Get command output as stream
 * const stream = await exec('cat large-file.txt', 'stream');
 * stream.pipe(process.stdout);
 *
 * @example
 * // Create vinyl file for Gulp
 * const vinylStream = await exec('webpack --output-format json', 'vinyl', 'stats.json');
 * vinylStream.pipe(gulp.dest('dist'));
 */
function exec(cmd, type = 'string', filename = null, options = {}) {
  return new Promise((resolve, reject) => {
    // Validate vinyl requirements
    if (type === 'vinyl' && !filename) {
      return reject(new Error('filename is required when type is "vinyl"'));
    }

    // Set default options
    const execOptions = {
      encoding: null, // Always get binary stdout (we'll convert later)
      timeout: 0,
      maxBuffer: 10 * 1024 * 1024, // 10MB
      ...options
    };

    // Execute command
    cpExec(cmd, execOptions, (err, stdout, stderr) => {
      // Handle execution errors
      if (err) {
        // Attach stderr for debugging
        err.stderr = stderr ? stderr.toString('utf8') : '';
        err.stdout = stdout ? stdout.toString('utf8') : '';
        return reject(err);
      }

      // Log stderr as warning if present (non-fatal)
      if (stderr && stderr.length > 0) {
        const stderrText = stderr.toString('utf8').trim();
        if (stderrText) {
          console.warn('[njshell stderr]', stderrText);
        }
      }

      try {
        let result;

        switch (type) {
          case 'string': {
          // Convert to UTF-8 string and trim whitespace
            result = stdout.toString('utf8').trim();
            break;
          }

          case 'buffer': {
          // Return raw buffer
            result = Buffer.from(stdout);
            break;
          }

          case 'stream': {
          // Create readable stream
            const stream = new Readable({
              read() {} // No-op read (push mode)
            });
            stream.push(stdout);
            stream.push(null); // EOF
            result = stream;
            break;
          }

          case 'vinyl': {
          // Create vinyl file for Gulp
            const buffer = Buffer.from(stdout);

            // Determine vinyl path
            // If filename is absolute, use it; otherwise use basename
            const vinylPath = path.isAbsolute(filename)
              ? filename
              : path.join(process.cwd(), filename);

            const vinylFile = new Vinyl({
              cwd: process.cwd(),
              base: path.dirname(vinylPath),
              path: vinylPath,
              contents: buffer
            });

            // Create object stream and push vinyl file
            const vinylStream = through2.obj();
            vinylStream.push(vinylFile);
            vinylStream.push(null); // EOF

            result = vinylStream;
            break;
          }

          default: {
            return reject(
              new Error(
              `Unsupported output type: "${type}". Use: string, buffer, stream, or vinyl.`
              )
            );
          }
        }

        resolve(result);
      } catch (conversionErr) {
        reject(conversionErr);
      }
    });
  });
}

/**
 * Execute a local npm binary from node_modules/.bin/
 *
 * @param {string} binName - Binary name (e.g., 'eslint', 'webpack')
 * @param {OutputType} [type='string'] - Output format
 * @param {string} [filename] - Required when type is 'vinyl'
 * @param {ExecOptions} [options={}] - Execution options
 * @returns {Promise<string|Buffer|Readable|NodeJS.ReadableStream>}
 *
 * @example
 * // Run local ESLint
 * const result = await execLocal('eslint --format json src/**\/*.js');
 *
 * @example
 * // Run webpack and get stats as vinyl
 * const stats = await execLocal('webpack --json', 'vinyl', 'stats.json');
 */
function execLocal(binName, type = 'string', filename = null, options = {}) {
  const binPath = path.join(root(), 'node_modules', '.bin', binName);

  // Check if we're on Windows (use .cmd extension)
  const isWindows = process.platform === 'win32';
  const fullBinPath = isWindows ? `"${binPath}.cmd"` : binPath;

  return exec(fullBinPath, type, filename, options);
}

module.exports = {
  exec,
  execLocal
};
