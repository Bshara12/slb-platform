import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { lbRouter } from './routes/lb.routes';
import { logger }   from './utils/logger';
import { AppError } from './errors/app-error';
import { proxyRouter } from './routes/proxy.routes';

const app: Application = express();
const PORT = parseInt(process.env.PORT ?? '3000', 10);

app.use(express.json());
app.use(cors());

app.use((req: Request, _res: Response, next: NextFunction) => {
  _res.on('finish', () => {
    logger.debug(`${req.method} ${req.path} → ${_res.statusCode}`);
  });
  next();
});

app.use('/api/lb', lbRouter);
app.use('/api/proxy', proxyRouter);

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data:    { service: 'load-balancer', status: 'healthy' },
    timestamp: new Date().toISOString(),
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Not found', timestamp: new Date().toISOString() });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message, timestamp: new Date().toISOString() });
  } else {
    logger.error('Unexpected error', err.message);
    res.status(500).json({ success: false, error: 'Internal server error', timestamp: new Date().toISOString() });
  }
});

app.use(cors({
  origin: '*',
  exposedHeaders: ['X-Worker-Id', 'X-Strategy', 'X-Latency-Ms']
}));


app.listen(PORT, () => {
  logger.info('Load Balancer started', { port: PORT });
});

export default app;