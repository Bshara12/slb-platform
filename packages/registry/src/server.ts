import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { registryRouter } from './routes/registry.routes';
import { startHealthChecker } from './health/health-checker';
import { logger } from './utils/logger';
import { AppError } from './errors/app-error';

const app: Application = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);


app.use(express.json());
app.use(cors());

app.use((req: Request, _res: Response, next: NextFunction) => {
  const start = Date.now();
  _res.on('finish', () => {
    const ms = Date.now() - start;
    logger.debug(`${req.method} ${req.path} → ${_res.statusCode} [${ms}ms]`);
  });
  next();
});

app.use('/api/registry', registryRouter);

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      service: 'registry',
      status:  'healthy',
      uptime:  Math.floor(process.uptime()),
    },
    timestamp: new Date().toISOString(),
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success:   false,
    error:     'Route not found',
    timestamp: new Date().toISOString(),
  });
});


app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success:   false,
      error:     err.message,
      timestamp: new Date().toISOString(),
    });
  } else {
    logger.error('Unexpected error', { message: err.message, stack: err.stack });
    res.status(500).json({
      success:   false,
      error:     'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});


app.listen(PORT, () => {
  logger.info(`Registry service started`, { port: PORT });
  logger.info(`Health endpoint: http://localhost:${PORT}/health`);

  startHealthChecker();
});

export default app;