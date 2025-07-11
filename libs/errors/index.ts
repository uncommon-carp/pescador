export class AppError extends Error {
  public readonly message: string;
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);

    this.message = message;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InternalServerError extends AppError {
  public readonly originalError?: Error;
  public readonly traceId: string;

  constructor(traceId: string, originalError?: Error) {
    const message = `An unexpected error occurred. Please provide this traceId to support: ${traceId}`;
    super(message, 500);

    if (originalError) {
      this.originalError = originalError;
    }
    this.traceId = traceId;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed.') {
    super(message, 401); // 401 Unauthorized
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Invalid input provided.') {
    super(message, 400); // 400 Bad Request
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'A conflict occurred.') {
    super(message, 409); // 409 Conflict
  }
}
