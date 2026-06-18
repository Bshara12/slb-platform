
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;

    this.isOperational = true;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const NotFoundError    = (msg: string) => new AppError(msg, 404);
export const BadRequestError  = (msg: string) => new AppError(msg, 400);
export const ConflictError    = (msg: string) => new AppError(msg, 409);
export const InternalError    = (msg: string) => new AppError(msg, 500);