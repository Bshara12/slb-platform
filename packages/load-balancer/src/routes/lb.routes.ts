import { Router, Request, Response } from 'express';
import { strategyRegistry }          from '../core/strategy.registry';
import { strategyRouter }            from '../core/strategy.router';
import { ServerNode, StrategyName }  from '@slb/shared';

export const lbRouter = Router();

lbRouter.get('/strategy', (_req: Request, res: Response) => {
  res.json({
    success:   true,
    data: {
      active:    strategyRegistry.getActiveName(),
      available: strategyRegistry.listAll(),
    },
    timestamp: new Date().toISOString(),
  });
});


lbRouter.put('/strategy', (req: Request, res: Response) => {
  const { name } = req.body as { name: StrategyName };

  if (!name) {
    res.status(400).json({
      success:   false,
      error:     '"name" is required',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  try {
    strategyRegistry.setActive(name);
    res.json({
      success:   true,
      data:      { active: strategyRegistry.getActiveName() },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(400).json({
      success:   false,
      error:     (err as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
});

lbRouter.post('/test-pick', (req: Request, res: Response) => {
  const { servers } = req.body as { servers: ServerNode[] };

  if (!servers || !Array.isArray(servers) || servers.length === 0) {
    res.status(400).json({
      success:   false,
      error:     '"servers" must be a non-empty array',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  try {
    const picked   = strategyRouter.route(servers);
    const strategy = strategyRouter.getActiveStrategyName();

    res.json({
      success: true,
      data: {
        picked,
        strategy,
        totalServers:   servers.length,
        healthyServers: servers.filter(s => s.isHealthy).length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      success:   false,
      error:     (err as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
});