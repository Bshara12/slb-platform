import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';


export function validateRegisterBody(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const { host, port, weight } = req.body as Record<string, unknown>;

  if (!host || typeof host !== 'string' || host.trim() === '') {
    return next(new AppError('"host" is required and must be a non-empty string', 400));
  }

  if (port === undefined || port === null) {
    return next(new AppError('"port" is required', 400));
  }

  const portNum = Number(port);
  if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
    return next(new AppError('"port" must be an integer between 1 and 65535', 400));
  }

  if (weight !== undefined) {
    const weightNum = Number(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      return next(new AppError('"weight" must be a positive number', 400));
    }
  }

  next();
}