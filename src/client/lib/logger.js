import debug from 'debug';

/**
 * Application logger with namespace support
 * Usage:
 * 
 * // Create a logger with a namespace
 * const log = logger('auth');
 * log.info('User logged in');
 * 
 * // Create nested namespaces
 * const apiLog = logger('api:users');
 * apiLog.info('Fetching users');
 * 
 * // Enable in browser console:
 * // localStorage.debug = 'app:*' (enable all app logs)
 * // localStorage.debug = 'app:api:*' (enable only api logs)
 * 
 * // Control log level printing
 * // logger.level = 'warn' (only show warn and error logs)
 */

// Set up app namespace prefix
const APP_NAMESPACE = 'app';

// Log levels with their priority
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Default minimum level to show
let minLevel = LOG_LEVELS.debug;

const logger = (namespace) => {
  const fullNamespace = namespace ? `${APP_NAMESPACE}:${namespace}` : APP_NAMESPACE;
  
  // Create debuggers for each level
  const debuggers = {
    debug: debug(`${fullNamespace}:debug`),
    info: debug(`${fullNamespace}:info`),
    warn: debug(`${fullNamespace}:warn`),
    error: debug(`${fullNamespace}:error`)
  };
  
  // Color the warn and error logs
  debuggers.warn.color = '#ffa500';
  debuggers.error.color = '#ff0000';
  
  // Create the logger instance with methods for each level
  const instance = {};
  
  Object.keys(LOG_LEVELS).forEach(level => {
    instance[level] = (...args) => {
      // Only log if level priority is >= minimum level
      if (LOG_LEVELS[level] >= minLevel) {
        debuggers[level](...args);
      }
      
      // Always log errors to console regardless of debug settings
      if (level === 'error') {
        console.error(...args);
      }
      
      // Always log warnings to console regardless of debug settings
      if (level === 'warn') {
        console.warn(...args);
      }
    };
  });
  
  return instance;
};

// Ability to control minimum log level
Object.defineProperty(logger, 'level', {
  get: () => {
    return Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === minLevel);
  },
  set: (level) => {
    if (LOG_LEVELS[level] !== undefined) {
      minLevel = LOG_LEVELS[level];
    } else {
      console.warn(`Invalid log level: ${level}. Must be one of: ${Object.keys(LOG_LEVELS).join(', ')}`);
    }
  }
});

export default logger; 