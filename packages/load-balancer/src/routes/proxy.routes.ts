import { Router, Request, Response } from 'express';
import { proxyService } from '../services/proxy.service';
import { logger }       from '../utils/logger';

export const proxyRouter = Router();

proxyRouter.post('/', async (req: Request, res: Response) => {
  const {
    path    = '/work',
    method  = 'POST',
    payload = {},
  } = req.body as { path?: string; method?: string; payload?: unknown };

  const result = await proxyService.forward(
    method.toUpperCase(),
    path,
    payload,
    req.headers as Record<string, string>,
  );

  res.setHeader('X-Worker-Id',    result.meta.workerId);
  res.setHeader('X-Strategy',     result.meta.strategy);
  res.setHeader('X-Latency-Ms',   result.meta.latencyMs.toString());

  res.status(result.statusCode).json({
    success:   result.success,
    data:      result.data,
    meta:      result.meta,
    timestamp: new Date().toISOString(),
  });
});