/**
 * Standardized error codes for the application
 * Used by both client and server
 */
export const ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // Data validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // API specific errors
  EXERCISE_ERROR: 'EXERCISE_ERROR',
  SESSION_ERROR: 'SESSION_ERROR',
  IDIOM_ERROR: 'IDIOM_ERROR',
  USER_ERROR: 'USER_ERROR'
};

/**
 * Map of error codes to their default HTTP status codes
 */
export const ERROR_STATUS_CODES = {
  [ERROR_CODES.UNAUTHORIZED]: 401,
  [ERROR_CODES.FORBIDDEN]: 403,
  [ERROR_CODES.INVALID_TOKEN]: 401,
  [ERROR_CODES.VALIDATION_ERROR]: 400,
  [ERROR_CODES.INVALID_INPUT]: 400,
  [ERROR_CODES.NOT_FOUND]: 404,
  [ERROR_CODES.ALREADY_EXISTS]: 409,
  [ERROR_CODES.INTERNAL_ERROR]: 500,
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 503,
  [ERROR_CODES.EXERCISE_ERROR]: 400,
  [ERROR_CODES.SESSION_ERROR]: 400,
  [ERROR_CODES.IDIOM_ERROR]: 400,
  [ERROR_CODES.USER_ERROR]: 400
};

/**
 * Base API error class with standardized properties
 */
export class APIError extends Error {
  constructor(message, code = ERROR_CODES.INTERNAL_ERROR, statusCode = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode || ERROR_STATUS_CODES[code] || 500;
  }
}

// Specific error classes
export class ValidationError extends APIError {
  constructor(message) {
    super(message, ERROR_CODES.VALIDATION_ERROR);
  }
}

export class NotFoundError extends APIError {
  constructor(message) {
    super(message, ERROR_CODES.NOT_FOUND);
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized access') {
    super(message, ERROR_CODES.UNAUTHORIZED);
  }
}

export class ForbiddenError extends APIError {
  constructor(message = 'Access forbidden') {
    super(message, ERROR_CODES.FORBIDDEN);
  }
}

export class CalendarExhaustedError extends APIError {
  constructor(message = 'Calendar exhausted') {
    super(message, ERROR_CODES.SERVICE_UNAVAILABLE, ERROR_STATUS_CODES[ERROR_CODES.SERVICE_UNAVAILABLE]);
  }
}

export default {
  ERROR_CODES,
  ERROR_STATUS_CODES,
  APIError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  CalendarExhaustedError
}; 