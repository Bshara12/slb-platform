import express, { Application, Request, Response, NextFunction } from 'express';
import http   from 'http';
import cors   from 'cors';
import { workerRouter }          from './routes/worker.routes';
import { registerWithRetry }     from './bootstrap/register';
import { setupGracefulShutdown } from './bootstrap/shutdown';
import { workerConfig }          from './config/worker.config';
import { logger }                from './utils/logger';

const app: Application = express();

app.use(express.json());
app.use(cors());

app.use((req: Request, _res: Response, next: NextFunction) => {
  _res.on('finish', () => {
    logger.debug(`${req.method} ${req.path} → ${_res.statusCode}`);
  });
  next();
});

app.use('/', workerRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Not found', timestamp: new Date().toISOString() });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', err.message);
  res.status(500).json({ success: false, error: 'Internal server error', timestamp: new Date().toISOString() });
});


const server = http.createServer(app);

server.listen(workerConfig.port, () => {
  logger.info('Worker started', {
    id:   workerConfig.workerId,
    port: workerConfig.port,
  });

  registerWithRetry()
    .then(() => {
      logger.info('Worker fully operational');
    })
    .catch((err: Error) => {
      logger.error('Registration failed permanently', err.message);
      process.exit(1);
    });

  setupGracefulShutdown(server);
});

export default app;