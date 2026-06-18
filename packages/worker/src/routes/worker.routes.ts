import { Router, Request, Response } from 'express';
import { workerConfig } from '../config/worker.config';
import { logger }       from '../utils/logger';

export const workerRouter = Router();


const simulationState = {
  slowMode:     false,  
  slowDelayMs:  2000,
  errorMode:    false,   
  requestCount: 0,  
};

workerRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      workerId:     workerConfig.workerId,
      status:       'healthy',
      uptime:       Math.floor(process.uptime()),
      requestCount: simulationState.requestCount,
      slowMode:     simulationState.slowMode,
      errorMode:    simulationState.errorMode,
    },
    timestamp: new Date().toISOString(),
  });
});

workerRouter.post('/work', async (req: Request, res: Response) => {
  simulationState.requestCount++;

  if (simulationState.errorMode) {
    logger.warn('Error mode active, rejecting request');
    res.status(500).json({
      success:  false,
      error:    'Worker in error simulation mode',
      workerId: workerConfig.workerId,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (simulationState.slowMode) {
    await sleep(simulationState.slowDelayMs);
  }

  const payload = req.body as Record<string, unknown> | undefined;

  logger.info('Processing work request', {
    requestCount: simulationState.requestCount,
    payload,
  });

  res.json({
    success:  true,
    data: {
      workerId:     workerConfig.workerId,
      processed:    payload ?? {},
      requestCount: simulationState.requestCount,
      processedAt:  new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  });
});


workerRouter.post('/simulate/slow', (req: Request, res: Response) => {
  const { enabled, delayMs } = req.body as { enabled: boolean; delayMs?: number };

  simulationState.slowMode   = enabled;
  simulationState.slowDelayMs = delayMs ?? 2000;

  logger.warn(`Slow mode ${enabled ? 'ENABLED' : 'DISABLED'}`, {
    delayMs: simulationState.slowDelayMs,
  });

  res.json({
    success:   true,
    data:      { slowMode: simulationState.slowMode, delayMs: simulationState.slowDelayMs },
    timestamp: new Date().toISOString(),
  });
});


workerRouter.post('/simulate/error', (req: Request, res: Response) => {
  const { enabled } = req.body as { enabled: boolean };

  simulationState.errorMode = enabled;

  logger.warn(`Error mode ${enabled ? 'ENABLED' : 'DISABLED'}`);

  res.json({
    success:   true,
    data:      { errorMode: simulationState.errorMode },
    timestamp: new Date().toISOString(),
  });
});

workerRouter.get('/stats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      workerId:     workerConfig.workerId,
      host:         workerConfig.host,
      port:         workerConfig.port,
      requestCount: simulationState.requestCount,
      uptime:       Math.floor(process.uptime()),
      simulation:   simulationState,
    },
    timestamp: new Date().toISOString(),
  });
});

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}