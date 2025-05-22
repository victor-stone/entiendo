// Shutdown handler for Entiendo Server
import fs from 'fs';
import debug from 'debug'

const debugInspector = debug('app:inspector');

/**
 * Sets up server shutdown handlers and heartbeat tracking
 * @param {object} server - The HTTP server instance
 * @param {string} rootDir - The app root directory
 */
export function setupShutdownHandlers(server, rootDir) {
  // Skip all shutdown handling in development mode
  if (process.env.NODE_ENV !== 'development') {
    debugInspector('Not running in development mode - shutdown handlers disabled');
    return;
  }

  // Helper function to log to both console and file
  const logShutdown = (message) => {
    debugInspector(message);
    // try {
    //   fs.appendFileSync(path.join(rootDir, 'server-shutdown.log'), `${new Date().toISOString()} - ${message}\n`);
    // } catch (err) {
    //   console.error('Failed to write to shutdown log:', err);
    // }
  };

  // Create a heartbeat file to track server lifecycle
  // const heartbeatFile = path.join(rootDir, 'server-heartbeat.log');
  // // Record server start
  // fs.writeFileSync(heartbeatFile, `Server started at ${new Date().toISOString()}\n`);
  // // Maintain heartbeat every 2 seconds
  // const heartbeatInterval = setInterval(() => {
  //   fs.appendFileSync(heartbeatFile, `Heartbeat at ${new Date().toISOString()}\n`);
  // }, 2000);

  // Track heartbeat termination
  process.on('exit', (code) => {
    heartbeatInterval && clearInterval(heartbeatInterval);
    heartbeatFile && fs.appendFileSync(heartbeatFile, `Server exit detected at ${new Date().toISOString()}\n`);
    logShutdown(`ENTIENDO Server is shutting down with exit code: ${code}`);
  });

  // Handle Ctrl+C (SIGINT)
  process.on('SIGINT', () => {
    logShutdown('ENTIENDO Server shutting down from SIGINT (Ctrl+C)');
    process.exit(0);
  });

  // Handle termination signal (SIGTERM)
  process.on('SIGTERM', () => {
    logShutdown('ENTIENDO Server shutting down from SIGTERM');
    process.exit(0);
  });

  // Try to catch debugger termination and other signals
  process.on('SIGHUP', () => {
    logShutdown('ENTIENDO Server shutting down from SIGHUP');
    process.exit(0);
  });

  // For Windows - Node.js doesn't support all signals on Windows
  if (process.platform === 'win32') {
    const rl = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.on('SIGINT', () => {
      logShutdown('ENTIENDO Server shutting down from Windows SIGINT');
      process.exit(0);
    });
  }

  // Add server close event handler
  if (server) {
    server.on('close', () => {
      logShutdown('ENTIENDO Server closed connection');
    });
  }

  // Track when the debugger disconnects (inspector protocol)
  try {
    // Check if inspector module is available instead of using process.binding
    const inspector = require('inspector');
    if (inspector) {
      logShutdown('Inspector module is available, but direct hooks are not supported');
      // No direct hooks into debugger disconnect available in the standard API
    }
  } catch (err) {
    debugInspector('Inspector module not available');
  }

  // Log at the beginning that we've registered shutdown hooks
  debugInspector('ENTIENDO Server shutdown hooks registered');
} 