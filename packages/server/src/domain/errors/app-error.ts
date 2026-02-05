export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', 400, message);
  }
}

export class UpstreamError extends AppError {
  constructor(message: string) {
    super('UPSTREAM_ERROR', 502, message);
  }
}
